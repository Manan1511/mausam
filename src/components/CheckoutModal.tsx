import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { useCart } from '../context/cartContextDef'
import { formatPriceINR } from '../utils/cartUtils'
import {
  COMPLIMENTARY_SHIPPING_LABEL,
  ORDERS_STORAGE_KEY,
  PINCODE_LENGTH,
  PHONE_MIN_DIGITS,
  type ShippingAddress,
  type PlacedOrder,
} from '../types/cart'

export default function CheckoutModal() {
  const { isCheckoutOpen, closeCheckout, items, subtotal, clearCart } = useCart()

  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    giftNote: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null)

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCheckoutOpen) {
        closeCheckout()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCheckoutOpen, closeCheckout])

  // Prevent background scroll when checkout modal is open
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCheckoutOpen])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof ShippingAddress]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < PHONE_MIN_DIGITS) {
      newErrors.phone = 'Valid 10-digit mobile number required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Valid email address required'
    }

    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Street address / house number required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    const cleanPincode = formData.pincode.replace(/\D/g, '')
    if (!cleanPincode || cleanPincode.length !== PINCODE_LENGTH) {
      newErrors.pincode = 'Valid 6-digit postal code required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    // Generate readable order ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000)
    const newOrderId = `MAUSAM-${randomSuffix}`

    const orderRecord: PlacedOrder = {
      orderId: newOrderId,
      createdAt: new Date().toISOString(),
      items: [...items],
      subtotal,
      shipping: COMPLIMENTARY_SHIPPING_LABEL,
      shippingAddress: { ...formData },
      paymentStatus: 'Pending Atelier Confirmation',
    }

    try {
      const existingOrdersStr = localStorage.getItem(ORDERS_STORAGE_KEY)
      const existingOrders: PlacedOrder[] = existingOrdersStr ? JSON.parse(existingOrdersStr) : []
      existingOrders.unshift(orderRecord)
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existingOrders))
    } catch {
      // quota or localstorage disabled
    }

    setTimeout(() => {
      setIsSubmitting(false)
      setPlacedOrder(orderRecord)
      clearCart()
    }, 400)
  }

  const handleFinishAndClose = () => {
    setPlacedOrder(null)
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      giftNote: '',
    })
    closeCheckout()
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
      {/* Backdrop */}
      <div
        onClick={handleFinishAndClose}
        className={`fixed inset-0 bg-ink/60 backdrop-blur-[3px] transition-opacity duration-300 ease-out ${
          isCheckoutOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className={`relative w-full max-w-2xl bg-cream border border-border shadow-2xl overflow-hidden my-8 transition-all duration-300 ease-out transform ${
            isCheckoutOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-cream">
            <div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-gold block mb-1">
                Atelier Direct
              </span>
              <h2 id="checkout-modal-title" className="font-serif text-2xl font-medium text-ink m-0">
                {placedOrder ? 'Order Confirmed' : 'Checkout & Atelier Delivery'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleFinishAndClose}
              className="text-ink/60 hover:text-ink p-1.5 transition-colors cursor-pointer rounded-full hover:bg-beige/60"
              aria-label="Close Checkout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 max-h-[calc(85vh-120px)] overflow-y-auto">
            {placedOrder ? (
              /* Order Confirmation View */
              <div className="text-center py-4 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-beige border border-gold/50 flex items-center justify-center text-gold">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-medium text-ink m-0 mb-2">
                    Thank you, {placedOrder.shippingAddress.fullName}!
                  </h3>
                  <p className="text-sm text-muted font-light max-w-md mx-auto leading-relaxed m-0">
                    Your handcrafted order has been placed into our atelier queue. We will carefully prepare, pack, and dispatch your creations with personalized gift seals.
                  </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-beige/50 border border-border p-5 text-left space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-border text-xs">
                    <div>
                      <span className="text-muted block text-[10px] uppercase tracking-wider">Order ID</span>
                      <span className="font-medium text-ink text-sm">{placedOrder.orderId}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] uppercase tracking-wider">Status</span>
                      <span className="text-gold font-medium">{placedOrder.paymentStatus}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] uppercase tracking-wider">Est. Delivery</span>
                      <span className="text-ink font-medium">3–5 Business Days</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] tracking-[0.1em] uppercase text-muted mb-2">Items Ordered</h4>
                    <div className="space-y-2">
                      {placedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs">
                          <span className="text-ink">
                            {item.name} <span className="text-muted">× {item.quantity}</span>
                          </span>
                          <span className="font-medium text-ink">
                            {formatPriceINR(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex justify-between items-baseline text-sm">
                    <span className="font-serif font-medium text-ink">Total Amount</span>
                    <span className="font-serif text-lg font-medium text-ink">
                      {formatPriceINR(placedOrder.subtotal)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border text-xs text-muted">
                    <span className="font-medium text-ink block mb-0.5">Delivery Address:</span>
                    <p className="m-0 leading-relaxed font-light">
                      {placedOrder.shippingAddress.fullName} · {placedOrder.shippingAddress.phone}
                      <br />
                      {placedOrder.shippingAddress.addressLine}, {placedOrder.shippingAddress.city},{' '}
                      {placedOrder.shippingAddress.state} – {placedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                </div>

                <div className="bg-cream border border-gold/40 p-4 text-xs text-ink/80 leading-relaxed">
                  <span className="font-medium block text-gold mb-1">
                    Concierge Note &amp; Payment Verification
                  </span>
                  Our atelier concierge will reach out via WhatsApp / SMS at{' '}
                  <strong className="text-ink">{placedOrder.shippingAddress.phone}</strong> to confirm custom gift seal details and payment preference before final dispatch.
                </div>

                <button
                  type="button"
                  onClick={handleFinishAndClose}
                  className="w-full py-3.5 bg-ink text-cream text-xs tracking-[0.14em] uppercase font-medium transition-colors duration-300 hover:bg-gold cursor-pointer"
                >
                  Return to Atelier
                </button>
              </div>
            ) : (
              /* Checkout Form View */
              <form onSubmit={handlePlaceOrder} className="space-y-6" noValidate>
                {/* Order Review Snippet */}
                <div className="bg-beige/40 border border-border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-serif font-medium text-ink">
                      Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span className="text-xs font-medium text-ink">{formatPriceINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-muted">
                    <span>Delivery</span>
                    <span className="text-ink font-medium">{COMPLIMENTARY_SHIPPING_LABEL}</span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div>
                  <h3 className="font-serif text-lg font-medium text-ink mb-4 pb-2 border-b border-border">
                    1. Shipping Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label htmlFor="fullName" className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Ananya Sharma"
                        className={`w-full p-2.5 bg-white border text-ink focus:outline-none focus:border-ink transition-colors ${
                          errors.fullName ? 'border-red-500' : 'border-border'
                        }`}
                      />
                      {errors.fullName && (
                        <span className="text-[10px] text-red-500 mt-1 block">{errors.fullName}</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                        Mobile / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        className={`w-full p-2.5 bg-white border text-ink focus:outline-none focus:border-ink transition-colors ${
                          errors.phone ? 'border-red-500' : 'border-border'
                        }`}
                      />
                      {errors.phone && (
                        <span className="text-[10px] text-red-500 mt-1 block">{errors.phone}</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className={`w-full p-2.5 bg-white border text-ink focus:outline-none focus:border-ink transition-colors ${
                          errors.email ? 'border-red-500' : 'border-border'
                        }`}
                      />
                      {errors.email && (
                        <span className="text-[10px] text-red-500 mt-1 block">{errors.email}</span>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="addressLine" className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        id="addressLine"
                        name="addressLine"
                        value={formData.addressLine}
                        onChange={handleInputChange}
                        placeholder="House / Apartment / Street / Landmark"
                        className={`w-full p-2.5 bg-white border text-ink focus:outline-none focus:border-ink transition-colors ${
                          errors.addressLine ? 'border-red-500' : 'border-border'
                        }`}
                      />
                      {errors.addressLine && (
                        <span className="text-[10px] text-red-500 mt-1 block">{errors.addressLine}</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Mumbai"
                        className={`w-full p-2.5 bg-white border text-ink focus:outline-none focus:border-ink transition-colors ${
                          errors.city ? 'border-red-500' : 'border-border'
                        }`}
                      />
                      {errors.city && (
                        <span className="text-[10px] text-red-500 mt-1 block">{errors.city}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="state" className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="e.g. Maharashtra"
                          className={`w-full p-2.5 bg-white border text-ink focus:outline-none focus:border-ink transition-colors ${
                            errors.state ? 'border-red-500' : 'border-border'
                          }`}
                        />
                        {errors.state && (
                          <span className="text-[10px] text-red-500 mt-1 block">{errors.state}</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="pincode" className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="6 digits"
                          maxLength={PINCODE_LENGTH}
                          className={`w-full p-2.5 bg-white border text-ink focus:outline-none focus:border-ink transition-colors ${
                            errors.pincode ? 'border-red-500' : 'border-border'
                          }`}
                        />
                        {errors.pincode && (
                          <span className="text-[10px] text-red-500 mt-1 block">{errors.pincode}</span>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="giftNote" className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                        Complimentary Gift Note or Custom Request (Optional)
                      </label>
                      <textarea
                        id="giftNote"
                        name="giftNote"
                        rows={2}
                        value={formData.giftNote}
                        onChange={handleInputChange}
                        placeholder="Add a handwritten message to be placed in our gold-foil envelope..."
                        className="w-full p-2.5 bg-white border border-border text-ink focus:outline-none focus:border-ink transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Notice */}
                <div>
                  <h3 className="font-serif text-lg font-medium text-ink mb-3 pb-2 border-b border-border">
                    2. Payment &amp; Confirmation
                  </h3>
                  <div className="p-4 bg-beige/60 border border-border text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                      <span className="font-medium text-ink">
                        Atelier Direct / Pay on Confirmation
                      </span>
                    </div>
                    <p className="text-muted font-light leading-relaxed m-0">
                      Payment gateway integration is currently in staging. By placing your order, your reservation will be locked in our studio. Our concierge will send you a direct invoice / UPI link and confirm custom packaging before shipping.
                    </p>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full py-3.5 bg-ink text-cream text-xs tracking-[0.14em] uppercase font-medium transition-colors duration-300 hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? 'Confirming with Atelier...' : `Place Order · ${formatPriceINR(subtotal)}`}
                  </button>
                  <p className="text-[10px] text-muted text-center mt-2 m-0">
                    Safe &amp; insured courier across India. No upfront charge required today.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
