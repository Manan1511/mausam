export default function Hero() {
  return (
    <div id="collections" className="scroll-mt-28 grid grid-cols-1 md:grid-cols-2 min-h-[520px] md:min-h-[calc(100vh-130px)] max-h-[820px]">
      <div className="flex flex-col justify-center gap-5 sm:gap-6 md:gap-7 px-6 py-12 md:px-14 lg:px-20 md:py-16 max-w-[680px] mx-auto md:mx-0 animate-fade-in-up">
        <div className="text-[11px] tracking-[0.22em] uppercase text-gold font-medium">
          Handcrafted Scent &amp; Floral Atelier
        </div>
        <h1 className="font-serif font-medium text-[36px] sm:text-[44px] md:text-[56px] leading-[1.08] m-0 text-ink">
          Artisanal Candles &amp; Bespoke Bouquets.
        </h1>
        <p className="text-sm sm:text-base leading-[1.75] text-ink/85 font-light max-w-[460px] m-0">
          Hand-poured botanical soy candles and everlasting preserved floral keepsakes. Individually handcrafted in our atelier to bring fragrance, warmth, and timeless beauty into every space.
        </p>
        <div className="flex flex-wrap gap-4 sm:gap-6 items-center mt-2 pt-1">
          <a
            href="#offerings"
            className="btn-solid bg-ink text-cream px-7 sm:px-8 py-3.5 sm:py-4 text-xs tracking-[0.12em] uppercase transition-all duration-300 hover:bg-gold hover:shadow-lg active:scale-95"
          >
            Explore Collections
          </a>
          <a
            href="#gifting"
            className="text-xs tracking-[0.12em] uppercase border-b border-gold pb-1 text-ink transition-all duration-300 hover:text-gold hover:border-ink"
          >
            Bespoke Gifting &rarr;
          </a>
        </div>
      </div>
      <div className="relative overflow-hidden min-h-[340px] md:min-h-full bg-beige group">
        <img
          src="/images/products/hero-lifestyle.webp"
          alt="Mausam Artwork Artisanal Candles and Bouquets Display"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        <div className="absolute bottom-6 left-6 bg-cream/92 backdrop-blur-sm px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-serif text-ink border border-border shadow-xs animate-float-slow">
          Mausam Atelier Collection
        </div>
      </div>
    </div>
  )
}
