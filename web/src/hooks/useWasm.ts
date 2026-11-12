import { useEffect, useState } from 'react'
import type { UnNativeFunctionMetadata } from '../lib/playground'
import { NATIVE_FUNCTION_CATALOG } from '../lib/nativeCatalog'
import { preloadPlayground } from '../lib/wasmClient'

// static catalog generated from the un project's native inventory — the Rust
// playground ships no reflection metadata, so autocomplete uses this instead
// of asking WASM. start fetching playground.wasm in the background while the
// editor mounts.
export const FALLBACK_NATIVE_FUNCTIONS: UnNativeFunctionMetadata[] = NATIVE_FUNCTION_CATALOG

declare global {
  interface Window {
    __nativeFunctions?: UnNativeFunctionMetadata[]
  }
}

export function useWasm() {
  const [nativeFunctions] = useState<UnNativeFunctionMetadata[]>(NATIVE_FUNCTION_CATALOG)

  // 디버깅용 노출 — Playwright 테스트에서 window.__nativeFunctions로 검증
  useEffect(() => {
    window.__nativeFunctions = nativeFunctions
    preloadPlayground()
  }, [nativeFunctions])

  return { nativeFunctions }
}
