export interface SeasonTab {
  id: string
  name: string
}

export const seasonTabs: SeasonTab[] = [
  { id: 'monsoon', name: 'The Monsoon — Earth & Petrichor' },
  { id: 'hemant', name: 'Hemant — Smoked Pine & Amber' },
  { id: 'vasant', name: 'Vasant — Wild Jasmine & Fig' },
  { id: 'grishma', name: 'Grishma — Bergamot & Tea' },
]

export interface SeasonProduct {
  photoLabel: string
  name: string
  notes: string[]
  burnTime: string
  weight: string
}

export const seasonProductsByTab: Record<string, SeasonProduct[]> = {
  monsoon: [
    {
      photoLabel: 'product photo — petrichor vessel',
      name: 'Petrichor No. 1',
      notes: ['Top: Rain-soaked Earth & Bergamot', 'Heart: Vetiver & Moss', 'Base: Sandalwood'],
      burnTime: '60+ Hour Clean Burn',
      weight: '220g',
    },
    {
      photoLabel: 'product photo — monsoon clay pot',
      name: 'Monsoon Clay',
      notes: ['Top: Wet Stone & Fig Leaf', 'Heart: Cedarwood', 'Base: Warm Musk'],
      burnTime: '55+ Hour Clean Burn',
      weight: '200g',
    },
    {
      photoLabel: 'product photo — earth & ember bowl',
      name: 'Earth & Ember',
      notes: ['Top: Black Pepper', 'Heart: Terracotta Accord', 'Base: Oud'],
      burnTime: '65+ Hour Clean Burn',
      weight: '240g',
    },
  ],
  hemant: [
    {
      photoLabel: 'product photo — smoked amber urn',
      name: 'Smoked Amber Urn',
      notes: ['Top: Smoked Pine', 'Heart: Amber Resin', 'Base: Cedar'],
      burnTime: '58+ Hour Clean Burn',
      weight: '230g',
    },
    {
      photoLabel: 'product photo — hearth pine bowl',
      name: 'Hearth Pine Bowl',
      notes: ['Top: Frankincense', 'Heart: Dry Pine Needle', 'Base: Sandalwood'],
      burnTime: '52+ Hour Clean Burn',
      weight: '210g',
    },
    {
      photoLabel: 'product photo — ember spice vessel',
      name: 'Ember Spice Vessel',
      notes: ['Top: Clove & Cinnamon Bark', 'Heart: Amber', 'Base: Warm Musk'],
      burnTime: '60+ Hour Clean Burn',
      weight: '225g',
    },
  ],
  vasant: [
    {
      photoLabel: 'product photo — wild jasmine bowl',
      name: 'Wild Jasmine Bowl',
      notes: ['Top: Jasmine Sambac', 'Heart: Fig Leaf', 'Base: White Musk'],
      burnTime: '56+ Hour Clean Burn',
      weight: '215g',
    },
    {
      photoLabel: 'product photo — fig blossom urn',
      name: 'Fig Blossom Urn',
      notes: ['Top: Green Fig', 'Heart: Neroli', 'Base: Cedarwood'],
      burnTime: '54+ Hour Clean Burn',
      weight: '205g',
    },
    {
      photoLabel: 'product photo — bloom garden vessel',
      name: 'Bloom Garden Vessel',
      notes: ['Top: Wild Jasmine', 'Heart: White Tea', 'Base: Sandalwood'],
      burnTime: '58+ Hour Clean Burn',
      weight: '220g',
    },
  ],
  grishma: [
    {
      photoLabel: 'product photo — bergamot tea chalice',
      name: 'Bergamot Tea Chalice',
      notes: ['Top: Bergamot', 'Heart: Green Tea', 'Base: Bamboo'],
      burnTime: '50+ Hour Clean Burn',
      weight: '195g',
    },
    {
      photoLabel: 'product photo — citrus grove bowl',
      name: 'Citrus Grove Bowl',
      notes: ['Top: Blood Orange', 'Heart: Bergamot', 'Base: White Musk'],
      burnTime: '48+ Hour Clean Burn',
      weight: '190g',
    },
    {
      photoLabel: 'product photo — sunlit veranda vessel',
      name: 'Sunlit Veranda Vessel',
      notes: ['Top: Green Tea', 'Heart: Jasmine', 'Base: Cedarwood'],
      burnTime: '52+ Hour Clean Burn',
      weight: '200g',
    },
  ],
}

export interface Bestseller {
  photoLabel: string
  category: string
  name: string
  notes: string
  price: string
}

export const bestsellers: Bestseller[] = [
  { photoLabel: 'petrichor vessel', category: 'Earth & Petrichor', name: 'Petrichor Vessel', notes: 'Vetiver · Rain-soaked Earth · Sandalwood', price: '₹4,200' },
  { photoLabel: 'smoked amber urn', category: 'Smoked Pine & Amber', name: 'Smoked Amber Urn', notes: 'Smoked Pine · Amber Resin · Cedar', price: '₹4,800' },
  { photoLabel: 'wild jasmine bowl', category: 'Wild Jasmine & Fig', name: 'Wild Jasmine Bowl', notes: 'Jasmine Sambac · Fig Leaf · White Musk', price: '₹4,500' },
  { photoLabel: 'bergamot tea chalice', category: 'Bergamot & Tea', name: 'Bergamot Tea Chalice', notes: 'Bergamot · Green Tea · Bamboo', price: '₹4,000' },
  { photoLabel: 'ceramic dune candle', category: 'Sandalwood & Oud', name: 'Ceramic Dune Candle', notes: 'Oud · Sandalwood · Warm Musk', price: '₹5,200' },
  { photoLabel: 'ribbed glass ember', category: 'Cardamom & Clove', name: 'Ribbed Glass Ember', notes: 'Cardamom · Clove · Tonka Bean', price: '₹4,600' },
  { photoLabel: 'alabaster bloom vessel', category: 'Rose & Saffron', name: 'Alabaster Bloom Vessel', notes: 'Rose Absolute · Saffron · Amber', price: '₹4,900' },
  { photoLabel: 'monsoon clay pot', category: 'Vetiver & Moss', name: 'Monsoon Clay Pot', notes: 'Vetiver · Moss · Cedarwood', price: '₹4,300' },
]

export interface GiftStep {
  number: string
  title: string
  description: string
}

export const giftSteps: GiftStep[] = [
  { number: '1', title: 'Curate Your Vessel', description: 'Select sizes & signature scents' },
  { number: '2', title: 'Bespoke Details', description: 'Personalized wax seal, custom initial tag & foil-stamped gift card' },
  { number: '3', title: 'Delivered to Delight', description: 'Hand-wrapped in signature gift packaging' },
]

export interface CraftFeature {
  shape: 'circle' | 'diamond' | 'square'
  title: string
  description: string
}

export const craftFeatures: CraftFeature[] = [
  { shape: 'circle', title: '100% Eco-Soy & Coconut Wax', description: 'Toxin-free, sootless burn' },
  { shape: 'diamond', title: 'Master Perfumery Oils', description: 'Complex, room-filling throw' },
  { shape: 'square', title: 'Reusable Keepsake Vessels', description: 'Handcrafted ceramics & blown glass designed to live forever' },
]

export const ambientMoments: string[] = [
  'golden hour, bedside',
  'dinner table styling',
  'spa bath styling',
  'reading nook, dusk',
]
