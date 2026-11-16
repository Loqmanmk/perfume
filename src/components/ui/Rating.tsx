import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  reviewCount?: number;
}

export function Rating({ value, reviewCount }: RatingProps) {
  const label =
    reviewCount === undefined
      ? `Rated ${value} out of 5`
      : `Rated ${value} out of 5 from ${reviewCount} reviews`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted" role="img" aria-label={label}>
      <Star size={14} className="fill-gold text-gold" aria-hidden />
      <span className="font-semibold text-cream">{value.toFixed(1)}</span>
      {reviewCount !== undefined && <span>({reviewCount})</span>}
    </div>
  );
}
