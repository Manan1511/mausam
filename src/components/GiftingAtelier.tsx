import { giftSteps } from '../data'

export default function GiftingAtelier() {
  return (
    <div id="gifting" className="scroll-mt-28 bg-cream py-14 md:py-20 px-6 md:px-12 text-center">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-2">The Gifting Atelier</div>
        <h2 className="font-serif font-medium text-3xl md:text-[38px] m-0 mb-10 md:mb-14 max-w-[700px] mx-auto">
          Thoughtful Tokens &amp; Grand Gestures
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto mb-12 md:mb-14">
        {giftSteps.map((step) => (
          <div key={step.number}>
            <div className="w-14 h-14 border border-gold rounded-full mx-auto mb-6 flex items-center justify-center font-serif text-xl text-gold">
              {step.number}
            </div>
            <h3 className="font-serif text-xl font-medium m-0 mb-2.5">{step.title}</h3>
            <p className="text-[13px] font-light text-muted leading-[1.7] m-0">{step.description}</p>
          </div>
        ))}
      </div>
        <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
          <a href="#gifting" className="btn-solid bg-ink text-cream px-7 py-3.5 text-xs tracking-[0.1em] uppercase">
            Curate a Gift Box
          </a>
          <a
            href="#gifting"
            className="btn-outline border border-ink text-ink px-7 py-3.5 text-xs tracking-[0.1em] uppercase hover:bg-ink hover:text-cream"
          >
            Inquire for Bespoke &amp; Bulk Orders
          </a>
        </div>
      </div>
    </div>
  )
}
