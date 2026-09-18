import { useState, useMemo, useEffect } from 'react'
import {
  productsByCategory,
  type ProductCategory,
  type ProductItem,
} from '../data'
import { useCart } from '../context/cartContextDef'
import { parsePriceToNumber } from '../utils/cartUtils'

type ShopCategory = 'all' | ProductCategory
type SortOption = 'featured' | 'price-asc' | 'price-desc'

const CATEGORY_ALL: ShopCategory = 'all'
const CATEGORY_CANDLES: ProductCategory = 'candles'
const CATEGORY_BOUQUETS: ProductCategory = 'bouquets'

const categoryTabs: { id: ShopCategory; label: string; href: string; count: number }[] = [
  {
    id: CATEGORY_ALL,
    label: 'All Creations',
    href: '#shop',
    count: productsByCategory.candles.length + productsByCategory.bouquets.length,
  },
  {
    id: CATEGORY_CANDLES,
    label: 'Artisanal Candles',
    href: '#shop/candles',
    count: productsByCategory.candles.length,
  },
  {
    id: CATEGORY_BOUQUETS,
    label: 'Floral Bouquets',
    href: '#shop/bouquets',
    count: productsByCategory.bouquets.length,
  },
]

interface ShopPageProps {
  category: ShopCategory
  onNavigateHome: () => void
}

export default function ShopPage({
  category,
  onNavigateHome,
}: ShopPageProps) {
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const { addItem } = useCart()

  // Scroll to top on mount or when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [category])

  const filteredProducts = useMemo(() => {
    let list: ProductItem[] = []
    if (category === CATEGORY_ALL) {
      list = [...productsByCategory.candles, ...productsByCategory.bouquets]
    } else if (category === CATEGORY_CANDLES) {
      list = [...productsByCategory.candles]
    } else if (category === CATEGORY_BOUQUETS) {
      list = [...productsByCategory.bouquets]
    }

    if (sortBy === 'price-asc') {
      return [...list].sort(
        (a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price)
      )
    }
    if (sortBy === 'price-desc') {
      return [...list].sort(
        (a, b) => parsePriceToNumber(b.price) - parsePriceToNumber(a.price)
      )
    }
    return list
  }, [category, sortBy])

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-border bg-beige/60 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-ink hover:text-gold transition-colors cursor-pointer bg-transparent border-none p-0 tracking-[0.08em] uppercase"
          >
            &larr; Return to Home
          </button>
          <div className="text-muted tracking-wider text-[11px] uppercase">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-muted hover:text-ink transition-colors bg-transparent border-none p-0 cursor-pointer uppercase text-[11px]"
            >
              Home
            </button>
            <span className="mx-2">/</span>
            <span className="text-ink font-medium">Shop</span>
            {category !== CATEGORY_ALL && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gold font-medium">
                  {category === CATEGORY_CANDLES
                    ? 'Artisanal Candles'
                    : 'Floral Bouquets'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <span className="text-[11px] tracking-[0.22em] uppercase text-gold font-medium block mb-2">
            The Atelier Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-ink m-0 mb-3">
            {category === CATEGORY_CANDLES
              ? 'Artisanal Scented Candles'
              : category === CATEGORY_BOUQUETS
              ? 'Bespoke Floral Bouquets'
              : 'The Complete Atelier Shop'}
          </h1>
          <p className="text-muted text-sm md:text-base font-light leading-relaxed m-0 max-w-2xl mx-auto">
            {category === CATEGORY_CANDLES
              ? 'Individually hand-poured botanical soy candles featuring sculptural art pieces, classical statues, festive urlis, and fragrant dessert wax creations.'
              : category === CATEGORY_BOUQUETS
              ? 'Everlasting preserved florals arranged in luxury Parisian hat boxes and keepsake wraps with personalized wax seals and handwritten notes.'
              : 'Explore our complete catalog of hand-poured botanical candles and preserved floral arrangements, handcrafted with love in our studio.'}
          </p>
        </div>

        {/* Controls: Category Filter Tabs & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {categoryTabs.map((tab) => {
              const isActive = category === tab.id
              return (
                <a
                  key={tab.id}
                  href={tab.href}
                  className={`px-4 py-2 text-xs tracking-[0.1em] uppercase font-medium rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 border no-underline ${
                    isActive
                      ? 'bg-ink text-cream border-ink shadow-sm'
                      : 'bg-white text-ink border-border hover:border-gold hover:text-gold'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-cream/20 text-cream' : 'bg-beige text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </a>
              )
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs self-end sm:self-auto shrink-0">
            <label htmlFor="shop-sort" className="text-muted tracking-wider uppercase text-[11px]">
              Sort By:
            </label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-border text-ink px-3 py-1.5 text-xs focus:outline-none focus:border-ink transition-colors cursor-pointer"
            >
              <option value="featured">Featured Curations</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="hover-lift border border-border bg-cream flex flex-col justify-between overflow-hidden group hover:border-gold/80 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative aspect-4/5 overflow-hidden bg-beige">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-cream/92 px-2.5 py-1 text-[9px] tracking-[0.1em] uppercase font-medium text-ink shadow-xs">
                    {product.badge}
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-ink/80 text-cream px-2 py-0.5 text-[8px] tracking-[0.12em] uppercase font-sans">
                  {product.category === CATEGORY_CANDLES ? 'Candle' : 'Bouquet'}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.14em] uppercase text-gold mb-1 font-medium">
                    {product.category === CATEGORY_CANDLES
                      ? 'Artisanal Candle'
                      : 'Floral Keepsake'}
                  </div>
                  <h3 className="font-serif text-lg md:text-xl font-medium m-0 mb-1.5 text-ink leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted font-light leading-relaxed m-0 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  {product.specs.scentNotes && (
                    <p className="text-[11px] text-ink/80 font-light italic m-0 mb-3 border-l-2 border-gold/50 pl-2">
                      {product.specs.scentNotes}
                    </p>
                  )}
                  {product.specs.burnTime && (
                    <div className="text-[10px] text-muted tracking-wider mb-3">
                      Burn Time: {product.specs.burnTime}
                    </div>
                  )}
                  {product.specs.material && !product.specs.burnTime && (
                    <div className="text-[10px] text-muted tracking-wider mb-3 line-clamp-1">
                      {product.specs.material}
                    </div>
                  )}
                </div>

                {/* Price and Add to Bag */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-sm gap-2">
                  <span className="font-medium text-ink shrink-0">{product.price}</span>
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        price: parsePriceToNumber(product.price),
                        priceFormatted: product.price,
                        image: product.image,
                        subtitle: product.specs.scentNotes || product.subtitle,
                      })
                    }
                    className="text-[10px] tracking-[0.12em] uppercase font-medium bg-beige hover:bg-ink text-ink hover:text-cream active:scale-95 px-3 py-1.5 transition-all duration-300 border border-border cursor-pointer shrink-0"
                    aria-label={`Add ${product.name} to bag`}
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Gifting Inquiry Banner */}
        <div className="mt-16 p-8 bg-beige/60 border border-border text-center max-w-3xl mx-auto">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-medium block mb-1">
            Bespoke Orders
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink m-0 mb-3">
            Looking for Custom Quantities or Wedding Favors?
          </h2>
          <p className="text-xs md:text-sm text-muted font-light max-w-lg mx-auto leading-relaxed mb-6">
            We curate personalized wax seals, custom fragrance notes, and tailored hat box arrangements for celebrations, hampers, and events.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="https://wa.me/919876543210?text=Hello%20Mausam%20Artwork,%20I%20would%20like%20to%20inquire%20about%20a%20custom%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-ink text-cream text-xs tracking-[0.12em] uppercase font-medium transition-colors duration-300 hover:bg-gold"
            >
              Chat on WhatsApp &rarr;
            </a>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-6 py-3 border border-ink text-ink text-xs tracking-[0.12em] uppercase font-medium transition-colors duration-300 hover:bg-ink hover:text-cream cursor-pointer"
            >
              Return to Atelier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
