import { Heart } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useCatalogue } from '@/features/catalogue/useCatalogue';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useWishlistStore } from '@/store/wishlistStore';

export function WishlistPage() {
  usePageTitle('Wishlist');

  const productIds = useWishlistStore((state) => state.productIds);
  const { repository, isLoading } = useCatalogue();
  const products = productIds
    .map((id) => repository.getById(id))
    .filter((product) => product !== undefined);

  return (
    <div className="container-page min-h-[80dvh] pb-24 pt-36 md:pt-44">
      <SectionHeading
        as="h1"
        eyebrow="Saved for later"
        title="Your wishlist"
        description="The fragrances you are still thinking about."
      />

      {isLoading ? (
        <div className="mt-14">
          <ProductGridSkeleton />
        </div>
      ) : products.length > 0 ? (
        <div className="mt-14">
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="hairline mt-14 rounded-2xl border px-6 py-20 text-center">
          <Heart size={32} strokeWidth={1.2} className="mx-auto text-gold" aria-hidden />
          <h2 className="mt-5 text-3xl">Nothing saved yet</h2>
          <p className="mt-2 text-muted">Tap the heart on any fragrance to keep it here.</p>
          <ButtonLink to="/shop" className="mt-7">
            Explore the collection
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
