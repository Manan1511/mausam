import { giftSteps } from '../data'
import { useStorefrontContent } from '../context/StorefrontContentProvider'

export default function GiftingAtelier() {
  const { content, mode } = useStorefrontContent()
  if (mode === 'live' && !content) return null

  const gifting = content?.gifting
  const steps = mode === 'preview'
    ? giftSteps.map(({ title, description }) => ({ title, description }))
    : gifting?.steps ?? []
  const image = mode === 'live' ? gifting?.image : null
  const eyebrow = gifting?.eyebrow ?? 'The Gifting Atelier'
  const title = gifting?.title ?? 'Thoughtful Keepsakes & Bespoke Gifting'
  const body = gifting?.body ?? 'From birthday surprises and anniversary boxes to wedding favors and festive corporate hampers, each piece is packaged to delight.'
  const primaryLabel = gifting?.ctaLabel ?? 'Explore Gifting Curations'
  const primaryHref = gifting?.ctaHref ?? '#offerings'
  const secondaryLabel = mode === 'preview' ? 'WhatsApp Bespoke Inquiry →' : gifting?.secondaryCtaLabel
  const secondaryHref = mode === 'preview'
    ? 'https://wa.me/919876543210?text=Hello%20Mausam%20Artwork,%20I%20would%20like%20to%20inquire%20about%20bespoke%20gifting'
    : gifting?.secondaryCtaHref

  return (
    <div id="gifting" className="scroll-mt-28 bg-cream py-14 md:py-20 px-6 md:px-12 text-center">
      <div className="max-w-7xl mx-auto">
        {eyebrow && <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-2 font-medium">{eyebrow}</div>}
        <h2 className="font-serif font-medium text-3xl md:text-[40px] m-0 mb-3 max-w-[700px] mx-auto">{title}</h2>
        {body && <p className="text-xs md:text-sm text-muted font-light max-w-lg mx-auto leading-relaxed mb-10 md:mb-14">{body}</p>}
        {image && (
          <div className="max-w-4xl mx-auto mb-8 md:mb-10 aspect-[2.4/1] overflow-hidden bg-beige">
            <img src={image.url} alt={image.altText ?? title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto mb-12 md:mb-14">
        {steps.map((step, index) => (
          <div key={`${step.title}-${index}`} className="group p-4 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 border border-gold rounded-full mx-auto mb-6 flex items-center justify-center font-serif text-xl text-gold group-hover:bg-gold group-hover:text-cream group-hover:shadow-md transition-all duration-300 transform group-hover:scale-110">
              {index + 1}
            </div>
            <h3 className="font-serif text-xl font-medium m-0 mb-2.5 text-ink group-hover:text-gold transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-[13px] font-light text-muted leading-[1.7] m-0">{step.description}</p>
          </div>
        ))}
      </div>
        <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
          {primaryLabel && primaryHref && (
            <a href={primaryHref} className="btn-solid bg-ink text-cream px-7 py-3.5 text-xs tracking-[0.12em] uppercase transition-all duration-300 hover:bg-gold hover:shadow-md active:scale-95">
              {primaryLabel}
            </a>
          )}
          {secondaryLabel && secondaryHref && (
            <a
              href={secondaryHref}
              target={secondaryHref.startsWith('https://') ? '_blank' : undefined}
              rel={secondaryHref.startsWith('https://') ? 'noopener noreferrer' : undefined}
              className="btn-outline border border-ink text-ink px-7 py-3.5 text-xs tracking-[0.12em] uppercase transition-all duration-300 hover:bg-ink hover:text-cream active:scale-95"
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
