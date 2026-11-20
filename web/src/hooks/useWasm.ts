import { useEffect, useRef, useState } from 'react'
import type { UnNativeFunctionMetadata } from '../lib/playground'
import { NATIVE_FUNCTION_CATALOG } from '../lib/nativeCatalog'
import { checkUnSource, preloadPlayground, type UnCheckResult } from '../lib/wasmClient'

// static catalog generated from the un project's native inventory — the Rust
// playground ships no reflection metadata, so autocomplete uses this instead
// of asking WASM. start fetching playground.wasm in the background while the
// editor mounts.
export const FALLBACK_NATIVE_FUNCTIONS: UnNativeFunctionMetadata[] = NATIVE_FUNCTION_CATALOG

declare global {
  interface Window {
    __nativeFunctions?: UnNativeFunctionMetadata[]
    __typeCheckResult?: UnCheckResult | null
  }
}

/** Debounced live type check. `null` means disabled, unavailable or pending. */
export function useWasm(source: string, typeCheckEnabled = true) {
  const [nativeFunctions] = useState<UnNativeFunctionMetadata[]>(NATIVE_FUNCTION_CATALOG)
  const [checkResult, setCheckResult] = useState<UnCheckResult | null>(null)
  const checkIdRef = useRef(0)

  useEffect(() => {
    window.__nativeFunctions = nativeFunctions
    preloadPlayground()
  }, [nativeFunctions])

  useEffect(() => {
    if (!typeCheckEnabled) {
      ++checkIdRef.current
      setCheckResult(null)
      return
    }
    const id = ++checkIdRef.current
    const timer = window.setTimeout(() => {
      void checkUnSource(source)
        .then((result) => { if (id === checkIdRef.current) setCheckResult(result) })
        .catch(() => { if (id === checkIdRef.current) setCheckResult(null) })
    }, 180)
    return () => window.clearTimeout(timer)
  }, [source, typeCheckEnabled])

  useEffect(() => {
    window.__typeCheckResult = checkResult
  }, [checkResult])

  return { nativeFunctions, checkResult }
}
