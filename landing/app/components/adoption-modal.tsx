'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TreePine, Loader2, ChevronRight, Leaf, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

interface Tree {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface AdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree: Tree | null;
}

// Country codes for pricing
const countryCodeMap: { [key: string]: string } = {
  'Alemania': 'DE',
  'España': 'ES',
  'Brasil': 'BR',
  'India': 'IN',
  'Guatemala': 'GT',
  'Estados Unidos': 'US',
  'Francia': 'FR',
  'Reino Unido': 'GB',
  'México': 'MX',
  'Argentina': 'AR',
  'Colombia': 'CO',
  'Suiza': 'CH',
  'Austria': 'AT',
};

const currencyDisplay: { [key: string]: { symbol: string; basePrice: number } } = {
  'DE': { symbol: '€', basePrice: 30 },
  'AT': { symbol: '€', basePrice: 30 },
  'CH': { symbol: 'CHF', basePrice: 38 },
  'ES': { symbol: '€', basePrice: 20 },
  'FR': { symbol: '€', basePrice: 25 },
  'US': { symbol: '$', basePrice: 28 },
  'GB': { symbol: '£', basePrice: 24 },
  'MX': { symbol: '$', basePrice: 230 },
  'BR': { symbol: 'R$', basePrice: 70 },
  'IN': { symbol: '₹', basePrice: 570 },
  'GT': { symbol: 'Q', basePrice: 30 },
  'DEFAULT': { symbol: '€', basePrice: 25 },
};

export default function AdoptionModal({ isOpen, onClose, tree }: AdoptionModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const packages = [
    { quantity: 1, label: `1 ${t('adoption.tree')}`, discount: 0 },
    { quantity: 3, label: `3 ${t('adoption.trees')}`, discount: 10, popular: true },
    { quantity: 10, label: `10 ${t('adoption.trees')}`, discount: 20 },
  ];

  // Get country code from user's country name
  const userCountryName = (session?.user as any)?.country || '';
  const countryCode = countryCodeMap[userCountryName] || 'ES';
  const currency = currencyDisplay[countryCode] || currencyDisplay['DEFAULT'];

  const calculatePrice = (quantity: number) => {
    const pkg = packages.find(p => p.quantity === quantity);
    const discount = pkg?.discount || 0;
    const baseTotal = currency.basePrice * quantity;
    return baseTotal - (baseTotal * discount / 100);
  };

  const handleAdopt = async () => {
    if (status !== 'authenticated') {
      onClose();
      router.push('/auth/login?redirect=/&action=adopt');
      return;
    }

    if (!tree) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'adoption',
          treeId: tree.id,
          quantity: selectedPackage,
          country: countryCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el sistema de pago');
      setIsLoading(false);
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPackage(1);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!tree) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header with tree image */}
            <div className="relative h-48 bg-gradient-to-br from-quetz-green/20 to-green-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <Image
                    src={tree.image}
                    alt={tree.name}
                    fill
                    className="object-cover rounded-full shadow-lg"
                    sizes="128px"
                  />
                </div>
              </div>
              <button
                onClick={onClose}
                className={`absolute top-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{t('adoption.title')}: {tree.name}</h3>
                <p className="text-gray-600 italic">{tree.description}</p>
              </div>

              {/* Package selection */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('adoption.selectPackage')}:</p>
                {packages.map((pkg) => (
                  <button
                    key={pkg.quantity}
                    onClick={() => setSelectedPackage(pkg.quantity)}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
                      selectedPackage === pkg.quantity
                        ? 'border-quetz-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPackage === pkg.quantity
                          ? 'border-quetz-green bg-quetz-green'
                          : 'border-gray-300'
                      }`}>
                        {selectedPackage === pkg.quantity && (
                          <Leaf className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="font-semibold text-gray-900">{pkg.label}</span>
                        {pkg.discount > 0 && (
                          <span className={`text-xs bg-quetz-green/10 text-quetz-green px-2 py-0.5 rounded-full ${isRTL ? 'mr-2' : 'ml-2'}`}>
                            -{pkg.discount}% {t('adoption.discount')}
                          </span>
                        )}
                        {pkg.popular && (
                          <span className={`text-xs bg-quetz-blue/10 text-quetz-blue px-2 py-0.5 rounded-full ${isRTL ? 'mr-2' : 'ml-2'}`}>
                            {t('adoption.popular')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-quetz-green">
                      {currency.symbol}{calculatePrice(pkg.quantity).toFixed(0)}
                    </span>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Stripe badge */}
              <div className="flex items-center justify-center gap-2 mb-4 text-gray-500 text-sm">
                <CreditCard className="w-4 h-4" />
                <span>{t('payment.secureStripe') || 'Pago seguro con Stripe'}</span>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleAdopt}
                disabled={isLoading}
                className={`w-full bg-quetz-green hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t('adoption.processing') || 'Procesando...'}</>
                ) : status !== 'authenticated' ? (
                  <><TreePine className="w-5 h-5" /> {t('auth.login')}<ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} /></>
                ) : (
                  <><TreePine className="w-5 h-5" /> {t('payment.payNow') || 'Pagar ahora'} - {currency.symbol}{calculatePrice(selectedPackage).toFixed(0)}<ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} /></>
                )}
              </button>

              {status !== 'authenticated' && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  {t('auth.noAccount')} <a href="/auth/registro" className="text-quetz-green hover:underline">{t('auth.registerHere')}</a>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
