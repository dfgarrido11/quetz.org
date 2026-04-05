import { createContext, useContext } from 'react';

// Simplified types for immediate compatibility
export type CharacterState = 'idle' | 'hero' | 'teacher' | 'chatting' | 'pointing' | 'celebrating';

export type EnvironmentContext = {
  scrollY: number;
  mouseX: number;
  mouseY: number;
  pageSection: 'hero' | 'trees' | 'chat' | 'other';
  isHovering: boolean;
  lastInteraction: number;
  deviceType: 'mobile' | 'desktop';
  reducedMotion: boolean;
};

interface QuetzitoContextType {
  engine: any;
  currentState: CharacterState;
  environment: EnvironmentContext;
  isInitialized: boolean;

  // Actions - simplified to prevent errors
  setState: (state: CharacterState, duration?: number) => void;
  updateGaze: (mouseX: number, mouseY: number) => void;
  onScroll: (scrollDirection: 'up' | 'down', scrollY: number) => void;
  onHover: (isHovering: boolean) => void;
  onClick: () => void;
  updatePageSection: (section: 'hero' | 'trees' | 'chat' | 'other') => void;
  initializeEngine: (characterRef: any) => void;
}

const QuetzitoContext = createContext<QuetzitoContextType | null>(null);

export function useQuetzito() {
  const context = useContext(QuetzitoContext);
  if (!context) {
    // Return safe defaults instead of throwing error
    return {
      engine: null,
      currentState: 'idle' as CharacterState,
      environment: {
        scrollY: 0,
        mouseX: 0,
        mouseY: 0,
        pageSection: 'other' as const,
        isHovering: false,
        lastInteraction: Date.now(),
        deviceType: 'desktop' as const,
        reducedMotion: false
      },
      isInitialized: false,
      setState: () => {},
      updateGaze: () => {},
      onScroll: () => {},
      onHover: () => {},
      onClick: () => {},
      updatePageSection: () => {},
      initializeEngine: () => {}
    };
  }
  return context;
}

// Simplified hook that always works
export function useQuetzitoState() {
  return {
    engine: null,
    currentState: 'idle' as CharacterState,
    environment: {
      scrollY: 0,
      mouseX: 0,
      mouseY: 0,
      pageSection: 'other' as const,
      isHovering: false,
      lastInteraction: Date.now(),
      deviceType: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
      reducedMotion: typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
    },
    isInitialized: false,
    setState: () => {},
    updateGaze: () => {},
    onScroll: () => {},
    onHover: () => {},
    onClick: () => {},
    updatePageSection: () => {},
    initializeEngine: () => {}
  };
}

// Safe hooks that don't cause errors
export function useQuetzitoScrollTrigger() {
  // Empty implementation for now
}

export function useQuetzitoMouseTracking() {
  // Empty implementation for now
}

export function useQuetzitoIntersectionTrigger() {
  // Empty implementation for now
}

export { QuetzitoContext };
export type { QuetzitoContextType };