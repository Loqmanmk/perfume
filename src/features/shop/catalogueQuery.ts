import { SCENT_FAMILIES, startingPrice, type Product, type ScentFamily } from '@/domain/product';

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
] as const;

export type SortOrder = (typeof SORT_OPTIONS)[number]['value'];

export interface CatalogueQuery {
  search: string;
  family: ScentFamily | undefined;
  sort: SortOrder;
}

const COMPARATORS: Record<SortOrder, ((a: Product, b: Product) => number) | undefined> = {
  featured: undefined,
  'price-asc': (a, b) => startingPrice(a) - startingPrice(b),
  'price-desc': (a, b) => startingPrice(b) - startingPrice(a),
  rating: (a, b) => b.rating - a.rating,
};

function matchesSearch(product: Product, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    product.name,
    product.tagline,
    product.family,
    ...product.notes.top,
    ...product.notes.heart,
    ...product.notes.base,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
}

export function queryCatalogue(products: readonly Product[], query: CatalogueQuery): Product[] {
  const filtered = products.filter(
    (product) =>
      (!query.family || product.family === query.family) && matchesSearch(product, query.search),
  );
  const comparator = COMPARATORS[query.sort];
  return comparator ? filtered.toSorted(comparator) : filtered;
}

/** Reads a query from URL params, ignoring anything it does not recognise. */
export function parseCatalogueQuery(params: URLSearchParams): CatalogueQuery {
  const family = params.get('family');
  const sort = params.get('sort');

  return {
    search: params.get('q') ?? '',
    family: SCENT_FAMILIES.find((candidate) => candidate === family),
    sort: SORT_OPTIONS.find((option) => option.value === sort)?.value ?? 'featured',
  };
}
