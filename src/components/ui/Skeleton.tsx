import { cn } from '@/lib/cn';

/** A shimmering placeholder in the shape of content that is still loading. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-2xl bg-ink-800', className)} />;
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading fragrances">
      <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <Skeleton className="aspect-[4/5]" />
            <Skeleton className="mt-4 h-6 w-2/3 rounded-full" />
            <Skeleton className="mt-2 h-3 w-1/2 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shown when the catalogue could not be loaded. */
export function LoadError({ message }: { message: string }) {
  return (
    <div role="alert" className="hairline rounded-2xl border px-6 py-16 text-center">
      <h2 className="text-3xl">We could not load the collection</h2>
      <p className="mt-2 text-muted">{message}</p>
    </div>
  );
}
