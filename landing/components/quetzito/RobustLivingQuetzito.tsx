'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface RobustLivingQuetzitoProps {
  className?: string;
  position?: 'hero' | 'trees' | 'chat' | 'floating';
  width?: number;
  height?: number;
  onClick?: () => void;
}

// Enhanced living fallback - looks very alive without 3D complexity
function EnhancedLivingFallback({
  position,
  onClick,
  className,
  width,
  height
}: {
  position: string;
  onClick?: () => void;
  className?: string;
  width?: number;
  height?: number;
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [gazeX, setGazeX] = useState(0);
  const [gazeY, setGazeY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getImageSrc = () => {
    switch (position) {
      case 'hero': return '/mascot/quetzito-aventurero.png';
      case 'trees': return '/mascot/quetzito-maestro.png';
      case 'chat': return '/mascot/quetzito-heroe.png';
      default: return '/mascot/quetzito-heroe.png';
    }
  };

  // Realistic blinking system
  useEffect(() => {
    const blinkInterval = () => {
      const nextBlink = 2000 + Math.random() * 4000; // 2-6 seconds
      setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150); // Quick blink
        blinkInterval(); // Schedule next blink
      }, nextBlink);
    };

    blinkInterval();
  }, []);

  // Enhanced gaze tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate gaze direction (subtle)
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;

      setGazeX(Math.max(-0.3, Math.min(0.3, deltaX * 0.5)));
      setGazeY(Math.max(-0.2, Math.min(0.2, deltaY * 0.3)));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer ${className}`}
      style={{ width, height }}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Main breathing character */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [-1 + gazeX * 20, 1 + gazeX * 20, -1 + gazeX * 20],
          scale: isHovering ? 1.02 : 1,
        }}
        transition={{
          y: { duration: 3 + Math.sin(Date.now()) * 0.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.3 }
        }}
        className="w-full h-full relative"
        style={{
          transform: `translateX(${gazeX * 8}px) translateY(${gazeY * 6}px)`
        }}
      >
        <Image
          src={getImageSrc()}
          alt="Quetzito viviente"
          fill
          className="object-contain drop-shadow-lg"
          sizes="(max-width: 768px) 150px, 300px"
          priority={position === 'hero'}
        />
      </motion.div>

      {/* Enhanced breathing glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [0.8, 1.3, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-quetz-green/25 rounded-full blur-md"
      />

      {/* Eye shine effects that blink */}
      <AnimatePresence>
        {!isBlinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute"
            style={{
              top: '30%',
              left: '45%',
              transform: `translate(${gazeX * 15}px, ${gazeY * 8}px)`
            }}
          >
            <div className="w-1 h-1 bg-white rounded-full shadow-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle pulse effect when hovering */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.2, 0],
              scale: [0, 2, 3]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 rounded-full bg-quetz-green/10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Living status indicator */}
      <div className="absolute top-1 right-1">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-green-400 rounded-full"
          title="Quetzito está vivo"
        />
      </div>

      {/* Accessibility info */}
      <div className="sr-only">
        Quetzito viviente - Respira, parpadea y sigue tu cursor. {isHovering ? 'Interactuando contigo' : 'Observando'}
      </div>
    </motion.div>
  );
}

// Tu Quetzito Auténtico en 3D - Carga el verdadero personaje
function AuthenticQuetzito3DLoader({
  position,
  width,
  height,
  onError
}: {
  position: string;
  width: number;
  height: number;
  onError: () => void;
}) {
  const [AuthenticQuetzito3D, setAuthenticQuetzito3D] = useState<any>(null);
  const [Canvas, setCanvas] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load3D = async () => {
      try {
        // Test WebGL support first
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        if (!gl) throw new Error('WebGL not supported');

        // Load dependencies very carefully
        const [fiberModule, authenticQuetzitoModule] = await Promise.all([
          import('@react-three/fiber').catch(() => null),
          import('./AuthenticQuetzito3D').catch(() => null)
        ]);

        if (!mounted || !fiberModule || !authenticQuetzitoModule) {
          throw new Error('3D modules failed to load');
        }

        setCanvas(fiberModule.Canvas);
        setAuthenticQuetzito3D(() => authenticQuetzitoModule.AuthenticQuetzito3D);
        setIsReady(true);

        console.log('🎬 ¡TU QUETZITO AUTÉNTICO 3D CARGADO EXITOSAMENTE!');

      } catch (error) {
        console.log('🦜 3D Quetzito no disponible, usando versión mejorada');
        if (mounted) onError();
      }
    };

    // Delay loading to ensure page is stable
    const timer = setTimeout(load3D, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [onError]);

  if (!isReady || !Canvas || !AuthenticQuetzito3D) return null;

  // Mapeo de posiciones a variantes
  const getVariant = () => {
    switch (position) {
      case 'hero': return 'hero';
      case 'trees': return 'teacher';
      case 'chat': return 'hero';
      default: return 'hero';
    }
  };

  // Tu Quetzito Auténtico en escena 3D
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      }}
      onError={onError}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-5, 2, 3]} intensity={0.3} />

      <AuthenticQuetzito3D
        position={[0, 0, 0]}
        scale={1.2}
        variant={getVariant()}
        isActive={true}
      />
    </Canvas>
  );
}

export default function RobustLivingQuetzito({
  className = '',
  position = 'floating',
  width = 200,
  height = 200,
  onClick
}: RobustLivingQuetzitoProps) {
  const [mode, setMode] = useState<'enhanced' | '3d' | 'fallback'>('enhanced');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Try to upgrade to 3D after page is stable
    const upgradeTimer = setTimeout(() => {
      // Only try 3D on capable devices
      if (navigator.hardwareConcurrency >= 2 && window.innerWidth > 640) {
        console.log('🎬 Cargando TU QUETZITO AUTÉNTICO en 3D...');
        setMode('3d'); // ¡Activado! - Cargar el verdadero Quetzito 3D
      }
    }, 2000);

    return () => clearTimeout(upgradeTimer);
  }, []);

  const handle3DError = useCallback(() => {
    console.log('🦜 3D failed, using enhanced living fallback');
    setMode('fallback');
  }, []);

  const handleClick = () => {
    onClick?.();

    // Fun click responses for the authentic Quetzito
    const responses = [
      '🎬 ¡Hola! ¡Soy TU QUETZITO auténtico en 3D!',
      '🦜 ¡Respiro, parpadeo y vivo para ti!',
      '✨ ¡Observa como sigo tu cursor como un personaje real!',
      '💚 ¡Soy tu guardián viviente de Zacapa!'
    ];

    console.log(responses[Math.floor(Math.random() * responses.length)]);
  };

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-2xl opacity-50">🦜</span>
      </div>
    );
  }

  // Render based on current mode
  switch (mode) {
    case '3d':
      return (
        <div className={`relative ${className}`} style={{ width, height }}>
          <AuthenticQuetzito3DLoader
            position={position}
            width={width}
            height={height}
            onError={handle3DError}
          />
          <div className="absolute top-1 right-1 text-xs font-bold text-quetz-green bg-white/80 px-1 rounded">
            TU QUETZITO 3D
          </div>
        </div>
      );

    case 'enhanced':
    default:
      return (
        <EnhancedLivingFallback
          position={position}
          onClick={handleClick}
          className={className}
          width={width}
          height={height}
        />
      );
  }
}

// Safe provider
export function RobustLivingQuetzitoProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export type { RobustLivingQuetzitoProps };