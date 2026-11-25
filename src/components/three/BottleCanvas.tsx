import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Canvas } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import type { BottleAppearance } from '@/domain/product';
import { cn } from '@/lib/cn';
import { useIsOnScreen } from '@/lib/hooks/useIsOnScreen';
import { BottleScene, type BottleInteraction } from './BottleScene';
import type { BottleLabel } from './useLabelTexture';

export interface BottleCanvasProps {
  bottle: BottleAppearance;
  label: BottleLabel;
  modelUrl?: string | null;
  autoRotate?: boolean;
  className?: string;
}

const KEYBOARD_STEP = Math.PI / 8;

/**
 * The WebGL viewer. Drag (or use ← →) to turn the bottle.
 * Heavy — import it through `BottleViewer`, which lazy-loads it and handles failure.
 */
export default function BottleCanvas({
  bottle,
  label,
  modelUrl = null,
  autoRotate = true,
  className,
}: BottleCanvasProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const interaction = useRef<BottleInteraction>({ yaw: 0, isDragging: false });
  const isOnScreen = useIsOnScreen(wrapper);
  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const stopDragging = () => {
      interaction.current.isDragging = false;
    };
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    return () => {
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') interaction.current.yaw -= KEYBOARD_STEP;
    else if (event.key === 'ArrowRight') interaction.current.yaw += KEYBOARD_STEP;
    else return;
    event.preventDefault();
  };

  return (
    <div
      ref={wrapper}
      role="application"
      tabIndex={0}
      aria-label={`360° view of ${label.name}. Drag, or use the left and right arrow keys, to turn it.`}
      className={cn('touch-pan-y select-none', className)}
      onKeyDown={handleKeyDown}
      onPointerDown={() => {
        interaction.current.isDragging = true;
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.2, 8.6], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={isOnScreen ? 'always' : 'never'}
      >
        <BottleScene
          bottle={bottle}
          label={label}
          modelUrl={modelUrl}
          interaction={interaction}
          autoRotate={autoRotate && !prefersReducedMotion}
          animated={!prefersReducedMotion}
        />
      </Canvas>
    </div>
  );
}
