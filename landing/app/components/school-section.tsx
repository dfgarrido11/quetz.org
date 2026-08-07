'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { School, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { formatCurrency, Language } from '@/lib/translations';
import type { ImpactStats } from '@/lib/impact-stats';

function CountUpNumber({ target, language }: { target: number; language: Language }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  // Starts at `target` so the real figure is in the server HTML, never 0.
  const [count, setCount] = useState(target);
  const hasAnimated = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || shouldReduceMotion || hasAnimated.current) {
      setCount(target);
      return;
    }
    hasAnimated.current = true;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => {
      clearInterval(timer);
      setCount(target);
    };
  }, [target, inView, shouldReduceMotion]);

  return <span ref={ref}>{formatCurrency(count, language, true)}</span>;
}

interface SchoolSectionProps {
  stats: ImpactStats;
  onOpenDonation?: () => void;
}

export default function SchoolSection({ stats, onOpenDonation }: SchoolSectionProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t, isRTL, language } = useLanguage();

  // Server-provided; `getImpactStats` already guarantees non-zero values.
  const currentAmount = stats.schoolRaised;
  const goalAmount = stats.schoolGoal;
  const progress = stats.schoolProgress;

  // Split school title for styling
  const schoolTitle = t('school.title');
  const titleParts = schoolTitle.split('.');
  const mainPart = titleParts.slice(0, 2).join('.') + '.';
  const highlightPart = titleParts.slice(2).join('.').trim();

  return (
    <section id="escuela" className={`relative py-20 sm:py-28 overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0">
        <Image
          src="/photos/school.jpg"
          alt={t('school.imageAlt')}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>


      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className={`flex items-center justify-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <School className="w-6 h-6 text-white" />
            <span className="text-white/80 font-semibold text-sm uppercase tracking-wider">Proyecto Escuela</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            {mainPart}
            <br />
            <span className="text-quetz-green">{highlightPart}</span>
          </h2>

          {/* Context paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-gray-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {t('school.context')}
          </motion.p>

          {/* Donation info */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-4 text-quetz-green text-sm sm:text-base font-medium max-w-2xl mx-auto"
          >
            💡 {t('school.donationInfo')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8"
          >
            <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-white font-medium">{t('miBosque.progress')}</span>
              <span className="text-quetz-green font-bold">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              {/* width is set inline so the bar is correct in the server HTML too */}
              <div
                style={{ width: `${progress}%` }}
                className={`bg-gradient-to-r ${isRTL ? 'from-green-400 to-quetz-green' : 'from-quetz-green to-green-400'} h-full rounded-full transition-[width] duration-1000 ease-out`}
              />
            </div>
            <div className={`flex items-center justify-between mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <span className="text-gray-300 text-sm">{t('school.raised')}</span>
                <span className="text-2xl sm:text-3xl font-bold text-white block">
                  <CountUpNumber target={currentAmount} language={language} />
                </span>
              </div>
              <div className={isRTL ? 'text-left' : 'text-right'}>
                <span className="text-gray-300 text-sm">{t('school.goal')}</span>
                <span className="text-xl font-semibold text-gray-200 block">
                  {formatCurrency(goalAmount, language, false)}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <button
              onClick={() => onOpenDonation?.()}
              className={`inline-flex items-center gap-2 bg-quetz-red hover:bg-red-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-bold shadow-2xl hover:shadow-red-500/30 transition-all transform hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Heart className="w-5 h-5" />
              {t('school.cta')}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
