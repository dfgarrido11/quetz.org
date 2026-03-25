'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Trees, Shield, BarChart3, Leaf, Award, ArrowRight,
  TreePine, Cloud, School, Users, MapPin,
} from 'lucide-react';

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplay(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span ref={ref}>{Number.isInteger(value) ? Math.round(display) : display.toFixed(1)}{suffix}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-3 border-green-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  const metrics = data?.metrics ?? {};
  const recentTrees = data?.recentTrees ?? [];
  const guardian = data?.guardian ?? null;
  const recentBadges = data?.recentBadges ?? [];
  const userName = data?.user?.name ?? 'Suscriptor';

  const metricCards = [
    { label: 'Árboles Plantados', value: metrics?.totalTrees ?? 0, icon: TreePine, color: 'bg-green-100 text-green-700', suffix: '' },
    { label: 'CO₂ Capturado', value: metrics?.totalCo2Tons ?? 0, icon: Cloud, color: 'bg-blue-100 text-blue-700', suffix: ' ton' },
    { label: 'Escuela (m²)', value: metrics?.schoolSqm ?? 0, icon: School, color: 'bg-amber-100 text-amber-700', suffix: ' m²' },
    { label: 'Niños Beneficiados', value: metrics?.childrenBenefited ?? 0, icon: Users, color: 'bg-purple-100 text-purple-700', suffix: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl p-6 md:p-8 text-white shadow-lg"
      >
        <h1 className="text-2xl md:text-3xl font-bold">¡Hola, {userName}! 🌿</h1>
        <p className="mt-2 text-green-100 text-sm md:text-base max-w-2xl">
          Bienvenido a tu dashboard personalizado. Aquí puedes ver el impacto real de tu suscripción en la reforestación de Zacapa, Guatemala.
        </p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {metricCards.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center mb-3`}>
              <m.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedNumber value={m.value} suffix={m.suffix} />
            </p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Trees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Trees className="w-4 h-4 text-green-600" /> Últimos Árboles
            </h2>
            <Link href="/dashboard/trees" className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1 font-medium">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {(recentTrees?.length ?? 0) === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">Aún no tienes árboles asignados</p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {recentTrees?.map?.((tree: any) => (
                <div key={tree?.id ?? Math.random()} className="bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors">
                  <div className="relative aspect-square rounded-md overflow-hidden mb-2 bg-green-200">
                    <Image
                      src={tree?.photoUrl ?? '/favicon.svg'}
                      alt={tree?.name ?? 'Árbol'}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <p className="font-medium text-sm text-gray-900 truncate">{tree?.name ?? 'Sin nombre'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Leaf className="w-3 h-3" />
                    {tree?.growthStage === 'seed' ? 'Semilla' : tree?.growthStage === 'sprout' ? 'Brote' : tree?.growthStage === 'sapling' ? 'Arbolito' : 'Árbol Maduro'}
                  </p>
                </div>
              )) ?? null}
            </div>
          )}
        </motion.div>

        {/* Guardian Quick View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" /> Mi Guardián
            </h2>
            <Link href="/dashboard/guardian" className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1 font-medium">
              Ver perfil <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {guardian ? (
            <div className="text-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 bg-green-200">
                <Image
                  src={guardian?.photoUrl ?? '/favicon.svg'}
                  alt={guardian?.name ?? 'Guardián'}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <p className="font-medium text-gray-900">{guardian?.name ?? ''}</p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {guardian?.location ?? 'Zacapa, Guatemala'}
              </p>
              <p className="text-xs text-gray-600 mt-3 line-clamp-3">{guardian?.bio?.substring?.(0, 150) ?? ''}...</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">Sin guardián asignado</p>
          )}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-5 md:col-span-2 lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Logros Recientes
            </h2>
            <Link href="/dashboard/impact" className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1 font-medium">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {(recentBadges?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm">Completa acciones para ganar logros</p>
            ) : (
              recentBadges?.map?.((ub: any) => (
                <div key={ub?.badge?.id ?? Math.random()} className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-800">{ub?.badge?.name ?? 'Logro'}</span>
                </div>
              )) ?? null
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
