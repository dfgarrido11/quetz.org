'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, TreePine, CheckCircle, Loader2, ArrowRight, LogIn, UserPlus, Sparkles, Heart } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';

interface GiftData {
  code: string;
  planName: string;
  treesPerMonth: number;
  durationMonths: number;
  recipientName: string;
  occasion: string;
  message: string | null;
  status: string;
  activatedAt: string | null;
}

const occasionEmojis: Record<string, string> = {
  cumpleanos: '🎂',
  navidad: '🎄',
  sanValentin: '❤️',
  otro: '🎁',
};

export default function RegaloPage() {
  const params = useParams();
  const router = useRouter();
  const codigo = params.codigo as string;
  const { data: session, status: sessionStatus } = useSession();
  const { t, isRTL } = useLanguage();
  
  const [gift, setGift] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const autoActivateAttempted = useRef(false);

  useEffect(() => {
    fetchGift();
  }, [codigo]);

  // Auto-activate gift when user returns after login/register
  useEffect(() => {
    if (
      sessionStatus === 'authenticated' &&
      gift &&
      gift.status === 'pending' &&
      !activated &&
      !activating &&
      !autoActivateAttempted.current
    ) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autoActivate') === '1') {
        autoActivateAttempted.current = true;
        handleActivate();
      }
    }
  }, [sessionStatus, gift]);

  const fetchGift = async () => {
    try {
      const res = await fetch(`/api/gifts?code=${codigo}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || t('giftActivate.invalidCode'));
        return;
      }
      
      setGift(data.gift);
      if (data.gift.status === 'activated') {
        setActivated(true);
      }
    } catch (err) {
      setError(t('giftActivate.errorTitle'));
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!session) {
      // Redirect to login with return URL
      signIn(undefined, { callbackUrl: `${window.location.origin}/regalo/${codigo}?autoActivate=1` });
      return;
    }

    setActivating(true);
    try {
      const res = await fetch('/api/gifts/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigo }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error);
        return;
      }
      
      setActivated(true);
    } catch (err) {
      setError(t('giftActivate.errorTitle'));
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-quetz-red animate-spin" />
      </div>
    );
  }

  if (error && !gift) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('giftActivate.errorTitle')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-quetz-green text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
          >
            {t('giftActivate.goToForest')}
          </Link>
        </div>
      </div>
    );
  }

  // Success screen after activation
  if (activated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-quetz-green/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-quetz-green" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('giftActivate.successTitle')}</h2>
          <p className="text-gray-600 mb-6">
            {t('giftActivate.successMsg')}
          </p>
          
          <div className="bg-quetz-green/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-quetz-green font-semibold">
              <TreePine className="w-5 h-5" />
              <span>{gift?.treesPerMonth} × {gift?.durationMonths} = {(gift?.treesPerMonth || 0) * (gift?.durationMonths || 0)}</span>
            </div>
          </div>
          
          <Link
            href="/mi-bosque"
            className="inline-flex items-center gap-2 bg-quetz-green text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
          >
            <span>{t('giftActivate.goToForest')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 to-red-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-quetz-red to-pink-500 text-white p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Gift className="w-10 h-10" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-1">{t('giftActivate.title')}</h1>
            <p className="text-white/80">{t('giftActivate.subtitle')} {occasionEmojis[gift?.occasion || 'otro']}</p>
          </div>

          {/* Gift Details */}
          <div className="p-6">
            {/* Recipient */}
            <div className="text-center mb-6">
              <p className="text-gray-500 text-sm">{t('myForest.giftTo')}</p>
              <p className="text-xl font-bold text-gray-900">{gift?.recipientName}</p>
            </div>

            {/* Plan Card */}
            <div className="bg-gradient-to-br from-quetz-green/5 to-green-50 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-quetz-green/10 rounded-lg flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-quetz-green" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{gift?.planName}</p>
                  <p className="text-sm text-gray-600">{gift?.treesPerMonth} × {gift?.durationMonths}</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg p-3">
                <span className="text-gray-600">{t('giftActivate.treesIncluded')}</span>
                <span className="text-lg font-bold text-quetz-green flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  {(gift?.treesPerMonth || 0) * (gift?.durationMonths || 0)}
                </span>
              </div>
            </div>

            {/* Message */}
            {gift?.message && (
              <div className="bg-pink-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-quetz-red flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 italic">"{gift.message}"</p>
                </div>
              </div>
            )}

            {/* Action */}
            {error && (
              <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm text-center">
                {error}
              </div>
            )}

            {sessionStatus === 'loading' ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-quetz-green animate-spin" />
              </div>
            ) : session ? (
              <button
                onClick={handleActivate}
                disabled={activating}
                className="w-full bg-quetz-green text-white font-semibold py-4 px-6 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {activating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t('giftActivate.activating')}</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> {t('giftActivate.activate')}</>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-gray-600 text-sm mb-4">
                  {t('giftActivate.loginRequired')}
                </p>
                <button
                  onClick={() => signIn(undefined, { callbackUrl: `${window.location.origin}/regalo/${codigo}?autoActivate=1` })}
                  className="w-full bg-quetz-green text-white font-semibold py-4 px-6 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t('giftActivate.loginBtn')}</span>
                </button>
                <Link
                  href={`/auth/registro?redirect=/regalo/${codigo}&autoActivate=1`}
                  className="w-full bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>{t('giftActivate.registerBtn')}</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {t('brand.slogan')}
        </p>
      </div>
    </div>
  );
}
