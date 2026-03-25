'use client';

import { useEffect, useState } from 'react';
import { Euro, TreePine, Users, School, TrendingUp, Calendar, Loader2, Building2, Mail, Phone } from 'lucide-react';

interface DashboardStats {
  totalIncome: number;
  socialFund: number;
  treesAdopted: number;
  treesPlanted: number;
  familiesHelped: number;
  co2CapturedKg: number;
  schoolFunding: number;
  schoolProgress: number;
  pendingAdoptions: number;
  activeSubscriptions: number;
  totalUsers: number;
  corporateLeads: Array<{
    id: string;
    companyName: string;
    country: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
    employeeCount: string | null;
    status: string;
    message: string | null;
    createdAt: string;
  }>;
  recentAdoptions: Array<{
    id: string;
    userName: string;
    treeName: string;
    quantity: number;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-quetz-green" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error cargando datos</p>
      </div>
    );
  }

  const mainMetrics = [
    { label: 'Ingresos Totales', value: `€${stats.totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, icon: Euro, color: 'bg-green-500' },
    { label: 'Fondo Social (30%)', value: `€${stats.socialFund.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, icon: Users, color: 'bg-blue-500' },
    { label: 'Árboles Adoptados', value: stats.treesAdopted.toLocaleString('es-ES'), icon: TreePine, color: 'bg-emerald-500' },
    { label: 'Árboles Plantados', value: stats.treesPlanted.toLocaleString('es-ES'), icon: TreePine, color: 'bg-teal-500' },
    { label: 'Familias Beneficiadas', value: stats.familiesHelped.toLocaleString('es-ES'), icon: Users, color: 'bg-purple-500' },
    { label: 'CO₂ Capturado', value: `${stats.co2CapturedKg.toLocaleString('es-ES')} kg`, icon: TrendingUp, color: 'bg-cyan-500' },
    { label: 'Escuela (Recaudado)', value: `€${stats.schoolFunding.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, icon: School, color: 'bg-orange-500' },
    { label: 'Escuela (Progreso)', value: `${stats.schoolProgress.toFixed(1)}%`, icon: School, color: 'bg-yellow-500' },
  ];

  const operationalMetrics = [
    { label: 'Adopciones Pendientes', value: stats.pendingAdoptions, urgent: stats.pendingAdoptions > 0 },
    { label: 'Suscripciones Activas', value: stats.activeSubscriptions },
    { label: 'Usuarios Registrados', value: stats.totalUsers },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {mainMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white rounded-xl p-4 shadow-sm">
              <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {operationalMetrics.map((metric) => (
          <div 
            key={metric.label} 
            className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${metric.urgent ? 'border-red-500' : 'border-quetz-green'}`}
          >
            <p className={`text-3xl font-bold ${metric.urgent ? 'text-red-600' : 'text-gray-900'}`}>
              {metric.value}
            </p>
            <p className="text-sm text-gray-500">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Corporate Leads */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Leads Corporativos</h2>
          <span className="ml-auto text-sm text-gray-500">{stats.corporateLeads.length} leads</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">País</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleados</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.corporateLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No hay leads corporativos aún
                  </td>
                </tr>
              ) : (
                stats.corporateLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.companyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.country}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.contactName}</td>
                    <td className="px-4 py-3 text-sm">
                      <a href={`mailto:${lead.contactEmail}`} className="text-quetz-green hover:underline flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {lead.contactEmail}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {lead.contactPhone ? (
                        <a href={`tel:${lead.contactPhone}`} className="text-quetz-green hover:underline flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {lead.contactPhone}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.employeeCount || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'active' ? 'bg-green-100 text-green-700' :
                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'proposal_sent' ? 'bg-purple-100 text-purple-700' :
                        lead.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {lead.status === 'new' ? 'Nuevo' :
                         lead.status === 'contacted' ? 'Contactado' :
                         lead.status === 'proposal_sent' ? 'Propuesta enviada' :
                         lead.status === 'active' ? 'Activo' :
                         lead.status === 'rejected' ? 'Rechazado' : lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Adoptions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Adopciones Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Árbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentAdoptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay adopciones recientes
                  </td>
                </tr>
              ) : (
                stats.recentAdoptions.map((adoption) => (
                  <tr key={adoption.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{adoption.userName || 'Anónimo'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{adoption.treeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{adoption.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {adoption.currency === 'EUR' ? '€' : adoption.currency} {adoption.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        adoption.status === 'paid' || adoption.status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : adoption.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {adoption.status === 'paid' ? 'Pagado' : 
                         adoption.status === 'active' ? 'Activo' :
                         adoption.status === 'pending' ? 'Pendiente' : adoption.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(adoption.createdAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
