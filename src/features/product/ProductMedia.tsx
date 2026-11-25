import { useState } from 'react';
import { Rotate3d } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BottleViewer } from '@/components/three/BottleViewer';
import type { Product } from '@/domain/product';
import { cn } from '@/lib/cn';

/** `'3d'` for the 360° viewer, or the index of a photo. */
type View = '3d' | number;

const VIEWER_HEIGHT = 'h-[26rem] sm:h-[34rem] lg:h-[40rem]';

const thumbClass = (isActive: boolean) =>
  cn(
    'grid size-18 shrink-0 place-items-center overflow-hidden rounded-xl border transition-colors duration-300',
    isActive ? 'border-gold' : 'border-cream/15 hover:border-cream/40',
  );

/** The 360° viewer plus the admin's photos, switchable from a row of thumbnails. */
export function ProductMedia({ product }: { product: Product }) {
  const [view, setView] = useState<View>('3d');
  const activePhoto = typeof view === 'number' ? product.images[view] : undefined;

  return (
    <div>
      <div className="hairline relative isolate overflow-hidden rounded-3xl border bg-ink-900">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 55%, ${product.bottle.liquidColor}, transparent 65%)`,
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {activePhoto ? (
            <motion.img
              key={activePhoto}
              src={activePhoto}
              alt={`${product.name}, photo ${(view as number) + 1} of ${product.images.length}`}
              className={cn('w-full object-cover', VIEWER_HEIGHT)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BottleViewer
                bottle={product.bottle}
                label={{ name: product.name, caption: product.concentration }}
                modelUrl={product.modelUrl}
                className={cn('w-full', VIEWER_HEIGHT)}
              />
              <p className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                <Rotate3d size={15} aria-hidden /> Drag to turn 360°
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {product.images.length > 0 && (
        <div role="group" aria-label="Product views" className="scrollbar-none mt-4 flex gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setView('3d')}
            aria-pressed={view === '3d'}
            className={cn(thumbClass(view === '3d'), 'flex-col gap-1 bg-ink-900 text-[0.62rem] font-semibold uppercase tracking-[0.14em]')}
          >
            <Rotate3d size={20} className="text-gold" aria-hidden />
            360°
          </button>
          {product.images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setView(index)}
              aria-pressed={view === index}
              aria-label={`Photo ${index + 1}`}
              className={thumbClass(view === index)}
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
