export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  const gtag = (window as any).gtag as ((...args: unknown[]) => void) | undefined
  if (typeof gtag === 'function') gtag('event', name, params)
  else console.debug('[analytics]', name, params)
}
