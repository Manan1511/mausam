import { useState, useEffect, useCallback } from 'react'
import AnnouncementBar from './components/AnnouncementBar'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductOfferings from './components/ProductOfferings'
import Bestsellers from './components/Bestsellers'
import GiftingAtelier from './components/GiftingAtelier'
import Craftsmanship from './components/Craftsmanship'
import Editorial from './components/Editorial'
import Footer from './components/Footer'
import Reveal from './components/Reveal'
import ShopPage from './components/ShopPage'
import { CartProvider } from './context/CartProvider'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import { type ProductCategory } from './data'

export default function App() {
  const [hash, setHash] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash.toLowerCase() : ''
  )

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.toLowerCase()
      setHash(newHash)
      if (newHash && !newHash.startsWith('#shop') && newHash !== '#') {
        setTimeout(() => {
          const el = document.querySelector(newHash)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 50)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateToHome = useCallback(() => {
    window.location.hash = ''
    setHash('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const isShop = hash.startsWith('#shop')
  const shopCategory: 'all' | ProductCategory = hash.includes('candles')
    ? 'candles'
    : hash.includes('bouquets')
    ? 'bouquets'
    : 'all'

  return (
    <CartProvider>
      <div className="bg-cream text-ink min-h-screen flex flex-col justify-between">
        <div>
          <AnnouncementBar />
          <Header />

          {isShop ? (
            <ShopPage
              category={shopCategory}
              onNavigateHome={navigateToHome}
            />
          ) : (
            <main>
              <Hero />
              <Reveal>
                <ProductOfferings />
              </Reveal>
              <Reveal>
                <Bestsellers />
              </Reveal>
              <Reveal>
                <GiftingAtelier />
              </Reveal>
              <Reveal>
                <Craftsmanship />
              </Reveal>
              <Reveal>
                <Editorial />
              </Reveal>
            </main>
          )}
        </div>

        <Footer />
        <CartDrawer />
        <CheckoutModal />
      </div>
    </CartProvider>
  )
}
