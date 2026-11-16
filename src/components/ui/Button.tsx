import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

interface StyleProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-gold text-ink-950 hover:bg-gold-soft disabled:bg-ink-600 disabled:text-muted',
  outline:
    'border border-cream/25 text-cream hover:border-gold hover:text-gold disabled:opacity-40',
  ghost: 'text-cream hover:text-gold disabled:opacity-40',
};

const SIZE_CLASSES: Record<Size, string> = {
  md: 'min-h-11 px-6 text-[0.72rem]',
  lg: 'min-h-14 px-9 text-xs',
};

function buttonClasses({ variant = 'primary', size = 'md', fullWidth }: StyleProps, extra?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2.5 rounded-full font-semibold uppercase tracking-[0.2em]',
    'transition-[background-color,color,border-color,transform] duration-300 ease-luxe active:scale-[0.98]',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    extra,
  );
}

type ButtonProps = StyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant, size, fullWidth, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, fullWidth }, className)} {...rest} />
  );
}

type ButtonLinkProps = StyleProps & LinkProps;

/** Same look as `Button`, but navigates. Use for anything that changes the URL. */
export function ButtonLink({ variant, size, fullWidth, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, fullWidth }, className)} {...rest} />;
}
