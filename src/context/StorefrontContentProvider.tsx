import { useCart } from './cartContextDef'

export type StorefrontContentStatus = 'preview' | 'loading' | 'ready' | 'missing' | 'unavailable'

export function useStorefrontContent() {
  const { mode, homepageContent, homepageStatus } = useCart()
  const contentStatus: StorefrontContentStatus = mode === 'preview'
    ? 'preview'
    : homepageStatus === 'loading'
      ? 'loading'
      : homepageStatus === 'unavailable'
        ? 'unavailable'
        : homepageContent
          ? 'ready'
          : 'missing'

  return {
    mode,
    content: mode === 'live' ? homepageContent : null,
    contentStatus,
  }
}
