'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import { Group, Color } from 'three';
import { useQuetzitoState, QuetzitoContext } from '@/hooks/use-quetzito-context';

// Simple quetzal model component (will be replaced with actual 3D model)
function QuetzalModel() {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  // Create a simple stylized quetzal using Three.js primitives
  // This will be replaced with a proper 3D model later
  useFrame((state) => {
    if (groupRef.current) {
      // Base floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Body */}
      <mesh position={[0, 0, 0]} name="body">
        <ellipsoidGeometry args={[0.8, 1.2, 0.6]} />
        <meshStandardMaterial color={new Color('#046307')} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.5, 0.2]} name="head">
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color={new Color('#2d6a4f')} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 1.7, 0.7]} name="left_eye">
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={new Color('#000000')} />
      </mesh>
      <mesh position={[0.2, 1.7, 0.7]} name="right_eye">
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={new Color('#000000')} />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 1.4, 0.9]} name="beak">
        <coneGeometry args={[0.1, 0.4, 8]} />
        <meshStandardMaterial color={new Color('#ff6b35')} />
      </mesh>

      {/* Wings */}
      <mesh position={[-1, 0.5, 0]} rotation={[0, 0, -0.3]} name="wing_left">
        <ellipsoidGeometry args={[0.3, 0.8, 0.1]} />
        <meshStandardMaterial color={new Color('#40916c')} />
      </mesh>
      <mesh position={[1, 0.5, 0]} rotation={[0, 0, 0.3]} name="wing_right">
        <ellipsoidGeometry args={[0.3, 0.8, 0.1]} />
        <meshStandardMaterial color={new Color('#40916c')} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, -1.2, -0.5]} rotation={[0.3, 0, 0]} name="tail">
        <ellipsoidGeometry args={[0.2, 1.5, 0.1]} />
        <meshStandardMaterial color={new Color('#2d6a4f')} />
      </mesh>

      {/* Tail feathers */}
      <mesh position={[0, -2.5, -0.3]} rotation={[0.2, 0, 0]} name="tail_feathers">
        <ellipsoidGeometry args={[0.1, 2, 0.05]} />
        <meshStandardMaterial color={new Color('#ff6b35')} />
      </mesh>
    </group>
  );
}

// Character controller that connects the 3D model to the animation engine
function QuetzalCharacterController() {
  const characterRef = useRef<Group>(null);
  const { initializeEngine } = React.useContext(QuetzitoContext)!;

  useEffect(() => {
    if (characterRef.current) {
      initializeEngine(characterRef);
    }
  }, [initializeEngine]);

  return (
    <group ref={characterRef}>
      <QuetzalModel />
    </group>
  );
}

// Scene setup component
function QuetzitoScene({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <group {...props}>
      <QuetzalCharacterController />
      {children}
    </group>
  );
}

// Loading fallback
function QuetzitoLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-quetz-green/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🦜</span>
        </div>
      </div>
    </div>
  );
}

// Error fallback
function QuetzitoError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center p-4">
      <span className="text-4xl mb-2">🦜</span>
      <p className="text-sm text-gray-600 mb-2">Quetzito está descansando</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-quetz-green hover:underline"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}

// Main Quetzito Engine Component
interface QuetzitoEngineProps {
  className?: string;
  position?: 'hero' | 'trees' | 'chat' | 'floating';
  width?: number;
  height?: number;
  controls?: boolean;
  autoRotate?: boolean;
  onClick?: () => void;
  fallback?: React.ReactNode;
}

export default function QuetzitoEngine({
  className = '',
  position = 'floating',
  width = 200,
  height = 200,
  controls = false,
  autoRotate = false,
  onClick,
  fallback = <QuetzitoLoader />
}: QuetzitoEngineProps) {
  const quetzitoState = useQuetzitoState();
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Reset error state for retry
  const handleRetry = () => {
    setError(null);
    setRetryKey(prev => prev + 1);
  };

  // Error boundary
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <QuetzitoError onRetry={handleRetry} />
      </div>
    );
  }

  // Position-specific camera settings
  const getCameraPosition = () => {
    switch (position) {
      case 'hero':
        return [3, 2, 5];
      case 'trees':
        return [-3, 1, 4];
      case 'chat':
        return [0, 0, 4];
      case 'floating':
      default:
        return [2, 1, 5];
    }
  };

  const getCharacterPosition = () => {
    switch (position) {
      case 'hero':
        return [0, 0, 0];
      case 'trees':
        return [0, 0, 0];
      case 'chat':
        return [0, -0.5, 0];
      case 'floating':
      default:
        return [0, 0, 0];
    }
  };

  return (
    <QuetzitoContext.Provider value={quetzitoState}>
      <div
        className={`relative ${className}`}
        style={{ width, height }}
        onClick={onClick}
      >
        <Canvas
          key={retryKey}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
          camera={{
            fov: 50,
            near: 0.1,
            far: 1000,
            position: getCameraPosition()
          }}
          onError={() => setError('Error rendering 3D scene')}
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />

          {/* Environment */}
          <Environment preset="sunset" />

          {/* Character */}
          <Suspense fallback={null}>
            <QuetzitoScene position={getCharacterPosition()} />
          </Suspense>

          {/* Controls (for development) */}
          {controls && (
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
            />
          )}
        </Canvas>

        {/* Loading overlay */}
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            {fallback}
          </div>
        }>
          {null}
        </Suspense>

        {/* Accessibility info */}
        <div className="sr-only">
          Quetzito, la mascota interactiva de Quetz.org. Un quetzal animado que responde a tus interacciones.
        </div>
      </div>
    </QuetzitoContext.Provider>
  );
}

// Provider component for app-level setup
export function QuetzitoProvider({ children }: { children: React.ReactNode }) {
  const quetzitoState = useQuetzitoState();

  return (
    <QuetzitoContext.Provider value={quetzitoState}>
      {children}
    </QuetzitoContext.Provider>
  );
}

// Export hooks and utilities
export { useQuetzitoState };
export type { QuetzitoEngineProps };