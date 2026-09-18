import { productCategories } from '../data'

export default function ProductOfferings() {
  return (
    <section id="offerings" className="scroll-mt-28 py-14 md:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
        <div className="text-[11px] tracking-[0.22em] uppercase text-gold font-medium mb-2">
          Our Studio Offerings
        </div>
        <h2 className="font-serif font-medium text-3xl md:text-4xl lg:text-[42px] m-0 mb-4 text-ink">
          Artisanal Candles &amp; Bespoke Bouquets
        </h2>
        <p className="text-muted text-sm md:text-base font-light leading-[1.75] m-0 max-w-2xl mx-auto">
          Mausam Artwork exists at the intersection of natural olfactory craft and bespoke botanical design. Each piece is individually handcrafted in small atelier batches — from sculptural botanical candles to everlasting floral keepsakes.
        </p>
      </div>

      {/* Dual Category Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12">
        {productCategories.map((cat) => (
          <a
            key={cat.id}
            href={`#shop/${cat.id}`}
            className="group relative border border-border bg-cream hover:border-gold hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between hover-lift text-ink no-underline block"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-beige">
              <img
                src={cat.coverImage}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-cream/90 px-3 py-1 text-[10px] tracking-[0.1em] uppercase font-medium text-ink shadow-xs">
                {cat.badge}
              </div>
              <div className="absolute bottom-4 right-4 bg-ink/80 text-cream px-3 py-1 text-[10px] tracking-[0.1em] uppercase">
                {cat.countLabel}
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
              <div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-gold mb-1 font-medium">
                  {cat.tagline}
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-medium m-0 mb-2 text-ink">
                  {cat.name}
                </h3>
                <p className="text-xs md:text-sm text-muted font-light leading-[1.7] m-0 mb-6">
                  {cat.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs tracking-[0.12em] uppercase text-ink font-medium group-hover:text-gold transition-colors duration-300">
                  Browse {cat.name} &rarr;
                </span>
                <span className="w-8 h-8 rounded-full border border-ink/40 flex items-center justify-center text-xs text-ink transition-all duration-300 group-hover:translate-x-1 group-hover:border-gold group-hover:text-gold">
                  &rarr;
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Action to Visit Complete Shop */}
      <div className="text-center pt-2">
        <a
          href="#shop"
          className="btn-solid bg-ink text-cream px-8 py-4 text-xs tracking-[0.14em] uppercase font-medium transition-all duration-300 hover:bg-gold hover:shadow-lg inline-flex items-center gap-2 active:scale-95"
        >
          <span>Explore Complete Atelier Shop</span>
          <span>&rarr;</span>
        </a>
      </div>
    </section>
  )
}
