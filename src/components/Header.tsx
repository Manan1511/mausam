import { useState } from 'react'

const navLinks = [
  { href: '#collections', label: 'The Collections' },
  { href: '#shop-by-mausam', label: 'Shop by Mausam' },
  { href: '#gifting', label: 'Gifting Atelier' },
  { href: '#story', label: 'Our Story' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-0 z-50 bg-cream border-b border-border">
      <div className="flex items-center justify-between gap-4 px-5 py-2.5 md:px-8 border-b border-beige">
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

        <nav className="hidden md:flex flex-wrap gap-5 text-[10.5px] tracking-[0.06em] uppercase">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="link-underline">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex flex-wrap gap-4 items-center text-[10.5px] tracking-[0.06em] uppercase">
          <span className="cursor-pointer transition-colors duration-300 hover:text-gold">Search</span>
          <span className="cursor-pointer transition-colors duration-300 hover:text-gold">Wishlist</span>
          <span>INR ₹</span>
          <span className="cursor-pointer transition-colors duration-300 hover:text-gold">Bag (0)</span>
        </div>

        <div className="md:hidden text-[10.5px] tracking-[0.06em] uppercase">Bag (0)</div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-b border-beige ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col gap-4 px-5 py-5 text-xs tracking-[0.06em] uppercase">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-wrap gap-4 px-5 pb-5 text-xs tracking-[0.06em] uppercase">
          <span>Search</span>
          <span>Wishlist</span>
          <span>INR ₹</span>
        </div>
      </div>

      <div className="text-center px-5 py-3.5 md:px-8">
        <div className="font-serif text-[22px] md:text-[26px] tracking-[0.14em] font-semibold">MAUSAM ARTWORK</div>
        <div className="text-[9px] tracking-[0.2em] uppercase text-gold mt-0.5">Atelier de Parfum</div>
      </div>
    </div>
  )
}
