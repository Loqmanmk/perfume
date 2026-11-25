import type { Product } from '@/domain/product';
import type { ProductFormValues } from '@/domain/productSchema';

/** A blank product with sensible starting choices. Prices are left empty on purpose. */
export function emptyProductValues(): ProductFormValues {
  return {
    name: '',
    tagline: '',
    description: '',
    family: 'floral',
    mood: 'radiant',
    concentration: 'Eau de Parfum',
    intensity: 3,
    longevity: 3,
    sillage: 3,
    sizes: [
      { ml: 30, price: Number.NaN },
      { ml: 50, price: Number.NaN },
      { ml: 100, price: Number.NaN },
    ],
    notes: { top: [], heart: [], base: [] },
    bottle: { shape: 'square', liquidColor: '#c8781f', glassTint: '#fff1dc', capColor: '#c9a96e' },
    images: [],
    modelUrl: null,
    isNew: true,
    isBestseller: false,
  };
}

/** The editable part of an existing product. */
export function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    family: product.family,
    mood: product.mood,
    concentration: product.concentration,
    intensity: product.intensity,
    longevity: product.longevity,
    sillage: product.sillage,
    sizes: product.sizes.map((size) => ({ ...size })),
    notes: { top: [...product.notes.top], heart: [...product.notes.heart], base: [...product.notes.base] },
    bottle: { ...product.bottle },
    images: [...product.images],
    modelUrl: product.modelUrl,
    isNew: product.isNew ?? false,
    isBestseller: product.isBestseller ?? false,
  };
}
