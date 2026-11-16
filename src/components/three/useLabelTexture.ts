import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { SITE } from '@/config/site';

export interface BottleLabel {
  name: string;
  caption: string;
}

const SIZE = 512;
const PAPER = '#f3ece0';
const INK = '#1c1815';
const FOIL = '#a8873f';
const DISPLAY_FONT = '"Cormorant Garamond Variable", Georgia, serif';
const SANS_FONT = '"Manrope Variable", system-ui, sans-serif';

function drawSpacedText(ctx: CanvasRenderingContext2D, text: string, y: number, spacing: number) {
  // `letterSpacing` is not in every TS DOM lib yet, but is supported by all evergreen browsers.
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
  ctx.fillText(text.toUpperCase(), SIZE / 2 + spacing / 2, y);
}

function drawLabel(canvas: HTMLCanvasElement, label: BottleLabel) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = FOIL;
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, SIZE - 44, SIZE - 44);

  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `600 30px ${SANS_FONT}`;
  drawSpacedText(ctx, SITE.name, 104, 16);

  ctx.fillRect(SIZE / 2 - 34, 150, 68, 2);

  const words = label.name.split(' ');
  const lines = words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : words;
  const lineHeight = 84;
  const firstLineY = 262 - ((lines.length - 1) * lineHeight) / 2;

  ctx.font = `500 82px ${DISPLAY_FONT}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  lines.forEach((line, index) => ctx.fillText(line, SIZE / 2, firstLineY + index * lineHeight, 420));

  ctx.font = `600 21px ${SANS_FONT}`;
  drawSpacedText(ctx, label.caption, 414, 7);
}

/** Paints the bottle's paper label onto a texture, redrawing once web fonts are ready. */
export function useLabelTexture(label: BottleLabel): CanvasTexture {
  const { name, caption } = label;

  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    return { canvas, texture };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const paint = () => {
      if (cancelled) return;
      drawLabel(canvas, { name, caption });
      texture.needsUpdate = true;
    };

    paint();
    void document.fonts.ready.then(paint);

    return () => {
      cancelled = true;
    };
  }, [canvas, texture, name, caption]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}
