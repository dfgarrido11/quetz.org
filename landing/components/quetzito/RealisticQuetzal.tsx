'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Color, Vector3 } from 'three';

interface RealisticQuetzalProps {
  position?: [number, number, number];
  scale?: number;
  isActive?: boolean;
}

export function RealisticQuetzal({ position = [0, 0, 0], scale = 1, isActive = true }: RealisticQuetzalProps) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const leftEyeRef = useRef<Mesh>(null);
  const rightEyeRef = useRef<Mesh>(null);
  const tailRef = useRef<Mesh>(null);
  const leftWingRef = useRef<Mesh>(null);
  const rightWingRef = useRef<Mesh>(null);

  // Animation state
  const [breathPhase, setBreathPhase] = useState(0);
  const [lastBlink, setLastBlink] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Colors - Realistic Quetzal colors
  const quetzalGreen = new Color('#0d4f3c'); // Deep emerald green
  const brightGreen = new Color('#22c55e'); // Bright accent green
  const goldenYellow = new Color('#f59e0b'); // Golden belly
  const crimsonRed = new Color('#dc2626'); // Crimson chest
  const deepBlue = new Color('#1e40af'); // Blue-black head
  const beakOrange = new Color('#ea580c'); // Beak color
  const eyeBlack = new Color('#000000'); // Eye color

  // Mouse tracking
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

  // Animation loop
  useFrame((state) => {
    if (!isActive || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // === BREATHING ANIMATION ===
    const breathCycle = Math.sin(time * 0.8) * 0.015 + 1; // Slower, more natural breathing
    if (bodyRef.current) {
      bodyRef.current.scale.set(1, breathCycle, 1.02 + Math.sin(time * 0.8) * 0.01);
    }

    // === BLINKING SYSTEM ===
    const timeSinceLastBlink = time - lastBlink;
    if (timeSinceLastBlink > 3 + Math.random() * 4 && !isBlinking) { // Random blink every 3-7 seconds
      setIsBlinking(true);
      setLastBlink(time);

      // Blink animation
      setTimeout(() => setIsBlinking(false), 150); // Quick blink
    }

    // Apply blink scaling
    const blinkScale = isBlinking ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.setY(blinkScale);
    if (rightEyeRef.current) rightEyeRef.current.scale.setY(blinkScale);

    // === EYE TRACKING ===
    const gazeStrength = 0.3; // How much the eyes follow mouse
    const eyeTargetX = mousePosition.x * gazeStrength;
    const eyeTargetY = mousePosition.y * gazeStrength * 0.5; // Less vertical movement

    if (leftEyeRef.current) {
      leftEyeRef.current.position.x = -0.18 + eyeTargetX * 0.1;
      leftEyeRef.current.position.z = 0.75 + eyeTargetY * 0.05;
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.position.x = 0.18 + eyeTargetX * 0.1;
      rightEyeRef.current.position.z = 0.75 + eyeTargetY * 0.05;
    }

    // === HEAD MOVEMENT ===
    if (headRef.current) {
      const headBob = Math.sin(time * 1.2) * 0.02;
      const headTilt = Math.sin(time * 0.6) * 0.05;
      const gazeRotationY = eyeTargetX * 0.1;
      const gazeRotationX = -eyeTargetY * 0.05;

      headRef.current.position.y = 1.5 + headBob;
      headRef.current.rotation.set(headTilt + gazeRotationX, gazeRotationY, headBob * 0.5);
    }

    // === MICRO MOVEMENTS ===
    // Subtle body sway
    if (groupRef.current) {
      const sway = Math.sin(time * 0.5) * 0.01;
      groupRef.current.rotation.z = sway;
      groupRef.current.position.y = position[1] + Math.sin(time * 0.7) * 0.03; // Very subtle float
    }

    // Tail sway
    if (tailRef.current) {
      const tailSway = Math.sin(time * 0.8) * 0.15;
      tailRef.current.rotation.z = tailSway;
    }

    // Wing flutter (subtle)
    const wingFlutter = Math.sin(time * 1.5) * 0.03;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = -0.2 + wingFlutter;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = 0.2 - wingFlutter;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* BODY - Main torso */}
      <mesh ref={bodyRef} position={[0, 0, 0]} name="body">
        <ellipsoidGeometry args={[0.6, 0.9, 0.5]} />
        <meshStandardMaterial
          color={quetzalGreen}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* CHEST - Crimson red chest patch */}
      <mesh position={[0, 0.2, 0.4]} name="chest">
        <ellipsoidGeometry args={[0.35, 0.4, 0.2]} />
        <meshStandardMaterial
          color={crimsonRed}
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>

      {/* BELLY - Golden yellow belly */}
      <mesh position={[0, -0.3, 0.3]} name="belly">
        <ellipsoidGeometry args={[0.4, 0.3, 0.25]} />
        <meshStandardMaterial
          color={goldenYellow}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* HEAD - With realistic proportions */}
      <mesh ref={headRef} position={[0, 1.5, 0.1]} name="head">
        <ellipsoidGeometry args={[0.45, 0.42, 0.48]} />
        <meshStandardMaterial
          color={deepBlue}
          roughness={0.2}
          metalness={0.15}
        />
      </mesh>

      {/* Head crest - Distinctive quetzal feature */}
      <mesh position={[0, 1.9, 0]} name="crest">
        <ellipsoidGeometry args={[0.15, 0.25, 0.1]} />
        <meshStandardMaterial
          color={brightGreen}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* EYES - Large, expressive eyes */}
      <mesh ref={leftEyeRef} position={[-0.18, 1.65, 0.75]} name="left_eye">
        <sphereGeometry args={[0.08, 12, 8]} />
        <meshStandardMaterial
          color={eyeBlack}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.18, 1.65, 0.75]} name="right_eye">
        <sphereGeometry args={[0.08, 12, 8]} />
        <meshStandardMaterial
          color={eyeBlack}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Eye shine - Makes eyes look alive */}
      <mesh position={[-0.16, 1.68, 0.78]} name="left_eye_shine">
        <sphereGeometry args={[0.02, 8, 6]} />
        <meshStandardMaterial
          color={new Color('#ffffff')}
          roughness={0}
          metalness={0}
          emissive={new Color('#ffffff')}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.20, 1.68, 0.78]} name="right_eye_shine">
        <sphereGeometry args={[0.02, 8, 6]} />
        <meshStandardMaterial
          color={new Color('#ffffff')}
          roughness={0}
          metalness={0}
          emissive={new Color('#ffffff')}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* BEAK - Prominent, realistic beak */}
      <mesh position={[0, 1.4, 0.95]} rotation={[0.1, 0, 0]} name="beak">
        <coneGeometry args={[0.08, 0.35, 8]} />
        <meshStandardMaterial
          color={beakOrange}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* WINGS - Detailed wings with proper anatomy */}
      <mesh ref={leftWingRef} position={[-0.8, 0.3, 0]} rotation={[0, 0, -0.2]} name="wing_left">
        <ellipsoidGeometry args={[0.25, 0.7, 0.08]} />
        <meshStandardMaterial
          color={brightGreen}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh ref={rightWingRef} position={[0.8, 0.3, 0]} rotation={[0, 0, 0.2]} name="wing_right">
        <ellipsoidGeometry args={[0.25, 0.7, 0.08]} />
        <meshStandardMaterial
          color={brightGreen}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Wing tips - Secondary feathers */}
      <mesh position={[-1.1, 0.1, 0]} rotation={[0, 0, -0.3]} name="wing_tip_left">
        <ellipsoidGeometry args={[0.15, 0.4, 0.05]} />
        <meshStandardMaterial
          color={deepBlue}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[1.1, 0.1, 0]} rotation={[0, 0, 0.3]} name="wing_tip_right">
        <ellipsoidGeometry args={[0.15, 0.4, 0.05]} />
        <meshStandardMaterial
          color={deepBlue}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* TAIL - Long, majestic quetzal tail */}
      <mesh ref={tailRef} position={[0, -1.1, -0.4]} rotation={[0.2, 0, 0]} name="tail_base">
        <ellipsoidGeometry args={[0.15, 0.8, 0.1]} />
        <meshStandardMaterial
          color={quetzalGreen}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Long tail feathers - Signature quetzal feature */}
      <mesh position={[0, -2.2, -0.2]} rotation={[0.15, 0, 0]} name="tail_feathers_long">
        <ellipsoidGeometry args={[0.08, 1.2, 0.06]} />
        <meshStandardMaterial
          color={brightGreen}
          roughness={0.2}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[-0.1, -2.4, -0.1]} rotation={[0.1, 0.1, 0]} name="tail_feather_left">
        <ellipsoidGeometry args={[0.06, 1.0, 0.04]} />
        <meshStandardMaterial
          color={goldenYellow}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.1, -2.4, -0.1]} rotation={[0.1, -0.1, 0]} name="tail_feather_right">
        <ellipsoidGeometry args={[0.06, 1.0, 0.04]} />
        <meshStandardMaterial
          color={goldenYellow}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {/* FEET - Small realistic feet */}
      <mesh position={[-0.2, -0.9, 0.3]} rotation={[0, 0, 0]} name="foot_left">
        <ellipsoidGeometry args={[0.08, 0.05, 0.15]} />
        <meshStandardMaterial
          color={beakOrange}
          roughness={0.6}
          metalness={0}
        />
      </mesh>
      <mesh position={[0.2, -0.9, 0.3]} rotation={[0, 0, 0]} name="foot_right">
        <ellipsoidGeometry args={[0.08, 0.05, 0.15]} />
        <meshStandardMaterial
          color={beakOrange}
          roughness={0.6}
          metalness={0}
        />
      </mesh>
    </group>
  );
}