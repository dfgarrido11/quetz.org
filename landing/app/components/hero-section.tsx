'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';

interface HeroSectionProps {
  onOpenModal: () => void;
}

export default function HeroSection({ onOpenModal }: HeroSectionProps) {
  const { t, isRTL } = useLanguage();

  return (
    <section id="inicio" className={`relative h-screen w-full overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0">
        <Image
          src="/photos/hero.jpg"
          alt="Paisaje de Zacapa, Guatemala"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
        {/* H1 - Título Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white max-w-5xl leading-tight"
        >
          {t('hero.title')}
        </motion.h1>

        {/* Subtítulo destacado */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-5 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-quetz-green max-w-3xl"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Claim de Impacto */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-4 text-base sm:text-lg md:text-xl text-white/90 font-medium max-w-2xl"
        >
          {t('hero.claim')}
        </motion.p>

        {/* Línea explicativa ultra clara */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-3 text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl leading-relaxed"
        >
          {t('hero.impact')}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8"
        >
          <button
            onClick={() => onOpenModal?.()}
            className="bg-quetz-red hover:bg-red-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-bold shadow-2xl hover:shadow-red-500/30 transition-all transform hover:scale-105"
          >
            {t('hero.cta')}
          </button>
        </motion.div>

        {/* Frase de Unión */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="mt-6 text-gray-300 text-sm sm:text-base italic"
        >
          &ldquo;{t('hero.tagline')}&rdquo;
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#arboles" className="animate-bounce block">
            <ChevronDown className="w-8 h-8 text-white/70" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
