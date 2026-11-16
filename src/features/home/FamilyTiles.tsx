import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FAMILY_LABELS, SCENT_FAMILIES, type ScentFamily } from '@/domain/product';

const FAMILY_DETAILS: Record<ScentFamily, { description: string; color: string }> = {
  floral: { description: 'Rose, iris, jasmine in bloom', color: '#b03a5b' },
  woody: { description: 'Sandalwood, cedar, vetiver', color: '#7a4a24' },
  amber: { description: 'Resins, spice, warm skin', color: '#c8781f' },
  citrus: { description: 'Lemon, neroli, bright zest', color: '#e9c23c' },
  fresh: { description: 'Sea air, white tea, mint', color: '#4f9db3' },
  gourmand: { description: 'Vanilla, tonka, dark rum', color: '#a8662c' },
};

export function FamilyTiles() {
  return (
    <section className="container-page py-24 md:py-32" aria-labelledby="families-title">
      <SectionHeading
        eyebrow="Olfactory families"
        title={<span id="families-title">Begin with a feeling</span>}
        description="Every perfume belongs to a family. Start with the one that sounds like you."
      />

      <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
        {SCENT_FAMILIES.map((family, index) => {
          const { description, color } = FAMILY_DETAILS[family];
          return (
            <li key={family}>
              <Reveal delay={(index % 3) * 0.08}>
                <Link
                  to={`/shop?family=${family}`}
                  className="hairline group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl border bg-ink-900 p-5 md:p-7"
                >
                  <span
                    aria-hidden
                    className="absolute -right-1/4 -top-1/4 size-3/4 rounded-full opacity-35 blur-3xl transition-[opacity,transform] duration-700 ease-luxe group-hover:scale-150 group-hover:opacity-70"
                    style={{ backgroundColor: color }}
                  />
                  <ArrowUpRight
                    size={20}
                    aria-hidden
                    className="absolute right-5 top-5 text-muted transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
                  />
                  <span className="relative font-display text-3xl md:text-4xl">{FAMILY_LABELS[family]}</span>
                  <span className="relative mt-1 text-xs text-muted md:text-sm">{description}</span>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
