import type { BottleAppearance } from '@/domain/product';
import { BOTTLE_SHAPES } from './bottleShapes';
import { CapMaterial } from './materials';
import { useLabelTexture, type BottleLabel } from './useLabelTexture';

interface PerfumeBottleProps {
  bottle: BottleAppearance;
  label: BottleLabel;
}

const COLLAR_HEIGHT = 0.14;
const DIP_TUBE_LENGTH = 1.7;

/** A complete flacon: glass body, perfume, foil label, collar, dip tube and cap. */
export function PerfumeBottle({ bottle, label }: PerfumeBottleProps) {
  const labelTexture = useLabelTexture(label);
  const { shoulderY, Body, Cap } = BOTTLE_SHAPES[bottle.shape];

  return (
    <group>
      <Body glassTint={bottle.glassTint} liquidColor={bottle.liquidColor} labelTexture={labelTexture} />

      <mesh position={[0, shoulderY - DIP_TUBE_LENGTH / 2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, DIP_TUBE_LENGTH, 12]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.35} roughness={0.2} />
      </mesh>

      <group position={[0, shoulderY, 0]}>
        <mesh position={[0, COLLAR_HEIGHT / 2 - 0.02, 0]}>
          <cylinderGeometry args={[0.25, 0.27, COLLAR_HEIGHT, 48]} />
          <CapMaterial color={bottle.capColor} />
        </mesh>
        <group position={[0, COLLAR_HEIGHT - 0.02, 0]}>
          <Cap color={bottle.capColor} />
        </group>
      </group>
    </group>
  );
}
