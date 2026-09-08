import { useEffect, useState } from 'react'
import type { UnNativeFunctionMetadata } from '../lib/playground'
import { setBuiltinTypeInfo } from '../lib/playground'

// 초기 fallback — WASM 로드 전에도 자동완성이 동작하도록 최소 카탈로그
// 실제 값은 WASM의 GetAllNativeFunctions(247개)로 교체됨
export const FALLBACK_NATIVE_FUNCTIONS: UnNativeFunctionMetadata[] = [
  { name: 'len', module: 'builtin', description: 'Returns the number of items in a collection.', example: 'write(len(items))', returnType: 'int', parameters: [{ name: 'value', expectedType: 'collection', essential: true, optional: false, positional: false }] },
  { name: 'type', module: 'builtin', description: 'Returns the UN type of a value.', example: 'write(type(value))', returnType: 'type', parameters: [{ name: 'value', expectedType: 'any', essential: true, optional: false, positional: false }] },
  { name: 'write', module: 'io', description: 'Writes values to standard output.', example: 'write("Hello", "UN")', returnType: 'none', parameters: [{ name: 'values', expectedType: 'any', essential: false, optional: false, positional: true },{ name: 'sep', expectedType: 'str', essential: false, optional: true, positional: false }] },
  { name: 'read', module: 'io', description: 'Reads one line from an input stream.', example: 'name = read("Name: ")', returnType: 'str', parameters: [{ name: 'prompt', expectedType: 'str', essential: false, optional: true, positional: false }] },
  { name: 'open', module: 'io', description: 'Opens a sandbox-relative file stream.', example: 'stream = open("notes.txt", "r")', returnType: 'stream', parameters: [{ name: 'path', expectedType: 'str', essential: true, optional: false, positional: false }] },
  { name: 'clear', module: 'io', description: 'Clears the active output stream.', example: 'clear()', returnType: 'none', parameters: [] },
]

declare global {
  interface Window {
    dotnetExports?: unknown
    wasmReady?: boolean
    dotnetInvoke?: (method: string, arg: string) => Promise<unknown>
    __nativeFunctions?: UnNativeFunctionMetadata[]
  }
}

export function useWasm() {
  const [wasmReady, setWasmReady] = useState(false)
  const [nativeFunctions, setNativeFunctions] = useState<UnNativeFunctionMetadata[]>(FALLBACK_NATIVE_FUNCTIONS as any)

  // 디버깅용 노출 — Playwright 테스트에서 window.__nativeFunctions로 검증
  useEffect(() => {
    window.__nativeFunctions = nativeFunctions
  }, [nativeFunctions])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        // Vite가 번들하지 않도록 eval로 동적 import — public/_framework에서 런타임 로드
        // @ts-ignore — dotnet.js는 런타임에만 존재, Vite 분석 우회
        const mod: any = await (0, eval)('import("/_framework/dotnet.js")')
        const dotnet = mod.dotnet ?? mod.default?.dotnet ?? mod.default
        if (!dotnet) throw new Error('dotnet export not found')
        const { getAssemblyExports, getConfig } = await dotnet.create()
        const config = getConfig()
        const exports = await getAssemblyExports(config.mainAssemblyName)
        const interop =
          (exports as any)?.Un?.Playground?.Wasm?.UnInterop ??
          (exports as any)?.Un?.UnInterop ??
          (exports as any)?.UnPlaygroundWasm?.UnInterop ??
          (exports as any)['Un.Playground.Wasm']?.UnInterop

        let target: any = interop
        if (!target || typeof target.Run !== 'function') {
          for (const v of Object.values(exports as any)) {
            if (v && typeof (v as any).Run === 'function') { target = v; break }
            if (v && typeof v === 'object') {
              for (const inner of Object.values(v as any)) {
                if (inner && typeof (inner as any).Run === 'function') { target = inner; break }
              }
            }
          }
        }
        if (!target || typeof target.Run !== 'function') throw new Error('UnInterop.Run not found')
        if (cancelled) return

        window.dotnetExports = exports
        window.wasmReady = true
        window.dotnetInvoke = async (method: string, arg: string) => {
          const fn = (target as any)[method]
          if (typeof fn !== 'function') throw new Error(`method ${method} not found`)
          const raw: string = fn(arg)
          try { return JSON.parse(raw as any) } catch { return raw as any }
        }

        setWasmReady(true)
        console.log('[wasm] ready', config.mainAssemblyName)

        try { await window.dotnetInvoke!('InitPromptHandler', '') } catch {}

        try {
          const all = await window.dotnetInvoke!('GetAllNativeFunctions', '')
          const arr = Array.isArray(all) ? all : (typeof all === 'string' ? JSON.parse(all as string) : [])
          if (Array.isArray(arr) && arr.length > 5) {
            setNativeFunctions(arr as any)
            console.log('[wasm] native catalog', arr.length)
          }
        } catch {}
        try {
          const bt = await window.dotnetInvoke!('GetBuiltinTypes', '')
          const arrBt = Array.isArray(bt) ? bt : (typeof bt === 'string' ? JSON.parse(bt as string) : [])
          if (Array.isArray(arrBt) && arrBt.length > 0) {
            setBuiltinTypeInfo(arrBt as any)
            console.log('[wasm] builtin types', arrBt.length)
          }
        } catch {}
      } catch (e) {
        console.warn('[wasm] init failed (fallback demo mode)', e)
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  return { wasmReady, nativeFunctions }
}
