import { ambientMoments } from '../data'

export default function Editorial() {
  return (
    <div className="py-14 md:py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-[11px] tracking-[0.2em] uppercase text-gold mb-2">Editorial</div>
        <h2 className="text-center font-serif font-medium text-3xl md:text-[38px] m-0 mb-10 md:mb-12">Ambient Moments</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ambientMoments.map((item) => (
            <div
              key={item.label}
              className="hover-lift relative aspect-3/4 flex items-center justify-center cursor-pointer group overflow-hidden bg-beige"
            >
              <img
                src={item.image}
                alt={item.label}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-3 left-3 bg-cream/90 px-2.5 py-1 text-[9px] tracking-[0.1em] uppercase font-medium text-ink">
                {item.tag}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="bg-ink/80 backdrop-blur-xs text-cream px-3 py-1.5 text-[9px] sm:text-[10px] tracking-[0.08em] uppercase">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
