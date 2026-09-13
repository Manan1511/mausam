import { ambientMoments } from '../data'

export default function Editorial() {
  return (
    <div className="px-8 py-[100px] md:px-16">
      <div className="text-center text-[11px] tracking-[0.2em] uppercase text-gold mb-3">Editorial</div>
      <h2 className="text-center font-serif font-medium text-[38px] m-0 mb-14">Ambient Moments</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {ambientMoments.map((label) => (
          <div
            key={label}
            className="diagonal-swatch-soft relative aspect-3/4 flex items-center justify-center"
          >
            <div className="bg-cream/88 px-3 py-1.5 font-mono text-[9px] uppercase text-center">{label}</div>
            <div className="absolute bottom-4 left-4 bg-ink text-cream px-3.5 py-2 text-[10px] tracking-[0.08em] uppercase">
              Shop the Mood
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
