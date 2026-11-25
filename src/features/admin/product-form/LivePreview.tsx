import { Rotate3d } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BottleViewer } from '@/components/three/BottleViewer';
import type { ProductFormValues } from '@/domain/productSchema';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

/** The 360° view exactly as customers will see it, updating as the admin edits. */
export function LivePreview() {
  const { control } = useFormContext<ProductFormValues>();
  const [name, concentration, bottle, modelUrl, images] = useWatch({
    control,
    name: ['name', 'concentration', 'bottle', 'modelUrl', 'images'],
  });
  // Wait for a pause in typing so the bottle does not replay its entrance on every key.
  const labelName = useDebouncedValue(name.trim() || 'Your fragrance', 500);

  return (
    <div>
      <div className="hairline relative isolate overflow-hidden rounded-3xl border bg-ink-900">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-40 transition-[background] duration-700"
          style={{ background: `radial-gradient(circle at 50% 55%, ${bottle.liquidColor}, transparent 65%)` }}
        />
        <BottleViewer
          bottle={bottle}
          label={{ name: labelName, caption: concentration }}
          modelUrl={modelUrl}
          className="h-[22rem] w-full lg:h-[28rem]"
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
          <Rotate3d size={14} aria-hidden /> Live 360° preview
        </p>
      </div>

      {images[0] && (
        <div className="mt-4 flex items-center gap-3 text-sm text-muted">
          <img src={images[0]} alt="" className="size-14 rounded-xl object-cover" />
          <p>Cover photo shown on the shop page. Customers can switch between photos and the 360° view.</p>
        </div>
      )}
    </div>
  );
}
