import { bestsellers } from '../data'
import { useCart } from '../context/cartContextDef'
import { parsePriceToNumber } from '../utils/cartUtils'

export default function Bestsellers() {
  const { addItem } = useCart()

  return (
    <div id="bestsellers" className="scroll-mt-28 bg-beige py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-2">Bestsellers</div>
        <h2 className="font-serif font-medium text-3xl md:text-[38px] m-0 mb-10 md:mb-12">Signature Vessels &amp; Centerpieces</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-7 text-left">
          {bestsellers.map((item) => {
            const handleAdd = () => {
              addItem({
                id: item.id,
                name: item.name,
                category: item.category,
                price: parsePriceToNumber(item.price),
                priceFormatted: item.price,
                image: item.image,
                subtitle: item.notes,
              })
            }

            return (
              <div key={item.id} className="product-card hover-lift bg-cream relative overflow-hidden flex flex-col justify-between">
                <div className="relative aspect-4/5 overflow-hidden bg-beige group">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="quick-add absolute bottom-0 left-0 right-0 bg-ink text-cream text-center p-3 text-[11px] tracking-[0.1em] uppercase cursor-pointer hover:bg-gold transition-colors duration-300 border-none w-full"
                    aria-label={`Quick add ${item.name} to bag`}
                  >
                    Quick Add +
                  </button>
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-1">{item.categoryLabel}</div>
                    <h3 className="font-serif text-[17px] sm:text-[19px] font-medium m-0 mb-1">{item.name}</h3>
                    <p className="text-[11px] text-muted font-light m-0 mb-3 line-clamp-2">{item.notes}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-medium text-ink">{item.price}</span>
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="text-[10px] tracking-[0.1em] uppercase font-medium text-gold hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
