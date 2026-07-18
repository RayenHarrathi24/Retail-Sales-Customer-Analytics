import { Suspense } from 'react';
import { SplashScene } from '@/components/splash/Scene';
import { SceneBoundary } from '@/components/splash/SceneBoundary';
import { useWebGL } from '@/lib/useWebGL';

const fallback = (
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#3b0f5c_0%,_#0d0620_65%)]" />
);

/**
 * Ambient "Consumer Constellation" 3D scene rendered fixed behind the whole
 * dashboard shell. Sits below all UI (z-index -10) and is non-interactive so
 * it never competes with dashboard controls.
 */
export function DashboardBackground() {
  const webglSupported = useWebGL();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {webglSupported ? (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={null}>
            <SplashScene />
          </Suspense>
        </SceneBoundary>
      ) : (
        fallback
      )}
      <div className="absolute inset-0 bg-[#0d0620]/60" />
    </div>
  );
}
