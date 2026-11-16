import { ChevronDown, Rotate3d } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ProductGrid } from '@/components/product/ProductGrid';
import { BottleViewer } from '@/components/three/BottleViewer';
import { Rating } from '@/components/ui/Rating';
import { ScaleMeter } from '@/components/ui/ScaleMeter';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FAMILY_LABELS, type Product } from '@/domain/product';
import { NotesPyramid } from '@/features/product/NotesPyramid';
import { PurchasePanel } from '@/features/product/PurchasePanel';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { productRepository } from '@/services/productRepository';
import { NotFoundPage } from './NotFoundPage';

const RELATED_COUNT = 4;

const DETAILS = [
  {
    title: 'How to wear it',
    body: 'Spray on pulse points — wrists, neck, behind the ears — from about 15 cm. Do not rub: let it dry so the top notes open naturally.',
  },
  {
    title: 'Ingredients & care',
    body: 'Alcohol denat., parfum, aqua. Vegan and cruelty-free. Keep the bottle away from heat and direct sunlight to preserve the composition.',
  },
  {
    title: 'Shipping & returns',
    body: 'Dispatched within 24 hours with two complimentary samples. Try a sample first: unopened bottles can be returned within 30 days.',
  },
];

function Breadcrumb({ product }: { product: Product }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.18em] text-muted">
      <ol className="flex flex-wrap gap-2">
        <li>
          <Link to="/shop" className="hover:text-cream">
            Shop
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link to={`/shop?family=${product.family}`} className="hover:text-cream">
            {FAMILY_LABELS[product.family]}
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-cream">
          {product.name}
        </li>
      </ol>
    </nav>
  );
}

function ProductDetail({ product }: { product: Product }) {
  usePageTitle(product.name);
  const related = productRepository.getRelated(product, RELATED_COUNT);

  return (
    <div className="pt-28 md:pt-36">
      <div className="container-page">
        <Breadcrumb product={product} />

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="hairline relative isolate overflow-hidden rounded-3xl border bg-ink-900">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-40"
                style={{
                  background: `radial-gradient(circle at 50% 55%, ${product.bottle.liquidColor}, transparent 65%)`,
                }}
              />
              <BottleViewer
                bottle={product.bottle}
                label={{ name: product.name, caption: product.concentration }}
                className="h-[26rem] w-full sm:h-[34rem] lg:h-[40rem]"
              />
              <p className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                <Rotate3d size={15} aria-hidden /> Drag to rotate
              </p>
            </div>
          </div>

          <div className="pb-4">
            <p className="eyebrow">
              {FAMILY_LABELS[product.family]} · {product.concentration}
            </p>
            <h1 className="mt-4 text-5xl md:text-7xl">{product.name}</h1>
            <p className="mt-3 font-display text-2xl italic text-cream/80">{product.tagline}</p>
            <div className="mt-4">
              <Rating value={product.rating} reviewCount={product.reviewCount} />
            </div>

            <p className="mt-6 text-muted">{product.description}</p>

            <div className="hairline mt-8 border-t pt-8">
              <PurchasePanel key={product.id} product={product} />
            </div>

            <div className="hairline mt-10 grid gap-6 border-t pt-8">
              <ScaleMeter label="Intensity" value={product.intensity} range={['Soft', 'Powerful']} />
              <ScaleMeter label="Longevity" value={product.longevity} range={['4 hours', '12+ hours']} />
              <ScaleMeter label="Sillage" value={product.sillage} range={['Intimate', 'Room-filling']} />
            </div>

            <div className="hairline mt-10 border-t">
              {DETAILS.map((detail) => (
                <details key={detail.title} className="hairline group border-b">
                  <summary className="flex min-h-14 list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    {detail.title}
                    <ChevronDown
                      size={18}
                      aria-hidden
                      className="text-muted transition-transform duration-300 group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-5 text-sm text-muted">{detail.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="container-page py-24 md:py-32" aria-label="Olfactory notes">
        <SectionHeading
          align="center"
          eyebrow="The composition"
          title="How it unfolds"
          description="A perfume is not one smell but three movements, each revealing the next."
        />
        <div className="mx-auto mt-14 max-w-4xl">
          <NotesPyramid notes={product.notes} accent={product.bottle.liquidColor} />
        </div>
      </section>

      <section className="container-page pb-24 md:pb-32" aria-label="Related fragrances">
        <SectionHeading eyebrow="Keep exploring" title="You may also love" />
        <div className="mt-14">
          <ProductGrid products={related} />
        </div>
      </section>
    </div>
  );
}

export function ProductPage() {
  const { slug = '' } = useParams();
  const product = productRepository.getBySlug(slug);

  return product ? <ProductDetail product={product} /> : <NotFoundPage />;
}
