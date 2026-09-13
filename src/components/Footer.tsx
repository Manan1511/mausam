export default function Footer() {
  return (
    <div id="story" className="bg-cream border-t border-border px-8 pt-20 pb-10 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-16 mb-16">
        <div>
          <div className="font-serif text-2xl tracking-[0.1em] mb-4">MAUSAM ARTWORK</div>
          <p className="text-[13px] font-light text-muted leading-[1.8] max-w-[340px] m-0 mb-6">
            Handcrafted sculptural candles, created as art and made to be experienced — each vessel cast to be kept
            long after the wax is gone.
          </p>
          <div className="flex max-w-[340px] border-b border-ink pb-2">
            <input
              type="email"
              placeholder="Receive seasonal olfactory releases and private collection invites"
              className="border-none bg-transparent flex-1 font-sans text-xs outline-none text-ink placeholder:text-muted"
            />
            <span className="text-[11px] tracking-[0.1em] uppercase text-gold whitespace-nowrap">Subscribe</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.15em] uppercase mb-5 text-gold">Customer Concierge</div>
          <div className="flex flex-col gap-3 text-[13px] font-light">
            <a href="#story">Candle Care Guide</a>
            <a href="#story">Order Tracking</a>
            <a href="#story">Shipping</a>
            <a href="#story">FAQs</a>
          </div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.15em] uppercase mb-5 text-gold">Corporate Gifting</div>
          <div className="flex flex-col gap-3 text-[13px] font-light">
            <a href="#gifting">Bulk Orders</a>
            <a href="#gifting">Custom Branding</a>
            <a href="#story">Contact Concierge</a>
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
  )
}
