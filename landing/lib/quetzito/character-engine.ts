import { gsap } from 'gsap';
import { MutableRefObject } from 'react';
import type { Group, Object3D } from 'three';

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

export interface CharacterBehavior {
  name: string;
  duration: number;
  priority: number;
  canInterrupt: boolean;
  timeline: gsap.core.Timeline;
}

export class QuetzitoCharacterEngine {
  private characterRef: MutableRefObject<Group | null>;
  private currentState: CharacterState = 'idle';
  private activeTimelines: Map<string, gsap.core.Timeline> = new Map();
  private environment: EnvironmentContext;
  private lastBlinkTime = 0;
  private lastBreathTime = 0;
  private isPlaying = false;

  // Animation targets (will be set when character model loads)
  private animationTargets: {
    head?: Object3D;
    body?: Object3D;
    tail?: Object3D;
    rightWing?: Object3D;
    leftWing?: Object3D;
    eyes?: Object3D;
    beak?: Object3D;
  } = {};

  constructor(characterRef: MutableRefObject<Group | null>) {
    this.characterRef = characterRef;
    this.environment = this.getDefaultEnvironment();
    this.setupPerformanceOptimization();
  }

  // Initialize character animation targets from 3D model
  public initializeCharacter(character: Group) {
    console.log('🎬 Inicializando Quetzito Character Engine...');

    // Map bone names to animation targets (will adapt to actual model structure)
    this.animationTargets.head = character.children.find(child =>
      child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('cabeza')
    );
    this.animationTargets.body = character.children.find(child =>
      child.name.toLowerCase().includes('body') || child.name.toLowerCase().includes('cuerpo')
    );
    this.animationTargets.tail = character.children.find(child =>
      child.name.toLowerCase().includes('tail') || child.name.toLowerCase().includes('cola')
    );
    this.animationTargets.rightWing = character.children.find(child =>
      child.name.toLowerCase().includes('wing_r') || child.name.toLowerCase().includes('wing_right')
    );
    this.animationTargets.leftWing = character.children.find(child =>
      child.name.toLowerCase().includes('wing_l') || child.name.toLowerCase().includes('wing_left')
    );

    // Fallback to root character if specific bones not found
    const fallbackTarget = character;
    this.animationTargets.head = this.animationTargets.head || fallbackTarget;
    this.animationTargets.body = this.animationTargets.body || fallbackTarget;
    this.animationTargets.tail = this.animationTargets.tail || fallbackTarget;

    this.startLifeAnimations();
    console.log('✨ Quetzito está vivo!');
  }

  // Start essential life animations (breathing, blinking, micro-movements)
  private startLifeAnimations() {
    this.isPlaying = true;
    this.startBreathingCycle();
    this.startBlinkingCycle();
    this.startIdleMicroMovements();
  }

  // Breathing animation - subtle chest rise and fall
  private startBreathingCycle() {
    if (!this.animationTargets.body || this.environment.reducedMotion) return;

    const breathTl = gsap.timeline({ repeat: -1, yoyo: true });

    breathTl
      .to(this.animationTargets.body.scale, {
        duration: 2,
        y: 1.02,
        z: 1.01,
        ease: "sine.inOut"
      })
      .to(this.animationTargets.body.position, {
        duration: 2,
        y: 0.01,
        ease: "sine.inOut"
      }, 0);

    this.activeTimelines.set('breathing', breathTl);
  }

  // Realistic blinking pattern
  private startBlinkingCycle() {
    const scheduleBlink = () => {
      if (!this.isPlaying || this.environment.reducedMotion) {
        setTimeout(scheduleBlink, 1000);
        return;
      }

      const blinkInterval = gsap.utils.random(2000, 6000); // 2-6 seconds between blinks

      setTimeout(() => {
        this.performBlink();
        scheduleBlink();
      }, blinkInterval);
    };

    scheduleBlink();
  }

  private performBlink() {
    if (!this.animationTargets.head) return;

    const blinkTl = gsap.timeline();

    // Quick blink animation - scale eyes down and up
    blinkTl
      .to(this.animationTargets.head.scale, {
        duration: 0.1,
        y: 0.1,
        ease: "power2.out"
      })
      .to(this.animationTargets.head.scale, {
        duration: 0.1,
        y: 1,
        ease: "power2.out"
      });
  }

  // Idle micro-movements for natural feel
  private startIdleMicroMovements() {
    if (!this.animationTargets.head || this.environment.reducedMotion) return;

    // Random subtle head movements
    const microMoveTl = gsap.timeline({ repeat: -1 });

    microMoveTl
      .to(this.animationTargets.head.rotation, {
        duration: gsap.utils.random(3, 5),
        x: gsap.utils.random(-0.1, 0.1),
        y: gsap.utils.random(-0.1, 0.1),
        z: gsap.utils.random(-0.05, 0.05),
        ease: "sine.inOut"
      })
      .to(this.animationTargets.head.rotation, {
        duration: gsap.utils.random(2, 4),
        x: gsap.utils.random(-0.05, 0.05),
        y: gsap.utils.random(-0.08, 0.08),
        z: gsap.utils.random(-0.03, 0.03),
        ease: "sine.inOut"
      });

    // Tail sway if available
    if (this.animationTargets.tail) {
      const tailTl = gsap.timeline({ repeat: -1, yoyo: true });
      tailTl.to(this.animationTargets.tail.rotation, {
        duration: 4,
        z: gsap.utils.random(-0.2, 0.2),
        ease: "sine.inOut"
      });
      this.activeTimelines.set('tailSway', tailTl);
    }

    this.activeTimelines.set('microMovements', microMoveTl);
  }

  // Change character behavior based on context
  public setState(newState: CharacterState, duration = 3) {
    if (this.currentState === newState) return;

    console.log(`🎭 Quetzito: ${this.currentState} -> ${newState}`);

    // Stop current state animations
    this.stopStateAnimations();
    this.currentState = newState;

    // Start new state animations
    switch (newState) {
      case 'hero':
        this.playHeroPose(duration);
        break;
      case 'teacher':
        this.playTeacherPose(duration);
        break;
      case 'chatting':
        this.playChatPose(duration);
        break;
      case 'pointing':
        this.playPointingGesture(duration);
        break;
      case 'celebrating':
        this.playCelebration(duration);
        break;
      case 'idle':
      default:
        this.playIdlePose();
        break;
    }
  }

  // Hero section pose - confident and welcoming
  private playHeroPose(duration: number) {
    if (!this.animationTargets.body) return;

    const heroTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    heroTl
      .to(this.animationTargets.body.rotation, {
        duration: 0.8,
        y: -0.1,
        x: 0.05,
        ease: "power2.out"
      })
      .to(this.animationTargets.body.position, {
        duration: 0.8,
        y: 0.1,
        ease: "power2.out"
      }, 0)
      .to(this.animationTargets.body.rotation, {
        duration: 1.5,
        y: 0.1,
        ease: "sine.inOut"
      })
      .to(this.animationTargets.body.rotation, {
        duration: 0.8,
        y: 0,
        x: 0,
        ease: "power2.in"
      })
      .to(this.animationTargets.body.position, {
        duration: 0.8,
        y: 0,
        ease: "power2.in"
      }, "-=0.8");

    this.activeTimelines.set('statePose', heroTl);
  }

  // Teacher pose - explanatory and engaging
  private playTeacherPose(duration: number) {
    if (!this.animationTargets.head || !this.animationTargets.body) return;

    const teacherTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    // Nodding motion
    teacherTl
      .to(this.animationTargets.head.rotation, {
        duration: 0.5,
        x: 0.15,
        ease: "power2.out"
      })
      .to(this.animationTargets.head.rotation, {
        duration: 0.5,
        x: -0.05,
        ease: "power2.out"
      })
      .to(this.animationTargets.head.rotation, {
        duration: 0.5,
        x: 0.1,
        ease: "power2.out"
      })
      .to(this.animationTargets.head.rotation, {
        duration: 0.5,
        x: 0,
        ease: "power2.in"
      });

    this.activeTimelines.set('statePose', teacherTl);
  }

  // Chat pose - active listening
  private playChatPose(duration: number) {
    if (!this.animationTargets.head) return;

    const chatTl = gsap.timeline({ repeat: -1, yoyo: true });

    chatTl.to(this.animationTargets.head.rotation, {
      duration: 1.5,
      z: 0.1,
      y: 0.05,
      ease: "sine.inOut"
    });

    this.activeTimelines.set('statePose', chatTl);
  }

  // Pointing gesture
  private playPointingGesture(duration: number) {
    if (!this.animationTargets.rightWing && !this.animationTargets.body) return;

    const target = this.animationTargets.rightWing || this.animationTargets.body;
    const pointTl = gsap.timeline();

    pointTl
      .to(target.rotation, {
        duration: 0.3,
        z: -0.5,
        ease: "power2.out"
      })
      .to(target.rotation, {
        duration: 0.5,
        z: -0.7,
        ease: "sine.inOut"
      })
      .to(target.rotation, {
        duration: 0.8,
        z: 0,
        ease: "power2.in",
        delay: duration - 1.6
      });

    this.activeTimelines.set('statePose', pointTl);
  }

  // Celebration animation
  private playCelebration(duration: number) {
    if (!this.animationTargets.body) return;

    const celebrateTl = gsap.timeline();

    celebrateTl
      .to(this.animationTargets.body.rotation, {
        duration: 0.2,
        z: 0.3,
        ease: "power2.out"
      })
      .to(this.animationTargets.body.position, {
        duration: 0.2,
        y: 0.3,
        ease: "power2.out"
      }, 0)
      .to(this.animationTargets.body.rotation, {
        duration: 0.2,
        z: -0.3,
        ease: "power2.inOut"
      })
      .to(this.animationTargets.body.rotation, {
        duration: 0.2,
        z: 0.2,
        ease: "power2.inOut"
      })
      .to(this.animationTargets.body.rotation, {
        duration: 0.4,
        z: 0,
        ease: "back.out(1.7)"
      })
      .to(this.animationTargets.body.position, {
        duration: 0.4,
        y: 0,
        ease: "bounce.out"
      }, "-=0.4");

    this.activeTimelines.set('statePose', celebrateTl);
  }

  // Return to idle state
  private playIdlePose() {
    // Idle is handled by the life animations
    // Just ensure no state-specific animations are running
  }

  // Mouse gaze tracking
  public updateGaze(mouseX: number, mouseY: number) {
    if (!this.animationTargets.head || this.environment.reducedMotion) return;

    const normalizedX = (mouseX - window.innerWidth / 2) / window.innerWidth;
    const normalizedY = (mouseY - window.innerHeight / 2) / window.innerHeight;

    // Subtle head movement following mouse
    gsap.to(this.animationTargets.head.rotation, {
      duration: 1.5,
      y: normalizedX * 0.1,
      x: -normalizedY * 0.05,
      ease: "power2.out",
      overwrite: "auto"
    });
  }

  // Scroll reaction
  public onScroll(scrollDirection: 'up' | 'down', scrollY: number) {
    this.environment.scrollY = scrollY;

    if (!this.animationTargets.head || this.environment.reducedMotion) return;

    // Look in scroll direction
    const headTilt = scrollDirection === 'down' ? 0.08 : -0.08;

    gsap.to(this.animationTargets.head.rotation, {
      duration: 0.5,
      x: headTilt,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(this.animationTargets.head.rotation, {
          duration: 1,
          x: 0,
          ease: "power2.out"
        });
      }
    });
  }

  // Update environment context
  public updateEnvironment(newEnvironment: Partial<EnvironmentContext>) {
    this.environment = { ...this.environment, ...newEnvironment };

    // Adapt performance based on device
    if (newEnvironment.reducedMotion !== undefined) {
      if (newEnvironment.reducedMotion) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    }
  }

  // Performance optimization
  private setupPerformanceOptimization() {
    // Check device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency < 4 ||
                          window.innerWidth < 768;

    // Adjust animation frequency based on device
    if (isLowEndDevice) {
      this.environment.deviceType = 'mobile';
      // Reduce animation frequency for mobile
    } else {
      this.environment.deviceType = 'desktop';
    }
  }

  // Stop state-specific animations
  private stopStateAnimations() {
    const stateTl = this.activeTimelines.get('statePose');
    if (stateTl) {
      stateTl.kill();
      this.activeTimelines.delete('statePose');
    }
  }

  // Pause all animations
  private pauseAnimations() {
    this.isPlaying = false;
    this.activeTimelines.forEach(tl => tl.pause());
  }

  // Resume all animations
  private resumeAnimations() {
    this.isPlaying = true;
    this.activeTimelines.forEach(tl => tl.play());
  }

  // Cleanup
  public destroy() {
    console.log('🔄 Destruyendo Quetzito Character Engine...');
    this.isPlaying = false;
    this.activeTimelines.forEach(tl => tl.kill());
    this.activeTimelines.clear();
  }

  // Default environment
  private getDefaultEnvironment(): EnvironmentContext {
    return {
      scrollY: 0,
      mouseX: 0,
      mouseY: 0,
      pageSection: 'other',
      isHovering: false,
      lastInteraction: Date.now(),
      deviceType: 'desktop',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }
}