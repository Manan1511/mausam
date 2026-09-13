import { giftSteps } from '../data'

export default function GiftingAtelier() {
  return (
    <div id="gifting" className="bg-cream px-8 py-[110px] md:px-16 text-center">
      <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-3">The Gifting Atelier</div>
      <h2 className="font-serif font-medium text-[38px] m-0 mb-16 max-w-[700px] mx-auto">
        Thoughtful Tokens &amp; Grand Gestures
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[1100px] mx-auto mb-16">
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
      <div className="flex gap-6 justify-center flex-wrap">
        <a href="#gifting" className="btn-solid bg-ink text-cream px-8 py-4 text-xs tracking-[0.1em] uppercase">
          Curate a Gift Box
        </a>
        <a
          href="#gifting"
          className="btn-outline border border-ink text-ink px-8 py-4 text-xs tracking-[0.1em] uppercase hover:bg-ink hover:text-cream"
        >
          Inquire for Bespoke &amp; Bulk Orders
        </a>
      </div>
    </div>
  )
}
