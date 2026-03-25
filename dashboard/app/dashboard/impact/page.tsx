'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TreePine, Cloud, School, Users, Award,
  Share2, TrendingUp, Zap, Lock,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Co2Chart = dynamic(() => import('@/components/co2-chart'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full" /></div> });

const BADGE_ICON_MAP: Record<string, any> = {
  sprout: TreePine,
  wind: Cloud,
  school: School,
  calendar: Award,
  award: Zap,
  trees: TreePine,
  'message-circle': Share2,
};

function AnimatedNumber({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let start = 0;
    const end = value;
    const duration = 1500;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      if (mounted.current) setDisplay(start);
    }, 16);
    return () => { mounted.current = false; clearInterval(timer); };
  }, [value]);

  return <span>{display.toFixed(decimals)}{suffix}</span>;
}

export default function ImpactPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/impact')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-3 border-green-700 border-t-transparent rounded-full" /></div>;
  }

  const metrics = data?.metrics ?? {};
  const badges = data?.badges ?? [];
  const earnedBadges = data?.earnedBadges ?? [];
  const multiplier = data?.multiplier ?? '1.0';
  const monthlyCo2 = data?.monthlyCo2 ?? [];

  const metricCards = [
    { label: 'Árboles Plantados', value: metrics?.totalTrees ?? 0, icon: TreePine, color: 'from-green-500 to-emerald-600', decimals: 0, suffix: '' },
    { label: 'CO₂ Capturado', value: metrics?.totalCo2Tons ?? 0, icon: Cloud, color: 'from-blue-500 to-cyan-600', decimals: 1, suffix: ' ton' },
    { label: 'Escuela Construida', value: metrics?.schoolSqm ?? 0, icon: School, color: 'from-amber-500 to-orange-600', decimals: 1, suffix: ' m²' },
    { label: 'Niños Beneficiados', value: metrics?.childrenBenefited ?? 0, icon: Users, color: 'from-purple-500 to-violet-600', decimals: 0, suffix: '' },
  ];

  const shareText = `🌳 Con mi suscripción a @QuetzOrg he plantado ${metrics?.totalTrees ?? 0} árboles, capturado ${metrics?.totalCo2Tons ?? 0} toneladas de CO₂ y ayudado a construir ${metrics?.schoolSqm ?? 0}m² de escuelas en Zacapa, Guatemala. Únete: quetz.org`;
  const encodedText = encodeURIComponent(shareText);

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://quetz.org&summary=${encodedText}`,
    };
    window.open(urls[platform] ?? '#', '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-green-600" /> Mi Impacto
        </h1>
        <p className="text-sm text-gray-500 mt-1">El cambio real que tu suscripción genera en Zacapa</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {metricCards.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${m.color} rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <m.icon className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">
              <AnimatedNumber value={m.value} suffix={m.suffix} decimals={m.decimals} />
            </p>
            <p className="text-sm opacity-80 mt-1">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Multiplier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold text-green-800">{multiplier}x</p>
            <p className="text-sm text-green-700">Tu impacto es <strong>{multiplier}x mayor</strong> que el promedio de suscriptores</p>
          </div>
        </div>
      </motion.div>

      {/* CO2 Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-5"
      >
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Cloud className="w-4 h-4 text-blue-600" /> Progreso Mensual de CO₂ Capturado
        </h3>
        <div className="h-64">
          <Co2Chart data={monthlyCo2} />
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-5"
      >
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-amber-500" /> Logros y Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {badges?.map?.((badge: any) => {
            const isEarned = earnedBadges?.includes?.(badge?.id);
            const IconComp = BADGE_ICON_MAP[badge?.icon ?? ''] ?? Award;
            return (
              <div
                key={badge?.id ?? Math.random()}
                className={`rounded-xl p-4 text-center transition-all ${
                  isEarned
                    ? 'bg-amber-50 border-2 border-amber-300 shadow-sm'
                    : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 ${
                  isEarned ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {isEarned ? <IconComp className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>
                <p className={`text-sm font-medium ${isEarned ? 'text-amber-800' : 'text-gray-400'}`}>
                  {badge?.name ?? 'Badge'}
                </p>
                <p className={`text-[11px] mt-1 ${isEarned ? 'text-amber-600' : 'text-gray-400'}`}>
                  {badge?.description ?? ''}
                </p>
              </div>
            );
          }) ?? null}
        </div>
      </motion.div>

      {/* Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm p-5"
      >
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Share2 className="w-4 h-4 text-green-600" /> Comparte tu Impacto
        </h3>
        <p className="text-sm text-gray-600 mb-4">Inspira a otros a unirse a la causa compartiendo tu impacto en redes sociales.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleShare('twitter')} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span>Twitter / X</span>
          </button>
          <button onClick={() => handleShare('facebook')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span>Facebook</span>
          </button>
          <button onClick={() => handleShare('linkedin')} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span>LinkedIn</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
