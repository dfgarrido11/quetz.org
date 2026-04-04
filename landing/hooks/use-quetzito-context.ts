import { createContext, useContext, useCallback, useState, useEffect, MutableRefObject } from 'react';
import { QuetzitoCharacterEngine, CharacterState, EnvironmentContext } from '@/lib/quetzito/character-engine';
import type { Group } from 'three';

interface QuetzitoContextType {
  engine: QuetzitoCharacterEngine | null;
  currentState: CharacterState;
  environment: EnvironmentContext;
  isInitialized: boolean;

  // Actions
  setState: (state: CharacterState, duration?: number) => void;
  updateGaze: (mouseX: number, mouseY: number) => void;
  onScroll: (scrollDirection: 'up' | 'down', scrollY: number) => void;
  onHover: (isHovering: boolean) => void;
  onClick: () => void;
  updatePageSection: (section: 'hero' | 'trees' | 'chat' | 'other') => void;
  initializeEngine: (characterRef: MutableRefObject<Group | null>) => void;
}

const QuetzitoContext = createContext<QuetzitoContextType | null>(null);

export function useQuetzito() {
  const context = useContext(QuetzitoContext);
  if (!context) {
    throw new Error('useQuetzito must be used within a QuetzitoProvider');
  }
  return context;
}

// Hook for character state management
export function useQuetzitoState() {
  const [engine, setEngine] = useState<QuetzitoCharacterEngine | null>(null);
  const [currentState, setCurrentState] = useState<CharacterState>('idle');
  const [environment, setEnvironment] = useState<EnvironmentContext>({
    scrollY: 0,
    mouseX: 0,
    mouseY: 0,
    pageSection: 'other',
    isHovering: false,
    lastInteraction: Date.now(),
    deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the character engine
  const initializeEngine = useCallback((characterRef: MutableRefObject<Group | null>) => {
    if (engine) {
      engine.destroy();
    }

    const newEngine = new QuetzitoCharacterEngine(characterRef);
    setEngine(newEngine);

    // Initialize when character model is available
    if (characterRef.current) {
      newEngine.initializeCharacter(characterRef.current);
      setIsInitialized(true);
      console.log('✨ Quetzito engine initialized!');
    }
  }, [engine]);

  // Update character state
  const setState = useCallback((state: CharacterState, duration = 3) => {
    if (engine) {
      engine.setState(state, duration);
      setCurrentState(state);
    }
  }, [engine]);

  // Update gaze tracking
  const updateGaze = useCallback((mouseX: number, mouseY: number) => {
    if (engine) {
      engine.updateGaze(mouseX, mouseY);
      setEnvironment(prev => ({ ...prev, mouseX, mouseY }));
    }
  }, [engine]);

  // Handle scroll events
  const onScroll = useCallback((scrollDirection: 'up' | 'down', scrollY: number) => {
    if (engine) {
      engine.onScroll(scrollDirection, scrollY);
      setEnvironment(prev => ({ ...prev, scrollY }));
    }
  }, [engine]);

  // Handle hover events
  const onHover = useCallback((isHovering: boolean) => {
    setEnvironment(prev => ({ ...prev, isHovering }));

    if (engine && isHovering) {
      // Subtle pointing gesture when hovering important elements
      setState('pointing', 2);
    }
  }, [engine, setState]);

  // Handle click events
  const onClick = useCallback(() => {
    if (engine) {
      setState('celebrating', 1.5);
      setEnvironment(prev => ({ ...prev, lastInteraction: Date.now() }));
    }
  }, [engine, setState]);

  // Update page section
  const updatePageSection = useCallback((section: 'hero' | 'trees' | 'chat' | 'other') => {
    setEnvironment(prev => ({ ...prev, pageSection: section }));

    if (engine) {
      // Auto-switch character behavior based on page section
      switch (section) {
        case 'hero':
          setState('hero');
          break;
        case 'trees':
          setState('teacher');
          break;
        case 'chat':
          setState('chatting');
          break;
        default:
          setState('idle');
          break;
      }
    }
  }, [engine, setState]);

  // Update engine environment when environment state changes
  useEffect(() => {
    if (engine) {
      engine.updateEnvironment(environment);
    }
  }, [engine, environment]);

  // Listen for reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setEnvironment(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Cleanup engine on unmount
  useEffect(() => {
    return () => {
      if (engine) {
        engine.destroy();
      }
    };
  }, [engine]);

  return {
    engine,
    currentState,
    environment,
    isInitialized,
    setState,
    updateGaze,
    onScroll,
    onHover,
    onClick,
    updatePageSection,
    initializeEngine
  };
}

// Hook for scroll-based interactions
export function useQuetzitoScrollTrigger() {
  const { onScroll, updatePageSection } = useQuetzito();
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';

      onScroll(scrollDirection, scrollY);
      setLastScrollY(scrollY);

      // Determine page section based on scroll position
      const heroHeight = window.innerHeight;
      const treesHeight = heroHeight + 800;

      if (scrollY < heroHeight) {
        updatePageSection('hero');
      } else if (scrollY < treesHeight) {
        updatePageSection('trees');
      } else {
        updatePageSection('other');
      }
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [onScroll, updatePageSection, lastScrollY]);
}

// Hook for mouse tracking
export function useQuetzitoMouseTracking() {
  const { updateGaze } = useQuetzito();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateGaze(e.clientX, e.clientY);
    };

    // Throttle mouse events for performance
    let ticking = false;
    const throttledMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleMouseMove(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', throttledMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
    };
  }, [updateGaze]);
}

// Hook for intersection-based section detection
export function useQuetzitoIntersectionTrigger() {
  const { updatePageSection } = useQuetzito();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '-20% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const section = element.dataset.quetzitoSection as 'hero' | 'trees' | 'chat' | 'other';

          if (section) {
            updatePageSection(section);
          }
        }
      });
    }, observerOptions);

    // Observe sections with data-quetzito-section attribute
    const sections = document.querySelectorAll('[data-quetzito-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [updatePageSection]);
}

export { QuetzitoContext };
export type { QuetzitoContextType };