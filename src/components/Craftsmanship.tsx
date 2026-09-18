import { craftFeatures } from '../data'

const shapeClasses: Record<string, string> = {
  circle: 'w-12 h-12 border border-ink rounded-full mx-auto mb-5 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:scale-110 group-hover:shadow-sm',
  diamond: 'w-12 h-12 border border-ink mx-auto mb-5 rotate-45 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:scale-110 group-hover:shadow-sm',
  square: 'w-12 h-12 border border-ink mx-auto mb-5 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:scale-110 group-hover:shadow-sm',
}

export default function Craftsmanship() {
  return (
    <div className="bg-beige py-14 md:py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-[11px] tracking-[0.2em] uppercase text-gold mb-2">Our Standard</div>
        <h2 className="text-center font-serif font-medium text-3xl md:text-[38px] m-0 mb-4">The Art of Clean Botanical Craft</h2>
        <p className="text-center text-xs md:text-sm text-muted font-light max-w-xl mx-auto leading-relaxed mb-10 md:mb-14">
          Every piece is poured and arranged with mindfulness — using 100% natural wax, premium phthalate-free oils, and everlasting botanical blooms.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto text-center">
          {craftFeatures.map((feature) => (
            <div key={feature.title} className="group p-4 transition-transform duration-300 hover:-translate-y-1">
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
