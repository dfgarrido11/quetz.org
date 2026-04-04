'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Color, Vector3, SphereGeometry } from 'three';

// Geometría elipsoidal personalizada para formas orgánicas de Quetzito
function EllipsoidGeometry({ args }: { args: [number, number, number] }) {
  const [radiusX, radiusY, radiusZ] = args;

  return (
    <sphereGeometry
      args={[1, 20, 16]}
      scale={[radiusX, radiusY, radiusZ]}
    />
  );
}

interface AuthenticQuetzito3DProps {
  position?: [number, number, number];
  scale?: number;
  variant?: 'hero' | 'adventure' | 'teacher';
  isActive?: boolean;
}

export function AuthenticQuetzito3D({
  position = [0, 0, 0],
  scale = 1,
  variant = 'hero',
  isActive = true
}: AuthenticQuetzito3DProps) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const leftEyeRef = useRef<Mesh>(null);
  const rightEyeRef = useRef<Mesh>(null);
  const leftWingRef = useRef<Mesh>(null);
  const rightWingRef = useRef<Mesh>(null);
  const crestRef = useRef<Mesh>(null);

  // Animation state
  const [lastBlink, setLastBlink] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Colors específicos de cada variante de TU QUETZITO
  const getColors = () => {
    switch (variant) {
      case 'hero':
        return {
          head: new Color('#4ade80'),      // Verde brillante de héroe
          crest: new Color('#22c55e'),     // Verde más oscuro para cresta
          chest: new Color('#ef4444'),     // Rojo del pecho
          body: new Color('#65a30d'),      // Verde cuerpo
          wings: new Color('#3b82f6'),     // Azul de las alas
          wingTips: new Color('#22c55e'),  // Verde de puntas de alas
          beak: new Color('#f97316'),      // Naranja del pico
          eyes: new Color('#1f2937'),      // Negro de ojos
          feet: new Color('#ea580c')       // Naranja de las patas
        };
      case 'adventure':
        return {
          head: new Color('#fb923c'),      // Naranja dorado del aventurero
          crest: new Color('#dc2626'),     // Rojo vibrante de la cresta
          chest: new Color('#fbbf24'),     // Amarillo/dorado del pecho
          body: new Color('#f59e0b'),      // Naranja del cuerpo
          wings: new Color('#10b981'),     // Verde de las alas
          wingTips: new Color('#3b82f6'),  // Azul de puntas
          beak: new Color('#ea580c'),      // Naranja del pico
          eyes: new Color('#1f2937'),      // Negro de ojos
          feet: new Color('#ea580c')       // Naranja de las patas
        };
      case 'teacher':
        return {
          head: new Color('#dc2626'),      // Rojo de la cabeza del maestro
          crest: new Color('#b91c1c'),     // Rojo más oscuro
          chest: new Color('#f3f4f6'),     // Beige/blanco del pecho
          body: new Color('#22c55e'),      // Verde del cuerpo
          wings: new Color('#16a34a'),     // Verde de las alas
          wingTips: new Color('#15803d'),  // Verde oscuro de puntas
          beak: new Color('#f97316'),      // Naranja del pico
          eyes: new Color('#1f2937'),      // Negro de ojos
          feet: new Color('#ea580c')       // Naranja de las patas
        };
      default:
        return getColors.call(this, 'hero');
    }
  };

  const colors = getColors();

  // Mouse tracking específico de Quetzito
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isActive]);

  // Animación específica de TU QUETZITO
  useFrame((state) => {
    if (!isActive || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // === RESPIRACIÓN CARACTERÍSTICA DE QUETZITO ===
    const breathCycle = Math.sin(time * 0.7) * 0.02 + 1; // Respiración relajada de Quetzito
    if (bodyRef.current) {
      bodyRef.current.scale.set(breathCycle, breathCycle, 1.01 + Math.sin(time * 0.7) * 0.01);
    }

    // === SISTEMA DE PARPADEO EXPRESIVO ===
    const timeSinceLastBlink = time - lastBlink;
    if (timeSinceLastBlink > 2.5 + Math.random() * 3.5 && !isBlinking) {
      setIsBlinking(true);
      setLastBlink(time);
      setTimeout(() => setIsBlinking(false), 120); // Parpadeo rápido como en los dibujos
    }

    // Aplicar parpadeo a los ojos grandes de Quetzito
    const blinkScale = isBlinking ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.setY(blinkScale);
    if (rightEyeRef.current) rightEyeRef.current.scale.setY(blinkScale);

    // === SEGUIMIENTO OCULAR EXPRESIVO COMO QUETZITO ===
    const gazeStrength = 0.25;
    const eyeTargetX = mousePosition.x * gazeStrength;
    const eyeTargetY = mousePosition.y * gazeStrength * 0.3;

    if (leftEyeRef.current) {
      leftEyeRef.current.position.x = -0.25 + eyeTargetX * 0.08;
      leftEyeRef.current.position.z = 0.6 + eyeTargetY * 0.04;
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.position.x = 0.25 + eyeTargetX * 0.08;
      rightEyeRef.current.position.z = 0.6 + eyeTargetY * 0.04;
    }

    // === MOVIMIENTO DE CABEZA EXPRESIVO ===
    if (headRef.current) {
      const headBob = Math.sin(time * 1.1) * 0.03;
      const headTilt = Math.sin(time * 0.8) * 0.04;
      const gazeRotationY = eyeTargetX * 0.12;
      const gazeRotationX = -eyeTargetY * 0.06;

      headRef.current.position.y = 0.8 + headBob;
      headRef.current.rotation.set(headTilt + gazeRotationX, gazeRotationY, headBob * 0.5);
    }

    // === MOVIMIENTO DE CRESTA DINÁMICO ===
    if (crestRef.current) {
      const crestSway = Math.sin(time * 1.3) * 0.08;
      crestRef.current.rotation.z = crestSway;
      crestRef.current.position.y = 1.1 + Math.sin(time * 1.2) * 0.02;
    }

    // === FLOTACIÓN CARACTERÍSTICA ===
    if (groupRef.current) {
      const float = Math.sin(time * 0.6) * 0.04;
      const sway = Math.sin(time * 0.4) * 0.015;
      groupRef.current.position.y = position[1] + float;
      groupRef.current.rotation.z = sway;
    }

    // === ALETEO DE ALAS COMO QUETZITO ===
    const wingFlap = Math.sin(time * 2.2) * 0.1;
    const wingFlutterShift = Math.sin(time * 2.2 + Math.PI/3) * 0.05;

    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = -0.3 + wingFlap + wingFlutterShift;
      leftWingRef.current.position.y = 0.1 + Math.sin(time * 2.2) * 0.02;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = 0.3 - wingFlap - wingFlutterShift;
      rightWingRef.current.position.y = 0.1 + Math.sin(time * 2.2 + Math.PI/6) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* CUERPO PRINCIPAL DE QUETZITO - Forma redondeada característica */}
      <mesh ref={bodyRef} position={[0, 0, 0]} name="body">
        <EllipsoidGeometry args={[0.5, 0.7, 0.45]} />
        <meshStandardMaterial
          color={colors.body}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* PECHO DISTINTIVO - Color característico de cada variante */}
      <mesh position={[0, 0.1, 0.35]} name="chest">
        <EllipsoidGeometry args={[0.35, 0.4, 0.2]} />
        <meshStandardMaterial
          color={colors.chest}
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>

      {/* CABEZA REDONDA Y EXPRESIVA */}
      <mesh ref={headRef} position={[0, 0.8, 0.1]} name="head">
        <sphereGeometry args={[0.4, 20, 16]} />
        <meshStandardMaterial
          color={colors.head}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* CRESTA CARACTERÍSTICA - Espiguitas como en la imagen */}
      <mesh ref={crestRef} position={[0, 1.1, 0]} rotation={[0, 0, 0]} name="crest">
        <coneGeometry args={[0.15, 0.35, 6]} />
        <meshStandardMaterial
          color={colors.crest}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Púas adicionales de la cresta */}
      <mesh position={[-0.1, 1.25, 0]} rotation={[0, 0, -0.3]} name="crest_spike_left">
        <coneGeometry args={[0.08, 0.2, 6]} />
        <meshStandardMaterial color={colors.crest} />
      </mesh>
      <mesh position={[0.1, 1.25, 0]} rotation={[0, 0, 0.3]} name="crest_spike_right">
        <coneGeometry args={[0.08, 0.2, 6]} />
        <meshStandardMaterial color={colors.crest} />
      </mesh>

      {/* OJOS GRANDES Y EXPRESIVOS - Característica principal */}
      <mesh ref={leftEyeRef} position={[-0.25, 0.85, 0.6]} name="left_eye">
        <EllipsoidGeometry args={[0.12, 0.15, 0.08]} />
        <meshStandardMaterial
          color={new Color('#ffffff')}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.25, 0.85, 0.6]} name="right_eye">
        <EllipsoidGeometry args={[0.12, 0.15, 0.08]} />
        <meshStandardMaterial
          color={new Color('#ffffff')}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Pupilas negras grandes */}
      <mesh position={[-0.25, 0.85, 0.65]} name="left_pupil">
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshStandardMaterial color={colors.eyes} />
      </mesh>
      <mesh position={[0.25, 0.85, 0.65]} name="right_pupil">
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshStandardMaterial color={colors.eyes} />
      </mesh>

      {/* Brillos en los ojos - Dan vida */}
      <mesh position={[-0.23, 0.88, 0.68]} name="left_eye_shine">
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial
          color={new Color('#ffffff')}
          emissive={new Color('#ffffff')}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0.27, 0.88, 0.68]} name="right_eye_shine">
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial
          color={new Color('#ffffff')}
          emissive={new Color('#ffffff')}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* PICO EXPRESIVO */}
      <mesh position={[0, 0.7, 0.75]} rotation={[0.2, 0, 0]} name="beak">
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial
          color={colors.beak}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* ALAS CARACTERÍSTICAS - Forma y colores de TU Quetzito */}
      <mesh ref={leftWingRef} position={[-0.7, 0.1, 0]} rotation={[0.1, 0, -0.3]} name="wing_left">
        <EllipsoidGeometry args={[0.2, 0.6, 0.08]} />
        <meshStandardMaterial
          color={colors.wings}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      <mesh ref={rightWingRef} position={[0.7, 0.1, 0]} rotation={[0.1, 0, 0.3]} name="wing_right">
        <EllipsoidGeometry args={[0.2, 0.6, 0.08]} />
        <meshStandardMaterial
          color={colors.wings}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* Puntas de las alas */}
      <mesh position={[-0.9, -0.1, 0]} rotation={[0.1, 0, -0.4]} name="wing_tip_left">
        <EllipsoidGeometry args={[0.12, 0.35, 0.05]} />
        <meshStandardMaterial color={colors.wingTips} />
      </mesh>
      <mesh position={[0.9, -0.1, 0]} rotation={[0.1, 0, 0.4]} name="wing_tip_right">
        <EllipsoidGeometry args={[0.12, 0.35, 0.05]} />
        <meshStandardMaterial color={colors.wingTips} />
      </mesh>

      {/* PATAS ROBUSTAS */}
      <mesh position={[-0.15, -0.6, 0.2]} rotation={[0.1, 0, 0]} name="foot_left">
        <EllipsoidGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial
          color={colors.feet}
          roughness={0.6}
          metalness={0}
        />
      </mesh>
      <mesh position={[0.15, -0.6, 0.2]} rotation={[0.1, 0, 0]} name="foot_right">
        <EllipsoidGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial
          color={colors.feet}
          roughness={0.6}
          metalness={0}
        />
      </mesh>

      {/* Dedos/garras */}
      <mesh position={[-0.15, -0.65, 0.28]} name="foot_left_claw">
        <coneGeometry args={[0.02, 0.08, 6]} />
        <meshStandardMaterial color={colors.feet} />
      </mesh>
      <mesh position={[0.15, -0.65, 0.28]} name="foot_right_claw">
        <coneGeometry args={[0.02, 0.08, 6]} />
        <meshStandardMaterial color={colors.feet} />
      </mesh>

      {/* Símbolo en el pecho para variante héroe */}
      {variant === 'hero' && (
        <mesh position={[0, 0.15, 0.5]} name="hero_symbol">
          <cylinderGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial
            color={new Color('#fbbf24')}
            emissive={new Color('#fbbf24')}
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}