import { MeshTransmissionMaterial } from '@react-three/drei';

/** Thick, refractive crystal. The expensive material — use it once per scene. */
export function GlassMaterial({ tint }: { tint: string }) {
  return (
    <MeshTransmissionMaterial
      color={tint}
      transmission={1}
      thickness={0.55}
      roughness={0.03}
      ior={1.45}
      chromaticAberration={0.04}
      anisotropicBlur={0.1}
      distortion={0.05}
      distortionScale={0.4}
      backside
      backsideThickness={0.3}
      samples={6}
      resolution={512}
    />
  );
}

/** The perfume itself: saturated, glossy and faintly self-lit so it glows through the glass. */
export function LiquidMaterial({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.1}
      roughness={0.12}
      clearcoat={1}
      transparent
      opacity={0.86}
    />
  );
}

/** Polished metal or lacquer for caps and collars. */
export function CapMaterial({ color }: { color: string }) {
  return <meshStandardMaterial color={color} metalness={0.85} roughness={0.24} />;
}
