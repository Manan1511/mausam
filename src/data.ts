export const DEFAULT_CURRENCY = '₹'

export type ProductCategory = 'candles' | 'bouquets'

export interface CategoryInfo {
  id: ProductCategory
  name: string
  tagline: string
  subtitle: string
  description: string
  coverImage: string
  badge: string
  countLabel: string
}

export const productCategories: CategoryInfo[] = [
  {
    id: 'candles',
    name: 'Artisanal Candles',
    tagline: 'Sculptural Wax Art & Scented Vessels',
    subtitle: 'Hand-poured 100% soy & botanical wax creations',
    description:
      'Individually hand-poured in small atelier batches using clean-burning botanical soy wax and fine perfumery oils. From sculptural playing cards and classical bust statues to botanical lotus urlis and dessert candles, each piece is designed to illuminate your space.',
    coverImage: '/images/products/category-candles-cover.webp',
    badge: 'Atelier Signature',
    countLabel: '8 Signature Designs',
  },
  {
    id: 'bouquets',
    name: 'Floral Bouquets',
    tagline: 'Everlasting Preserved Blooms & Hat Box Keepsakes',
    subtitle: 'Hand-arranged preserved floral keepsakes',
    description:
      'Masterfully preserved garden roses, hydrangeas, and delicate botanicals that maintain their soft petals and vibrant beauty for seasons without water. Beautifully styled in luxury Parisian hat boxes with silk ribbons, custom wax seals, and personalized gift tags.',
    coverImage: '/images/products/category-bouquets-cover.webp',
    badge: 'Bespoke Atelier',
    countLabel: '8 Curated Arrangements',
  },
]

export interface ProductItem {
  id: string
  name: string
  category: ProductCategory
  subtitle: string
  description: string
  price: string
  image: string
  badge?: string
  specs: {
    burnTime?: string
    weight?: string
    dimensions?: string
    material?: string
    scentNotes?: string
  }
}

export const productsByCategory: Record<ProductCategory, ProductItem[]> = {
  candles: [
    {
      id: 'candle-playing-card',
      name: 'Playing Card Art Pillar',
      category: 'candles',
      subtitle: 'Hand-Carved Sculptural Wax Art',
      description: 'Iconic playing card motifs sculpted with pure soy wax, creating a statement art piece for mantels and dressers.',
      price: `${DEFAULT_CURRENCY}2,450`,
      image: '/images/products/candle-playing-card.webp',
      badge: 'Best Seller',
      specs: {
        burnTime: '50+ Hour Clean Burn',
        weight: '320g',
        material: '100% Eco-Soy Wax',
        scentNotes: 'Amber Resin, Smoked Cedar & Vanilla Bean',
      },
    },
    {
      id: 'candle-lotus-urli',
      name: 'Lotus Blossom Urli Candle',
      category: 'candles',
      subtitle: 'Scalloped Gold-Rim Botanical Urli',
      description: 'Hand-set pink and white lotus petal wax formations in an ornate metallic rim vessel for festive illumination.',
      price: `${DEFAULT_CURRENCY}3,200`,
      image: '/images/products/candle-lotus-urli.webp',
      badge: 'Festive Centerpiece',
      specs: {
        burnTime: '65+ Hour Clean Burn',
        weight: '450g',
        material: 'Soy & Coconut Wax Blend',
        scentNotes: 'Jasmine Sambac, White Rose & Vetiver',
      },
    },
    {
      id: 'candle-sculpture-bust',
      name: 'Venus Aphrodite Bust Candle',
      category: 'candles',
      subtitle: 'Classical Sculpture Figurative Candle',
      description: 'Museum-grade neoclassical statue cast in fine velvety soy wax, designed as sculptural home decor and gentle ambient light.',
      price: `${DEFAULT_CURRENCY}1,850`,
      image: '/images/products/candle-sculpture-bust.webp',
      badge: 'Collector Edition',
      specs: {
        burnTime: '35+ Hour Clean Burn',
        weight: '260g',
        material: 'Pure Botanical Soy',
        scentNotes: 'French Lavender, Bergamot & Soft Sandalwood',
      },
    },
    {
      id: 'candle-burgundy-tapers',
      name: 'Burgundy Botanique Tapers (Set of 4)',
      category: 'candles',
      subtitle: 'Artisanal Cone-Wrapped Dinner Tapers',
      description: 'Rich burgundy dripless tapers bundled with dried botanical sprigs and parchment sleeves for dinner tables.',
      price: `${DEFAULT_CURRENCY}1,650`,
      image: '/images/products/candle-burgundy-tapers.webp',
      specs: {
        burnTime: '12+ Hours Each',
        weight: '200g (Set)',
        material: 'Beeswax & Soy Blend',
        scentNotes: 'Subtle Honeyed Fig Leaf (Dripless)',
      },
    },
    {
      id: 'candle-patisserie-waffle',
      name: 'Pâtisserie Berry & Waffle Candle',
      category: 'candles',
      subtitle: 'Gourmand Wax Confection Sculpture',
      description: 'Artfully hand-piped miniature dessert candles topped with realistic wax berries, biscuits, and creamy glaze.',
      price: `${DEFAULT_CURRENCY}1,950`,
      image: '/images/products/candle-patisserie-waffle.webp',
      badge: 'Gourmand Series',
      specs: {
        burnTime: '40+ Hour Clean Burn',
        weight: '210g',
        material: 'Soy Wax & Gourmet Oils',
        scentNotes: 'Warm Tonka, Baked Vanilla & Wild Strawberry',
      },
    },
    {
      id: 'candle-marigold-urli',
      name: 'Marigold Celebration Urli Vessel',
      category: 'candles',
      subtitle: 'Golden Petal Floral Urli Vessel',
      description: 'Bright golden and orange marigold floral carvings floating in premium scented soy wax with multi-wick illumination.',
      price: `${DEFAULT_CURRENCY}2,800`,
      image: '/images/products/candle-marigold-urli.webp',
      specs: {
        burnTime: '55+ Hour Clean Burn',
        weight: '400g',
        material: '100% Eco-Soy Wax',
        scentNotes: 'Fresh Marigold, Saffron & Kashmiri Oud',
      },
    },
    {
      id: 'candle-floating-petal',
      name: 'Celestial Floating Bloom Vessel',
      category: 'candles',
      subtitle: 'Cobalt & Gilded Petal Glass Bowl',
      description: 'Deep blue and gold-dusted wax flowers floating gracefully in an artisanal glass chalice designed to reflect candlelight.',
      price: `${DEFAULT_CURRENCY}2,200`,
      image: '/images/products/candle-floating-petal.webp',
      specs: {
        burnTime: '45+ Hour Clean Burn',
        weight: '280g',
        material: 'Soy Wax & Blown Glass',
        scentNotes: 'Blue Lotus, Green Tea & White Musk',
      },
    },
    {
      id: 'candle-curated-box',
      name: 'Atelier Scented Gift Box',
      category: 'candles',
      subtitle: 'Dual Botanical Urli Keepsake Gift Set',
      description: 'Handcrafted twin candle set presented in signature rigid gift box with satin ties and custom embossed card.',
      price: `${DEFAULT_CURRENCY}3,600`,
      image: '/images/products/candle-curated-box.webp',
      badge: 'Gift Atelier',
      specs: {
        burnTime: '80+ Total Hour Burn',
        weight: '500g',
        material: 'Pure Soy & Gold Foil',
        scentNotes: 'Petrichor, Jasmine & Smoked Amber',
      },
    },
  ],
  bouquets: [
    {
      id: 'bouquet-blush-hatbox',
      name: 'Blush Rose Atelier Hat Box',
      category: 'bouquets',
      subtitle: 'Signature Round Keepsake Bloom Box',
      description: 'Everlasting blush pink garden roses, hydrangeas, and eucalyptus nested in a handcrafted white Parisian hat box.',
      price: `${DEFAULT_CURRENCY}3,400`,
      image: '/images/products/bouquet-blush-hatbox.webp',
      badge: 'Most Loved',
      specs: {
        dimensions: '22cm x 25cm Hat Box',
        material: 'Preserved & Everlasting Florals',
        scentNotes: 'Infused with Subtle Bulgarian Rose Water',
      },
    },
    {
      id: 'bouquet-vintage-pastels',
      name: 'Vintage Peony & Lilac Bloom Box',
      category: 'bouquets',
      subtitle: 'Artisanal Pastel Floral Arrangement',
      description: 'A romantic symphony of dusty mauve roses, lilac peonies, and pearl accents arranged in a velvet-finish cylinder box.',
      price: `${DEFAULT_CURRENCY}3,800`,
      image: '/images/products/bouquet-vintage-pastels.webp',
      badge: 'Atelier Choice',
      specs: {
        dimensions: '24cm x 28cm Bloom Box',
        material: 'Premium Preserved Garden Blooms',
        scentNotes: 'Gentle French Peony & White Tea Essence',
      },
    },
    {
      id: 'bouquet-spring-bloom',
      name: 'Spring Meadow Petite Hat Box',
      category: 'bouquets',
      subtitle: 'Curated Cylindrical Bloom Box',
      description: 'Sunny lemon, peach, and lavender everlasting blooms tied with French silk ribbon and the signature Mausam seal.',
      price: `${DEFAULT_CURRENCY}3,250`,
      image: '/images/products/bouquet-spring-bloom.webp',
      specs: {
        dimensions: '20cm x 22cm Petite Box',
        material: 'Everlasting Preserved Botanicals',
        scentNotes: 'Subtle Sweet Magnolia & Bergamot',
      },
    },
    {
      id: 'bouquet-celebration-tag',
      name: 'Celebration Personalized Floral Box',
      category: 'bouquets',
      subtitle: 'Custom Initial & Polaroid Gift Box',
      description: 'Handcrafted floral hamper with personalized mini polaroid, gold foil card, and curated everlasting flowers.',
      price: `${DEFAULT_CURRENCY}4,100`,
      image: '/images/products/bouquet-celebration-tag.webp',
      badge: 'Personalized',
      specs: {
        dimensions: '26cm x 26cm Gift Hamper',
        material: 'Preserved Roses & Keepsake Box',
        scentNotes: 'Wild Jasmine & Fig Essence',
      },
    },
    {
      id: 'bouquet-keepsake-arrangement',
      name: 'Botanical Keepsake Cup',
      category: 'bouquets',
      subtitle: 'Petite Ceramic Floral Accent',
      description: 'Charming miniature dried and preserved floral arrangement set in a reusable fluted ceramic chalice for desks and vanities.',
      price: `${DEFAULT_CURRENCY}2,200`,
      image: '/images/products/bouquet-keepsake-arrangement.webp',
      specs: {
        dimensions: '15cm x 18cm Ceramic Chalice',
        material: 'Ceramic Keepsake & Dried Florals',
        scentNotes: 'Unscented / Natural Botanical Throw',
      },
    },
    {
      id: 'bouquet-english-roses',
      name: 'English Rose & Hydrangea Cluster',
      category: 'bouquets',
      subtitle: 'Dense Romantic Garden Box',
      description: 'Opulent layers of deep petal pink garden roses, white waxflowers, and delicate gypsophila nestled into a luxury gift display.',
      price: `${DEFAULT_CURRENCY}3,600`,
      image: '/images/products/bouquet-english-roses.webp',
      specs: {
        dimensions: '25cm x 25cm Square Hamper',
        material: 'Preserved Florals & Keepsake Box',
        scentNotes: 'English Damask Rose Infusion',
      },
    },
    {
      id: 'bouquet-artisan-curation',
      name: 'Artisan Pastel Hand-Tied Wrap',
      category: 'bouquets',
      subtitle: 'Crafted Florist Paper & Silk Wrap',
      description: 'Lush hand-tied floral bouquet wrapped in layered Italian paper, tissue, and gold-edged satin ribbon.',
      price: `${DEFAULT_CURRENCY}2,950`,
      image: '/images/products/bouquet-artisan-curation.webp',
      specs: {
        dimensions: '35cm Height Wrapped Bouquet',
        material: 'Preserved & Dried Floral Stem Wrap',
        scentNotes: 'Fresh Botanical Scent Infusion',
      },
    },
    {
      id: 'bouquet-grand-tablebox',
      name: 'Grand Foyer Statement Centerpiece',
      category: 'bouquets',
      subtitle: 'Luxury Table Display Floral Box',
      description: 'Substantial multi-tier floral curation designed as an unforgettable dining centerpiece or grand entrance statement.',
      price: `${DEFAULT_CURRENCY}5,200`,
      image: '/images/products/bouquet-grand-tablebox.webp',
      badge: 'Statement Piece',
      specs: {
        dimensions: '32cm x 35cm Grand Display Box',
        material: 'Master Preserved Florals & Silk Ribbon',
        scentNotes: 'Delicate Garden Rose & White Amber',
      },
    },
  ],
}

export interface Bestseller {
  id: string
  image: string
  category: ProductCategory
  categoryLabel: string
  name: string
  notes: string
  price: string
}

export const bestsellers: Bestseller[] = [
  {
    id: 'bs-playing-card',
    image: '/images/products/candle-playing-card.webp',
    category: 'candles',
    categoryLabel: 'Artisanal Candles',
    name: 'Playing Card Pillar',
    notes: 'Pure Soy Wax · Sculpted Ace Motifs · Amber & Cedar',
    price: `${DEFAULT_CURRENCY}2,450`,
  },
  {
    id: 'bs-blush-hatbox',
    image: '/images/products/bouquet-blush-hatbox.webp',
    category: 'bouquets',
    categoryLabel: 'Floral Bouquets',
    name: 'Blush Rose Atelier Box',
    notes: 'Everlasting Preserved Roses · White Hat Box · Silk Ribbon',
    price: `${DEFAULT_CURRENCY}3,400`,
  },
  {
    id: 'bs-lotus-urli',
    image: '/images/products/candle-lotus-urli.webp',
    category: 'candles',
    categoryLabel: 'Artisanal Candles',
    name: 'Lotus Blossom Urli Candle',
    notes: 'Scalloped Gold Vessel · Jasmine Sambac · Eco-Soy',
    price: `${DEFAULT_CURRENCY}3,200`,
  },
  {
    id: 'bs-vintage-pastels',
    image: '/images/products/bouquet-vintage-pastels.webp',
    category: 'bouquets',
    categoryLabel: 'Floral Bouquets',
    name: 'Vintage Peony & Lilac Box',
    notes: 'Dusty Rose & Lilac Botanicals · Velvet Cylinder Box',
    price: `${DEFAULT_CURRENCY}3,800`,
  },
  {
    id: 'bs-sculpture-bust',
    image: '/images/products/candle-sculpture-bust.webp',
    category: 'candles',
    categoryLabel: 'Artisanal Candles',
    name: 'Venus Aphrodite Bust',
    notes: 'Neoclassical Statue · Pure Botanical Soy · French Lavender',
    price: `${DEFAULT_CURRENCY}1,850`,
  },
  {
    id: 'bs-burgundy-tapers',
    image: '/images/products/candle-burgundy-tapers.webp',
    category: 'candles',
    categoryLabel: 'Artisanal Candles',
    name: 'Burgundy Botanique Tapers',
    notes: 'Set of 4 · Dried Floral Cones · Dripless Beeswax',
    price: `${DEFAULT_CURRENCY}1,650`,
  },
  {
    id: 'bs-spring-bloom',
    image: '/images/products/bouquet-spring-bloom.webp',
    category: 'bouquets',
    categoryLabel: 'Floral Bouquets',
    name: 'Spring Meadow Hat Box',
    notes: 'Preserved Pastel Florals · Signature Mausam Wax Seal',
    price: `${DEFAULT_CURRENCY}3,250`,
  },
  {
    id: 'bs-patisserie-waffle',
    image: '/images/products/candle-patisserie-waffle.webp',
    category: 'candles',
    categoryLabel: 'Artisanal Candles',
    name: 'Pâtisserie Berry Waffle',
    notes: 'Hand-Piped Wax Dessert · Wild Berries · Vanilla Tonka',
    price: `${DEFAULT_CURRENCY}1,950`,
  },
]

export interface GiftStep {
  number: string
  title: string
  description: string
}

export const giftSteps: GiftStep[] = [
  {
    number: '1',
    title: 'Select Atelier Creations',
    description: 'Choose your signature hand-poured soy candles, everlasting flower hat boxes, or a bespoke combination.',
  },
  {
    number: '2',
    title: 'Custom Personalization',
    description: 'Add a heartfelt handwritten message, custom photo/name tag, and authentic Mausam wax-sealed envelope.',
  },
  {
    number: '3',
    title: 'Delivered with Care',
    description: 'Carefully wrapped in keepsake packaging and dispatched safely to doorsteps across India.',
  },
]

export interface CraftFeature {
  shape: 'circle' | 'diamond' | 'square'
  title: string
  description: string
}

export const craftFeatures: CraftFeature[] = [
  {
    shape: 'circle',
    title: 'Clean-Burning Botanical Wax',
    description: '100% pure soy and botanical wax blends with lead-free cotton wicks for a sootless, toxin-free scent throw.',
  },
  {
    shape: 'diamond',
    title: 'Everlasting Botanical Artistry',
    description: 'Artisan preserved florals and petals that retain their delicate texture and beauty for months without watering.',
  },
  {
    shape: 'square',
    title: 'Handcrafted Keepsake Vessels',
    description: 'Brass lotus urlis, Parisian hat boxes, textured cylinders, and glass vessels designed to be treasured.',
  },
]

export interface EditorialMoment {
  image: string
  label: string
  tag: string
}

export const ambientMoments: EditorialMoment[] = [
  { image: '/images/products/editorial-bedside.webp', label: 'Golden Hour Bedside', tag: 'Sculptural Glow' },
  { image: '/images/products/editorial-dinner.webp', label: 'Festive Dining Setting', tag: 'Urli & Taper Styling' },
  { image: '/images/products/editorial-spa.webp', label: 'Sanctuary Spa Moment', tag: 'Botanical Lotus Petals' },
  { image: '/images/products/editorial-nook.webp', label: 'Reading Nook Dusk', tag: 'Handcrafted Tapers' },
]
