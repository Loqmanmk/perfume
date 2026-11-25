import { useEffect, useRef, useState } from 'react';
import { Box, Trash2, Upload } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import type { ProductFormValues } from '@/domain/productSchema';
import { errorMessage } from '@/lib/api/http';
import { catalogueApi } from '@/services/catalogueApi';

/**
 * Optional real 3D model (.glb) of the product. Without one, the 360° viewer
 * shows a bottle generated from the shape and colours chosen above.
 */
export function ModelField({ onBusyChange }: { onBusyChange: (isBusy: boolean) => void }) {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const modelUrl = useWatch({ control, name: 'modelUrl' });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => onBusyChange(isUploading), [isUploading, onBusyChange]);

  const upload = async (file: File) => {
    setError(undefined);
    setIsUploading(true);
    try {
      const url = await catalogueApi.upload(file, 'model', file.name);
      setValue('modelUrl', url, { shouldDirty: true, shouldValidate: true });
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="hairline rounded-2xl border p-5">
      <div className="flex items-start gap-4">
        <Box size={22} strokeWidth={1.4} className="mt-1 shrink-0 text-gold" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Real 3D model (optional)</p>
          <p className="mt-1 text-sm text-muted">
            For a true 360° view of your actual bottle, scan it with a phone app such as Polycam, Luma AI or
            Reality Composer, export it as <span className="text-cream">.glb</span> and upload it here.
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {modelUrl ? (
              <>
                <span className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">Model uploaded</span>
                <Button variant="ghost" onClick={() => setValue('modelUrl', null, { shouldDirty: true })}>
                  <Trash2 size={15} aria-hidden /> Remove model
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={isUploading}>
                <Upload size={15} aria-hidden /> {isUploading ? 'Uploading…' : 'Upload .glb file'}
              </Button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".glb,model/gltf-binary"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = '';
            }}
          />
        </div>
      </div>
    </div>
  );
}
