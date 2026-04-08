'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';

// ─── Sprite States ────────────────────────────────────────────────────────────
type QuetzitoState = 'idle' | 'wave' | 'walk' | 'point' | 'celebrate' | 'sleep';

const SPRITES: Record<QuetzitoState, string> = {
  idle: '/mascot/sprites/idle.png',
  wave: '/mascot/sprites/wave.png',
  walk: '/mascot/sprites/walk_right.png',
  point: '/mascot/sprites/point.png',
  celebrate: '/mascot/sprites/celebrate.png',
  sleep: '/mascot/sprites/idle.png', // reuse idle with opacity
};

// ─── Section Messages (German) ────────────────────────────────────────────────
const SECTION_MESSAGES: Record<string, { message: string; state: QuetzitoState }> = {
  hero: { message: 'Willkommen bei Quetz! 🌿', state: 'wave' },
  arboles: { message: 'Wähle deinen Baum! 🌳', state: 'point' },
  planes: { message: 'Finde deinen Plan! 📋', state: 'point' },
  escuela: { message: '120 Kinder brauchen dich! 🏫', state: 'wave' },
  transparencia: { message: '100% transparent! ✨', state: 'idle' },
  tienda: { message: 'Schau dir unseren Shop an! 🛍️', state: 'point' },
};

// ─── Idle Behaviors ───────────────────────────────────────────────────────────
const IDLE_MESSAGES = [
  'Hallo! Ich bin Quetzito! 🌿',
  'Wusstest du? Ein Baum absorbiert 22 kg CO₂ pro Jahr!',
  'Klick mich an! 😊',
  'Zusammen machen wir Guatemala grüner!',
  'Jeder Baum zählt! 🌱',
];

export default function DisneyQuetzito() {
  const [state, setState] = useState<QuetzitoState>('idle');
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [currentSection, setCurrentSection] = useState('hero');
  const [isSleeping, setIsSleeping] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageIndexRef = useRef(0);

  // Position with spring physics
  const x = useMotionValue(60);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 20 });
  const springY = useSpring(y, { stiffness: 100, damping: 20 });

  // ─── Entrance Animation ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setState('wave');
      setMessage('Willkommen bei Quetz! 🌿');
      setShowBubble(true);
      setTimeout(() => {
        setShowBubble(false);
        setState('idle');
      }, 3500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ─── Scroll Section Detection ────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'arboles', 'planes', 'escuela', 'transparencia', 'tienda'];
      let found = 'hero';

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            found = id;
            break;
          }
        }
      }

      if (found !== currentSection) {
        setCurrentSection(found);
        const sectionData = SECTION_MESSAGES[found];
        if (sectionData) {
          setState(sectionData.state);
          setMessage(sectionData.message);
          setShowBubble(true);
          setIsSleeping(false);
          setTimeout(() => {
            setShowBubble(false);
            setState('idle');
          }, 3000);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSection]);

  // ─── Idle Timer & Sleep ──────────────────────────────────────────────────
  useEffect(() => {
    if (state === 'idle' && !showBubble) {
      // Random idle message every 15-25 seconds
      idleTimerRef.current = setTimeout(() => {
        const msg = IDLE_MESSAGES[messageIndexRef.current % IDLE_MESSAGES.length];
        messageIndexRef.current++;
        setMessage(msg);
        setShowBubble(true);
        setState('wave');
        setTimeout(() => {
          setShowBubble(false);
          setState('idle');
        }, 4000);
      }, 15000 + Math.random() * 10000);

      // Sleep after 45 seconds of no interaction
      sleepTimerRef.current = setTimeout(() => {
        setIsSleeping(true);
        setState('sleep');
      }, 45000);
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [state, showBubble]);

  // ─── Click Handler ───────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    setIsSleeping(false);
    setState('celebrate');
    setMessage('Du bist toll! 🎉');
    setShowBubble(true);
    setTimeout(() => {
      setShowBubble(false);
      setState('idle');
    }, 3000);
  }, []);

  // ─── Cart Event Listener ─────────────────────────────────────────────────
  useEffect(() => {
    const handleCartAdd = () => {
      setState('celebrate');
      setMessage('Fantastisch! Danke! 🌳🎉');
      setShowBubble(true);
      setTimeout(() => {
        setShowBubble(false);
        setState('idle');
      }, 4000);
    };

    window.addEventListener('quetzito:celebrate', handleCartAdd);
    return () => window.removeEventListener('quetzito:celebrate', handleCartAdd);
  }, []);

  // ─── Mouse Follow (subtle) ──────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isSleeping) return;
      const windowWidth = window.innerWidth;
      // Quetzito subtly leans toward mouse
      const mouseRatio = e.clientX / windowWidth;
      setFacingRight(e.clientX > windowWidth / 2);
      // Subtle horizontal shift based on mouse position
      x.set(40 + mouseRatio * 40);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isSleeping, x]);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.3 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
          className="fixed bottom-4 z-50 pointer-events-none"
          style={{ left: springX, right: 'auto' }}
        >
          <div className="pointer-events-auto relative">
            {/* Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-30 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Quetzito ausblenden"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Speech Bubble */}
            <AnimatePresence>
              {showBubble && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 10 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-4 py-2.5 whitespace-nowrap z-20 border border-green-100"
                >
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-green-100 transform rotate-45" />
                  <p className="text-sm font-medium text-gray-800 relative z-10">{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quetzito Character */}
            <motion.div
              onClick={handleClick}
              className="cursor-pointer relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={
                isSleeping
                  ? { rotate: [0, -5, 0, 5, 0], transition: { duration: 3, repeat: Infinity } }
                  : state === 'idle'
                  ? {
                      y: [0, -6, 0],
                      rotate: [-1, 1, -1],
                      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    }
                  : state === 'celebrate'
                  ? {
                      y: [0, -20, 0],
                      rotate: [-5, 5, -5, 5, 0],
                      scale: [1, 1.15, 1],
                      transition: { duration: 0.6, repeat: 3 },
                    }
                  : state === 'wave'
                  ? {
                      rotate: [-3, 3, -3],
                      transition: { duration: 0.5, repeat: 4 },
                    }
                  : {}
              }
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-green-400/20 blur-xl scale-150" />

              {/* Shadow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/10 rounded-full blur-sm" />

              {/* Character sprite */}
              <div
                className="relative w-20 h-20 md:w-24 md:h-24"
                style={{ transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)' }}
              >
                <Image
                  src={SPRITES[state]}
                  alt="Quetzito"
                  fill
                  className={`object-contain drop-shadow-lg transition-opacity duration-500 ${
                    isSleeping ? 'opacity-60' : 'opacity-100'
                  }`}
                  sizes="(max-width: 768px) 80px, 96px"
                  priority
                />

                {/* Sleep ZZZ */}
                {isSleeping && (
                  <motion.div
                    className="absolute -top-4 -right-2 text-lg font-bold text-green-600/60"
                    animate={{
                      opacity: [0, 1, 0],
                      y: [0, -10, -20],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    💤
                  </motion.div>
                )}
              </div>

              {/* Sparkle particles when celebrating */}
              {state === 'celebrate' && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: ['#E9C46A', '#2D6A4F', '#E76F51', '#52B788', '#F4A261', '#264653'][i],
                        top: '50%',
                        left: '50%',
                      }}
                      animate={{
                        x: [0, (Math.random() - 0.5) * 80],
                        y: [0, -40 - Math.random() * 40],
                        opacity: [1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        repeat: 2,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
