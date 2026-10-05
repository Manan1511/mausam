import { useCart } from '../context/cartContextDef'
import type { StoreProduct } from '../types/shopify'
import { formatMoney } from '../utils/cartUtils'
import { ProductVariantSelect } from './ProductVariantPicker'
import { useProductVariant } from '../hooks/useProductVariant'

export default function Bestsellers() {
  const { featuredProducts, missingFeaturedProductCount, status, mode, homepageStatus } = useCart()

  return (
    <div id="bestsellers" className="scroll-mt-28 bg-beige py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-2">Bestsellers</div>
        <h2 className="font-serif font-medium text-3xl md:text-[38px] m-0 mb-10 md:mb-12">
          Signature Vessels &amp; Centerpieces
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-7 text-left">
          {featuredProducts.map((product) => (
            <BestsellerCard key={product.id} product={product} />
          ))}
        </div>
        {status === 'loading' && featuredProducts.length === 0 && (
          <p className="py-8 text-sm text-muted" role="status">Loading featured creations…</p>
        )}
        {status === 'unavailable' && (
          <p className="py-8 text-sm text-muted" role="alert">
            Featured creations are temporarily unavailable.
          </p>
        )}
        {status === 'ready' && mode === 'live' && homepageStatus === 'unavailable' && (
          <p className="py-8 text-sm text-muted" role="alert">
            Featured creations could not be loaded from Shopify.
          </p>
        )}
        {status === 'ready' && mode === 'live' && missingFeaturedProductCount > 0 && (
          <p className="py-8 text-sm text-muted" role="alert">
            {missingFeaturedProductCount === 1
              ? 'One featured product is not published to this Shopify storefront. Check the product publication and homepage selection.'
              : `${missingFeaturedProductCount} featured products are not published to this Shopify storefront. Check product publication and homepage selection.`}
          </p>
        )}
        {status === 'ready' && featuredProducts.length === 0 && homepageStatus === 'ready' && (
          <p className="py-8 text-sm text-muted">Featured creations will appear here soon.</p>
        )}
      </div>
    </div>
  )
}

function BestsellerCard({ product }: { product: StoreProduct }) {
  const { variantId, setVariantId, canAdd, addToBag } = useProductVariant(product)
  const categoryLabel = product.category === 'candles'
    ? 'Artisanal Candles'
    : product.category === 'bouquets'
      ? 'Floral Bouquets'
      : product.vendor

  return (
    <div className="product-card hover-lift bg-cream relative overflow-hidden flex flex-col justify-between">
      <div className="relative aspect-4/5 overflow-hidden bg-beige group">
        {product.image && (
          <img
            src={product.image.url}
            alt={product.image.altText || product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
          />
        )}
        <button
          type="button"
          onClick={() => void addToBag()}
          disabled={!canAdd}
          className="quick-add absolute bottom-0 left-0 right-0 bg-ink text-cream text-center p-3 text-[11px] tracking-[0.1em] uppercase cursor-pointer hover:bg-gold transition-colors duration-300 border-none w-full disabled:opacity-45 disabled:cursor-not-allowed"
          aria-label={`Quick add ${product.title} to bag`}
        >
          Quick Add +
        </button>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-1">{categoryLabel}</div>
          <h3 className="font-serif text-[17px] sm:text-[19px] font-medium m-0 mb-1">{product.title}</h3>
          <p className="text-[11px] text-muted font-light m-0 mb-3 line-clamp-2">
            {product.subtitle || product.description}
          </p>
          <ProductVariantSelect
            product={product}
            value={variantId}
            onChange={setVariantId}
            className="mb-3"
          />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium text-ink">
            {formatMoney(product.priceRange.min.amount, product.priceRange.min.currencyCode)}
          </span>
          <button
            type="button"
            onClick={() => void addToBag()}
            disabled={!canAdd}
            className="text-[10px] tracking-[0.1em] uppercase font-medium text-gold hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}
