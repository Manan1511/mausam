import { craftFeatures } from '../data'

const shapeClasses: Record<string, string> = {
  circle: 'w-11 h-11 border border-ink rounded-full mx-auto mb-5.5',
  diamond: 'w-11 h-11 border border-ink mx-auto mb-5.5 rotate-45',
  square: 'w-11 h-11 border border-ink mx-auto mb-5.5',
}

export default function Craftsmanship() {
  return (
    <div className="bg-beige py-14 md:py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-[11px] tracking-[0.2em] uppercase text-gold mb-2">Craftsmanship</div>
        <h2 className="text-center font-serif font-medium text-3xl md:text-[38px] m-0 mb-10 md:mb-12">The Anatomy of a Clean Burn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto text-center">
          {craftFeatures.map((feature) => (
            <div key={feature.title}>
              <div className={shapeClasses[feature.shape]} />
              <h3 className="font-serif text-[19px] font-medium m-0 mb-2">{feature.title}</h3>
              <p className="text-[13px] font-light text-muted leading-[1.7] m-0">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
