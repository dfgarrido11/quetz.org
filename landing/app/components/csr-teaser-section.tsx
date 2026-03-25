'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building2, ArrowRight, Users, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';

export default function CsrTeaserSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t, isRTL } = useLanguage();

  return (
    <section className={`py-16 sm:py-20 bg-gradient-to-r from-blue-50 to-indigo-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className={`flex flex-col md:flex-row items-center gap-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center relative">
              <Building2 className="w-12 h-12 text-quetz-blue" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-quetz-green flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 text-center md:${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {t('csr.title')}
            </h2>
            <p className="text-gray-600 text-lg mb-0 md:mb-0">
              {t('csr.text')}
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <Link
              href="/empresas"
              className={`inline-flex items-center gap-2 bg-quetz-blue text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span>{t('csr.cta')}</span>
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
