/** Longest side of an uploaded photo. Plenty for a full-screen product view, small enough to load fast. */
const MAX_DIMENSION = 1800;
const QUALITY = 0.86;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Resizes and re-encodes a photo in the browser before upload. A 12-megapixel
 * phone photo (~5 MB) typically becomes ~300 KB, and camera metadata such as
 * GPS location is stripped in the process.
 */
export async function compressImage(source: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = await canvasToBlob(canvas, 'image/webp', QUALITY);
  // Browsers without WebP encoding silently fall back to PNG, which is much larger.
  if (webp?.type === 'image/webp') return webp;
  return (await canvasToBlob(canvas, 'image/jpeg', QUALITY)) ?? source;
}

export interface SuggestedColors {
  liquidColor: string;
  glassTint: string;
}

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

/** Mixes a colour toward white; `amount` 0 keeps it, 1 is pure white. */
const tint = (r: number, g: number, b: number, amount: number) =>
  toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);

const SAMPLE_SIZE = 48;
const HUE_BUCKETS = 18;

/**
 * Finds the dominant colourful hue in the middle of a product photo — usually
 * the perfume itself — so the 3D bottle can match it without manual picking.
 * Returns undefined for photos with no clear colour (e.g. a clear liquid on white).
 */
export async function suggestColorsFromPhoto(photo: Blob): Promise<SuggestedColors | undefined> {
  const bitmap = await createImageBitmap(photo);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return undefined;

  // Sample the central 60%: product photos are framed around the bottle.
  const cropX = bitmap.width * 0.2;
  const cropY = bitmap.height * 0.2;
  ctx.drawImage(bitmap, cropX, cropY, bitmap.width * 0.6, bitmap.height * 0.6, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const buckets = Array.from({ length: HUE_BUCKETS }, () => ({ weight: 0, r: 0, g: 0, b: 0 }));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const lightness = (max + min) / 2;
    const chroma = max - min;
    const saturation = chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * lightness - 1));

    // Ignore greys, near-black shadows and blown-out highlights.
    if (saturation < 0.22 || lightness < 0.12 || lightness > 0.9) continue;

    let hue: number;
    if (max === r / 255) hue = ((g - b) / 255 / chroma) % 6;
    else if (max === g / 255) hue = (b - r) / 255 / chroma + 2;
    else hue = (r - g) / 255 / chroma + 4;
    const bucketIndex = Math.floor((((hue * 60 + 360) % 360) / 360) * HUE_BUCKETS) % HUE_BUCKETS;

    const bucket = buckets[bucketIndex];
    if (!bucket) continue;
    const weight = saturation * (1 - Math.abs(lightness - 0.5));
    bucket.weight += weight;
    bucket.r += r * weight;
    bucket.g += g * weight;
    bucket.b += b * weight;
  }

  const best = buckets.reduce((top, bucket) => (bucket.weight > top.weight ? bucket : top));
  if (best.weight < 1) return undefined;

  const r = best.r / best.weight;
  const g = best.g / best.weight;
  const b = best.b / best.weight;
  return { liquidColor: toHex(r, g, b), glassTint: tint(r, g, b, 0.88) };
}
