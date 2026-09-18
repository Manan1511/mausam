import { giftSteps } from '../data'

export default function GiftingAtelier() {
  return (
    <div id="gifting" className="scroll-mt-28 bg-cream py-14 md:py-20 px-6 md:px-12 text-center">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-2 font-medium">The Gifting Atelier</div>
        <h2 className="font-serif font-medium text-3xl md:text-[40px] m-0 mb-3 max-w-[700px] mx-auto">
          Thoughtful Keepsakes &amp; Bespoke Gifting
        </h2>
        <p className="text-xs md:text-sm text-muted font-light max-w-lg mx-auto leading-relaxed mb-10 md:mb-14">
          From birthday surprises and anniversary boxes to wedding favors and festive corporate hampers, each piece is packaged to delight.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto mb-12 md:mb-14">
        {giftSteps.map((step) => (
          <div key={step.number} className="group p-4 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 border border-gold rounded-full mx-auto mb-6 flex items-center justify-center font-serif text-xl text-gold group-hover:bg-gold group-hover:text-cream group-hover:shadow-md transition-all duration-300 transform group-hover:scale-110">
              {step.number}
            </div>
            <h3 className="font-serif text-xl font-medium m-0 mb-2.5 text-ink group-hover:text-gold transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-[13px] font-light text-muted leading-[1.7] m-0">{step.description}</p>
          </div>
        ))}
      </div>
        <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
          <a
            href="#offerings"
            className="btn-solid bg-ink text-cream px-7 py-3.5 text-xs tracking-[0.12em] uppercase transition-all duration-300 hover:bg-gold hover:shadow-md active:scale-95"
          >
            Explore Gifting Curations
          </a>
          <a
            href="https://wa.me/919876543210?text=Hello%20Mausam%20Artwork,%20I%20would%20like%20to%20inquire%20about%20bespoke%20gifting"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline border border-ink text-ink px-7 py-3.5 text-xs tracking-[0.12em] uppercase transition-all duration-300 hover:bg-ink hover:text-cream active:scale-95"
          >
            WhatsApp Bespoke Inquiry &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
