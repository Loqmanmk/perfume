export const SCENT_FAMILIES = ['floral', 'woody', 'amber', 'citrus', 'fresh', 'gourmand'] as const;
export type ScentFamily = (typeof SCENT_FAMILIES)[number];

export const MOODS = ['radiant', 'serene', 'bold', 'sensual'] as const;
export type Mood = (typeof MOODS)[number];

export const BOTTLE_SHAPE_OPTIONS = ['square', 'round', 'tall'] as const;
export type BottleShape = (typeof BOTTLE_SHAPE_OPTIONS)[number];

export const CONCENTRATIONS = ['Eau de Toilette', 'Eau de Parfum', 'Extrait de Parfum'] as const;
export type Concentration = (typeof CONCENTRATIONS)[number];

export interface ProductSize {
  ml: number;
  price: number;
}

export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
}

/** Everything needed to draw a bottle, in 2D or 3D. */
export interface BottleAppearance {
  shape: BottleShape;
  liquidColor: string;
  glassTint: string;
  capColor: string;
}

/** A 1–5 scale used for intensity, longevity and sillage. */
export type Scale = 1 | 2 | 3 | 4 | 5;

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  family: ScentFamily;
  mood: Mood;
  concentration: Concentration;
  intensity: Scale;
  longevity: Scale;
  sillage: Scale;
  /** Sorted ascending by volume. Always contains at least one size. */
  sizes: [ProductSize, ...ProductSize[]];
  notes: ScentNotes;
  bottle: BottleAppearance;
  /** Photo URLs; the first is the cover. Empty when the product only has its illustrated bottle. */
  images: string[];
  /** Optional scanned 3D model (.glb). When present it replaces the generated bottle in the 360° viewer. */
  modelUrl: string | null;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

export const FAMILY_LABELS: Record<ScentFamily, string> = {
  floral: 'Floral',
  woody: 'Woody',
  amber: 'Amber',
  citrus: 'Citrus',
  fresh: 'Fresh',
  gourmand: 'Gourmand',
};

export const MOOD_LABELS: Record<Mood, string> = {
  radiant: 'Radiant',
  serene: 'Serene',
  bold: 'Bold',
  sensual: 'Sensual',
};

export const SHAPE_LABELS: Record<BottleShape, string> = {
  square: 'Square flacon',
  round: 'Round flacon',
  tall: 'Tall column',
};

export function startingPrice(product: Product): number {
  return product.sizes[0].price;
}

/** The size pre-selected for shoppers: the middle option when there is one. */
export function defaultSize(product: Product): ProductSize {
  return product.sizes[1] ?? product.sizes[0];
}

export function findSize(product: Product, ml: number): ProductSize | undefined {
  return product.sizes.find((size) => size.ml === ml);
}

export function coverImage(product: Product): string | undefined {
  return product.images[0];
}
