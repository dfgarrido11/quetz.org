'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Dynamic imports to prevent SSR issues
let Canvas: any;
let Environment: any;
let OrbitControls: any;
let RealisticQuetzal: any;

interface LivingQuetzitoEngineProps {
  className?: string;
  position?: 'hero' | 'trees' | 'chat' | 'floating';
  width?: number;
  height?: number;
  controls?: boolean;
  onClick?: () => void;
  fallback?: React.ReactNode;
}

// Enhanced animated fallback while 3D loads
function EnhancedQuetzitoFallback({
  position,
  onClick,
  className
}: {
  position: string;
  onClick?: () => void;
  className?: string;
}) {
  const getImageSrc = () => {
    switch (position) {
      case 'hero': return '/mascot/quetzito-aventurero.png';
      case 'trees': return '/mascot/quetzito-maestro.png';
      case 'chat': return '/mascot/quetzito-heroe.png';
      default: return '/mascot/quetzito-heroe.png';
    }
  };

  return (
    <motion.div
      className={`w-full h-full relative cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Main character with enhanced animation */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full h-full relative"
      >
        <Image
          src={getImageSrc()}
          alt="Quetzito"
          fill
          className="object-contain drop-shadow-xl"
          sizes="(max-width: 768px) 150px, 300px"
          priority
        />
      </motion.div>

      {/* Breathing effect glow */}
      <motion.div
        animate={{
          opacity: [0.2, 0.6, 0.2],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-quetz-green/30 rounded-full blur-md"
      />

      {/* Eye shine effect */}
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
        style={{
          filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))'
        }}
      />

      {/* Loading indicator for 3D */}
      <div className="absolute top-2 right-2 text-xs text-quetz-green/70 font-medium">
        🎬 Cargando...
      </div>
    </motion.div>
  );
}

// 3D Scene Component
function QuetzitoScene({
  position,
  cameraPosition,
  characterScale
}: {
  position: [number, number, number];
  cameraPosition: [number, number, number];
  characterScale: number;
}) {
  if (!RealisticQuetzal) return null;

  return (
    <>
      {/* Cinematic lighting setup */}
      <ambientLight intensity={0.4} color="#f0f9ff" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight
        position={[-5, 5, 5]}
        intensity={0.3}
        color="#22c55e"
      />
      <pointLight
        position={[5, -5, -5]}
        intensity={0.2}
        color="#f59e0b"
      />

      {/* Environment - Natural lighting */}
      <Environment preset="dawn" />

      {/* Our realistic Quetzal */}
      <RealisticQuetzal
        position={position}
        scale={characterScale}
        isActive={true}
      />

      {/* Subtle fog for atmosphere */}
      <fog attach="fog" args={['#f0f9ff', 15, 25]} />
    </>
  );
}

export default function LivingQuetzitoEngine({
  className = '',
  position = 'floating',
  width = 200,
  height = 200,
  controls = false,
  onClick,
  fallback
}: LivingQuetzitoEngineProps) {
  const [is3DReady, setIs3DReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  // Load 3D dependencies progressively
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadThreeDDependencies();
    }
  }, []);

  const loadThreeDDependencies = async () => {
    try {
      setLoadingProgress(20);

      // Load React Three Fiber
      const { Canvas: CanvasComponent } = await import('@react-three/fiber');
      Canvas = CanvasComponent;
      setLoadingProgress(40);

      // Load Drei helpers
      const { Environment: EnvironmentComponent, OrbitControls: OrbitControlsComponent } = await import('@react-three/drei');
      Environment = EnvironmentComponent;
      OrbitControls = OrbitControlsComponent;
      setLoadingProgress(60);

      // Load our realistic Quetzal
      const { RealisticQuetzal: RealisticQuetzalComponent } = await import('./RealisticQuetzal');
      RealisticQuetzal = RealisticQuetzalComponent;
      setLoadingProgress(80);

      // Small delay to ensure everything is loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingProgress(100);
      setIs3DReady(true);

      console.log('🎬 Quetzito 3D Engine loaded successfully!');

    } catch (err) {
      console.error('Failed to load 3D components:', err);
      setError('3D not supported on this device');
    }
  };

  // Position-specific settings
  const getViewConfig = () => {
    switch (position) {
      case 'hero':
        return {
          cameraPosition: [4, 2, 6] as [number, number, number],
          characterPosition: [0, 0, 0] as [number, number, number],
          characterScale: 0.8,
          fov: 45
        };
      case 'trees':
        return {
          cameraPosition: [-4, 1, 5] as [number, number, number],
          characterPosition: [0, 0, 0] as [number, number, number],
          characterScale: 0.6,
          fov: 50
        };
      case 'chat':
        return {
          cameraPosition: [0, 0, 5] as [number, number, number],
          characterPosition: [0, -0.3, 0] as [number, number, number],
          characterScale: 0.5,
          fov: 55
        };
      default:
        return {
          cameraPosition: [3, 1, 6] as [number, number, number],
          characterPosition: [0, 0, 0] as [number, number, number],
          characterScale: 0.7,
          fov: 50
        };
    }
  };

  const viewConfig = getViewConfig();

  // Show enhanced fallback while loading or if 3D fails
  if (!is3DReady || error) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        {fallback || (
          <EnhancedQuetzitoFallback
            position={position}
            onClick={() => {
              onClick?.();
              console.log(`🦜 Quetzito ${position} clicked! ${is3DReady ? '3D Ready' : 'Loading...'}`);
            }}
            className={className}
          />
        )}

        {/* Progress indicator */}
        {!error && loadingProgress > 0 && loadingProgress < 100 && (
          <div className="absolute bottom-2 left-2 text-xs font-medium text-quetz-green/80">
            {loadingProgress}% cargado
          </div>
        )}
      </div>
    );
  }

  // Render full 3D scene
  return (
    <div
      className={`relative ${className} overflow-hidden rounded-lg`}
      style={{ width, height }}
      onClick={() => {
        onClick?.();
        console.log('🎬 Living Quetzito clicked! Full 3D active');
      }}
    >
      <Canvas
        camera={{
          fov: viewConfig.fov,
          near: 0.1,
          far: 1000,
          position: viewConfig.cameraPosition
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          depth: true,
          stencil: false,
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
          setError('3D rendering failed');
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <QuetzitoScene
            position={viewConfig.characterPosition}
            cameraPosition={viewConfig.cameraPosition}
            characterScale={viewConfig.characterScale}
          />
        </Suspense>

        {/* Development controls */}
        {controls && OrbitControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={10}
          />
        )}
      </Canvas>

      {/* Status indicator */}
      <div className="absolute top-2 right-2 text-xs font-medium text-quetz-green">
        🎬 LIVE
      </div>

      {/* Accessibility */}
      <div className="sr-only">
        Quetzito, el quetzal 3D viviente de Quetz.org. Respira, parpadea y reacciona a tus movimientos del cursor.
      </div>
    </div>
  );
}

// Safe provider for SSR compatibility
export function LivingQuetzitoProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export type { LivingQuetzitoEngineProps };