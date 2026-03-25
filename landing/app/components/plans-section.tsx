'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Coffee, Trees, TreeDeciduous, Sparkles, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useCartStore } from '@/lib/cart-store';
import Link from 'next/link';

interface PlansSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export default function PlansSection({ onSelectPlan }: PlansSectionProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t, isRTL } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const [addedPlan, setAddedPlan] = useState<string | null>(null);

  // Base prices in EUR
  const plans = [
    {
      id: 'cafe',
      title: t('plans.cafe.title'),
      text: t('plans.cafe.text'),
      impact: t('plans.cafe.impact'),
      cta: t('plans.cafe.cta'),
      tag: t('plans.cafe.tag'),
      price: 5,
      trees: 1,
      icon: Coffee,
      recommended: true,
      color: 'quetz-green',
    },
    {
      id: 'bosquePequeno',
      title: t('plans.bosquePequeno.title'),
      text: t('plans.bosquePequeno.text'),
      impact: t('plans.bosquePequeno.impact'),
      cta: t('plans.bosquePequeno.cta'),
      price: 12,
      trees: 3,
      icon: Trees,
      recommended: false,
      color: 'quetz-blue',
    },
    {
      id: 'bosqueGrande',
      title: t('plans.bosqueGrande.title'),
      text: t('plans.bosqueGrande.text'),
      impact: t('plans.bosqueGrande.impact'),
      cta: t('plans.bosqueGrande.cta'),
      price: 35,
      trees: 10,
      icon: TreeDeciduous,
      recommended: false,
      color: 'quetz-red',
    },
  ];

  const benefits = [
    t('plans.cancelAnytime'),
    t('plans.securePayments'),
    t('plans.visibleImpact'),
  ];

  return (
    <section id="planes" className={`py-20 sm:py-28 bg-gradient-to-b from-white to-quetz-cream ${isRTL ? 'rtl' : 'ltr'}`}>
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('plans.title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('plans.subtitle')}
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  plan.recommended ? 'ring-2 ring-quetz-green scale-105 md:scale-110 z-10' : ''
                }`}
              >
                {/* Recommended Tag */}
                {plan.recommended && (
                  <div className="absolute top-0 left-0 right-0 bg-quetz-green text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {plan.tag}
                  </div>
                )}

                <div className={`p-6 ${plan.recommended ? 'pt-12' : ''}`}>
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-${plan.color}/10 flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 text-${plan.color}`} />
                  </div>

                  {/* Title & Text */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                  <p className="text-gray-600 mb-4">{plan.text}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-500">{t('plans.perMonth')}</span>
                  </div>

                  {/* Impact */}
                  <p className="text-sm text-quetz-green font-medium mb-6 flex items-start gap-2">
                    <span className="mt-0.5">🌱</span>
                    <span>{plan.impact}</span>
                  </p>

                  {/* CTA Button */}
                  <AnimatePresence mode="wait">
                    {addedPlan === plan.id ? (
                      <motion.div
                        key="added"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="w-full py-3 px-4 rounded-xl bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        <span>¡Añadido al carrito!</span>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="add"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          addItem({
                            type: 'subscription',
                            planId: plan.id,
                            planName: plan.title,
                            treesPerMonth: plan.trees,
                            quantity: 1,
                            pricePerUnit: plan.price,
                            isGift: false,
                            speciesSelection: [],
                          });
                          setAddedPlan(plan.id);
                          setTimeout(() => setAddedPlan(null), 1500);
                        }}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                          plan.recommended
                            ? 'bg-quetz-green text-white hover:bg-green-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>➕ Añadir al carrito</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-quetz-green" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">{t('plans.footer')}</p>
        </motion.div>
      </div>
    </section>
  );
}
