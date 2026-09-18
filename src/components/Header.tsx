import { useState } from 'react'
import { useCart } from '../context/cartContextDef'

const navLinks = [
  { href: '#shop', label: 'Shop' },
  { href: '#offerings', label: 'Collections' },
  { href: '#bestsellers', label: 'Bestsellers' },
  { href: '#story', label: 'Our Story' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { totalItems, openCart } = useCart()

  return (
    <div className="sticky top-0 z-50 bg-cream border-b border-border">
      <div className="border-b border-beige">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-5 py-2.5 md:px-8">
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

          <nav className="hidden md:flex flex-wrap gap-8 text-[11px] tracking-[0.08em] uppercase">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="link-underline font-medium hover:text-gold transition-colors duration-300">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex flex-wrap gap-6 items-center text-[11px] tracking-[0.08em] uppercase">
            <span className="text-muted">INR ₹</span>
            <button
              type="button"
              onClick={openCart}
              className="cursor-pointer transition-colors duration-300 hover:text-gold flex items-center gap-1.5 font-medium bg-transparent border-none text-[11px] tracking-[0.08em] uppercase text-ink"
              aria-label={`Open shopping bag with ${totalItems} items`}
            >
              <span>Bag</span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink text-cream text-[10px] font-sans font-medium transition-transform duration-300 group-hover:scale-110">
                {totalItems}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={openCart}
            className="md:hidden text-xs tracking-[0.08em] uppercase font-medium bg-transparent border-none text-ink cursor-pointer flex items-center gap-1.5"
            aria-label={`Open shopping bag with ${totalItems} items`}
          >
            <span>Bag</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink text-cream text-[10px] font-sans font-medium">
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-b border-beige ${
          open ? 'max-h-80' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col gap-4 px-6 py-5 text-xs tracking-[0.08em] uppercase">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="hover:text-gold transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-wrap gap-6 px-6 pb-5 text-xs tracking-[0.08em] uppercase items-center border-t border-beige/60 pt-4">
          <span className="text-muted">INR ₹</span>
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

      <div className="flex flex-col items-center justify-center px-5 py-2 md:py-2.5 text-center">
        <a href="#collections" className="group inline-flex flex-col items-center cursor-pointer">
          <img
            src="/images/logo-icon.webp"
            alt="Mausam Artwork Logo"
            width="44"
            height="44"
            loading="lazy"
            decoding="async"
            className="w-9 h-9 md:w-10 md:h-10 object-contain mb-0.5 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-serif text-[19px] md:text-[23px] tracking-[0.16em] font-semibold text-ink">
            MAUSAM ARTWORK
          </span>
          <span className="text-[8.5px] md:text-[9px] tracking-[0.22em] uppercase text-gold">
            Designer Scented Candles &amp; Floral Atelier
          </span>
        </a>
      </div>
    </div>
  )
}
