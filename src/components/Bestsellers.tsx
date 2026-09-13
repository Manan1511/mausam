import { bestsellers } from '../data'

export default function Bestsellers() {
  return (
    <div className="bg-beige px-8 py-[100px] md:px-16 text-center">
      <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-3">Bestsellers</div>
      <h2 className="font-serif font-medium text-[38px] m-0 mb-14">Signature Vessels &amp; Centerpieces</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-7 text-left">
        {bestsellers.map((item) => (
          <div key={item.name} className="product-card hover-lift bg-cream relative overflow-hidden">
            <div className="diagonal-swatch-tight aspect-4/5 flex items-center justify-center relative overflow-hidden">
              <div className="bg-cream/88 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.05em] text-center">
                {item.photoLabel}
              </div>
              <div className="quick-add absolute bottom-0 left-0 right-0 bg-ink text-cream text-center p-3 text-[11px] tracking-[0.1em] uppercase">
                Quick Add
              </div>
            </div>
            <div className="px-1 py-5">
              <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-1.5">{item.category}</div>
              <h3 className="font-serif text-[19px] font-medium m-0 mb-1.5">{item.name}</h3>
              <p className="text-[11px] text-muted font-light m-0 mb-2">{item.notes}</p>
              <div className="text-sm">{item.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
