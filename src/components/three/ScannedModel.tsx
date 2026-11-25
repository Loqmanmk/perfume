import { useMemo } from 'react';
import { Center, Resize, useGLTF } from '@react-three/drei';

/** Same visual height as the generated bottles, so every product sits on the stage the same way. */
const MODEL_HEIGHT = 2.6;
const MODEL_CENTER_Y = 0.45;

/**
 * A real 3D model of the product (.glb) — for example a scan made with a phone
 * app. Any size or origin works: it is centred and scaled to fit the stage.
 */
export function ScannedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // Clone so the same cached model can be shown in two viewers at once.
  const model = useMemo(() => scene.clone(true), [scene]);

  return (
    <group scale={MODEL_HEIGHT} position={[0, MODEL_CENTER_Y, 0]}>
      <Resize>
        <Center>
          <primitive object={model} />
        </Center>
      </Resize>
    </group>
  );
}
