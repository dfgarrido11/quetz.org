'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreePine,
  Leaf,
  Calendar,
  Gift,
  LogOut,
  Loader2,
  CheckCircle,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  User,
  TrendingUp,
  Droplets,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface Adoption {
  id: string;
  treeId: string;
  quantity: number;
  amount: number;
  currency: string;
  status: string;
  progress: number;
  createdAt: string;
  tree: {
    id: string;
    species: string;
    nameEs: string;
    image: string;
  };
  farmer?: {
    name: string;
  };
}

interface GiftSent {
  id: string;
  code: string;
  planName: string;
  recipientName: string;
  recipientEmail: string;
  status: string;
  sentAt: string | null;
  activatedAt: string | null;
  message: string | null;
}

interface Subscription {
  id: string;
  planName: string;
  treesPerMonth: number;
  priceEurMonth: number;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}

const dateLocaleMap: Record<string, string> = {
  es: 'es-ES',
  de: 'de-DE',
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-SA',
};

export default function MiBosquePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL, language } = useLanguage();
  
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [gifts, setGifts] = useState<GiftSent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bosque' | 'regalos' | 'suscripciones'>('bosque');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('cart') === 'success') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') return;
      try {
        const [adoptRes, giftsRes, subsRes] = await Promise.all([
          fetch('/api/adoptions'),
          fetch('/api/gifts/sent'),
          fetch('/api/subscriptions/mine'),
        ]);
        
        if (adoptRes.ok) {
          const data = await adoptRes.json();
          setAdoptions(data.adoptions || []);
        }
        if (giftsRes.ok) {
          const data = await giftsRes.json();
          setGifts(data.gifts || []);
        }
        if (subsRes.ok) {
          const data = await subsRes.json();
          setSubscriptions(data.subscriptions || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-quetz-green" />
      </div>
    );
  }

  if (!session) return null;

  const paidAdoptions = adoptions.filter((a) => ['paid', 'active'].includes(a.status));
  const totalTrees = paidAdoptions.reduce((sum, a) => sum + a.quantity, 0);
  const totalCo2 = totalTrees * 25;
  const daysSinceFirst = paidAdoptions.length > 0
    ? Math.floor((Date.now() - new Date(paidAdoptions[paidAdoptions.length - 1]?.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Success Banner */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-green-600 text-white py-4 px-6 text-center z-50"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">{t('myForest.purchaseSuccess')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center">
              <div className="relative h-10 sm:h-11 w-auto transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/logo-quetz-oficial.png"
                  alt="QUETZ Logo"
                  width={160}
                  height={44}
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/carrito" className="p-2 text-gray-600 hover:text-quetz-green">
                <ShoppingCart className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 text-gray-600 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{t('myForest.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('myForest.welcome')}, {session.user?.name || t('myForest.defaultUser')} 🌿
              </h1>
              <p className="text-gray-600">{t('myForest.impact')}</p>
            </div>
            <Link
              href="/#arboles"
              className="inline-flex items-center gap-2 bg-quetz-green text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
            >
              <span>🎁 {t('myForest.giftTree')}</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 text-center">
              <TreePine className="w-8 h-8 text-quetz-green mx-auto mb-2" />
              <p className="text-3xl font-bold text-quetz-green">{totalTrees}</p>
              <p className="text-sm text-gray-600">{t('myForest.treesAdopted')}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-4 text-center">
              <Droplets className="w-8 h-8 text-quetz-blue mx-auto mb-2" />
              <p className="text-3xl font-bold text-quetz-blue">{totalCo2.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{t('myForest.co2Year')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-4 text-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-500">{daysSinceFirst}</p>
              <p className="text-sm text-gray-600">{t('myForest.daysActive')}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'bosque', label: t('myForest.tabForest'), icon: TreePine, count: paidAdoptions.length },
            { id: 'regalos', label: t('myForest.tabGifts'), icon: Gift, count: gifts.length },
            { id: 'suscripciones', label: t('myForest.tabSubscriptions'), icon: Calendar, count: subscriptions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-quetz-green text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'bosque' && (
            <motion.div
              key="bosque"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {paidAdoptions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <TreePine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('myForest.emptyForest')}</h3>
                  <p className="text-gray-600 mb-6">{t('myForest.emptyForestDesc')}</p>
                  <Link
                    href="/#arboles"
                    className="inline-flex items-center gap-2 bg-quetz-green text-white font-semibold py-3 px-6 rounded-xl"
                  >
                    <Leaf className="w-5 h-5" />
                    <span>{t('myForest.adoptFirst')}</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paidAdoptions.map((adoption) => (
                    <AdoptionCard key={adoption.id} adoption={adoption} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'regalos' && (
            <motion.div
              key="regalos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {gifts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('myForest.emptyGifts')}</h3>
                  <p className="text-gray-600 mb-6">{t('myForest.emptyGiftsDesc')}</p>
                  <Link
                    href="/regalar"
                    className="inline-flex items-center gap-2 bg-pink-500 text-white font-semibold py-3 px-6 rounded-xl"
                  >
                    <Gift className="w-5 h-5" />
                    <span>{t('myForest.giftTrees')}</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {gifts.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'suscripciones' && (
            <motion.div
              key="suscripciones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {subscriptions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('myForest.noSubs')}</h3>
                  <p className="text-gray-600 mb-6">{t('myForest.noSubsDesc')}</p>
                  <Link
                    href="/#planes"
                    className="inline-flex items-center gap-2 bg-quetz-blue text-white font-semibold py-3 px-6 rounded-xl"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>{t('myForest.viewPlans')}</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <SubscriptionCard key={sub.id} subscription={sub} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Adoption Card Component
function AdoptionCard({ adoption }: { adoption: Adoption }) {
  const { t, language } = useLanguage();
  const locale = dateLocaleMap[language] || 'es-ES';
  const formattedDate = new Date(adoption.createdAt).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="relative h-40">
        <Image
          src={adoption.tree?.image || '/trees/cafe.jpg'}
          alt={adoption.tree?.nameEs || 'Tree'}
          fill
          className="object-cover"
        />
        {adoption.quantity > 1 && (
          <div className="absolute top-3 right-3 bg-quetz-green text-white px-3 py-1 rounded-full text-sm font-bold">
            x{adoption.quantity}
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-900">{adoption.tree?.nameEs || t('myForest.myTree')}</h4>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <Calendar className="w-4 h-4" />
          {t('myForest.adoptedOn')} {formattedDate}
        </p>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{t('myForest.progress')}</span>
            <span className="font-medium text-quetz-green">{adoption.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${adoption.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-quetz-green to-emerald-400 rounded-full"
            />
          </div>
        </div>

        {adoption.farmer && (
          <p className="text-xs text-gray-500 mt-2">
            👨‍🌾 {t('myForest.caredBy')} {adoption.farmer.name}
          </p>
        )}

        {/* Gift Button */}
        <Link
          href={`/regalar?tree=${adoption.tree?.species}`}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 bg-pink-50 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors"
        >
          <span>🎁 {t('myForest.giftThisTree')}</span>
        </Link>
      </div>
    </motion.div>
  );
}

// Gift Card Component
function GiftCard({ gift }: { gift: GiftSent }) {
  const { t } = useLanguage();
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    sent: 'bg-blue-100 text-blue-700',
    activated: 'bg-green-100 text-green-700',
  };
  const statusLabels = {
    pending: t('myForest.statusPending'),
    sent: t('myForest.statusSent'),
    activated: t('myForest.statusActivated'),
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{gift.planName}</h4>
            <p className="text-sm text-gray-600">{t('myForest.forRecipient')} {gift.recipientName}</p>
            <p className="text-xs text-gray-400">{gift.recipientEmail}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[gift.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
          {statusLabels[gift.status as keyof typeof statusLabels] || gift.status}
        </span>
      </div>
      {gift.message && (
        <p className="mt-3 text-sm text-gray-600 italic bg-gray-50 rounded-lg p-3">
          &ldquo;{gift.message}&rdquo;
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{t('myForest.code')} <code className="bg-gray-100 px-2 py-0.5 rounded">{gift.code}</code></span>
        {gift.status === 'sent' && (
          <button className="flex items-center gap-1 text-quetz-blue hover:underline">
            <Send className="w-3 h-3" />
            {t('myForest.resend')}
          </button>
        )}
      </div>
    </div>
  );
}

// Subscription Card Component
function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const { t, language } = useLanguage();
  const locale = dateLocaleMap[language] || 'es-ES';
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-quetz-blue" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{subscription.planName}</h4>
            <p className="text-sm text-gray-600">{subscription.treesPerMonth} {t('myForest.treesPerMonth')}</p>
            <p className="text-sm font-medium text-quetz-green">{subscription.priceEurMonth} {t('myForest.perMonth')}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[subscription.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
          {subscription.status === 'active' ? t('myForest.active') : subscription.status}
        </span>
      </div>
      {subscription.currentPeriodEnd && (
        <p className="mt-3 text-xs text-gray-500">
          {t('myForest.nextRenewal')} {new Date(subscription.currentPeriodEnd).toLocaleDateString(locale)}
        </p>
      )}
    </div>
  );
}
