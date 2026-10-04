import { useStorefrontContent } from '../context/StorefrontContentProvider'

export default function AnnouncementBar() {
  const { content, mode } = useStorefrontContent()
  const text = mode === 'preview'
    ? 'Hand-Poured Scented Candles | Bespoke Everlasting Bouquets | Crafted with Love in India'
    : content?.announcement.enabled ? content.announcement.text : ''
  if (!text) return null

  return (
    <div className="bg-beige text-center px-5 py-2.5 font-sans text-xs tracking-[0.12em] uppercase text-ink border-b border-border">
      {text}
    </div>
  )
}
