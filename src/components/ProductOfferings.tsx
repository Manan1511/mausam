import { useState } from 'react'
import {
  productCategories,
  productsByCategory,
  type ProductCategory,
  type ProductItem,
} from '../data'

type ActiveFilter = 'all' | ProductCategory

const FILTER_ALL = 'all'
const FILTER_CANDLES: ProductCategory = 'candles'
const FILTER_BOUQUETS: ProductCategory = 'bouquets'

const filterTabs: { id: ActiveFilter; label: string }[] = [
  { id: FILTER_ALL, label: 'All Offerings' },
  { id: FILTER_CANDLES, label: 'Artisanal Candles' },
  { id: FILTER_BOUQUETS, label: 'Floral Bouquets' },
]

export default function ProductOfferings() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(FILTER_ALL)

  const candleItems = productsByCategory.candles
  const bouquetItems = productsByCategory.bouquets

  const displayedProducts: ProductItem[] =
    activeFilter === FILTER_ALL
      ? [...candleItems.slice(0, 4), ...bouquetItems.slice(0, 4)]
      : productsByCategory[activeFilter]

  return (
    <section id="offerings" className="scroll-mt-28 py-14 md:py-20 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-14">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-2">The Two Pillars</div>
        <h2 className="font-serif font-medium text-3xl md:text-4xl lg:text-[42px] m-0 mb-4">
          Artisanal Candles &amp; Bespoke Bouquets
        </h2>
        <p className="text-muted text-sm md:text-base font-light leading-[1.7] m-0">
          Mausam Artwork exists at the intersection of olfactory craft and botanical design. Each piece is individually
          handcrafted in our atelier — from sculpted soy candles to everlasting floral keepsakes.
        </p>
      </div>

      {/* Dual Category Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-14 md:mb-16">
        {productCategories.map((cat) => {
          const isSelected = activeFilter === cat.id
          return (
            <div
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`group relative border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-ink bg-beige/50 shadow-md ring-1 ring-ink'
                  : 'border-border bg-cream hover:border-gold hover:shadow-lg'
              }`}
            >
              <div className="relative aspect-16/10 overflow-hidden bg-beige">
                <img
                  src={cat.coverImage}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-cream/90 px-3 py-1 text-[10px] tracking-[0.1em] uppercase font-medium text-ink">
                  {cat.badge}
                </div>
                <div className="absolute bottom-4 right-4 bg-ink/80 text-cream px-3 py-1 text-[10px] tracking-[0.1em] uppercase">
                  {cat.countLabel}
                </div>
              </div>

              <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.15em] uppercase text-gold mb-1">{cat.tagline}</div>
                  <h3 className="font-serif text-2xl md:text-3xl font-medium m-0 mb-2">{cat.name}</h3>
                  <p className="text-xs md:text-sm text-muted font-light leading-[1.7] m-0 mb-5">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs tracking-[0.1em] uppercase text-ink font-medium group-hover:text-gold transition-colors duration-300">
                    {isSelected ? 'Viewing This Collection ↓' : `Browse ${cat.name} →`}
                  </span>
                  <span className="w-8 h-8 rounded-full border border-ink/40 flex items-center justify-center text-xs text-ink transition-transform duration-300 group-hover:translate-x-1 group-hover:border-ink">
                    →
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border mb-10 md:mb-12">
        <div className="no-scrollbar flex md:justify-center items-center gap-2 sm:gap-4 overflow-x-auto md:overflow-visible flex-nowrap -mx-6 px-6 md:mx-0 md:px-0">
          {filterTabs.map((tab) => {
            const active = activeFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                aria-pressed={active}
                className={`shrink-0 whitespace-nowrap px-4 sm:px-6 py-3 font-serif text-base md:text-lg border-b-2 transition-colors duration-300 cursor-pointer bg-transparent ${
                  active
                    ? 'border-ink text-ink font-medium'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
        {displayedProducts.map((product) => (
          <div
            key={product.id}
            className="hover-lift border border-border bg-cream flex flex-col justify-between overflow-hidden group"
          >
            <div className="relative aspect-4/5 overflow-hidden bg-beige">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {product.badge && (
                <div className="absolute top-3 left-3 bg-cream/92 px-2.5 py-1 text-[9px] tracking-[0.1em] uppercase font-medium text-ink">
                  {product.badge}
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <div className="text-[10px] tracking-[0.12em] uppercase text-gold mb-1">
                  {product.category === 'candles' ? 'Artisanal Candle' : 'Floral Bouquet'}
                </div>
                <h4 className="font-serif text-lg md:text-xl font-medium m-0 mb-1 leading-snug">
                  {product.name}
                </h4>
                <p className="text-xs text-muted font-light leading-[1.6] m-0 mb-3 line-clamp-2">
                  {product.description}
                </p>
                {product.specs.scentNotes && (
                  <p className="text-[11px] text-ink/75 font-light italic m-0 mb-3 border-l-2 border-gold/50 pl-2">
                    {product.specs.scentNotes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                <span className="font-medium text-ink">{product.price}</span>
                <span className="text-[10px] tracking-[0.1em] uppercase text-gold hover:text-ink transition-colors cursor-pointer">
                  Inquire
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
