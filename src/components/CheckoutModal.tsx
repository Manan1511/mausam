import { useEffect } from 'react'
import { useCart } from '../context/cartContextDef'

export default function CheckoutModal() {
  const { isCheckoutOpen, closeCheckout, openCart } = useCart()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCheckoutOpen) closeCheckout()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeCheckout, isCheckoutOpen])

  useEffect(() => {
    if (isCheckoutOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCheckoutOpen])

  const returnToBag = () => {
    closeCheckout()
    openCart()
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-[visibility] duration-300 ${
        isCheckoutOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      aria-hidden={!isCheckoutOpen}
    >
      <button
        type="button"
        onClick={closeCheckout}
        className={`fixed inset-0 w-full h-full bg-ink/60 backdrop-blur-[3px] transition-opacity duration-300 ease-out border-0 ${
          isCheckoutOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close checkout notice"
        tabIndex={isCheckoutOpen ? 0 : -1}
      />
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          inert={!isCheckoutOpen}
          className={`relative w-full max-w-lg bg-cream border border-border shadow-2xl overflow-hidden my-8 transition-all duration-300 ease-out ${
            isCheckoutOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="p-6 border-b border-border flex items-center justify-between bg-cream">
            <div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-gold block mb-1">
                Atelier Preview
              </span>
              <h2 id="checkout-modal-title" className="font-serif text-2xl font-medium text-ink m-0">
                Checkout isn’t connected yet
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCheckout}
              className="text-ink/60 hover:text-ink p-2 rounded-full hover:bg-beige transition-colors"
              aria-label="Close checkout notice"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm text-muted font-light leading-relaxed m-0">
              This is a browsing preview. No order has been placed and no payment or delivery details are collected.
              Shopify checkout will be available after the store is connected.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={returnToBag}
                className="flex-1 py-3 bg-ink text-cream text-xs tracking-[0.12em] uppercase font-medium hover:bg-gold transition-colors"
              >
                Return to my bag
              </button>
              <button
                type="button"
                onClick={closeCheckout}
                className="flex-1 py-3 border border-ink text-ink text-xs tracking-[0.12em] uppercase font-medium hover:bg-beige transition-colors"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
