export default function Hero() {
  return (
    <div id="collections" className="scroll-mt-28 grid grid-cols-1 md:grid-cols-2 min-h-[540px] md:min-h-[calc(100vh-140px)] max-h-[820px]">
      <div className="flex flex-col justify-center gap-6 md:gap-7 px-6 py-12 md:px-14 lg:px-20 md:py-16 max-w-[680px] mx-auto md:mx-0">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold">Handcrafted Luxury Atelier</div>
        <h1 className="font-serif font-medium text-[38px] md:text-[56px] leading-[1.08] m-0">
          Artisanal Candles &amp; Bespoke Bouquets.
        </h1>
        <p className="text-base leading-[1.7] text-ink font-light max-w-[460px]">
          Sculptural hand-poured soy candles and everlasting floral arrangements, crafted in our atelier to elevate and
          illuminate your personal sanctuary.
        </p>
        <div className="flex flex-wrap gap-6 sm:gap-8 items-center mt-2">
          <a
            href="#offerings"
            className="btn-solid bg-ink text-cream px-8 py-4 text-xs tracking-[0.1em] uppercase"
          >
            Explore The Creations
          </a>
          <a
            href="#gifting"
            className="text-xs tracking-[0.1em] uppercase border-b border-gold pb-1.5 text-ink transition-colors duration-300 hover:text-gold"
          >
            Discover Gifting Atelier
          </a>
        </div>
      </div>
      <div className="relative overflow-hidden min-h-[360px] md:min-h-full bg-beige">
        <img
          src="/images/products/hero-lifestyle.webp"
          alt="Mausam Artwork Artisanal Candles and Bouquets Display"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-6 left-6 bg-cream/90 backdrop-blur-xs px-4 py-2 text-[11px] tracking-[0.1em] uppercase font-serif text-ink">
          Mausam Atelier Collection
        </div>
      </div>
    </div>
  )
}
