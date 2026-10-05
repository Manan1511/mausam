import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminApiError, adminApi } from './adminApi'
import type { AdminPageInfo, AdminProductChoice } from './adminTypes'

interface FeaturedProductsEditorProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

const EMPTY_PAGE: AdminPageInfo = { hasNextPage: false, endCursor: null }

export default function FeaturedProductsEditor({ selectedIds, onChange }: FeaturedProductsEditorProps) {
  const [products, setProducts] = useState<AdminProductChoice[]>([])
  const [pageInfo, setPageInfo] = useState(EMPTY_PAGE)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async (after: string | null = null, reset = false) => {
    setLoading(true)
    setError(null)
    try {
      const result = await adminApi.getProducts(after)
      setProducts((previous) => reset ? result.products : [...previous, ...result.products])
      setPageInfo(result.pageInfo)
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : 'Shopify products could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const loadFirstPage = async () => {
      try {
        const result = await adminApi.getProducts()
        if (!active) return
        setProducts(result.products)
        setPageInfo(result.pageInfo)
      } catch (cause) {
        if (!active) return
        setError(cause instanceof AdminApiError ? cause.message : 'Shopify products could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadFirstPage()
    return () => { active = false }
  }, [])

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])
  const filteredProducts = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return needle ? products.filter((product) => product.title.toLowerCase().includes(needle)) : products
  }, [products, search])

  function move(index: number, offset: -1 | 1) {
    const target = index + offset
    if (target < 0 || target >= selectedIds.length) return
    const next = [...selectedIds]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function toggle(productId: string) {
    if (selectedIds.includes(productId)) {
      onChange(selectedIds.filter((id) => id !== productId))
    } else if (selectedIds.length < 20) {
      onChange([...selectedIds, productId])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="m-0 text-lg font-medium text-ink">Featured products</h3>
          <span className="text-sm text-muted">{selectedIds.length} of 20 selected</span>
        </div>
        <p className="mb-0 mt-1 text-sm text-muted">Choose active products published to this Shopify storefront, then use the arrows to set their order.</p>
      </div>

      <div className="space-y-3">
        <h4 className="m-0 text-sm font-medium text-ink">Storefront order</h4>
        {selectedIds.length === 0 && <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted">No products selected. Add products from the list below.</p>}
        <ol className="m-0 list-none space-y-2 p-0">
          {selectedIds.map((id, index) => {
            const product = productById.get(id)
            return (
              <li key={id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-white p-2.5 sm:p-3">
                {product?.image ? <img src={product.image.url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <div className="h-12 w-12 shrink-0 rounded-lg bg-beige" />}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{product?.title ?? `Shopify product ${id.slice(-8)}`}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" className="admin-icon-button" aria-label={`Move ${product?.title ?? 'product'} up`} disabled={index === 0} onClick={() => move(index, -1)}>Up</button>
                  <button type="button" className="admin-icon-button" aria-label={`Move ${product?.title ?? 'product'} down`} disabled={index === selectedIds.length - 1} onClick={() => move(index, 1)}>Down</button>
                  <button type="button" className="admin-icon-button text-red-800" aria-label={`Remove ${product?.title ?? 'product'}`} onClick={() => toggle(id)}>Remove</button>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-ink" htmlFor="product-search">Add active products</label>
        <input id="product-search" value={search} onChange={(event) => setSearch(event.target.value)} className="admin-input" placeholder="Search loaded products" />
        {error && <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">{error}</p>}
        {loading && products.length === 0 && <p className="py-4 text-sm text-muted" role="status">Loading Shopify products…</p>}
        {!loading && filteredProducts.length === 0 && !error && <p className="py-4 text-sm text-muted">No matching products in the loaded list.</p>}
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
          {filteredProducts.map((product) => {
            const selected = selectedIds.includes(product.id)
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  disabled={!selected && selectedIds.length >= 20}
                  aria-pressed={selected}
                  className="flex min-h-[68px] w-full items-center gap-3 rounded-xl border border-border bg-white p-2.5 text-left transition hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {product.image ? <img src={product.image.url} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" /> : <div className="h-11 w-11 shrink-0 rounded-lg bg-beige" />}
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{product.title}</span>
                  <span className="shrink-0 text-xs font-medium text-muted">{selected ? 'Added' : 'Add'}</span>
                </button>
              </li>
            )
          })}
        </ul>
        {pageInfo.hasNextPage && (
          <button type="button" onClick={() => void loadProducts(pageInfo.endCursor)} disabled={loading} className="admin-secondary-button min-h-11 w-full sm:w-auto">
            {loading ? 'Loading…' : 'Load more products'}
          </button>
        )}
        {search && pageInfo.hasNextPage && <p className="m-0 text-xs text-muted">Search covers products loaded so far. Load more to expand the results.</p>}
      </div>
    </div>
  )
}
