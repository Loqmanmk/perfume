import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Reveal } from '@/components/ui/Reveal';

const PILLARS = [
  {
    step: '01',
    title: 'Sourced by hand',
    body: 'Rose from Grasse, vanilla from Madagascar, sandalwood from Mysore — bought directly from growers we know by name.',
  },
  {
    step: '02',
    title: 'Composed slowly',
    body: 'Each formula rests for eight weeks before bottling, so every note has time to settle into the next.',
  },
  {
    step: '03',
    title: 'Made to last',
    body: 'High concentrations, refillable crystal and recyclable packaging. Luxury that respects where it comes from.',
  },
];

export function Story() {
  const section = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);

  return (
    <section
      id="story"
      ref={section}
      className="hairline relative scroll-mt-18 overflow-hidden border-y bg-ink-900 py-24 md:py-36"
      aria-labelledby="story-title"
    >
      <motion.p
        aria-hidden
        style={prefersReducedMotion ? undefined : { x: drift }}
        className="pointer-events-none absolute -top-6 left-0 whitespace-nowrap font-display text-[11rem] italic leading-none text-cream/[0.04] md:text-[18rem]"
      >
        savoir-faire
      </motion.p>

      <div className="container-page relative">
        <Reveal className="max-w-4xl">
          <p className="eyebrow">Our story</p>
          <h2 id="story-title" className="mt-5 text-4xl md:text-7xl">
            A perfume is a memory you have <em className="text-gold">not made yet</em>.
          </h2>
          <p className="mt-7 max-w-2xl text-lg text-muted">
            We are a small house of perfumers who believe scent should be personal, patient and
            honest. No shortcuts, no noise — only beautiful materials given the time they deserve.
          </p>
        </Reveal>

        <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {PILLARS.map((pillar, index) => (
            <li key={pillar.step}>
              <Reveal delay={index * 0.12} className="hairline border-t pt-6">
                <p className="text-sm font-semibold text-gold">{pillar.step}</p>
                <h3 className="mt-3 text-3xl">{pillar.title}</h3>
                <p className="mt-3 text-muted">{pillar.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
