import { ArrowRight } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { LoadError, ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useCatalogue } from '@/features/catalogue/useCatalogue';
import { FamilyTiles } from '@/features/home/FamilyTiles';
import { Hero } from '@/features/home/Hero';
import { NotesMarquee } from '@/features/home/NotesMarquee';
import { ScentFinderBanner } from '@/features/home/ScentFinderBanner';
import { ServicePromises } from '@/features/home/ServicePromises';
import { Story } from '@/features/home/Story';
import { usePageTitle } from '@/lib/hooks/usePageTitle';

const HERO_PRODUCT_COUNT = 4;
const FEATURED_PRODUCT_COUNT = 4;

export function HomePage() {
  usePageTitle();

  const { repository, isLoading, error } = useCatalogue();
  const catalogue = repository.getAll();
  const [firstHero, ...otherHeroes] = catalogue.slice(0, HERO_PRODUCT_COUNT);
  const featured = [
    ...new Set([...repository.getBestsellers(), ...catalogue.filter((product) => product.isNew)]),
  ].slice(0, FEATURED_PRODUCT_COUNT);

  return (
    <>
      {firstHero ? (
        <Hero products={[firstHero, ...otherHeroes]} />
      ) : (
        <div className="container-page min-h-dvh pt-36">
          {isLoading && <Skeleton className="h-[60dvh]" />}
          {error && <LoadError message={error.message} />}
        </div>
      )}
      <NotesMarquee />

      <section className="container-page pt-24 md:pt-32" aria-label="Most loved fragrances">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="The icons"
            title="Most loved"
            description="The fragrances our clients come back to, season after season."
          />
          <ButtonLink to="/shop" variant="ghost" className="px-0">
            View all <ArrowRight size={16} aria-hidden />
          </ButtonLink>
        </div>
        <div className="mt-14">
          {isLoading ? <ProductGridSkeleton /> : !error && <ProductGrid products={featured} />}
        </div>
      </section>

      <FamilyTiles />
      <Story />
      <ServicePromises />
      <ScentFinderBanner />
    </>
  );
}
