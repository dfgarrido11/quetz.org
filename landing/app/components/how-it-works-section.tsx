'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ListChecks, TreePine, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function HowItWorksSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t, isRTL } = useLanguage();

  const steps = [
    {
      icon: ListChecks,
      title: t('howItWorks.step1.title'),
      text: t('howItWorks.step1.text'),
      color: 'quetz-green',
      number: '01',
    },
    {
      icon: TreePine,
      title: t('howItWorks.step2.title'),
      text: t('howItWorks.step2.text'),
      color: 'quetz-blue',
      number: '02',
    },
    {
      icon: GraduationCap,
      title: t('howItWorks.step3.title'),
      text: t('howItWorks.step3.text'),
      color: 'quetz-red',
      number: '03',
    },
  ];

  return (
    <section className={`py-20 sm:py-24 bg-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            {t('howItWorks.title')}
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Connector Line (hidden on mobile, shown between items on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-200" style={{ left: '60%' }} />
                )}

                {/* Number Badge */}
                <div className="relative inline-block mb-6">
                  <div className={`w-24 h-24 rounded-full bg-${step.color}/10 flex items-center justify-center mx-auto`}>
                    <Icon className={`w-10 h-10 text-${step.color}`} />
                  </div>
                  <span className={`absolute -top-2 -${isRTL ? 'left' : 'right'}-2 w-8 h-8 rounded-full bg-${step.color} text-white text-sm font-bold flex items-center justify-center`}>
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
