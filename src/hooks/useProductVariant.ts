import { useState } from 'react'
import { useCart } from '../context/cartContextDef'
import type { StoreProduct } from '../types/shopify'

export function useProductVariant(product: StoreProduct) {
  const [variantId, setVariantId] = useState(
    product.variants.length === 1 ? product.variants[0].id : '',
  )
  const { addItem, status, isCartMutating } = useCart()
  const variant = product.variants.find((item) => item.id === variantId)
  const canAdd = Boolean(
    status === 'ready' &&
    !isCartMutating &&
    product.availableForSale &&
    variant?.availableForSale,
  )

  return {
    variantId,
    setVariantId,
    variant,
    canAdd,
    addToBag: () => variant && canAdd ? addItem(product, variant.id) : Promise.resolve(),
  }
}
