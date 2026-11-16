import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FAMILY_LABELS, SCENT_FAMILIES, type ScentFamily } from '@/domain/product';
import { parseCatalogueQuery, queryCatalogue, SORT_OPTIONS } from '@/features/shop/catalogueQuery';
import { cn } from '@/lib/cn';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { productRepository } from '@/services/productRepository';

interface FamilyChipProps {
  label: string;
  isActive: boolean;
  onSelect: () => void;
}

function FamilyChip({ label, isActive, onSelect }: FamilyChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        'min-h-11 shrink-0 rounded-full border px-5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-300',
        isActive
          ? 'border-gold bg-gold text-ink-950'
          : 'border-cream/15 text-muted hover:border-cream/40 hover:text-cream',
      )}
    >
      {label}
    </button>
  );
}

export function ShopPage() {
  usePageTitle('Shop');

  const [params, setParams] = useSearchParams();
  const query = parseCatalogueQuery(params);
  const products = queryCatalogue(productRepository.getAll(), query);

  /** Filters live in the URL so results can be shared, bookmarked and restored with Back. */
  const setParam = (key: string, value: string | undefined) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const selectFamily = (family: ScentFamily | undefined) => setParam('family', family);

  return (
    <div className="container-page pb-24 pt-36 md:pb-32 md:pt-44">
      <SectionHeading
        as="h1"
        eyebrow="The collection"
        title="All fragrances"
        description="Eight perfumes, each composed around a single idea. Filter by family or search for a note you love."
      />

      <div className="mt-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter by olfactory family"
          className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0"
        >
          <FamilyChip label="All" isActive={!query.family} onSelect={() => selectFamily(undefined)} />
          {SCENT_FAMILIES.map((family) => (
            <FamilyChip
              key={family}
              label={FAMILY_LABELS[family]}
              isActive={query.family === family}
              onSelect={() => selectFamily(family)}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <div className="hairline flex min-h-11 flex-1 items-center gap-2 rounded-full border px-4 focus-within:border-gold lg:w-64">
            <Search size={16} className="shrink-0 text-muted" aria-hidden />
            <label htmlFor="shop-search" className="sr-only">
              Search fragrances and notes
            </label>
            <input
              id="shop-search"
              type="search"
              value={query.search}
              onChange={(event) => setParam('q', event.target.value || undefined)}
              placeholder="Search a name or note"
              className="w-full bg-transparent text-sm placeholder:text-muted focus:outline-none"
            />
          </div>

          <label htmlFor="shop-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="shop-sort"
            value={query.sort}
            onChange={(event) =>
              setParam('sort', event.target.value === 'featured' ? undefined : event.target.value)
            }
            className="hairline min-h-11 rounded-full border bg-ink-950 px-4 text-sm text-cream"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted" role="status">
        {products.length} {products.length === 1 ? 'fragrance' : 'fragrances'}
      </p>

      {products.length > 0 ? (
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="hairline mt-8 rounded-2xl border px-6 py-20 text-center">
          <h2 className="text-3xl">Nothing matches that search</h2>
          <p className="mt-2 text-muted">Try another note, or clear the filters to see everything.</p>
          <Button variant="outline" className="mt-6" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
