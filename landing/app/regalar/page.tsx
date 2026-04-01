'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  TreePine,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  Heart,
  ArrowLeft,
  Sparkles,
  Coffee,
  Trees,
  TreeDeciduous,
  Repeat,
  Leaf,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useLanguage } from '@/lib/language-context';

const BASE_PRICE = 25;

const TREES = [
  { id: 'cafe', name: 'Café', image: '/trees/cafe.jpg', impact: '22 kg CO₂/año' },
  { id: 'aguacate', name: 'Aguacate', image: '/trees/aguacate.jpg', impact: '25 kg CO₂/año' },
  { id: 'caoba', name: 'Caoba', image: '/trees/caoba.jpg', impact: '35 kg CO₂/año' },
  { id: 'mango', name: 'Mango', image: '/trees/mango.jpg', impact: '20 kg CO₂/año' },
  { id: 'cacao', name: 'Cacao', image: '/trees/cacao.jpg', impact: '28 kg CO₂/año' },
  { id: 'cedro', name: 'Cedro', image: '/trees/cedro.jpg', impact: '32 kg CO₂/año' },
  { id: 'naranja', name: 'Naranja', image: '/trees/naranja.jpg', impact: '18 kg CO₂/año' },
  { id: 'limon', name: 'Limón', image: '/trees/limon.jpg', impact: '18 kg CO₂/año' },
  { id: 'pino', name: 'Pino', image: '/trees/pino.jpg', impact: '5 kg CO₂/año' },
];

const PLANS = [
  {
    id: 'cafe',
    icon: Coffee,
    price: 5,
    trees: 1,
    recommended: true,
  },
  {
    id: 'bosquePequeno',
    icon: Trees,
    price: 12,
    trees: 3,
    recommended: false,
  },
  {
    id: 'bosqueGrande',
    icon: TreeDeciduous,
    price: 35,
    trees: 10,
    recommended: false,
  },
];

type GiftMode = 'one-time' | 'recurring';

function RegalarContent() {
  const searchParams = useSearchParams();
  const preselectedTree = searchParams.get('tree');
  const { t, isRTL } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [giftMode, setGiftMode] = useState<GiftMode>('one-time');
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (preselectedTree) initial[preselectedTree] = 1;
    return initial;
  });
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
  const [addedPlan, setAddedPlan] = useState<string | null>(null);

  const giftItemsInCart = cartItems.filter((item) => item.isGift).reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (tree: typeof TREES[0]) => {
    addItem({
      type: 'one-time',
      treeId: tree.id,
      treeName: tree.name,
      treeImage: tree.image,
      quantity: quantities[tree.id] || 1,
      pricePerUnit: BASE_PRICE,
      isGift: true,
    });
    setAddedToCart((prev) => ({ ...prev, [tree.id]: true }));
    setTimeout(() => {
      setAddedToCart((prev) => ({ ...prev, [tree.id]: false }));
      setQuantities((prev) => ({ ...prev, [tree.id]: 1 }));
    }, 1500);
  };

  const handleAddPlan = (plan: typeof PLANS[0]) => {
    addItem({
      type: 'subscription',
      planId: plan.id,
      planName: t(`plans.${plan.id}.title`),
      treesPerMonth: plan.trees,
      quantity: 1,
      pricePerUnit: plan.price,
      isGift: true,
      speciesSelection: [],
    });
    setAddedPlan(plan.id);
    setTimeout(() => setAddedPlan(null), 1500);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 text-gray-600 hover:text-quetz-green">
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <div className="relative h-9 w-auto transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/logo-quetz-oficial.png"
                  alt="QUETZ Logo"
                  width={130}
                  height={36}
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>
            <Link
              href="/carrito"
              className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-pink-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t('gift.giftSummary')} {giftItemsInCart > 0 && `(${giftItemsInCart})`}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-4">
            <Gift className="w-5 h-5" />
            <span className="font-medium">{t('gift.howItWorks')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('gift.pageTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('gift.subtitle')} 🌍
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Gift, title: t('gift.step1Title'), desc: t('gift.step1Desc') },
            { icon: Heart, title: t('gift.step2Title'), desc: t('gift.step2Desc') },
            { icon: Sparkles, title: t('gift.step3Title'), desc: t('gift.step3Desc') },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 text-center shadow-sm"
            >
              <feat.icon className="w-10 h-10 text-pink-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">{feat.title}</h3>
              <p className="text-sm text-gray-600">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Gift Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-5 text-center">
            {t('gift.chooseType')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* One-time option */}
            <button
              onClick={() => setGiftMode('one-time')}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                giftMode === 'one-time'
                  ? 'border-pink-500 bg-pink-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-pink-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${giftMode === 'one-time' ? 'bg-pink-500' : 'bg-gray-100'}`}>
                  <Leaf className={`w-5 h-5 ${giftMode === 'one-time' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{t('gift.oneTimeTitle')}</h3>
                  <p className="text-xs text-gray-500">{t('gift.oneTimeDesc')}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-pink-600">€25 / {t('trees.perTree').replace('/ ', '')}</p>
            </button>

            {/* Recurring option */}
            <button
              onClick={() => setGiftMode('recurring')}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                giftMode === 'recurring'
                  ? 'border-pink-500 bg-pink-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-pink-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${giftMode === 'recurring' ? 'bg-pink-500' : 'bg-gray-100'}`}>
                  <Repeat className={`w-5 h-5 ${giftMode === 'recurring' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{t('gift.recurringTitle')}</h3>
                  <p className="text-xs text-gray-500">{t('gift.recurringDesc')}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-pink-600">€5–€35 {t('plans.perMonth')}</p>
            </button>
          </div>
        </motion.div>

        {/* Content based on mode */}
        <AnimatePresence mode="wait">
          {giftMode === 'one-time' ? (
            <motion.div
              key="one-time"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Trees Grid */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {t('gift.chooseTrees')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {TREES.map((tree, index) => (
                  <motion.div
                    key={tree.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-2xl shadow-md overflow-hidden border-2 transition-colors ${
                      preselectedTree === tree.id ? 'border-pink-500' : 'border-transparent'
                    }`}
                  >
                    <div className="relative h-40">
                      <Image src={tree.image} alt={tree.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <h3 className="text-lg font-bold text-white">{t(`trees.${tree.id}.name`) || tree.name}</h3>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <span className="text-sm font-bold text-quetz-green">{BASE_PRICE} €</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-quetz-blue font-medium mb-3">
                        🌱 {tree.impact}
                      </p>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">{t('trees.quantity')}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuantities((prev) => ({ ...prev, [tree.id]: Math.max(1, (prev[tree.id] || 1) - 1) }))}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold">{quantities[tree.id] || 1}</span>
                          <button
                            onClick={() => setQuantities((prev) => ({ ...prev, [tree.id]: (prev[tree.id] || 1) + 1 }))}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="flex items-center justify-between mb-3 py-2 px-3 bg-pink-50 rounded-lg">
                        <span className="text-sm text-gray-600">{t('trees.subtotal')}</span>
                        <span className="font-bold text-pink-600">
                          {((quantities[tree.id] || 1) * BASE_PRICE).toFixed(2)} €
                        </span>
                      </div>

                      {/* Add to Cart */}
                      <AnimatePresence mode="wait">
                        {addedToCart[tree.id] ? (
                          <motion.div
                            key="added"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="w-full bg-green-100 text-green-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" />
                            <span>{t('trees.added')}</span>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="add"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddToCart(tree)}
                            className="w-full bg-pink-500 text-white font-semibold py-3 rounded-xl hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Gift className="w-5 h-5" />
                            <span>{t('trees.addToGiftCart')}</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="recurring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Plans Grid */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                {t('gift.choosePlans')}
              </h2>
              <p className="text-center text-gray-500 mb-8 flex items-center justify-center gap-2">
                <Repeat className="w-4 h-4 text-pink-500" />
                {t('gift.planGiftNote')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {PLANS.map((plan, index) => {
                  const Icon = plan.icon;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                        plan.recommended ? 'ring-2 ring-pink-500 scale-105 z-10' : ''
                      }`}
                    >
                      {plan.recommended && (
                        <div className="absolute top-0 left-0 right-0 bg-pink-500 text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {t('plans.cafe.tag')}
                        </div>
                      )}
                      <div className={`p-6 ${plan.recommended ? 'pt-12' : ''}`}>
                        <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-pink-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{t(`plans.${plan.id}.title`)}</h3>
                        <p className="text-gray-600 text-sm mb-4">{t(`plans.${plan.id}.text`)}</p>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                          <span className="text-gray-500 text-sm">{t('plans.perMonth')}</span>
                        </div>
                        <p className="text-sm text-quetz-green font-medium mb-5 flex items-start gap-2">
                          <span>🌱</span>
                          <span>{t(`plans.${plan.id}.impact`)}</span>
                        </p>
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
                              <span>{t('trees.added')}</span>
                            </motion.div>
                          ) : (
                            <motion.button
                              key="add"
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAddPlan(plan)}
                              className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                                plan.recommended
                                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                              }`}
                            >
                              <Gift className="w-5 h-5" />
                              <span>{t('trees.addToGiftCart')}</span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/carrito"
            className="inline-flex items-center gap-3 bg-pink-500 text-white font-bold text-lg py-4 px-8 rounded-2xl hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <ShoppingCart className="w-6 h-6" />
            <span>🛒 {t('gift.continueToCheckout')}</span>
            {giftItemsInCart > 0 && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {giftItemsInCart}
              </span>
            )}
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

export default function RegalarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
      </div>
    }>
      <RegalarContent />
    </Suspense>
  );
}
