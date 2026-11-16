import type { Product } from '@/domain/product';
import { Reveal } from '@/components/ui/Reveal';
import { ProductCard } from './ProductCard';

const STAGGER_SECONDS = 0.08;
const COLUMNS = 4;

export function ProductGrid({ products }: { products: readonly Product[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <Reveal delay={(index % COLUMNS) * STAGGER_SECONDS}>
            <ProductCard product={product} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
