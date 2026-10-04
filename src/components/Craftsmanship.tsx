import { craftFeatures } from '../data'
import { useStorefrontContent } from '../context/StorefrontContentProvider'

const shapeClasses: Record<string, string> = {
  circle: 'w-12 h-12 border border-ink rounded-full mx-auto mb-5 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:scale-110 group-hover:shadow-sm',
  diamond: 'w-12 h-12 border border-ink mx-auto mb-5 rotate-45 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:scale-110 group-hover:shadow-sm',
  square: 'w-12 h-12 border border-ink mx-auto mb-5 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:scale-110 group-hover:shadow-sm',
}

export default function Craftsmanship() {
  const { content, mode } = useStorefrontContent()
  if (mode === 'live' && !content) return null

  const craftsmanship = content?.craftsmanship
  const features = mode === 'preview'
    ? craftFeatures
    : (craftsmanship?.features ?? []).map((feature, index) => ({
        ...feature,
        shape: craftFeatures[index]?.shape ?? 'circle' as const,
      }))
  const eyebrow = craftsmanship?.eyebrow ?? 'Our Standard'
  const title = craftsmanship?.title ?? 'The Art of Clean Botanical Craft'
  const body = craftsmanship?.body ?? 'Every piece is poured and arranged with mindfulness, using 100% natural wax, premium phthalate-free oils, and everlasting botanical blooms.'
  const image = mode === 'live' ? craftsmanship?.image : null

  return (
    <div className="bg-beige py-14 md:py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {eyebrow && <div className="text-center text-[11px] tracking-[0.2em] uppercase text-gold mb-2">{eyebrow}</div>}
        <h2 className="text-center font-serif font-medium text-3xl md:text-[38px] m-0 mb-4">{title}</h2>
        {body && <p className="text-center text-xs md:text-sm text-muted font-light max-w-xl mx-auto leading-relaxed mb-10 md:mb-14">{body}</p>}
        {image && (
          <div className="max-w-4xl mx-auto mb-8 md:mb-10 aspect-[2.4/1] overflow-hidden bg-cream">
            <img src={image.url} alt={image.altText ?? title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto text-center">
          {features.map((feature, index) => (
            <div key={`${feature.title}-${index}`} className="group p-4 transition-transform duration-300 hover:-translate-y-1">
              <div className={shapeClasses[feature.shape]}>
                <span className="w-1.5 h-1.5 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="font-serif text-[19px] font-medium m-0 mb-2 text-ink group-hover:text-gold transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-[13px] font-light text-muted leading-[1.7] m-0">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
