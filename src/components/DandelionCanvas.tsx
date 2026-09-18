import React, { useEffect, useRef } from 'react';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import type { ParticleTheme } from '../types';

interface DandelionCanvasProps {
  theme?: ParticleTheme;
  onEngineReady?: (engine: PhysicsEngine) => void;
}

export const DandelionCanvas: React.FC<DandelionCanvasProps> = ({
  theme = 'maple',
  onEngineReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PhysicsEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new PhysicsEngine(canvasRef.current, 85);
    engine.setTheme(theme);
    engineRef.current = engine;
    engine.start();

    if (onEngineReady) {
      onEngineReady(engine);
    }

    const handleGlobalBreeze = (e: Event) => {
      const customEvent = e as CustomEvent<{
        power?: number;
        originX?: number;
        originY?: number;
        radius?: number;
      }>;
      const { power = 1.0, originX, originY, radius } = customEvent.detail || {};
      if (originX !== undefined && originY !== undefined) {
        engine.triggerLandingImpact(originX, originY, radius, power);
      } else {
        engine.triggerBreeze(power);
      }
    };

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: ParticleTheme }>;
      if (customEvent.detail?.theme) {
        engine.setTheme(customEvent.detail.theme);
      }
    };

    window.addEventListener('trigger-dandelion-breeze', handleGlobalBreeze);
    window.addEventListener('change-particle-theme', handleThemeChange);

    return () => {
      window.removeEventListener('trigger-dandelion-breeze', handleGlobalBreeze);
      window.removeEventListener('change-particle-theme', handleThemeChange);
      engine.destroy();
      engineRef.current = null;
    };
  }, [onEngineReady, theme]);

  // 当外部 theme prop 变化时同步
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTheme(theme);
    }
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ display: 'block' }}
    />
  );
};
