import { useState } from 'react'
import { useCart } from '../context/cartContextDef'

interface NavLinkItem {
  readonly href: string
  readonly label: string
}

const NAV_LINKS: readonly NavLinkItem[] = [
  { href: '#shop', label: 'Shop' },
  { href: '#offerings', label: 'Collections' },
  { href: '#bestsellers', label: 'Bestsellers' },
  { href: '#story', label: 'Our Story' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { totalItems, openCart } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-xs border-b border-border">
      {/* Single Unified Navbar Row */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-5 py-3 md:py-3.5 md:px-8">
        {/* Mobile: Hamburger Button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="md:hidden flex flex-col justify-center gap-1.5 w-6 h-6 shrink-0 cursor-pointer"
        >
          <span
            className={`block h-px w-full bg-ink transition-transform duration-300 ${
              open ? 'translate-y-[6.5px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-px w-full bg-ink transition-opacity duration-300 ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block h-px w-full bg-ink transition-transform duration-300 ${
              open ? '-translate-y-[6.5px] -rotate-45' : ''
            }`}
          />
        </button>

        {/* Brand Name (Text Only - No Logo Image) */}
        <a
          href="#"
          onClick={() => {
            if (window.location.hash !== '' && window.location.hash !== '#') {
              window.location.hash = ''
            }
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="font-serif text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.16em] uppercase text-ink hover:text-gold transition-colors shrink-0 text-center md:text-left cursor-pointer"
        >
          MAUSAM ARTWORK
        </a>

        {/* Desktop Nav Links (Center) */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.1em] uppercase font-medium">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="link-underline text-ink/90 hover:text-gold transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Utility Actions: Currency & Bag */}
        <div className="flex items-center gap-5 text-[11px] tracking-[0.08em] uppercase shrink-0">
          <span className="hidden sm:inline text-muted font-sans">INR ₹</span>
          <button
            type="button"
            onClick={openCart}
            className="cursor-pointer transition-colors duration-300 hover:text-gold flex items-center gap-1.5 font-medium bg-transparent border-none text-[11px] tracking-[0.08em] uppercase text-ink"
            aria-label={`Open shopping bag with ${totalItems} items`}
          >
            <span>Bag</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink text-cream text-[10px] font-sans font-medium transition-transform duration-300 hover:scale-110">
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-t border-beige/80 bg-cream ${
          open ? 'max-h-80' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col gap-4 px-6 py-5 text-xs tracking-[0.1em] uppercase font-medium">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-between px-6 pb-5 text-xs tracking-[0.08em] uppercase border-t border-beige/60 pt-4">
          <span className="text-muted font-sans">Currency: INR ₹</span>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              openCart()
            }}
            className="text-gold font-medium uppercase bg-transparent border-none text-xs tracking-[0.08em] cursor-pointer"
          >
            View Bag ({totalItems})
          </button>
        </div>
      </div>
    </header>
  )
}
