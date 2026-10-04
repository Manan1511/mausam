import type { StoreProduct, StoreVariant } from '../types/shopify'
import { formatMoney } from '../utils/cartUtils'

export function ProductVariantSelect({
  product,
  value,
  onChange,
  className = '',
}: {
  product: StoreProduct
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  if (product.variants.length <= 1) return null

  return (
    <label className={`block ${className}`}>
      <span className="sr-only">Choose an option for {product.title}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 border border-border bg-white px-2.5 py-2 text-[11px] text-ink focus:outline-none focus:border-ink"
        aria-label={`Choose an option for ${product.title}`}
      >
        <option value="">Choose an option</option>
        {product.variants.map((variant) => (
          <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>
            {variantLabel(variant)}
          </option>
        ))}
      </select>
    </label>
  )
}

function variantLabel(variant: StoreVariant): string {
  const title = variant.title === 'Default Title'
    ? variant.selectedOptions.map((option) => option.value).filter(Boolean).join(' / ') || 'Standard'
    : variant.title
  return `${title} · ${formatMoney(variant.price.amount, variant.price.currencyCode)}`
}
