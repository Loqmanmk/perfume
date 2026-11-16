import { useState } from 'react';
import { ArrowRight, Rotate3d } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BottleViewer } from '@/components/three/BottleViewer';
import { ButtonLink } from '@/components/ui/Button';
import { FAMILY_LABELS, startingPrice, type Product } from '@/domain/product';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';

interface HeroProps {
  /** Fragrances the shopper can flip through. Must not be empty. */
  products: readonly [Product, ...Product[]];
}

const textTransition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;

export function Hero({ products }: HeroProps) {
  const [activeId, setActiveId] = useState(products[0].id);
  const active = products.find((product) => product.id === activeId) ?? products[0];

  return (
    <section className="relative isolate overflow-clip pt-18" aria-labelledby="hero-title">
      {/* Ambient glow that takes the colour of the selected perfume */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 size-[70rem] max-w-none -translate-x-1/4 -translate-y-1/2 animate-drift rounded-full opacity-30 blur-3xl transition-[background] duration-1000"
        style={{ background: `radial-gradient(circle, ${active.bottle.liquidColor}, transparent 62%)` }}
      />

      <div className="container-page grid min-h-[calc(100dvh-4.5rem)] items-center gap-4 pb-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0 pt-10 lg:pt-0">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={textTransition}
          >
            Maison de Parfum · Est. 2012
          </motion.p>

          <motion.h1
            id="hero-title"
            className="mt-6 text-6xl sm:text-7xl xl:text-[6.5rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...textTransition, delay: 0.1 }}
          >
            Wear what <em className="text-gold">cannot</em> be seen.
          </motion.h1>

          <div className="mt-8 min-h-32" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <p className="font-display text-3xl">{active.name}</p>
                <p className="mt-2 max-w-md text-muted">{active.tagline}</p>
                <p className="mt-3 text-sm">
                  <span className="text-muted">{FAMILY_LABELS[active.family]} · from </span>
                  <span className="font-semibold">{formatPrice(startingPrice(active))}</span>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...textTransition, delay: 0.25 }}
          >
            <ButtonLink to={`/product/${active.slug}`} size="lg">
              Discover <ArrowRight size={16} aria-hidden />
            </ButtonLink>
            <ButtonLink to="/shop" size="lg" variant="outline">
              Shop all
            </ButtonLink>
          </motion.div>
        </div>

        <div className="relative min-w-0">
          <BottleViewer
            bottle={active.bottle}
            label={{ name: active.name, caption: active.concentration }}
            className="h-[26rem] w-full sm:h-[34rem] lg:h-[42rem]"
          />

          <p className="pointer-events-none absolute right-2 top-4 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            <Rotate3d size={15} aria-hidden /> Drag to rotate
          </p>

          <div
            role="group"
            aria-label="Choose a fragrance to preview"
            className="scrollbar-none -mx-5 flex justify-start gap-2 overflow-x-auto px-5 sm:justify-center"
          >
            {products.map((product) => {
              const isActive = product.id === active.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setActiveId(product.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex min-h-11 shrink-0 items-center gap-2.5 rounded-full border px-4 text-xs font-semibold transition-colors duration-300',
                    isActive
                      ? 'border-gold text-cream'
                      : 'border-cream/15 text-muted hover:border-cream/40 hover:text-cream',
                  )}
                >
                  <span
                    aria-hidden
                    className="size-3 rounded-full"
                    style={{ backgroundColor: product.bottle.liquidColor }}
                  />
                  {product.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
