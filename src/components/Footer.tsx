export default function Footer() {
  return (
    <div id="story" className="scroll-mt-28 bg-cream border-t border-border px-6 pt-16 pb-10 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 md:gap-16 mb-12 md:mb-14">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/images/logo-icon.webp"
                alt="Mausam Artwork Logo"
                width="36"
                height="36"
                loading="lazy"
                decoding="async"
                className="w-8 h-8 object-contain"
              />
              <div className="font-serif text-2xl tracking-[0.1em]">MAUSAM ARTWORK</div>
            </div>
            <p className="text-[13px] font-light text-muted leading-[1.8] max-w-[340px] m-0 mb-6">
              Handcrafted sculptural soy candles and bespoke everlasting bouquets, created as art and made to elevate
              your personal spaces.
            </p>
            <div className="flex max-w-[340px] border-b border-ink pb-2">
              <input
                type="email"
                placeholder="Receive seasonal olfactory releases"
                aria-label="Email subscription"
                className="border-none bg-transparent flex-1 font-sans text-xs outline-none text-ink placeholder:text-muted"
              />
              <button
                type="button"
                className="text-[11px] tracking-[0.1em] uppercase text-gold whitespace-nowrap cursor-pointer hover:text-ink transition-colors duration-300"
              >
                Subscribe
              </button>
            </div>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.15em] uppercase mb-4 md:mb-5 text-gold font-medium">Customer Care</div>
            <div className="flex flex-col gap-2.5 sm:gap-3 text-[13px] font-light">
              <a href="#story" className="hover:text-gold transition-colors">Candle &amp; Floral Care Guide</a>
              <a href="#offerings" className="hover:text-gold transition-colors">Pan-India Atelier Shipping</a>
              <a href="#story" className="hover:text-gold transition-colors">Artisanal Studio FAQs</a>
            </div>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.15em] uppercase mb-4 md:mb-5 text-gold font-medium">Bespoke &amp; Celebrations</div>
            <div className="flex flex-col gap-2.5 sm:gap-3 text-[13px] font-light">
              <a href="#gifting" className="hover:text-gold transition-colors">Wedding &amp; Event Favors</a>
              <a href="#gifting" className="hover:text-gold transition-colors">Personalized Gift Boxes</a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">WhatsApp Studio Concierge</a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex justify-between items-center flex-wrap gap-4">
          <div className="text-[11px] text-muted font-light">© 2026 Mausam Artwork. All rights reserved.</div>
          <div className="flex gap-2.5">
            {['VISA', 'MASTERCARD', 'RUPAY', 'UPI'].map((label) => (
              <span
                key={label}
                className="border border-border px-2.5 py-1 text-[10px] tracking-[0.05em] text-muted"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
