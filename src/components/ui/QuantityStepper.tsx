import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Names what is being counted, for screen readers. */
  label: string;
  size?: 'sm' | 'md';
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  size = 'md',
}: QuantityStepperProps) {
  const buttonClass = cn(
    'grid place-items-center text-cream transition-colors hover:text-gold disabled:text-ink-600',
    size === 'md' ? 'size-11' : 'size-9',
  );

  return (
    <div
      role="group"
      aria-label={label}
      className="hairline inline-flex items-center rounded-full border"
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={14} aria-hidden />
      </button>
      <span aria-live="polite" className="w-7 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={14} aria-hidden />
      </button>
    </div>
  );
}
