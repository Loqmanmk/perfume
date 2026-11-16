import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  /** Heading level, so each page keeps a correct outline. */
  as?: 'h1' | 'h2';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
}: SectionHeadingProps) {
  return (
    <Reveal className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className="eyebrow">{eyebrow}</p>
      <Heading className="mt-4 text-4xl md:text-6xl">{title}</Heading>
      {description && <p className="mt-5 text-base text-muted md:text-lg">{description}</p>}
    </Reveal>
  );
}
