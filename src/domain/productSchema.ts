import { z } from 'zod';
import {
  BOTTLE_SHAPE_OPTIONS,
  CONCENTRATIONS,
  MOODS,
  SCENT_FAMILIES,
  type ProductSize,
  type Scale,
} from './product.ts';

/*
 * The single definition of a valid product. The admin form validates with it in
 * the browser and the API validates with it again on the server, so the two can
 * never disagree.
 */

export const MAX_PRODUCT_IMAGES = 8;

const scale = z
  .number({ error: 'Choose a value from 1 to 5.' })
  .int()
  .min(1)
  .max(5)
  .transform((value) => value as Scale);

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a colour like #c9a96e.');

const noteList = z
  .array(z.string().trim().min(1).max(40))
  .min(1, 'Add at least one note.')
  .max(8, 'Keep it to 8 notes or fewer.');

/** Only files our own upload endpoint produced are accepted. */
const uploadedFile = (extensions: string) =>
  z.string().regex(new RegExp(`^/uploads/[a-zA-Z0-9-]+\\.(${extensions})$`), 'Invalid file.');

const sizeSchema = z.object({
  ml: z.number({ error: 'Enter a volume.' }).int('Use whole millilitres.').min(1).max(1000),
  price: z.number({ error: 'Enter a price.' }).positive('Enter a price above 0.').max(100_000),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name of at least 2 characters.').max(60),
  tagline: z.string().trim().min(2, 'Add a short tagline.').max(120),
  description: z.string().trim().min(10, 'Describe the fragrance in a sentence or two.').max(1200),
  family: z.enum(SCENT_FAMILIES),
  mood: z.enum(MOODS),
  concentration: z.enum(CONCENTRATIONS),
  intensity: scale,
  longevity: scale,
  sillage: scale,
  sizes: z
    .array(sizeSchema)
    .min(1, 'Add at least one size.')
    .max(6)
    .refine(
      (sizes) => new Set(sizes.map((size) => size.ml)).size === sizes.length,
      'Each size must have a different volume.',
    )
    // Safe: `.min(1)` guarantees at least one element.
    .transform((sizes) => sizes.toSorted((a, b) => a.ml - b.ml) as [ProductSize, ...ProductSize[]]),
  notes: z.object({ top: noteList, heart: noteList, base: noteList }),
  bottle: z.object({
    shape: z.enum(BOTTLE_SHAPE_OPTIONS),
    liquidColor: hexColor,
    glassTint: hexColor,
    capColor: hexColor,
  }),
  images: z.array(uploadedFile('webp|jpg|png')).max(MAX_PRODUCT_IMAGES),
  modelUrl: uploadedFile('glb').nullable(),
  isNew: z.boolean(),
  isBestseller: z.boolean(),
});

/** What the form edits. */
export type ProductFormValues = z.input<typeof productInputSchema>;
/** What the server stores, after validation and normalisation. */
export type ProductInput = z.output<typeof productInputSchema>;
