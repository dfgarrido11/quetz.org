'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Gift, Heart, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';

export default function GiftTeaserSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t, isRTL } = useLanguage();

  return (
    <section className={`py-16 sm:py-20 bg-gradient-to-r from-pink-50 to-red-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className={`flex flex-col md:flex-row items-center gap-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Gift className="w-12 h-12 text-quetz-red" />
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 text-center md:${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center md:justify-start gap-2">
              {t('gift.title')}
              <Heart className="w-6 h-6 text-quetz-red inline" />
            </h2>
            <p className="text-gray-600 text-lg mb-0 md:mb-0">
              {t('gift.text')}
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <Link
              href="/regalar"
              className={`inline-flex items-center gap-2 bg-quetz-red text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span>{t('gift.cta')}</span>
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
