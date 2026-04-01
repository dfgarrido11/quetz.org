'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Leaf, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useCartStore } from '@/lib/cart-store';
import { metaPixel } from '@/app/components/meta-pixel';

interface Tree {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface TreesSectionProps {
  onSelectTree: (tree: Tree) => void;
  isGiftMode?: boolean;
}

export default function TreesSection({ onSelectTree, isGiftMode = false }: TreesSectionProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { t, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const addItem = useCartStore((state) => state.addItem);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
  const [celebrating, setCelebrating] = useState<Record<string, boolean>>({});

  // Base price in EUR
  const BASE_PRICE = 25;

  // Tree data with translation keys
  const trees: Tree[] = [
    { id: 'cafe', name: t('trees.cafe.name'), description: t('trees.cafe.desc'), image: '/trees/cafe.jpg' },
    { id: 'aguacate', name: t('trees.aguacate.name'), description: t('trees.aguacate.desc'), image: '/trees/aguacate.jpg' },
    { id: 'caoba', name: t('trees.caoba.name'), description: t('trees.caoba.desc'), image: '/trees/caoba.jpg' },
    { id: 'mango', name: t('trees.rambutan.name'), description: t('trees.rambutan.desc'), image: '/trees/mango.jpg' },
    { id: 'cacao', name: t('trees.cacao.name'), description: t('trees.cacao.desc'), image: '/trees/cacao.jpg' },
    { id: 'cedro', name: t('trees.cedro.name'), description: t('trees.cedro.desc'), image: '/trees/cedro.jpg' },
    { id: 'naranja', name: t('trees.naranja.name'), description: t('trees.naranja.desc'), image: '/trees/naranja.jpg' },
    { id: 'limon', name: t('trees.limon.name'), description: t('trees.limon.desc'), image: '/trees/limon.jpg' },
    { id: 'pino', name: t('trees.cactus.name'), description: t('trees.cactus.desc'), image: '/trees/pino.jpg' },
  ];

  // Impact data for each tree
  const treeImpacts: Record<string, string> = {
    cafe: t('trees.cafe.impact'),
    aguacate: t('trees.aguacate.impact'),
    caoba: t('trees.caoba.impact'),
    mango: t('trees.rambutan.impact'),
    cacao: t('trees.cacao.impact'),
    cedro: t('trees.cedro.impact'),
    naranja: t('trees.naranja.impact'),
    limon: t('trees.limon.impact'),
    pino: t('trees.cactus.impact'),
  };

  return (
    <section id="arboles" className={`py-20 sm:py-28 bg-white relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Quetzito Maestro - Mascot Guide */}
      <motion.div
        initial={{ opacity: 0, x: isRTL ? 100 : -100 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={`hidden lg:block absolute ${isRTL ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 z-10`}
      >
        <div className="relative">
          {/* Speech Bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 1.2 }}
            className={`absolute -top-16 ${isRTL ? 'right-20' : 'left-20'} bg-white rounded-2xl shadow-lg p-3 max-w-[180px] z-20`}
          >
            <div className={`absolute -bottom-2 ${isRTL ? 'right-6' : 'left-6'} w-4 h-4 bg-white transform rotate-45`} />
            <p className="text-sm font-medium text-gray-800 relative z-10">
              {t('mascot.hello')} {t('mascot.adopt')}
            </p>
          </motion.div>
          
          {/* Mascot Image */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-2, 2, -2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="w-20 md:w-28 h-28 md:h-36 relative"
          >
            <Image
              src="/mascot/quetzito-aventurero.png"
              alt="Quetzito Aventurero"
              fill
              className="object-contain object-center drop-shadow-xl mascot-float-hero"
              sizes="(max-width: 768px) 80px, 112px"
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className={`flex items-center justify-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Leaf className="w-6 h-6 text-quetz-green" />
            <span className="text-quetz-green font-semibold text-sm uppercase tracking-wider">{t('header.adopt')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            {t('trees.title')}
          </h2>
          
          {/* Mobile Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="lg:hidden flex justify-center mt-6"
          >
            <div className={`flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full py-2 px-4 shadow-md ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-20 md:w-28 h-24 md:h-32 relative flex-shrink-0">
                <Image
                  src="/mascot/quetzito-maestro.png"
                  alt="Quetzito Maestro"
                  fill
                  className="object-contain mascot-float-hero"
                  sizes="(max-width: 768px) 80px, 112px"
                />
              </div>
              <p className="text-sm font-medium text-gray-700">
                {t('mascot.adopt')}
              </p>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {trees?.map?.((tree, index) => (
            <div key={tree.id} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <Image
                  src={tree.image}
                  alt={tree.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">{tree.name}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className={`text-gray-600 italic mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>"{tree.description}"</p>
                
                {/* Price */}
                <div className={`flex items-center gap-1 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <span className="text-sm text-gray-500">{t('trees.priceFrom')}</span>
                  <span className="text-lg font-bold text-quetz-green">{BASE_PRICE} €</span>
                  <span className="text-sm text-gray-500">{t('trees.perTree')}</span>
                </div>
                
                {/* Impact */}
                <p className={`text-sm text-quetz-blue font-medium mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  🌱 {treeImpacts[tree.id]}
                </p>
                
                {/* Quantity Selector */}
                <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm text-gray-600">{t('trees.quantity')}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantities(prev => ({ ...prev, [tree.id]: Math.max(1, (prev[tree.id] || 1) - 1) }))}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">{quantities[tree.id] || 1}</span>
                    <button
                      onClick={() => setQuantities(prev => ({ ...prev, [tree.id]: (prev[tree.id] || 1) + 1 }))}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* Subtotal */}
                <div className={`flex items-center justify-between mb-4 py-2 px-3 bg-quetz-green/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm text-gray-600">{t('trees.subtotal')}</span>
                  <span className="font-bold text-quetz-green">{((quantities[tree.id] || 1) * BASE_PRICE).toFixed(2)} €</span>
                </div>
                
                {/* Add to Cart Button */}
                <AnimatePresence mode="wait">
                  {addedToCart[tree.id] ? (
                    <motion.div
                      key="added"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="w-full bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>{t('trees.added')}</span>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add"
                      initial={{ scale: 1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const qty = quantities[tree.id] || 1;
                        addItem({
                          type: 'one-time',
                          treeId: tree.id,
                          treeName: tree.name,
                          treeImage: tree.image,
                          quantity: qty,
                          pricePerUnit: BASE_PRICE,
                          isGift: isGiftMode,
                        });
                        metaPixel.trackAddToCart({
                          content_name: tree.name,
                          content_type: 'product',
                          content_ids: [tree.id],
                          value: BASE_PRICE * qty,
                          currency: 'EUR',
                        });
                        setAddedToCart(prev => ({ ...prev, [tree.id]: true }));
                        if (!shouldReduceMotion) {
                          setCelebrating(prev => ({ ...prev, [tree.id]: true }));
                          setTimeout(() => setCelebrating(prev => ({ ...prev, [tree.id]: false })), 1000);
                        }
                        setTimeout(() => {
                          setAddedToCart(prev => ({ ...prev, [tree.id]: false }));
                          setQuantities(prev => ({ ...prev, [tree.id]: 1 }));
                        }, 1500);
                      }}
                      className={`w-full bg-quetz-green text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isGiftMode ? t('trees.addToGiftCart') : t('trees.addToCart')}</span>
                    </motion.button>
                  )}
                </AnimatePresence>
                
                {/* Quick Adopt (existing behavior) */}
                <button
                  onClick={() => onSelectTree(tree)}
                  className={`w-full mt-2 text-quetz-green font-medium py-2 hover:underline flex items-center justify-center gap-1 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Leaf className="w-4 h-4" />
                  <span>{t('trees.adoptDirect')}</span>
                </button>
              </div>
            </motion.div>

            {/* Quetzito celebración al añadir al carrito */}
            <AnimatePresence>
              {celebrating[tree.id] && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 1.3, 1, 1.1, 1],
                    opacity: [0, 1, 1, 1, 0],
                    y: [0, -40, -20, -30, -10],
                    rotate: [0, -20, 20, -10, 5],
                  }}
                  transition={{ duration: 1, times: [0, 0.25, 0.5, 0.75, 1] }}
                  className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
                >
                  <div className="relative w-24 h-28 drop-shadow-xl">
                    <Image
                      src="/mascot/quetzito-aventurero.png"
                      alt="¡Celebración!"
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
