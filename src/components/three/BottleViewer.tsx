import { Component, lazy, Suspense, type ReactNode } from 'react';
import { BottleArt } from '@/components/product/BottleArt';
import type { BottleCanvasProps } from './BottleCanvas';

const BottleCanvas = lazy(() => import('./BottleCanvas'));

interface BoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

/** If WebGL is unavailable or the scene crashes, show the illustration instead of a blank box. */
class WebGLBoundary extends Component<BoundaryProps, { hasFailed: boolean }> {
  override state = { hasFailed: false };

  static getDerivedStateFromError() {
    return { hasFailed: true };
  }

  override render() {
    return this.state.hasFailed ? this.props.fallback : this.props.children;
  }
}

/**
 * Public entry point for the 3D bottle. Keeps three.js out of the main bundle
 * and degrades to a 2D illustration while loading or when WebGL fails.
 */
export function BottleViewer(props: BottleCanvasProps) {
  const fallback = (
    <div className={props.className}>
      <BottleArt bottle={props.bottle} name={props.label.name} className="mx-auto h-full py-10" />
    </div>
  );

  return (
    // Keyed so a broken model does not keep the viewer stuck after it is replaced.
    <WebGLBoundary key={props.modelUrl ?? 'generated'} fallback={fallback}>
      <Suspense fallback={fallback}>
        <BottleCanvas {...props} />
      </Suspense>
    </WebGLBoundary>
  );
}
