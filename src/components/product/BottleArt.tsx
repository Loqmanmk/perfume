import { useId, type ReactNode } from 'react';
import type { BottleAppearance, BottleShape } from '@/domain/product';

interface BottleArtProps {
  bottle: BottleAppearance;
  name: string;
  className?: string;
}

interface Silhouette {
  body: (fill: string) => ReactNode;
  liquid: (fill: string) => ReactNode;
  cap: (fill: string) => ReactNode;
  collarY: number;
  labelY: number;
}

const SILHOUETTES: Record<BottleShape, Silhouette> = {
  square: {
    body: (fill) => <rect x="38" y="92" width="124" height="164" rx="14" fill={fill} />,
    liquid: (fill) => <rect x="49" y="122" width="102" height="124" rx="8" fill={fill} />,
    cap: (fill) => <rect x="73" y="26" width="54" height="52" rx="5" fill={fill} />,
    collarY: 78,
    labelY: 188,
  },
  round: {
    body: (fill) => <ellipse cx="100" cy="174" rx="80" ry="82" fill={fill} />,
    liquid: (fill) => <ellipse cx="100" cy="182" rx="66" ry="64" fill={fill} />,
    cap: (fill) => <circle cx="100" cy="50" r="29" fill={fill} />,
    collarY: 79,
    labelY: 186,
  },
  tall: {
    body: (fill) => <rect x="56" y="78" width="88" height="184" rx="24" fill={fill} />,
    liquid: (fill) => <rect x="65" y="106" width="70" height="148" rx="17" fill={fill} />,
    cap: (fill) => <rect x="75" y="6" width="50" height="58" rx="6" fill={fill} />,
    collarY: 64,
    labelY: 184,
  },
};

/** Lightweight 2D bottle used in grids, the cart, and as the 3D fallback. Decorative. */
export function BottleArt({ bottle, name, className }: BottleArtProps) {
  const id = useId();
  const liquidId = `${id}-liquid`;
  const glassId = `${id}-glass`;
  const capId = `${id}-cap`;
  const silhouette = SILHOUETTES[bottle.shape];

  return (
    <svg viewBox="0 0 200 280" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id={liquidId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bottle.liquidColor} stopOpacity="0.75" />
          <stop offset="1" stopColor={bottle.liquidColor} />
        </linearGradient>
        <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={bottle.glassTint} stopOpacity="0.34" />
          <stop offset="0.5" stopColor={bottle.glassTint} stopOpacity="0.1" />
          <stop offset="1" stopColor={bottle.glassTint} stopOpacity="0.26" />
        </linearGradient>
        <linearGradient id={capId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={bottle.capColor} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.55" stopColor={bottle.capColor} />
          <stop offset="1" stopColor={bottle.capColor} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="266" rx="64" ry="7" fill="#000" opacity="0.45" />

      {silhouette.cap(bottle.capColor)}
      <g opacity="0.55">{silhouette.cap(`url(#${capId})`)}</g>
      <rect x="84" y={silhouette.collarY} width="32" height="16" rx="2" fill={bottle.capColor} />

      {silhouette.liquid(`url(#${liquidId})`)}
      {silhouette.body(`url(#${glassId})`)}
      <g fill="none" stroke={bottle.glassTint} strokeOpacity="0.45" strokeWidth="1.2">
        {silhouette.body('none')}
      </g>

      <text
        x="100"
        y={silhouette.labelY}
        textAnchor="middle"
        fill="#f3ece0"
        fontFamily="var(--font-display)"
        fontSize="15"
        letterSpacing="0.5"
      >
        {name}
      </text>
      <rect x="88" y={silhouette.labelY + 9} width="24" height="1" fill="#f3ece0" opacity="0.6" />
    </svg>
  );
}
