import { ButtonLink } from '@/components/ui/Button';
import { usePageTitle } from '@/lib/hooks/usePageTitle';

export function NotFoundPage() {
  usePageTitle('Page not found');

  return (
    <div className="container-page grid min-h-[80dvh] place-items-center pt-18 text-center">
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-5 text-6xl md:text-8xl">This scent has faded.</h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          The page you are looking for does not exist or has moved. The collection is still here.
        </p>
        <ButtonLink to="/shop" size="lg" className="mt-9">
          Back to the collection
        </ButtonLink>
      </div>
    </div>
  );
}
