import { Sparkles } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export function ScentFinderBanner() {
  return (
    <section className="container-page pb-24 md:pb-32" aria-labelledby="finder-banner-title">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl border border-gold/25 bg-ink-900 px-6 py-16 text-center md:py-24">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 animate-drift opacity-40"
            style={{
              background:
                'radial-gradient(40% 60% at 25% 40%, #b03a5b, transparent), radial-gradient(40% 60% at 75% 60%, #c8781f, transparent)',
            }}
          />
          <Sparkles size={28} strokeWidth={1.3} className="mx-auto text-gold" aria-hidden />
          <h2 id="finder-banner-title" className="mx-auto mt-5 max-w-2xl text-4xl md:text-6xl">
            Not sure where to start?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Answer three questions and we will match you with the fragrances made for you.
          </p>
          <ButtonLink to="/scent-finder" size="lg" className="mt-8">
            Find my scent
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
