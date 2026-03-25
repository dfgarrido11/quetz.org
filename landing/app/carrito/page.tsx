'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Gift,
  User,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CreditCard,
  Loader2,
  TreePine,
  CheckCircle,
  Calendar,
  Check,
} from 'lucide-react';
import { useCartStore, CartItem, SpeciesSelection } from '@/lib/cart-store';
import { useLanguage } from '@/lib/language-context';

const ALL_TREE_SPECIES = [
  { id: 'pino', name: 'Pino', image: '/trees/pino.jpg' },
  { id: 'cipres', name: 'Ciprés', image: '/trees/cipres.jpg' },
  { id: 'cafe', name: 'Café', image: '/trees/cafe.jpg' },
  { id: 'aguacate', name: 'Aguacate', image: '/trees/aguacate.jpg' },
  { id: 'caoba', name: 'Caoba', image: '/trees/caoba.jpg' },
  { id: 'rambutan', name: 'Rambután', image: '/trees/rambutan.jpg' },
  { id: 'cacao', name: 'Cacao', image: '/trees/cacao.jpg' },
  { id: 'cedro', name: 'Cedro', image: '/trees/cedro.jpg' },
  { id: 'naranja', name: 'Naranja', image: '/trees/naranja.jpg' },
  { id: 'limon', name: 'Limón', image: '/trees/limon.jpg' },
  { id: 'cactus', name: 'Cactus', image: '/trees/cactus.jpg' },
];

// Plan Café solo permite Pino o Ciprés
const PLAN_CAFE_SPECIES = ['pino', 'cipres'];

// Función para obtener las especies disponibles según el plan
const getSpeciesForPlan = (planName: string) => {
  if (planName?.toLowerCase().includes('café') || planName?.toLowerCase().includes('cafe')) {
    return ALL_TREE_SPECIES.filter(s => PLAN_CAFE_SPECIES.includes(s.id));
  }
  return ALL_TREE_SPECIES;
};

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t, isRTL } = useLanguage();
  const {
    items,
    removeItem,
    updateQuantity,
    updateGiftStatus,
    updateGiftRecipient,
    updateSpeciesSelection,
    clearCart,
  } = useCartStore();
  
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState('');

  const subscriptionItems = items.filter((item) => item.type === 'subscription');
  const oneTimeItems = items.filter((item) => item.type === 'one-time');
  const totalItems = items.reduce((sum, item) => {
    if (item.type === 'subscription') return sum + (item.treesPerMonth || 0);
    return sum + item.quantity;
  }, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  const giftItems = items.filter((item) => item.isGift);
  const personalItems = items.filter((item) => !item.isGift);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckout = async () => {
    if (status !== 'authenticated') {
      router.push('/auth/login?redirect=/carrito');
      return;
    }

    // Validate gift recipients
    const invalidGifts = giftItems.filter(
      (item) => !item.giftRecipient?.name || !item.giftRecipient?.email
    );
    if (invalidGifts.length > 0) {
      setError('Por favor completa los datos del destinatario para todos los regalos');
      return;
    }

    // Validate species selection for subscriptions
    const invalidSubs = subscriptionItems.filter((item) => {
      const totalSelected = (item.speciesSelection || []).reduce((s, sp) => s + sp.quantity, 0);
      return totalSelected !== (item.treesPerMonth || 0);
    });
    if (invalidSubs.length > 0) {
      setError('Por favor selecciona las especies para tus suscripciones');
      return;
    }

    setIsCheckingOut(true);
    setError('');

    try {
      const response = await fetch('/api/checkout/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar');
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h1>
            <p className="text-gray-600 mb-6">
              {t('cart.emptyDesc')}
            </p>
            <Link
              href="/#planes"
              className="inline-flex items-center gap-2 bg-quetz-green text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
            >
              <TreePine className="w-5 h-5" />
              <span>{t('cart.viewPlans')}</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-quetz-green transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('cart.continueShopping')}</span>
            </Link>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-quetz-green" />
              <span className="font-semibold">{t('cart.title')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscriptions */}
            {subscriptionItems.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-quetz-blue" />
                  {t('cart.subscriptions')}
                </h2>
                <div className="space-y-4">
                  {subscriptionItems.map((item) => (
                    <SubscriptionCard
                      key={item.id}
                      item={item}
                      isExpanded={expandedItems[item.id]}
                      onToggleExpand={() => toggleExpanded(item.id)}
                      onRemove={() => removeItem(item.id)}
                      onUpdateGiftStatus={(isGift) => updateGiftStatus(item.id, isGift)}
                      onUpdateRecipient={(r) => updateGiftRecipient(item.id, r)}
                      onUpdateSpecies={(s) => updateSpeciesSelection(item.id, s)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* One-time purchases */}
            {oneTimeItems.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-quetz-green" />
                  {t('cart.oneTime')}
                </h2>
                <div className="space-y-4">
                  {oneTimeItems.map((item) => (
                    <OneTimeCard
                      key={item.id}
                      item={item}
                      isExpanded={expandedItems[item.id]}
                      onToggleExpand={() => toggleExpanded(item.id)}
                      onRemove={() => removeItem(item.id)}
                      onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                      onUpdateGiftStatus={(isGift) => updateGiftStatus(item.id, isGift)}
                      onUpdateRecipient={(r) => updateGiftRecipient(item.id, r)}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 mt-4"
            >
              <Trash2 className="w-4 h-4" />
              {t('cart.remove')}
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('cart.orderSummary')}</h3>
              
              {/* Items breakdown */}
              <div className="space-y-3 mb-4">
                {subscriptionItems.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t('cart.subscriptionsCount')} ({subscriptionItems.reduce((s, i) => s + (i.treesPerMonth || 0), 0)} {t('cart.treesPerMonth')})
                    </span>
                    <span className="font-medium">
                      {subscriptionItems.reduce((s, i) => s + i.pricePerUnit, 0).toFixed(2)} €{t('cart.perMonth')}
                    </span>
                  </div>
                )}
                {oneTimeItems.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <TreePine className="w-4 h-4 inline mr-1" />
                      {t('cart.oneTimeCount')} ({oneTimeItems.reduce((s, i) => s + i.quantity, 0)} {t('cart.trees')})
                    </span>
                    <span className="font-medium">
                      {oneTimeItems.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0).toFixed(2)} €
                    </span>
                  </div>
                )}
                {giftItems.length > 0 && (
                  <div className="flex justify-between text-sm text-pink-600">
                    <span>
                      <Gift className="w-4 h-4 inline mr-1" />
                      {t('cart.isGift')}
                    </span>
                    <span>{giftItems.length} item(s)</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">{t('cart.totalToday')}</span>
                  <span className="text-2xl font-bold text-quetz-green">{totalPrice.toFixed(2)} €</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('cart.socialFund')}</p>
                {subscriptionItems.length > 0 && (
                  <p className="text-xs text-quetz-blue mt-1">{t('cart.monthlyNote')}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-quetz-green text-white font-semibold py-4 px-6 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('cart.processing')}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>{t('cart.checkout')}</span>
                  </>
                )}
              </button>

              {status !== 'authenticated' && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  {t('cart.loginRequired')}
                </p>
              )}

              {/* Impact preview */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-medium text-gray-900 mb-2">{t('cart.impact')}</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>🌳 {totalItems} {t('cart.trees')}</p>
                  <p>🌍 ~{(totalItems * 25).toLocaleString()} kg CO₂/año</p>
                  <p>👨‍🌾 ~{Math.ceil(totalItems / 10)} familias</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subscription Card Component
interface SubscriptionCardProps {
  item: CartItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdateGiftStatus: (isGift: boolean) => void;
  onUpdateRecipient: (recipient: CartItem['giftRecipient']) => void;
  onUpdateSpecies: (selection: SpeciesSelection[]) => void;
}

function SubscriptionCard({
  item,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdateGiftStatus,
  onUpdateRecipient,
  onUpdateSpecies,
}: SubscriptionCardProps) {
  const { t } = useLanguage();
  const [localSelection, setLocalSelection] = useState<Record<string, number>>({});
  const treesPerMonth = item.treesPerMonth || 0;
  const totalSelected = Object.values(localSelection).reduce((s, v) => s + v, 0);
  const remaining = treesPerMonth - totalSelected;

  useEffect(() => {
    // Initialize from existing selection
    if (item.speciesSelection?.length) {
      const sel: Record<string, number> = {};
      item.speciesSelection.forEach((s) => { sel[s.species] = s.quantity; });
      setLocalSelection(sel);
    }
  }, [item.speciesSelection]);

  // Get available species for this plan
  const availableSpecies = getSpeciesForPlan(item.planName || '');

  const updateSpecies = (species: string, delta: number) => {
    const current = localSelection[species] || 0;
    const newVal = Math.max(0, current + delta);
    
    // Check if we can add more
    if (delta > 0 && remaining <= 0) return;
    
    const newSelection = { ...localSelection, [species]: newVal };
    setLocalSelection(newSelection);
    
    // Convert to array format for store
    const selectionArray: SpeciesSelection[] = Object.entries(newSelection)
      .filter(([_, qty]) => qty > 0)
      .map(([sp, qty]) => ({
        species: sp,
        name: ALL_TREE_SPECIES.find((t) => t.id === sp)?.name || sp,
        quantity: qty,
      }));
    onUpdateSpecies(selectionArray);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-quetz-blue/20"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-quetz-blue" />
              <h4 className="font-semibold text-gray-900">{item.planName}</h4>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {treesPerMonth} {t('cart.treesPerMonth')} · {item.pricePerUnit} €{t('cart.perMonth')}
            </p>
          </div>
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Species Selection */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">{t('cart.chooseSpecies')}</span>
            <span className={`text-sm font-bold ${remaining === 0 ? 'text-green-600' : 'text-orange-500'}`}>
              {remaining === 0 ? '✓' : remaining}
            </span>
          </div>
          <div className={`grid gap-2 ${availableSpecies.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {availableSpecies.map((tree) => {
              const qty = localSelection[tree.id] || 0;
              return (
                <div key={tree.id} className={`relative rounded-lg border-2 p-2 text-center transition-colors ${
                  qty > 0 ? 'border-quetz-green bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="relative w-10 h-10 mx-auto mb-1 rounded-full overflow-hidden">
                    <Image src={tree.image} alt={tree.name} fill className="object-cover" />
                  </div>
                  <p className="text-xs font-medium truncate">{tree.name}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <button
                      onClick={() => updateSpecies(tree.id, -1)}
                      disabled={qty === 0}
                      className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-xs disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-4 text-xs font-bold">{qty}</span>
                    <button
                      onClick={() => updateSpecies(tree.id, 1)}
                      disabled={remaining <= 0}
                      className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-xs disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gift Toggle */}
        <GiftToggle
          item={item}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onUpdateGiftStatus={onUpdateGiftStatus}
          onUpdateRecipient={onUpdateRecipient}
        />
      </div>
    </motion.div>
  );
}

// One-time Card Component
interface OneTimeCardProps {
  item: CartItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
  onUpdateGiftStatus: (isGift: boolean) => void;
  onUpdateRecipient: (recipient: CartItem['giftRecipient']) => void;
}

function OneTimeCard({
  item,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdateQuantity,
  onUpdateGiftStatus,
  onUpdateRecipient,
}: OneTimeCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-4">
        <div className="flex gap-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={item.treeImage || '/trees/cafe.jpg'} alt={item.treeName || ''} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-semibold text-gray-900">{item.treeName}</h4>
              <button onClick={onRemove} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{item.pricePerUnit} €</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="text-sm text-gray-500">
                = {(item.quantity * item.pricePerUnit).toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Gift Toggle */}
        <GiftToggle
          item={item}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onUpdateGiftStatus={onUpdateGiftStatus}
          onUpdateRecipient={onUpdateRecipient}
        />
      </div>
    </motion.div>
  );
}

// Gift Toggle Component (shared)
interface GiftToggleProps {
  item: CartItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateGiftStatus: (isGift: boolean) => void;
  onUpdateRecipient: (recipient: CartItem['giftRecipient']) => void;
}

function GiftToggle({
  item,
  isExpanded,
  onToggleExpand,
  onUpdateGiftStatus,
  onUpdateRecipient,
}: GiftToggleProps) {
  const { t } = useLanguage();
  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            onUpdateGiftStatus(!item.isGift);
            if (!item.isGift) onToggleExpand();
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            item.isGift
              ? 'bg-pink-100 text-pink-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {item.isGift ? (
            <>
              <Gift className="w-4 h-4" />
              <span>{t('cart.isGift')}</span>
              <CheckCircle className="w-4 h-4" />
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              <span>{t('cart.isGiftFor')}</span>
            </>
          )}
        </button>

        {item.isGift && (
          <button onClick={onToggleExpand} className="text-sm text-gray-500 flex items-center gap-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {item.isGift && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 bg-pink-50 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.recipientName')}</label>
                <input
                  type="text"
                  value={item.giftRecipient?.name || ''}
                  onChange={(e) => onUpdateRecipient({ ...item.giftRecipient, name: e.target.value, email: item.giftRecipient?.email || '' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-quetz-green"
                  placeholder="María García"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.recipientEmail')}</label>
                <input
                  type="email"
                  value={item.giftRecipient?.email || ''}
                  onChange={(e) => onUpdateRecipient({ ...item.giftRecipient, name: item.giftRecipient?.name || '', email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-quetz-green"
                  placeholder="maria@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.giftMessage')}</label>
                <textarea
                  value={item.giftRecipient?.message || ''}
                  onChange={(e) => onUpdateRecipient({ ...item.giftRecipient, name: item.giftRecipient?.name || '', email: item.giftRecipient?.email || '', message: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-quetz-green"
                  rows={2}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}