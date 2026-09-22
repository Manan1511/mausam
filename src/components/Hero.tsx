export default function Hero() {
  return (
    <div
      id="collections"
      className="relative scroll-mt-28 grid grid-cols-1 md:grid-cols-2 min-h-0 md:min-h-[calc(100vh-130px)] md:max-h-[840px] overflow-hidden"
    >
      {/* Hero Left: Text Column with Full-Bleed Bouquet Backdrop */}
      <div className="relative w-full h-full flex flex-col justify-center px-6 py-12 sm:px-8 sm:py-14 md:px-12 lg:px-16 md:py-16 overflow-hidden">
        {/* Bouquet Backdrop Image & Editorial Scrim */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <img
            src="/images/hero-bouquet-backdrop.webp"
            alt=""
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-bottom opacity-95 transition-transform duration-1000 ease-out"
          />
          {/* Soft editorial blur and cream gradient for crystal-clear text readability on all devices */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream/95 via-cream/85 to-cream/25" />
          <div className="absolute inset-0 backdrop-blur-[1.5px]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col gap-5 sm:gap-6 md:gap-7 max-w-[540px] mx-auto md:mx-0 w-full animate-fade-in-up">
          <div className="text-[11px] tracking-[0.22em] uppercase text-gold font-medium">
            Handcrafted Scent &amp; Floral Atelier
          </div>
          <h1 className="font-serif font-medium text-[34px] sm:text-[42px] md:text-[52px] lg:text-[56px] leading-[1.08] m-0 text-ink">
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
      </div>

      {/* Hero Right: Artisanal Candles Visual */}
      <div className="relative overflow-hidden w-full h-[360px] sm:h-[440px] md:h-full min-h-[320px] md:min-h-full bg-beige group">
        <img
          src="/images/products/hero-lifestyle.webp"
          alt="Mausam Artwork Artisanal Candles and Bouquets Display"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        <div className="absolute bottom-6 left-6 bg-cream/92 backdrop-blur-sm px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-serif text-ink border border-border shadow-xs animate-float-slow">
          Mausam Atelier Collection
        </div>
      </div>
    </div>
  )
}
