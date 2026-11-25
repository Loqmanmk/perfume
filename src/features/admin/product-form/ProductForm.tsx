import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pipette, Save } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Field, FormAlert, inputClass } from '@/components/ui/form/Field';
import { CONCENTRATIONS, FAMILY_LABELS, MOOD_LABELS, MOODS, SCENT_FAMILIES } from '@/domain/product';
import { productInputSchema, type ProductFormValues, type ProductInput } from '@/domain/productSchema';
import { applyServerErrors } from '@/lib/forms';
import { suggestColorsFromPhoto } from '@/lib/image';
import { CheckboxField, ColorField, NotesInput, ScaleField, ShapePicker, SizesField } from './fields';
import { LivePreview } from './LivePreview';
import { ModelField } from './ModelField';
import { PhotoField } from './PhotoField';

interface ProductFormProps {
  initialValues: ProductFormValues;
  submitLabel: string;
  onSubmit: (values: ProductInput) => Promise<unknown>;
}

function Section({ step, title, description, children }: { step: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section className="hairline border-t pt-8" aria-labelledby={`section-${step}`}>
      <p className="text-xs font-semibold text-gold">{step}</p>
      <h2 id={`section-${step}`} className="mt-1 text-3xl">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

/** Warns before leaving the page with unsaved edits. */
function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedChanges]);
}

export function ProductForm({ initialValues, submitLabel, onSubmit }: ProductFormProps) {
  const form = useForm<ProductFormValues, unknown, ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  });
  const { register, handleSubmit, setError, setValue, getFieldState, formState } = form;
  const { errors, isSubmitting, isDirty, isSubmitSuccessful } = formState;

  const [busy, setBusy] = useState({ photos: false, model: false });
  const [lastPhoto, setLastPhoto] = useState<Blob>();
  const [colorNotice, setColorNotice] = useState<string>();
  const isUploading = busy.photos || busy.model;

  useUnsavedChangesWarning(isDirty && !isSubmitSuccessful);

  const applyColorsFrom = useCallback(
    async (photo: Blob, force: boolean) => {
      // Never overwrite colours the admin picked by hand, unless they ask.
      if (!force && getFieldState('bottle.liquidColor').isDirty) return;
      const colors = await suggestColorsFromPhoto(photo);
      if (!colors) {
        if (force) setColorNotice('No clear colour found in the photo — pick the colours by hand.');
        return;
      }
      setValue('bottle.liquidColor', colors.liquidColor, { shouldDirty: force });
      setValue('bottle.glassTint', colors.glassTint, { shouldDirty: force });
      setColorNotice('Colours matched to your photo. Adjust them if needed.');
    },
    [getFieldState, setValue],
  );

  const handlePhotoAdded = useCallback(
    (photo: Blob) => {
      setLastPhoto(photo);
      void applyColorsFrom(photo, false);
    },
    [applyColorsFrom],
  );

  const setPhotosBusy = useCallback((photos: boolean) => setBusy((current) => ({ ...current, photos })), []);
  const setModelBusy = useCallback((model: boolean) => setBusy((current) => ({ ...current, model })), []);

  const submit = handleSubmit(
    async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        applyServerErrors(error, setError);
      }
    },
    // Bring the first problem into view so it is never hidden below the fold.
    () => requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()),
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-10">
          <Section step="01" title="Photos" description="Customers see the cover photo in the shop and every photo on the product page.">
            <PhotoField onPhotoAdded={handlePhotoAdded} onBusyChange={setPhotosBusy} />
          </Section>

          <Section step="02" title="The fragrance">
            <Field id="product-name" label="Name" error={errors.name?.message}>
              {(control) => <input {...control} {...register('name')} placeholder="Ambre Nocturne" className={inputClass(!!errors.name, 'min-h-12')} />}
            </Field>
            <Field id="product-tagline" label="Tagline" hint="One line, shown under the name." error={errors.tagline?.message}>
              {(control) => (
                <input {...control} {...register('tagline')} placeholder="Warm amber, smoked vanilla, midnight resin." className={inputClass(!!errors.tagline, 'min-h-12')} />
              )}
            </Field>
            <Field id="product-description" label="Description" error={errors.description?.message}>
              {(control) => <textarea {...control} {...register('description')} rows={4} className={inputClass(!!errors.description, 'py-3')} />}
            </Field>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field id="product-family" label="Family">
                {(control) => (
                  <select {...control} {...register('family')} className={inputClass(false, 'min-h-12')}>
                    {SCENT_FAMILIES.map((family) => (
                      <option key={family} value={family}>
                        {FAMILY_LABELS[family]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field id="product-mood" label="Mood">
                {(control) => (
                  <select {...control} {...register('mood')} className={inputClass(false, 'min-h-12')}>
                    {MOODS.map((mood) => (
                      <option key={mood} value={mood}>
                        {MOOD_LABELS[mood]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field id="product-concentration" label="Concentration">
                {(control) => (
                  <select {...control} {...register('concentration')} className={inputClass(false, 'min-h-12')}>
                    {CONCENTRATIONS.map((concentration) => (
                      <option key={concentration}>{concentration}</option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
          </Section>

          <Section step="03" title="Sizes and prices" description="Each size is a separate option customers can choose.">
            <SizesField />
          </Section>

          <Section step="04" title="Scent profile">
            <NotesInput name="notes.top" label="Top notes" placeholder="e.g. Bergamot, Pink pepper" />
            <NotesInput name="notes.heart" label="Heart notes" placeholder="e.g. Rose, Jasmine" />
            <NotesInput name="notes.base" label="Base notes" placeholder="e.g. Vanilla, Sandalwood" />
            <div className="grid gap-6 sm:grid-cols-3">
              <ScaleField name="intensity" label="Intensity" range={['Soft', 'Strong']} />
              <ScaleField name="longevity" label="Longevity" range={['Hours', 'All day']} />
              <ScaleField name="sillage" label="Sillage" range={['Close', 'Room']} />
            </div>
          </Section>

          <Section step="05" title="3D bottle" description="Used for the 360° view. Colours are matched to your first photo automatically.">
            <ShapePicker />
            <div className="grid gap-5 sm:grid-cols-3">
              <ColorField name="bottle.liquidColor" label="Perfume" />
              <ColorField name="bottle.glassTint" label="Glass" />
              <ColorField name="bottle.capColor" label="Cap" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => lastPhoto && void applyColorsFrom(lastPhoto, true)} disabled={!lastPhoto}>
                <Pipette size={15} aria-hidden /> Match colours to last photo
              </Button>
              {colorNotice && (
                <p className="text-sm text-muted" role="status">
                  {colorNotice}
                </p>
              )}
            </div>
            <ModelField onBusyChange={setModelBusy} />
          </Section>

          <Section step="06" title="Visibility">
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckboxField name="isNew" label="Mark as new" description="Shows a “New” badge and features it on the home page." />
              <CheckboxField name="isBestseller" label="Bestseller" description="Features it in “Most loved” on the home page." />
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <LivePreview />
          <div className="mt-6 space-y-3">
            <FormAlert message={errors.root?.message} />
            <Button type="submit" size="lg" fullWidth disabled={isSubmitting || isUploading}>
              <Save size={16} aria-hidden />
              {isSubmitting ? 'Saving…' : isUploading ? 'Waiting for uploads…' : submitLabel}
            </Button>
          </div>
        </aside>
      </form>
    </FormProvider>
  );
}
