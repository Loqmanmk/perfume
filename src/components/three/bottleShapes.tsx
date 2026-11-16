import type { ComponentType } from 'react';
import { RoundedBox } from '@react-three/drei';
import { DoubleSide, Vector2, type Texture } from 'three';
import type { BottleShape } from '@/domain/product';
import { CapMaterial, GlassMaterial, LiquidMaterial } from './materials';

interface BodyProps {
  glassTint: string;
  liquidColor: string;
  labelTexture: Texture;
}

interface CapProps {
  color: string;
}

/**
 * One silhouette. To add a new bottle shape, describe it here and register it
 * in `BOTTLE_SHAPES` — nothing else in the 3D code needs to change.
 */
export interface BottleShapeSpec {
  /** Height (in scene units) at which the glass ends and the collar begins. */
  shoulderY: number;
  Body: ComponentType<BodyProps>;
  Cap: ComponentType<CapProps>;
}

function LabelMaterial({ texture }: { texture: Texture }) {
  return (
    <meshStandardMaterial
      map={texture}
      metalness={0.1}
      roughness={0.55}
      side={DoubleSide}
    />
  );
}

/* ---------------------------------- Square --------------------------------- */

function SquareBody({ glassTint, liquidColor, labelTexture }: BodyProps) {
  return (
    <>
      <RoundedBox args={[1.5, 2, 0.8]} radius={0.14} smoothness={6}>
        <GlassMaterial tint={glassTint} />
      </RoundedBox>
      <RoundedBox args={[1.2, 1.5, 0.5]} radius={0.08} smoothness={4} position={[0, -0.1, 0]}>
        <LiquidMaterial color={liquidColor} />
      </RoundedBox>
      <mesh position={[0, -0.05, 0.403]}>
        <planeGeometry args={[0.8, 0.8]} />
        <LabelMaterial texture={labelTexture} />
      </mesh>
    </>
  );
}

function SquareCap({ color }: CapProps) {
  return (
    <RoundedBox args={[0.64, 0.56, 0.64]} radius={0.05} smoothness={4} position={[0, 0.28, 0]}>
      <CapMaterial color={color} />
    </RoundedBox>
  );
}

/* ---------------------------------- Round ---------------------------------- */

const ROUND_RADIUS = 1.08;
const ROUND_DEPTH_SCALE = 0.5;
const ROUND_LABEL_ARC = { horizontal: 0.74, vertical: 0.7 };

function RoundBody({ glassTint, liquidColor, labelTexture }: BodyProps) {
  return (
    <>
      <mesh scale={[1, 1, ROUND_DEPTH_SCALE]}>
        <sphereGeometry args={[ROUND_RADIUS, 64, 64]} />
        <GlassMaterial tint={glassTint} />
      </mesh>
      <mesh scale={[1, 1, 0.36]} position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.84, 48, 48]} />
        <LiquidMaterial color={liquidColor} />
      </mesh>
      {/* A patch of the same sphere, so the label hugs the curve of the glass. */}
      <mesh scale={[1, 1, ROUND_DEPTH_SCALE]}>
        <sphereGeometry
          args={[
            ROUND_RADIUS + 0.006,
            32,
            16,
            Math.PI / 2 - ROUND_LABEL_ARC.horizontal / 2,
            ROUND_LABEL_ARC.horizontal,
            Math.PI / 2 - ROUND_LABEL_ARC.vertical / 2 + 0.05,
            ROUND_LABEL_ARC.vertical,
          ]}
        />
        <LabelMaterial texture={labelTexture} />
      </mesh>
    </>
  );
}

function RoundCap({ color }: CapProps) {
  return (
    <mesh position={[0, 0.32, 0]}>
      <sphereGeometry args={[0.34, 48, 48]} />
      <CapMaterial color={color} />
    </mesh>
  );
}

/* ----------------------------------- Tall ---------------------------------- */

const TALL_RADIUS = 0.6;
const TALL_PROFILE = [
  [0, -1.25],
  [0.5, -1.25],
  [0.57, -1.21],
  [TALL_RADIUS, -1.12],
  [TALL_RADIUS, 0.84],
  [0.56, 1.04],
  [0.43, 1.19],
  [0.24, 1.25],
  [0, 1.25],
].map(([radius, y]) => new Vector2(radius, y));

const TALL_LABEL_ARC = 1.3;

function TallBody({ glassTint, liquidColor, labelTexture }: BodyProps) {
  return (
    <>
      <mesh>
        <latheGeometry args={[TALL_PROFILE, 72]} />
        <GlassMaterial tint={glassTint} />
      </mesh>
      <mesh scale={[0.84, 0.86, 0.84]} position={[0, -0.06, 0]}>
        <latheGeometry args={[TALL_PROFILE, 48]} />
        <LiquidMaterial color={liquidColor} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry
          args={[
            TALL_RADIUS + 0.004,
            TALL_RADIUS + 0.004,
            0.78,
            32,
            1,
            true,
            -TALL_LABEL_ARC / 2,
            TALL_LABEL_ARC,
          ]}
        />
        <LabelMaterial texture={labelTexture} />
      </mesh>
    </>
  );
}

function TallCap({ color }: CapProps) {
  return (
    <mesh position={[0, 0.36, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 0.72, 48]} />
      <CapMaterial color={color} />
    </mesh>
  );
}

export const BOTTLE_SHAPES: Record<BottleShape, BottleShapeSpec> = {
  square: { shoulderY: 1, Body: SquareBody, Cap: SquareCap },
  round: { shoulderY: 1.04, Body: RoundBody, Cap: RoundCap },
  tall: { shoulderY: 1.25, Body: TallBody, Cap: TallCap },
};
