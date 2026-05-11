'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { motion } from 'framer-motion';
import { TreePine, Users, Leaf, School, DollarSign, MapPin, Heart, CheckCircle, TrendingUp, CreditCard, RefreshCw, Sprout, Landmark, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface StripeStats {
  mrr: number;
  totalRevenue: number;
  activeSubscribers: number;
  oneTimeRevenue: number;
  currency: string;
  lastUpdated: string;
  error?: string;
}

interface Stats {
  totalRaisedEur: number;
  numTransactions: number;
  stripeFeesEur: number;
  stripeFeesEstimated: boolean;
  netRaisedEur: number;
  schoolAllocation: number;
  plantingAllocation: number;
  operationsAllocation: number;
  reserveAllocation: number;
  schoolAllocated: number;
  schoolTransferred: number;
  schoolPending: number;
  schoolGoal: number;
  schoolPhase: string;
  schoolProgress: number;
  schoolGoalInTrees: number;
  treesNeededRemaining: number;
  totalTrees: number;
  treesAdopted: number;
  totalAdopters: number;
  jornalesFunded: number;
  co2CapturedKg: number;
  hectaresReforested: number;
  lastUpdated: string;
}

const phaseLabels: Record<string, { es: string; de: string; en: string; fr: string; ar: string; icon: string }> = {
  terreno: { es: 'Adquisición del terreno', de: 'Grundstückserwerb', en: 'Land acquisition', fr: 'Acquisition du terrain', ar: 'الحصول على الأرض', icon: '🏔️' },
  cimientos: { es: 'Construcción de cimientos', de: 'Fundamentbau', en: 'Foundation construction', fr: 'Construction des fondations', ar: 'بناء الأساسات', icon: '🏗️' },
  paredes: { es: 'Levantamiento de paredes', de: 'Wandbau', en: 'Wall construction', fr: 'Construction des murs', ar: 'بناء الجدران', icon: '🧱' },
  techo: { es: 'Instalación del techo', de: 'Dachinstallation', en: 'Roof installation', fr: 'Installation du toit', ar: 'تركيب السقف', icon: '🏠' },
  terminada: { es: '¡Escuela terminada!', de: 'Schule fertig!', en: 'School completed!', fr: 'École terminée !', ar: 'المدرسة مكتملة!', icon: '🎉' },
};

const phases = ['terreno', 'cimientos', 'paredes', 'techo', 'terminada'];

function fmtEur(val: number | undefined | null): string {
  return typeof val === 'number'
    ? val.toLocaleString('de-DE', { minimumFractionDigits: 2 })
    : '—';
}

function fmtNum(val: number | undefined | null): string {
  return typeof val === 'number' ? val.toLocaleString('de-DE') : '—';
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 1500;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}{suffix}</span>;
}

export default function TransparenciaPage() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeStats, setStripeStats] = useState<StripeStats | null>(null);
  const [stripeLoading, setStripeLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transparency')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setStats)
      .catch((err: unknown) => {
        console.error('[transparency fetch]', err instanceof Error ? err.message : err);
        setStats(null);
      })
      .finally(() => setLoading(false));

    fetch('/api/stripe/mrr')
      .then((r) => r.json())
      .then(setStripeStats)
      .catch(() => setStripeStats(null))
      .finally(() => setStripeLoading(false));
  }, []);

  const currentPhaseIndex = stats ? phases.indexOf(stats.schoolPhase) : 0;
  const phaseLabel = stats ? (phaseLabels[stats.schoolPhase]?.[language as keyof typeof phaseLabels['terreno']] || phaseLabels[stats.schoolPhase]?.es) : '';

  const schoolPercent = stats?.schoolProgress ?? 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-emerald-700/50 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-200 text-sm mb-6">
              <CheckCircle className="w-4 h-4" />
              Transparencia Radical · Datos en tiempo real
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Cada euro,<br />
              <span className="text-emerald-300">visible.</span>
            </h1>
            <p className="text-emerald-100 text-xl max-w-2xl mx-auto leading-relaxed">
              En quetz.org no hay letra pequeña. Aquí puedes ver exactamente qué pasa con cada adopción, cada euro y cada árbol.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stripe MRR — Real Revenue */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Ingresos reales — directo desde Stripe</h2>
          </div>
          <p className="text-gray-400 text-center text-xs mb-8">
            Datos en tiempo real · sin redondeos · sin letra pequeña
          </p>

          {stripeLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 animate-pulse h-28" />
              ))}
            </div>
          ) : stripeStats && !stripeStats.error ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  {
                    icon: TrendingUp,
                    label: 'MRR (Ingresos recurrentes/mes)',
                    value: `€${stripeStats.mrr.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                    color: 'emerald',
                    tooltip: 'Suma de todas las suscripciones activas, normalizadas a mensual',
                  },
                  {
                    icon: DollarSign,
                    label: 'Total recaudado (histórico)',
                    value: `€${stripeStats.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                    color: 'blue',
                    tooltip: 'Todos los cobros exitosos desde el inicio',
                  },
                  {
                    icon: Users,
                    label: 'Suscriptores activos',
                    value: stripeStats.activeSubscribers.toString(),
                    color: 'violet',
                    tooltip: 'Personas con suscripción mensual activa ahora mismo',
                  },
                  {
                    icon: CreditCard,
                    label: 'Pagos únicos',
                    value: `€${stripeStats.oneTimeRevenue.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                    color: 'amber',
                    tooltip: 'Adopciones y donaciones de una sola vez',
                  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-5 text-center`}
                  >
                    <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <p className={`text-2xl font-bold text-${color}-700 tabular-nums`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Actualizado: {new Date(stripeStats.lastUpdated).toLocaleString('es-ES', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {' '}· Caché 5 min
              </p>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Datos Stripe no disponibles en este momento.</p>
              {stripeStats?.error && (
                <p className="text-xs text-red-400 mt-1">{stripeStats.error}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Impacto acumulado</h2>
          <p className="text-gray-500 text-center mb-10 text-sm">Actualizado automáticamente con cada adopción</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: TreePine, label: 'Bäume adoptiert', value: stats?.treesAdopted ?? 0, color: 'emerald', suffix: '' },
                { icon: Sprout, label: 'Jornale finanziert', value: stats?.jornalesFunded ?? 0, color: 'amber', suffix: '' },
                { icon: Leaf, label: 'kg CO₂ gebunden/Jahr', value: stats?.co2CapturedKg ?? 0, color: 'green', suffix: '' },
                { icon: Users, label: 'Adoptanten', value: stats?.totalAdopters ?? 0, color: 'violet', suffix: '' },
              ].map(({ icon: Icon, label, value, color, suffix }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl p-6 shadow-sm border border-${color}-100 text-center`}
                >
                  <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                  <p className={`text-3xl font-bold text-${color}-700`}>
                    <AnimatedNumber value={value} suffix={suffix} />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Money Flow — live breakdown */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Wohin fließt dein Geld?</h2>
          <p className="text-gray-500 text-center mb-10 text-sm">Echte Zahlen · ohne Beschönigung · direkt aus der Datenbank</p>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 animate-pulse">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Gross → Stripe fees → Net */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Brutto eingenommen</p>
                    <p className="text-2xl font-bold text-gray-900">€{fmtEur(stats?.totalRaisedEur)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 flex items-center justify-end gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      Stripe-Gebühren {stats?.stripeFeesEstimated ? '(geschätzt)' : ''}
                    </p>
                    <p className="text-2xl font-bold text-red-500">−€{fmtEur(stats?.stripeFeesEur)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">3,4% + 0,35 € / Transaktion</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Netto</p>
                    <p className="text-2xl font-bold text-emerald-700">€{fmtEur(stats?.netRaisedEur)}</p>
                  </div>
                </div>
              </div>

              {/* Allocation breakdown */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-sm font-semibold text-gray-700 mb-4">Verteilung des Nettobetrags</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Aufforstung', pct: '40 %', value: stats?.plantingAllocation, color: 'emerald', icon: Sprout },
                    { label: 'Schule Zacapa', pct: '30 %', value: stats?.schoolAllocation, color: 'blue', icon: School },
                    { label: 'Betrieb', pct: '20 %', value: stats?.operationsAllocation, color: 'gray', icon: Landmark },
                    { label: 'Reserve', pct: '10 %', value: stats?.reserveAllocation, color: 'violet', icon: TrendingUp },
                  ].map(({ label, pct, value, color, icon: Icon }) => (
                    <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4 text-center`}>
                      <Icon className={`w-5 h-5 text-${color}-500 mx-auto mb-2`} />
                      <p className={`text-lg font-bold text-${color}-700`}>€{fmtEur(value)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                      <p className={`text-xs font-medium text-${color}-500`}>{pct}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* School Progress */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2 justify-center">
            <School className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Escuela en Zacapa — Avance en vivo</h2>
          </div>
          <p className="text-gray-500 text-center mb-10">Zacapa, Guatemala · Meta: €50,000</p>

          {/* Progress bar */}
          {loading ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 mb-8 animate-pulse">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
              </div>
              <div className="h-4 bg-gray-100 rounded-full" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 mb-8">
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Zugeteilt</p>
                  <p className="text-2xl font-bold text-blue-700">€{fmtEur(stats?.schoolAllocated)}</p>
                  <p className="text-xs text-gray-400">30 % des Nettobetrags</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Überwiesen</p>
                  <p className="text-2xl font-bold text-emerald-600">€{fmtEur(stats?.schoolTransferred)}</p>
                  <p className="text-xs text-gray-400">nach Guatemala gesendet</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ausstehend</p>
                  <p className="text-2xl font-bold text-amber-500">€{fmtEur(stats?.schoolPending)}</p>
                  <p className="text-xs text-gray-400">nächste Überweisung</p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Ziel: €{fmtNum(stats?.schoolGoal)}</span>
                <span>
                  {typeof stats?.schoolProgress === 'number'
                    ? stats.schoolProgress < 0.01
                      ? '<0,01%'
                      : `${stats.schoolProgress.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
                    : '—'}
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(schoolPercent, schoolPercent > 0 ? 1 : 0)}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
              </div>
              {typeof stats?.treesNeededRemaining === 'number' && stats.treesNeededRemaining > 0 && (
                <p className="text-center text-sm font-semibold text-blue-700 mt-4">
                  Noch {fmtNum(stats.treesNeededRemaining)} Bäume bis zur Schule
                </p>
              )}
            </div>
          )}

          {/* Phase tracker */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <h3 className="font-bold text-gray-800 mb-6 text-center">Fases de construcción</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-1000"
                style={{ width: `${(currentPhaseIndex / (phases.length - 1)) * 100}%` }}
              />
              {phases.map((phase, idx) => {
                const isCompleted = idx < currentPhaseIndex;
                const isCurrent = idx === currentPhaseIndex;
                const phaseInfo = phaseLabels[phase];
                return (
                  <div key={phase} className="flex flex-col items-center z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                      isCompleted ? 'bg-blue-500 border-blue-500 text-white' :
                      isCurrent ? 'bg-white border-blue-500 text-blue-500 shadow-lg' :
                      'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {isCompleted ? '✓' : phaseInfo.icon}
                    </div>
                    <p className={`text-xs mt-2 text-center max-w-16 leading-tight ${
                      isCurrent ? 'font-bold text-blue-700' : isCompleted ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {phaseInfo[language as keyof typeof phaseInfo] || phaseInfo.es}
                    </p>
                    {isCurrent && (
                      <span className="mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Actual
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Dónde trabajamos</h2>
          <p className="text-gray-500 text-center mb-10">Zacapa, Guatemala — 14°58'N, 89°31'W</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-gray-800">Zacapa, Guatemala</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Zacapa es uno de los departamentos más áridos de Guatemala. La aldea donde se construirá la escuela es una comunidad rural con acceso limitado a educación y servicios básicos.
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Departamento', value: 'Zacapa, Guatemala' },
                  { label: 'Altitud', value: '~200 m sobre el nivel del mar' },
                  { label: 'Clima', value: 'Tropical seco (bosque seco subtropical)' },
                  { label: 'Especies plantadas', value: 'Café, aguacate, mango, cacao, caoba, cedro, naranja, limón, pino' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-700 text-right max-w-48">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Google Maps */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 h-72 md:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120000!2d-89.5!3d14.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f63e0a3e3e3e3e3%3A0x0!2sZacapa%2C+Guatemala!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '280px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Zacapa, Guatemala"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-16 px-4 bg-emerald-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Nuestro compromiso</h2>
          <p className="text-emerald-100 text-lg leading-relaxed mb-8">
            Publicamos estos datos porque creemos que la confianza se gana con hechos, no con palabras. Si en algún momento tienes dudas sobre cómo se usa tu dinero, escríbenos directamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:info@quetz.org"
              className="bg-white text-emerald-800 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
            >
              Escríbenos
            </Link>
            <Link
              href="/#adoptar"
              className="border border-emerald-400 text-emerald-100 px-6 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors"
            >
              Adoptar un árbol
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
