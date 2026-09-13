import { useState } from 'react'
import { seasonTabs, seasonProductsByTab } from '../data'

export default function ShopByMausam() {
  const [activeTab, setActiveTab] = useState(seasonTabs[0].id)
  const products = seasonProductsByTab[activeTab]

  return (
    <div id="shop-by-mausam" className="px-8 py-[100px] md:px-16 text-center">
      <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-3">Shop by Mausam</div>
      <h2 className="font-serif font-medium text-[38px] m-0 mb-10">A Seasonal Scent Journey</h2>

      <div className="flex justify-center gap-0 border-b border-border mb-14 flex-wrap">
        {seasonTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={
              activeTab === tab.id
                ? 'px-8 py-4 font-serif text-xl border-b-2 border-ink transition-colors duration-300 cursor-pointer bg-transparent'
                : 'px-8 py-4 font-serif text-xl text-muted border-b-2 border-transparent transition-colors duration-300 hover:text-ink cursor-pointer bg-transparent'
            }
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {products.map((product) => (
          <div key={product.name} className="hover-lift border border-border">
            <div className="diagonal-swatch-tight aspect-4/5 flex items-center justify-center">
              <div className="bg-cream/88 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.06em] text-center">
                {product.photoLabel}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif font-medium text-[22px] m-0 mb-2.5">{product.name}</h3>
              <p className="text-xs tracking-[0.05em] text-ink font-light leading-[1.7] m-0 mb-3.5">
                {product.notes.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < product.notes.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <div className="flex justify-between text-[11px] tracking-[0.06em] uppercase text-muted">
                <span>{product.burnTime}</span>
                <span>{product.weight}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
