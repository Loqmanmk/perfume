import { Reveal } from '@/components/ui/Reveal';
import type { ScentNotes } from '@/domain/product';

const TIERS: { key: keyof ScentNotes; title: string; timing: string; width: string }[] = [
  { key: 'top', title: 'Top notes', timing: 'First 15 minutes', width: 'md:w-1/2' },
  { key: 'heart', title: 'Heart notes', timing: '15 minutes – 4 hours', width: 'md:w-3/4' },
  { key: 'base', title: 'Base notes', timing: '4 hours and beyond', width: 'md:w-full' },
];

/** The olfactory pyramid: how the perfume unfolds over time, narrow top to broad base. */
export function NotesPyramid({ notes, accent }: { notes: ScentNotes; accent: string }) {
  return (
    <ol className="flex flex-col items-center gap-3">
      {TIERS.map((tier, index) => (
        <li key={tier.key} className={`w-full ${tier.width}`}>
          <Reveal delay={index * 0.12}>
            <div className="hairline relative overflow-hidden rounded-2xl border bg-ink-900 px-6 py-6 text-center">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
              />
              <p className="eyebrow">{tier.title}</p>
              <p className="mt-2 font-display text-2xl md:text-3xl">{notes[tier.key].join(' · ')}</p>
              <p className="mt-1 text-xs text-muted">{tier.timing}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
