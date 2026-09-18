import { useEffect } from 'react'
import { useCart } from '../context/cartContextDef'
import { formatPriceINR } from '../utils/cartUtils'
import { COMPLIMENTARY_SHIPPING_LABEL } from '../types/cart'

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    totalItems,
    subtotal,
    closeCart,
    openCheckout,
    removeItem,
    updateQuantity,
  } = useCart()

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCartOpen, closeCart])

  // Prevent background scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-[visibility] duration-300 ${
        isCartOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      aria-hidden={!isCartOpen}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-ink/60 backdrop-blur-[3px] transition-opacity duration-300 ease-out ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div
          className={`w-screen max-w-md bg-cream shadow-2xl flex flex-col justify-between border-l border-border transition-transform duration-300 ease-out transform ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-cream">
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-wide text-ink m-0">
                Your Atelier Bag
              </h2>
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-medium tracking-wider uppercase bg-beige text-ink rounded-full border border-border">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="text-ink/60 hover:text-ink p-1.5 transition-colors cursor-pointer rounded-full hover:bg-beige/60"
              aria-label="Close Bag"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-beige border border-border flex items-center justify-center mb-4 text-gold">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-medium text-ink mb-2">
                  Your atelier bag is empty
                </h3>
                <p className="text-xs sm:text-sm text-muted font-light leading-relaxed max-w-xs mb-6">
                  Explore our handcrafted scented soy candles and everlasting floral bouquet curations.
                </p>
                <a
                  href="#offerings"
                  onClick={closeCart}
                  className="inline-block px-6 py-3 bg-ink text-cream text-xs tracking-[0.12em] uppercase transition-colors duration-300 hover:bg-gold"
                >
                  Explore Creations
                </a>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-24 shrink-0 bg-beige overflow-hidden border border-border">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] tracking-[0.14em] uppercase text-gold block mb-0.5">
                              {item.category === 'candles' ? 'Artisanal Candle' : 'Floral Bouquet'}
                            </span>
                            <h4 className="font-serif text-base font-medium text-ink truncate m-0">
                              {item.name}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-muted hover:text-ink transition-colors p-1 cursor-pointer"
                            title="Remove item"
                            aria-label={`Remove ${item.name}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] text-muted line-clamp-1 mt-0.5 m-0">
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                        <div className="flex items-center border border-border bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-xs text-ink hover:bg-beige transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-ink select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs text-ink hover:bg-beige transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-medium text-sm text-ink">
                          {formatPriceINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-border bg-beige/40 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-muted">
                  <span>Shipping</span>
                  <span className="text-ink font-medium">{COMPLIMENTARY_SHIPPING_LABEL}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-border">
                  <span className="font-serif text-lg font-medium text-ink">Subtotal</span>
                  <span className="font-serif text-xl font-medium text-ink">
                    {formatPriceINR(subtotal)}
                  </span>
                </div>
                <p className="text-[10px] text-muted text-center pt-1 m-0">
                  Taxes and complimentary atelier gift packaging included.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={openCheckout}
                  className="w-full py-3.5 bg-ink text-cream text-xs tracking-[0.14em] uppercase font-medium transition-colors duration-300 hover:bg-gold cursor-pointer text-center block shadow-sm"
                >
                  Proceed to Checkout →
                </button>
                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full py-2.5 bg-transparent text-ink text-xs tracking-[0.1em] uppercase hover:underline transition-colors cursor-pointer text-center"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
