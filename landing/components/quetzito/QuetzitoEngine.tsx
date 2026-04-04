'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Simplified fallback component to prevent client-side errors
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

// Main Quetzito Engine Component - Simplified version
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
  fallback
}: QuetzitoEngineProps) {
  const [isClient, setIsClient] = useState(false);
  const [is3DSupported, setIs3DSupported] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setIs3DSupported(!!gl);
    } catch (e) {
      setIs3DSupported(false);
    }
  }, []);

  // Get the appropriate image based on position
  const getImageSrc = () => {
    switch (position) {
      case 'hero':
        return '/mascot/quetzito-aventurero.png';
      case 'trees':
        return '/mascot/quetzito-maestro.png';
      case 'chat':
        return '/mascot/quetzito-heroe.png';
      default:
        return '/mascot/quetzito-heroe.png';
    }
  };

  // Enhanced animated fallback that looks more alive
  const renderAnimatedFallback = () => (
    <motion.div
      className="w-full h-full relative cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [-1, 1, -1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full h-full relative"
      >
        <Image
          src={getImageSrc()}
          alt="Quetzito"
          fill
          className="object-contain drop-shadow-lg"
          sizes="(max-width: 768px) 100px, 200px"
        />
      </motion.div>

      {/* Subtle glow effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-quetz-green/20 rounded-full blur-sm"
      />
    </motion.div>
  );

  // For now, always render the enhanced animated fallback
  // This ensures the site works while we can develop 3D features separately
  return (
    <div
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {isClient ? renderAnimatedFallback() : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-2xl">🦜</span>
        </div>
      )}

      {/* Accessibility info */}
      <div className="sr-only">
        Quetzito, la mascota interactiva de Quetz.org. Un quetzal animado que responde a tus interacciones.
      </div>
    </div>
  );
}

// Simplified provider that doesn't cause hydration issues
export function QuetzitoProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Export simplified state hook
export function useQuetzitoState() {
  return {
    engine: null,
    currentState: 'idle' as const,
    environment: {},
    isInitialized: false,
    setState: () => {},
    updateGaze: () => {},
    onScroll: () => {},
    onHover: () => {},
    onClick: () => {},
    updatePageSection: () => {},
    initializeEngine: () => {},
  };
}

export type { QuetzitoEngineProps };