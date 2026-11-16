import { useMemo, useRef, type ReactNode, type RefObject } from 'react';
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  PresentationControls,
  Sparkles,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, MathUtils, type Group } from 'three';
import type { BottleAppearance } from '@/domain/product';
import { PerfumeBottle } from './PerfumeBottle';
import type { BottleLabel } from './useLabelTexture';

/** Mutable interaction state shared between the DOM wrapper and the render loop. */
export interface BottleInteraction {
  /** Extra rotation requested from the keyboard, in radians. */
  yaw: number;
  isDragging: boolean;
}

interface BottleSceneProps {
  bottle: BottleAppearance;
  label: BottleLabel;
  interaction: RefObject<BottleInteraction>;
  autoRotate: boolean;
  animated: boolean;
}

const AUTO_ROTATE_SPEED = 0.28;
const ENTRANCE_SCALE = 0.8;

/** Studio lighting built from light cards, so no HDR file has to be downloaded. */
function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <color attach="background" args={['#0b0908']} />
      <Lightformer form="rect" intensity={7} position={[0, 5, -1]} scale={[9, 3, 1]} />
      <Lightformer
        form="rect"
        intensity={4}
        color="#ffe2b8"
        position={[-5, 1, 2]}
        rotation-y={Math.PI / 2}
        scale={[7, 4, 1]}
      />
      <Lightformer
        form="rect"
        intensity={3}
        position={[5, 0, 2]}
        rotation-y={-Math.PI / 2}
        scale={[7, 3, 1]}
      />
      <Lightformer form="ring" intensity={2} color="#c9a96e" position={[0, -2, 5]} scale={3} />
    </Environment>
  );
}

/** A soft halo in the perfume's colour, placed behind the bottle so the glass has light to bend. */
function Halo({ color }: { color: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.25, 'rgba(255,255,255,0.3)');
      // Fully transparent well before the edge, so the canvas bounds never show.
      gradient.addColorStop(0.55, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    return new CanvasTexture(canvas);
  }, []);

  return (
    <mesh position={[0, 0.2, -3]}>
      <planeGeometry args={[9, 9]} />
      <meshBasicMaterial map={texture} color={color} transparent opacity={0.55} depthWrite={false} />
    </mesh>
  );
}

/** Slow turntable spin, keyboard rotation and the scale-in entrance. */
function Turntable({
  interaction,
  autoRotate,
  children,
}: Pick<BottleSceneProps, 'interaction' | 'autoRotate'> & { children: ReactNode }) {
  const group = useRef<Group>(null);
  const spin = useRef(0);

  useFrame((_, delta) => {
    const target = group.current;
    if (!target) return;

    if (autoRotate && !interaction.current.isDragging) {
      spin.current += delta * AUTO_ROTATE_SPEED;
    }

    target.rotation.y = MathUtils.damp(
      target.rotation.y,
      spin.current + interaction.current.yaw,
      6,
      delta,
    );
    target.scale.setScalar(MathUtils.damp(target.scale.x, 1, 5, delta));
  });

  return (
    <group ref={group} scale={ENTRANCE_SCALE}>
      {children}
    </group>
  );
}

export function BottleScene({ bottle, label, interaction, autoRotate, animated }: BottleSceneProps) {
  return (
    <>
      <StudioEnvironment />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />

      <Halo color={bottle.liquidColor} />

      <PresentationControls
        cursor
        snap={false}
        speed={1.8}
        polar={[-0.4, 0.4]}
        azimuth={[-Infinity, Infinity]}
      >
        <Float
          speed={animated ? 1.6 : 0}
          rotationIntensity={animated ? 0.12 : 0}
          floatIntensity={animated ? 0.5 : 0}
        >
          {/* Keyed so each fragrance gets a fresh entrance animation. */}
          <Turntable key={label.name} interaction={interaction} autoRotate={autoRotate}>
            <group position={[0, -0.35, 0]}>
              <PerfumeBottle bottle={bottle} label={label} />
            </group>
          </Turntable>
        </Float>
      </PresentationControls>

      {animated && (
        <Sparkles count={36} scale={[5, 5, 3]} size={2.2} speed={0.25} opacity={0.5} color="#e4d0a6" />
      )}

      <ContactShadows position={[0, -1.85, 0]} opacity={0.55} scale={9} blur={2.6} far={4} />
    </>
  );
}
