// Loads the Rust playground WASM module (`web/public/playground.wasm`, built from
// un/rust/playground) and exposes the documented `playground_*` ABI to TypeScript.
//
// Interactive `read()` works by replay: the browser runs the script with the
// input lines collected so far as `stdin`. when the script asks `read()` for a
// line that is not in the buffer yet, the run aborts and the JSON result reports
// `needsInput: true` — the caller appends the next line and runs again.
//
// The wasm has no OS clock, so it imports the host's time:
//   env.unvm_monotonic_nanos() -> f64 nanoseconds (performance.now() * 1e6)
//   env.unvm_unix_nanos()      -> f64 nanoseconds (Date.now() * 1e6)
// Both must be provided; the module fails to instantiate without them.

export type UnPlaygroundResult = {
  stdout: string
  error: string | null
  timedOut: boolean
  needsInput: boolean
  exitCode: number
}

type PlaygroundAbi = {
  playground_alloc: (len: number) => number
  playground_free: (ptr: number, len: number) => void
  playground_run: (
    codePtr: number, codeLen: number,
    filePtr: number, fileLen: number,
    allowedPtr: number, allowedLen: number,
    stdinPtr: number, stdinLen: number,
    allowEof: number,
    outLenPtr: number,
  ) => number
  memory: WebAssembly.Memory
}

// the host clock the wasm imports (wasm32-unknown-unknown has no OS clock)
const envImports = {
  env: {
    unvm_monotonic_nanos: () => performance.now() * 1e6,
    unvm_unix_nanos: () => Date.now() * 1e6,
  },
}

let instancePromise: Promise<PlaygroundAbi> | null = null

async function instantiate(): Promise<PlaygroundAbi> {
  const response = await fetch('/playground.wasm')
  if (!response.ok) throw new Error(`failed to fetch /playground.wasm (${response.status})`)

  let instance: WebAssembly.Instance
  try {
    const streaming = await WebAssembly.instantiateStreaming(response.clone(), envImports)
    instance = streaming.instance
  } catch {
    // instantiateStreaming requires `application/wasm`; fall back to the bytes
    instance = (await WebAssembly.instantiate(await response.arrayBuffer(), envImports)).instance
  }

  const exports = instance.exports as unknown as PlaygroundAbi
  if (typeof exports.playground_alloc !== 'function' || typeof exports.playground_run !== 'function') {
    throw new Error('playground.wasm does not export the playground_* ABI')
  }
  return exports
}

function loadPlayground(): Promise<PlaygroundAbi> {
  if (!instancePromise) {
    instancePromise = instantiate().catch((error) => {
      instancePromise = null
      throw error
    })
  }
  return instancePromise
}

// start fetching at module load so the WASM is ready by the first run
export function preloadPlayground(): void {
  void loadPlayground().catch(() => { /* the next run() retries and reports the error */ })
}

function writeBuffer(abi: PlaygroundAbi, encoder: TextEncoder, text: string): { ptr: number; length: number } {
  const bytes = encoder.encode(text)
  if (bytes.length === 0) return { ptr: 0, length: 0 } // playground_alloc(0) is null; the ABI reads null, 0 as empty
  const ptr = abi.playground_alloc(bytes.length)
  new Uint8Array(abi.memory.buffer, ptr, bytes.length).set(bytes)
  return { ptr, length: bytes.length }
}

function freeBuffer(abi: PlaygroundAbi, ptr: number, length: number): void {
  if (length > 0) abi.playground_free(ptr, length)
}

/**
 * Runs `source` with the replayed `inputs` (the lines the user typed so far) and
 * returns the sandbox outcome. with `allowEof`, `read()` at end of input returns
 * an empty line instead of asking for input again.
 */
export async function runUnScript(source: string, inputs: string[], allowEof = false): Promise<UnPlaygroundResult> {
  const abi = await loadPlayground()
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stdin = inputs.join('\n')
  const code = writeBuffer(abi, encoder, source)
  const file = writeBuffer(abi, encoder, 'playground.un')
  const allowed = writeBuffer(abi, encoder, '')
  const stdinBuffer = writeBuffer(abi, encoder, stdin)

  const outLenPtr = abi.playground_alloc(4)
  let resultPtr = 0
  let outLength = 0
  try {
    resultPtr = abi.playground_run(
      code.ptr, code.length,
      file.ptr, file.length,
      allowed.ptr, allowed.length,
      stdinBuffer.ptr, stdinBuffer.length,
      allowEof ? 1 : 0,
      outLenPtr,
    )
    // memory may have grown during the call; always read the buffer fresh
    outLength = new Uint32Array(abi.memory.buffer, outLenPtr, 1)[0]
    const json = decoder.decode(new Uint8Array(abi.memory.buffer, resultPtr, outLength))
    try {
      return JSON.parse(json) as UnPlaygroundResult
    } catch {
      throw new Error(`playground.wasm returned invalid JSON: ${json.slice(0, 120)}`)
    }
  } finally {
    freeBuffer(abi, code.ptr, code.length)
    freeBuffer(abi, file.ptr, file.length)
    freeBuffer(abi, allowed.ptr, allowed.length)
    freeBuffer(abi, stdinBuffer.ptr, stdinBuffer.length)
    if (resultPtr !== 0) freeBuffer(abi, resultPtr, outLength)
    abi.playground_free(outLenPtr, 4)
  }
}
