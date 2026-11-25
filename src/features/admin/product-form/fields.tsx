import { useState, type KeyboardEvent } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import {
  Controller,
  useFieldArray,
  useFormContext,
  type FieldPath,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import { BottleArt } from '@/components/product/BottleArt';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/form/Field';
import { BOTTLE_SHAPE_OPTIONS, SHAPE_LABELS } from '@/domain/product';
import type { ProductFormValues } from '@/domain/productSchema';
import { cn } from '@/lib/cn';

/** Reads a nested error message by path, e.g. `notes.top` or `sizes.0.price`. */
function useErrorAt(path: string): string | undefined {
  const { formState } = useFormContext<ProductFormValues>();
  let node: unknown = formState.errors;
  for (const key of path.split('.')) node = (node as Record<string, unknown> | undefined)?.[key];
  const error = node as { message?: string; root?: { message?: string } } | undefined;
  return error?.message ?? error?.root?.message;
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/* --------------------------------- Sizes ---------------------------------- */

const MAX_SIZES = 6;

export function SizesField() {
  const { control, register } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'sizes' });
  const groupError = useErrorAt('sizes');

  return (
    <fieldset>
      <legend className="text-sm font-semibold">Sizes and prices</legend>
      <ul className="mt-3 space-y-3">
        {fields.map((field, index) => (
          <SizeRow
            key={field.id}
            index={index}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
            registerMl={register(`sizes.${index}.ml`, { valueAsNumber: true })}
            registerPrice={register(`sizes.${index}.price`, { valueAsNumber: true })}
          />
        ))}
      </ul>
      <ErrorText message={groupError} />
      {fields.length < MAX_SIZES && (
        <Button variant="ghost" className="mt-2 px-0" onClick={() => append({ ml: Number.NaN, price: Number.NaN })}>
          <Plus size={15} aria-hidden /> Add a size
        </Button>
      )}
    </fieldset>
  );
}

interface SizeRowProps {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  registerMl: UseFormRegisterReturn;
  registerPrice: UseFormRegisterReturn;
}

function SizeRow({ index, canRemove, onRemove, registerMl, registerPrice }: SizeRowProps) {
  const mlError = useErrorAt(`sizes.${index}.ml`);
  const priceError = useErrorAt(`sizes.${index}.price`);
  const label = `Size ${index + 1}`;

  return (
    <li>
      <div className="flex items-start gap-3">
        <label className="flex-1">
          <span className="sr-only">{label} volume in millilitres</span>
          <div className="relative">
            <input
              {...registerMl}
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="50"
              aria-invalid={mlError ? true : undefined}
              className={inputClass(!!mlError, 'min-h-12 pr-12')}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">ml</span>
          </div>
        </label>
        <label className="flex-1">
          <span className="sr-only">{label} price in euros</span>
          <div className="relative">
            <input
              {...registerPrice}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="120"
              aria-invalid={priceError ? true : undefined}
              className={inputClass(!!priceError, 'min-h-12 pr-10')}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">€</span>
          </div>
        </label>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="grid size-12 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-danger disabled:opacity-30"
          aria-label={`Remove ${label.toLowerCase()}`}
        >
          <Trash2 size={16} aria-hidden />
        </button>
      </div>
      <ErrorText message={mlError ?? priceError} />
    </li>
  );
}

/* ---------------------------------- Notes --------------------------------- */

type NotesPath = 'notes.top' | 'notes.heart' | 'notes.base';

/** Type a note and press Enter or comma; Backspace on an empty box removes the last one. */
export function NotesInput({ name, label, placeholder }: { name: NotesPath; label: string; placeholder: string }) {
  const { control } = useFormContext<ProductFormValues>();
  const [draft, setDraft] = useState('');
  const error = useErrorAt(name);
  const inputId = `field-${name.replace('.', '-')}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const commit = () => {
          const note = draft.trim().replace(/,$/, '');
          if (note && !field.value.includes(note)) field.onChange([...field.value, note]);
          setDraft('');
        };

        const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            commit();
          } else if (event.key === 'Backspace' && draft === '' && field.value.length > 0) {
            field.onChange(field.value.slice(0, -1));
          }
        };

        return (
          <div>
            <label htmlFor={inputId} className="text-sm font-semibold">
              {label}
            </label>
            <div
              className={cn(
                'mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border bg-ink-900 px-3 py-2 focus-within:border-gold',
                error ? 'border-danger' : 'border-cream/15',
              )}
            >
              {field.value.map((note) => (
                <span key={note} className="flex items-center gap-1 rounded-full bg-ink-700 py-1 pl-3 pr-1 text-sm">
                  {note}
                  <button
                    type="button"
                    onClick={() => field.onChange(field.value.filter((item) => item !== note))}
                    className="grid size-6 place-items-center rounded-full text-muted hover:text-cream"
                    aria-label={`Remove ${note}`}
                  >
                    <X size={12} aria-hidden />
                  </button>
                </span>
              ))}
              <input
                id={inputId}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => {
                  commit();
                  field.onBlur();
                }}
                placeholder={field.value.length === 0 ? placeholder : 'Add another…'}
                aria-invalid={error ? true : undefined}
                className="min-w-28 flex-1 bg-transparent py-1 text-base placeholder:text-muted focus:outline-none"
              />
            </div>
            <ErrorText message={error} />
          </div>
        );
      }}
    />
  );
}

/* ---------------------------------- Scale --------------------------------- */

type ScalePath = 'intensity' | 'longevity' | 'sillage';
const STEPS = [1, 2, 3, 4, 5] as const;

export function ScaleField({ name, label, range }: { name: ScalePath; label: string; range: [string, string] }) {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <fieldset>
          <legend className="flex w-full justify-between text-sm">
            <span className="font-semibold">{label}</span>
            <span className="text-xs text-muted">
              {range[0]} — {range[1]}
            </span>
          </legend>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {STEPS.map((step) => (
              <label
                key={step}
                className={cn(
                  'grid min-h-11 cursor-pointer place-items-center rounded-lg border text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-gold-soft',
                  step <= field.value ? 'border-gold bg-gold/15 text-cream' : 'border-cream/15 text-muted hover:border-cream/40',
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={step}
                  checked={field.value === step}
                  onChange={() => field.onChange(step)}
                  className="sr-only"
                />
                {step}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    />
  );
}

/* --------------------------------- Colour --------------------------------- */

type ColorPath = 'bottle.liquidColor' | 'bottle.glassTint' | 'bottle.capColor';
const HEX = /^#[0-9a-f]{6}$/i;

export function ColorField({ name, label }: { name: ColorPath; label: string }) {
  const { control } = useFormContext<ProductFormValues>();
  const error = useErrorAt(name);
  const id = `field-${name.replace('.', '-')}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <label htmlFor={id} className="text-sm font-semibold">
            {label}
          </label>
          <div className={cn('mt-2 flex min-h-12 items-center gap-3 rounded-xl border bg-ink-900 px-2', error ? 'border-danger' : 'border-cream/15')}>
            <input
              type="color"
              value={HEX.test(field.value) ? field.value : '#000000'}
              onChange={(event) => field.onChange(event.target.value)}
              className="size-9 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent"
              aria-label={`${label} picker`}
            />
            <input
              id={id}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              spellCheck={false}
              className="w-full bg-transparent font-mono text-sm uppercase focus:outline-none"
            />
          </div>
          <ErrorText message={error} />
        </div>
      )}
    />
  );
}

/* --------------------------------- Shape ---------------------------------- */

export function ShapePicker() {
  const { control, watch } = useFormContext<ProductFormValues>();
  const bottle = watch('bottle');

  return (
    <Controller
      control={control}
      name="bottle.shape"
      render={({ field }) => (
        <fieldset>
          <legend className="text-sm font-semibold">Bottle shape</legend>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {BOTTLE_SHAPE_OPTIONS.map((shape) => (
              <label
                key={shape}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-3 text-center text-xs transition-colors has-focus-visible:outline-2 has-focus-visible:outline-gold-soft',
                  field.value === shape ? 'border-gold bg-gold/10' : 'border-cream/15 hover:border-cream/40',
                )}
              >
                <input
                  type="radio"
                  name="bottle.shape"
                  value={shape}
                  checked={field.value === shape}
                  onChange={() => field.onChange(shape)}
                  className="sr-only"
                />
                <BottleArt bottle={{ ...bottle, shape }} name="" className="h-20" />
                {SHAPE_LABELS[shape]}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    />
  );
}

/* -------------------------------- Checkbox -------------------------------- */

export function CheckboxField({
  name,
  label,
  description,
}: {
  name: Extract<FieldPath<ProductFormValues>, 'isNew' | 'isBestseller'>;
  label: string;
  description: string;
}) {
  const { register } = useFormContext<ProductFormValues>();
  return (
    <label className="hairline flex cursor-pointer items-start gap-3 rounded-xl border p-4 has-checked:border-gold/60">
      <input type="checkbox" {...register(name)} className="mt-1 size-4 accent-[var(--color-gold)]" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
    </label>
  );
}
