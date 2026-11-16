import type { Scale } from '@/domain/product';
import { cn } from '@/lib/cn';

interface ScaleMeterProps {
  label: string;
  value: Scale;
  /** Words for the low and high end, e.g. "Soft" → "Powerful". */
  range: [low: string, high: string];
}

const STEPS = [1, 2, 3, 4, 5] as const;

/** A five-step bar for intensity, longevity and sillage. */
export function ScaleMeter({ label, value, range }: ScaleMeterProps) {
  return (
    <div role="img" aria-label={`${label}: ${value} out of 5`}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-xs text-muted">
          {range[0]} — {range[1]}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden>
        {STEPS.map((step) => (
          <span
            key={step}
            className={cn('h-1 flex-1 rounded-full', step <= value ? 'bg-gold' : 'bg-ink-700')}
          />
        ))}
      </div>
    </div>
  );
}
