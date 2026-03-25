'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Loader2, School, CreditCard } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedAmountsEur = [10, 25, 50, 100];

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

const currencyDisplay: { [key: string]: { symbol: string; rate: number } } = {
  'DE': { symbol: '€', rate: 1 },
  'AT': { symbol: '€', rate: 1 },
  'CH': { symbol: 'CHF', rate: 0.95 },
  'ES': { symbol: '€', rate: 1 },
  'FR': { symbol: '€', rate: 1 },
  'US': { symbol: '$', rate: 1.08 },
  'GB': { symbol: '£', rate: 0.86 },
  'MX': { symbol: '$', rate: 18.5 },
  'BR': { symbol: 'R$', rate: 5.5 },
  'IN': { symbol: '₹', rate: 91 },
  'GT': { symbol: 'Q', rate: 8.5 },
  'DEFAULT': { symbol: '€', rate: 1 },
};

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get country code from user's country name
  const userCountryName = (session?.user as any)?.country || '';
  const countryCode = countryCodeMap[userCountryName] || 'ES';
  const currency = currencyDisplay[countryCode] || currencyDisplay['DEFAULT'];

  const convertToLocal = (eurAmount: number) => {
    return Math.round(eurAmount * currency.rate);
  };

  const getAmountInEur = () => {
    if (selectedAmount) {
      return selectedAmount;
    }
    const custom = parseFloat(customAmount);
    if (!isNaN(custom) && custom > 0) {
      return Math.round(custom / currency.rate);
    }
    return 0;
  };

  const getDisplayAmount = () => {
    if (selectedAmount) {
      return convertToLocal(selectedAmount);
    }
    return customAmount ? parseFloat(customAmount) : 0;
  };

  const handleDonate = async () => {
    if (status !== 'authenticated') {
      onClose();
      router.push('/auth/login?redirect=/&action=donate');
      return;
    }

    const amountEur = getAmountInEur();
    if (amountEur <= 0) {
      setError(t('donation.invalidAmount') || 'Monto inválido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'donation',
          customAmount: amountEur,
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

  const handleClose = () => {
    setSelectedAmount(25);
    setCustomAmount('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAmount(25);
      setCustomAmount('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-quetz-red/20 to-red-100 p-8 text-center">
              <button
                onClick={handleClose}
                className={`absolute top-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <School className="w-8 h-8 text-quetz-red" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t('donation.title')}</h3>
              <p className="text-gray-600 mt-2">{t('donation.subtitle')}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Suggested amounts */}
              <p className="text-sm font-medium text-gray-700 mb-3">{t('donation.selectAmount')}:</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {suggestedAmountsEur.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    disabled={isLoading}
                    className={`p-4 rounded-xl border-2 transition-all font-semibold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
                      selectedAmount === amount
                        ? 'border-quetz-red bg-red-50 text-quetz-red'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {currency.symbol}{convertToLocal(amount)}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="relative mb-4">
                <span className={`absolute top-1/2 -translate-y-1/2 text-gray-500 font-medium ${isRTL ? 'right-4' : 'left-4'}`}>
                  {currency.symbol}
                </span>
                <input
                  type="number"
                  placeholder={t('donation.customAmount')}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  disabled={isLoading}
                  className={`w-full py-4 border-2 border-gray-200 rounded-xl focus:border-quetz-red focus:ring-0 outline-none transition-colors text-lg ${isLoading ? 'opacity-50' : ''} ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                />
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
                onClick={handleDonate}
                disabled={isLoading || (!selectedAmount && !customAmount)}
                className={`w-full bg-quetz-red hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t('donation.processing') || 'Procesando...'}</>
                ) : status !== 'authenticated' ? (
                  <><Heart className="w-5 h-5" /> {t('auth.login')}</>
                ) : (
                  <><Heart className="w-5 h-5" /> {t('payment.payNow') || 'Donar ahora'} - {currency.symbol}{getDisplayAmount()}</>
                )}
              </button>

              {status !== 'authenticated' && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  {t('auth.noAccount')} <a href="/auth/registro" className="text-quetz-red hover:underline">{t('auth.registerHere')}</a>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
