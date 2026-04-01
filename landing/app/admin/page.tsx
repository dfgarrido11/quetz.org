'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Euro, TreePine, Users, School, TrendingUp, Gift,
  RefreshCw, ExternalLink, Download, Loader2,
  Activity, Mail, Building2, Leaf,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: 'gift' | 'adoption';
  description: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  code: string | null;
  createdAt: string;
}

interface CorporateLead {
  id: string;
  companyName: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  employeeCount: string | null;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalRevenue: number;
  giftRevenue: number;
  adoptionRevenue: number;
  donationRevenue: number;
  mrr: number;
  socialFund: number;
  schoolRaised: number;
  schoolGoal: number;
  schoolProgress: number;
  treesAdopted: number;
  treesFromGifts: number;
  totalTrees: number;
  totalFamilies: number;
  co2Captured: number;
  giftsPending: number;
  giftsPaid: number;
  giftsSent: number;
  giftsActivated: number;
  giftsTotal: number;
  totalUsers: number;
  corporateLeads: number;
  newsletterLeads: number;
  pendingAdoptions: number;
  activeSubscriptions: number;
  recentActivity: ActivityItem[];
  corporateLeadsList: CorporateLead[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function eur(n: number) {
  return '€' + n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function exportCSV(stats: DashboardStats) {
  const rows = [
    ['Tipo', 'Descripción', 'Plan', 'Monto', 'Moneda', 'Estado', 'Código', 'Fecha'],
    ...stats.recentActivity.map(a => [
      a.type === 'gift' ? 'Regalo' : 'Adopción',
      a.description,
      a.planName,
      a.amount.toFixed(2),
      a.currency,
      a.status,
      a.code ?? '',
      new Date(a.createdAt).toLocaleString('es-ES'),
    ]),
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quetz-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, sub, accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${accent ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white' : 'bg-white border-gray-100'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent ? 'bg-white/20' : 'bg-[#2D6A4F]/10'}`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-[#2D6A4F]'}`} />
      </div>
      <p className={`text-2xl font-bold leading-tight ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-sm mt-0.5 ${accent ? 'text-white/80' : 'text-gray-500'}`}>{label}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${accent ? 'text-white/60' : 'text-[#2D6A4F]'}`}>{sub}</p>}
    </div>
  );
}

function SmallCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {note && <p className="text-xs text-[#2D6A4F] font-medium mt-1">{note}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid:      'bg-blue-50 text-blue-700',
    sent:      'bg-emerald-50 text-emerald-700',
    activated: 'bg-green-100 text-green-800',
    pending:   'bg-yellow-50 text-yellow-700',
    active:    'bg-green-100 text-green-800',
    cancelled: 'bg-red-50 text-red-700',
    new:       'bg-yellow-50 text-yellow-700',
    contacted: 'bg-blue-50 text-blue-700',
    proposal_sent: 'bg-purple-50 text-purple-700',
    rejected:  'bg-red-50 text-red-700',
  };
  const labels: Record<string, string> = {
    paid: 'Pagado', sent: 'Enviado', activated: 'Activado',
    pending: 'Pendiente', active: 'Activo', cancelled: 'Cancelado',
    new: 'Nuevo', contacted: 'Contactado',
    proposal_sent: 'Propuesta', rejected: 'Rechazado',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">Error cargando datos del dashboard</p>
        <button onClick={() => load()} className="mt-3 text-sm text-[#2D6A4F] underline">
          Reintentar
        </button>
      </div>
    );
  }

  const funnelSteps = [
    { label: 'Pendiente', count: stats.giftsPending,   color: 'bg-yellow-400' },
    { label: 'Pagado',    count: stats.giftsPaid,      color: 'bg-blue-500'   },
    { label: 'Enviado',   count: stats.giftsSent,      color: 'bg-emerald-500'},
    { label: 'Activado',  count: stats.giftsActivated, color: 'bg-green-600'  },
  ];
  const funnelTotal = Math.max(stats.giftsTotal, 1);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastUpdated
              ? `Actualizado: ${lastUpdated.toLocaleTimeString('es-ES')} · auto-refresh cada 30 s`
              : 'Cargando…'}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* ROW 1 — Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Euro}
          label="Ingresos Totales"
          value={eur(stats.totalRevenue)}
          sub={`MRR: ${eur(stats.mrr)}/mes`}
          accent
        />
        <KpiCard
          icon={TrendingUp}
          label="MRR"
          value={eur(stats.mrr) + '/mo'}
          sub={`${stats.activeSubscriptions} suscripciones activas`}
        />
        <KpiCard
          icon={TreePine}
          label="Árboles Totales"
          value={stats.totalTrees.toLocaleString('es-ES')}
          sub={`${stats.totalFamilies} familias · ${stats.co2Captured.toLocaleString('es-ES')} kg CO₂`}
        />
        <KpiCard
          icon={School}
          label="Escuela Jumuzna"
          value={`${stats.schoolProgress.toFixed(1)}%`}
          sub={`${eur(stats.schoolRaised)} de ${eur(stats.schoolGoal)}`}
        />
      </div>

      {/* ROW 2 — Revenue Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Desglose de Ingresos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SmallCard
            label="Ingresos por Regalos"
            value={eur(stats.giftRevenue)}
            note={`${stats.giftsTotal} regalo${stats.giftsTotal !== 1 ? 's' : ''} total`}
          />
          <SmallCard
            label="Ingresos por Suscripciones"
            value={eur(stats.adoptionRevenue)}
            note={`${stats.treesAdopted} adopciones`}
          />
          <SmallCard
            label="Donaciones"
            value={eur(stats.donationRevenue)}
            note="Fondos directos"
          />
        </div>
      </div>

      {/* ROW 3 — Gift Funnel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Gift className="w-5 h-5 text-[#2D6A4F]" />
          <h2 className="font-semibold text-gray-900">Embudo de Regalos</h2>
          <span className="ml-auto text-sm text-gray-500">{stats.giftsTotal} total</span>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {funnelSteps.map((step) => (
            <div key={step.label} className="text-center">
              <div className="text-3xl font-bold text-gray-900">{step.count}</div>
              <div className="text-sm text-gray-500 mt-0.5">{step.label}</div>
            </div>
          ))}
        </div>
        {/* Stacked bar */}
        <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
          {funnelSteps.map((step) => {
            const pct = (step.count / funnelTotal) * 100;
            return pct > 0 ? (
              <div
                key={step.label}
                className={`${step.color} h-full rounded-full transition-all`}
                style={{ width: `${pct}%` }}
                title={`${step.label}: ${step.count}`}
              />
            ) : null;
          })}
          {stats.giftsTotal === 0 && (
            <div className="bg-gray-100 h-full rounded-full w-full" />
          )}
        </div>
        <div className="flex gap-4 mt-3">
          {funnelSteps.map((step) => (
            <div key={step.label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* ROW 4 — School Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-2">
          <School className="w-5 h-5 text-[#2D6A4F]" />
          <h2 className="font-semibold text-gray-900">Escuela Jumuzna — Progreso de Construcción</h2>
        </div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-3xl font-bold text-[#2D6A4F]">{eur(stats.schoolRaised)}</p>
            <p className="text-sm text-gray-500 mt-0.5">recaudados de {eur(stats.schoolGoal)} objetivo</p>
          </div>
          <p className="text-4xl font-black text-gray-200">{stats.schoolProgress.toFixed(0)}%</p>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788] rounded-full transition-all duration-700"
            style={{ width: `${Math.max(stats.schoolProgress, 0.5)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>€0</span>
          <span className="text-[#2D6A4F] font-medium">{eur(stats.schoolRaised)}</span>
          <span>{eur(stats.schoolGoal)}</span>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Fondo social (30% de ingresos totales) · {stats.totalTrees} árboles plantados generan este fondo automáticamente
        </p>
      </div>

      {/* ROW 5 — Pipeline */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.corporateLeads}</p>
              <p className="text-sm text-gray-500">Leads Corporativos</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.newsletterLeads}</p>
              <p className="text-sm text-gray-500">Newsletter</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#2D6A4F]/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Usuarios Registrados</p>
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-sm border flex items-center gap-4 ${stats.pendingAdoptions > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.pendingAdoptions > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
              <Activity className={`w-5 h-5 ${stats.pendingAdoptions > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats.pendingAdoptions > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.pendingAdoptions}</p>
              <p className="text-sm text-gray-500">Adopciones Pendientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 6 — Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#2D6A4F]" />
          <h2 className="font-semibold text-gray-900">Actividad Reciente</h2>
          <span className="ml-auto text-sm text-gray-400">últimas {stats.recentActivity.length} transacciones</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Quién</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No hay actividad reciente
                  </td>
                </tr>
              ) : (
                stats.recentActivity.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${item.type === 'gift' ? 'bg-amber-50 text-amber-700' : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'}`}>
                        {item.type === 'gift' ? <Gift className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                        {item.type === 'gift' ? 'Regalo' : 'Adopción'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 max-w-[180px] truncate">{item.description}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{item.planName}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{eur(item.amount)}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{item.code ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 7 — Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2D6A4F] text-white rounded-xl text-sm font-semibold hover:bg-[#1B4332] transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Stripe Dashboard
          </a>
          <button
            onClick={() => exportCSV(stats)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#2D6A4F] text-[#2D6A4F] rounded-xl text-sm font-semibold hover:bg-[#2D6A4F]/5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl text-sm font-semibold cursor-not-allowed"
            title="Próximamente"
          >
            <TreePine className="w-4 h-4" />
            Enviar Update a Guatemala
            <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Pronto</span>
          </button>
        </div>
      </div>

    </div>
  );
}
