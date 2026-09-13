export default function Hero() {
  return (
    <div id="collections" className="grid grid-cols-1 md:grid-cols-2 min-h-[640px]">
      <div className="flex flex-col justify-center gap-7 px-8 py-16 md:px-16 md:py-20 max-w-[640px]">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold">Autumn / Winter Collection</div>
        <h1 className="font-serif font-medium text-[38px] md:text-[56px] leading-[1.08] m-0">
          Fragrance as an Art Form. Seasons in Scent.
        </h1>
        <p className="text-base leading-[1.7] text-ink font-light max-w-[460px]">
          Hand-poured soy candles housed in sculptural, reusable vessels. Designed to illuminate your personal
          sanctuary.
        </p>
        <div className="flex flex-wrap gap-8 items-center mt-2">
          <a
            href="#collections"
            className="btn-solid bg-ink text-cream px-8 py-4 text-xs tracking-[0.1em] uppercase"
          >
            Explore The Collection
          </a>
          <a
            href="#gifting"
            className="text-xs tracking-[0.1em] uppercase border-b border-gold pb-1.5 text-ink transition-colors duration-300"
          >
            Discover The Gifting Atelier
          </a>
        </div>
      </div>
      <div className="diagonal-swatch relative flex items-center justify-center min-h-[320px]">
        <div className="bg-cream/88 px-5 py-2.5 font-mono text-[11px] tracking-[0.08em] uppercase text-ink text-center">
          Lifestyle photo — ribbed amber glass &amp; ceramic vessels on travertine
        </div>
      </div>
    </div>
  )
}
