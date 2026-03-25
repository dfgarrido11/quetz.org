'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Euro, TreePine, Users, PiggyBank } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { formatCurrency, formatNumber, Language } from '@/lib/translations';

interface Stats {
  totalIncome: number;
  socialFund: number;
  treesPlanted: number;
  familiesHelped: number;
}

// Base exact values - SYNCHRONIZED with school-section.tsx
// Total Income = School Funding Base = 5,420.20 €
// Social Fund = 30% of Total Income = 1,626.06 €
const BASE_STATS = {
  totalIncome: 5420.20,
  socialFund: 1626.06,
  treesPlanted: 847,
  familiesHelped: 23,
};

interface CountUpNumberProps {
  target: number;
  isCurrency: boolean;
  inView: boolean;
  language: Language;
}

function CountUpNumber({ target, isCurrency, inView, language }: CountUpNumberProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
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

    return () => clearInterval(timer);
  }, [target, inView]);

  if (isCurrency) {
    return <span>{formatCurrency(count, language, true)}</span>;
  }
  return <span>{formatNumber(Math.floor(count), language)}</span>;
}

export default function TransparencySection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t, isRTL, language } = useLanguage();
  const [stats, setStats] = useState<Stats>(BASE_STATS);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        // The API already calculates totals including base stats from DB
        // Access data.stats which contains the correct values
        if (data.success && data.stats) {
          setStats({
            totalIncome: data.stats.totalIncome || BASE_STATS.totalIncome,
            socialFund: data.stats.socialFund || BASE_STATS.socialFund,
            treesPlanted: data.stats.treesPlanted || BASE_STATS.treesPlanted,
            familiesHelped: data.stats.familiesHelped || BASE_STATS.familiesHelped,
          });
        }
      })
      .catch(() => {
        // On error, keep BASE_STATS as fallback
      });
  }, []);

  const metrics = [
    { id: 'ingresos', label: t('transparency.totalIncome'), value: stats.totalIncome, isCurrency: true, icon: Euro },
    { id: 'fondo', label: t('transparency.socialFund'), value: stats.socialFund, isCurrency: true, icon: PiggyBank },
    { id: 'arboles', label: t('transparency.treesPlanted'), value: stats.treesPlanted, isCurrency: false, icon: TreePine },
    { id: 'familias', label: t('transparency.familiesHelped'), value: stats.familiesHelped, isCurrency: false, icon: Users },
  ];

  return (
    <section id="transparencia" className={`relative py-20 sm:py-28 overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0">
        <Image
          src="/photos/transparency.jpg"
          alt="Fondo de transparencia"
          fill
          className="object-cover blur-sm"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-quetz-cream/90" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            {t('transparency.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics?.map?.((metric, index) => {
            const IconComponent = metric?.icon;
            return (
              <motion.div
                key={metric?.id ?? index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-quetz-green/10 rounded-full mb-4 mx-auto">
                  {IconComponent && <IconComponent className="w-6 h-6 text-quetz-green" />}
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    <CountUpNumber
                      target={metric?.value ?? 0}
                      isCurrency={metric?.isCurrency ?? false}
                      inView={inView}
                      language={language}
                    />
                  </div>
                  <div className="mt-2 text-sm sm:text-base text-gray-600">
                    {metric?.label ?? ''}
                  </div>
                </div>
              </motion.div>
            );
          }) ?? null}
        </div>
      </div>
    </section>
  );
}
