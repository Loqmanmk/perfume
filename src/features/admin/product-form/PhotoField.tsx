import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Camera, ImagePlus, Star, Trash2 } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { MAX_PRODUCT_IMAGES, type ProductFormValues } from '@/domain/productSchema';
import { errorMessage } from '@/lib/api/http';
import { cn } from '@/lib/cn';
import { compressImage } from '@/lib/image';
import { catalogueApi } from '@/services/catalogueApi';
import { CameraDialog } from './CameraDialog';

interface PendingPhoto {
  id: string;
  previewUrl: string;
}

interface PhotoFieldProps {
  /** Called with each new photo once uploaded, e.g. to suggest bottle colours. */
  onPhotoAdded: (photo: Blob) => void;
  onBusyChange: (isBusy: boolean) => void;
}

const isImage = (file: File) => file.type.startsWith('image/');

/**
 * Photos of the product: take one with the camera, pick files, or drop them in.
 * Each photo is compressed in the browser and uploaded straight away, so the
 * admin sees it on the page immediately.
 */
export function PhotoField({ onPhotoAdded, onBusyChange }: PhotoFieldProps) {
  const { control, getValues, setValue, formState } = useFormContext<ProductFormValues>();
  const images = useWatch({ control, name: 'images' });
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string>();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const slotsLeft = MAX_PRODUCT_IMAGES - images.length - pending.length;
  const fieldError = formState.errors.images?.message;

  useEffect(() => onBusyChange(pending.length > 0), [pending.length, onBusyChange]);

  const setImages = (next: string[]) =>
    setValue('images', next, { shouldDirty: true, shouldValidate: true });

  const uploadOne = async (photo: Blob) => {
    const id = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(photo);
    setPending((current) => [...current, { id, previewUrl }]);

    try {
      const compressed = await compressImage(photo);
      const url = await catalogueApi.upload(compressed, 'image', 'photo');
      // Read the latest list: several uploads may finish in any order.
      setImages([...getValues('images'), url]);
      onPhotoAdded(compressed);
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setPending((current) => current.filter((item) => item.id !== id));
      URL.revokeObjectURL(previewUrl);
    }
  };

  const addPhotos = (photos: Blob[]) => {
    setUploadError(undefined);
    const accepted = photos.slice(0, Math.max(slotsLeft, 0));
    if (accepted.length < photos.length) {
      setUploadError(`You can add up to ${MAX_PRODUCT_IMAGES} photos per product.`);
    }
    accepted.forEach((photo) => void uploadOne(photo));
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    addPhotos([...event.dataTransfer.files].filter(isImage));
  };

  const makeCover = (url: string) => setImages([url, ...images.filter((image) => image !== url)]);
  const removePhoto = (url: string) => setImages(images.filter((image) => image !== url));

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-2xl border border-dashed p-6 text-center transition-colors md:p-8',
          isDragging ? 'border-gold bg-gold/5' : 'border-cream/20',
        )}
      >
        <p className="font-display text-2xl">Photograph your product</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Take a photo with your camera, choose files, or drop them here. The first photo is the cover.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button onClick={() => setIsCameraOpen(true)} disabled={slotsLeft <= 0}>
            <Camera size={16} aria-hidden /> Take a photo
          </Button>
          <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={slotsLeft <= 0}>
            <ImagePlus size={16} aria-hidden /> Upload photos
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            addPhotos([...(event.target.files ?? [])].filter(isImage));
            event.target.value = '';
          }}
        />
      </div>

      {(uploadError || fieldError) && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {uploadError ?? fieldError}
        </p>
      )}

      {(images.length > 0 || pending.length > 0) && (
        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label="Product photos">
          {images.map((url, index) => (
            <li key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-ink-800">
              <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink-950">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 p-1.5">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(url)}
                    className="grid size-9 place-items-center rounded-full text-cream hover:text-gold"
                    aria-label={`Make photo ${index + 1} the cover`}
                  >
                    <Star size={15} aria-hidden />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="grid size-9 place-items-center rounded-full text-cream hover:text-danger"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </div>
            </li>
          ))}
          {pending.map((item) => (
            <li key={item.id} className="relative aspect-square overflow-hidden rounded-xl bg-ink-800">
              <img src={item.previewUrl} alt="" className="h-full w-full object-cover opacity-40" />
              <span className="absolute inset-0 grid place-items-center" role="status" aria-label="Uploading photo">
                <span className="size-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              </span>
            </li>
          ))}
        </ul>
      )}

      <CameraDialog
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(photo) => addPhotos([photo])}
      />
    </div>
  );
}
