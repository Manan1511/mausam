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

function App() {
  return (
    <div className="bg-cream text-ink">
      <AnnouncementBar />
      <Header />
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
      <Footer />
    </div>
  )
}

export default App
