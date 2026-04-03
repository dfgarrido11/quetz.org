'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DashboardMetrics {
  // Lead Generation
  leadsGenerated: number;
  leadsEnriched: number;
  leadsQualified: number;

  // Email Performance
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsReplied: number;

  // Conversion Funnel
  meetingsBooked: number;
  proposalsSent: number;
  dealsCreated: number;
  dealsClosed: number;
  revenue: number;

  // Efficiency Metrics
  responseRate: number;
  conversionRate: number;
  averageScore: number;

  // Sequence Performance
  sequences: {
    [key: string]: {
      name: string;
      totalLeads: number;
      openRate: number;
      clickRate: number;
      replyRate: number;
    };
  };

  // Recent Activity
  recentLeads: Array<{
    id: string;
    company: string;
    score: number;
    source: string;
    status: string;
    createdAt: string;
  }>;

  lastUpdated: string;
}

const QuetzDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando métricas de Quetz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error cargando dashboard</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const calculateOpenRate = () => {
    return metrics.emailsDelivered > 0
      ? ((metrics.emailsOpened / metrics.emailsDelivered) * 100).toFixed(1)
      : '0';
  };

  const calculateClickRate = () => {
    return metrics.emailsDelivered > 0
      ? ((metrics.emailsClicked / metrics.emailsDelivered) * 100).toFixed(1)
      : '0';
  };

  const calculateReplyRate = () => {
    return metrics.emailsDelivered > 0
      ? ((metrics.emailsReplied / metrics.emailsDelivered) * 100).toFixed(1)
      : '0';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            🌱 Quetz B2B Dashboard
            <span className="ml-4 text-sm font-normal text-gray-500">
              Última actualización: {new Date(metrics.lastUpdated).toLocaleString()}
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema de automatización B2B funcionando 24/7 para generar leads y cerrar ventas
          </p>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Generados Hoy</CardTitle>
              <span className="text-2xl">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.leadsGenerated}</div>
              <p className="text-xs text-gray-500">
                {metrics.leadsQualified} calificados (Score >70)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
              <span className="text-2xl">📧</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.emailsSent}</div>
              <p className="text-xs text-gray-500">
                {calculateOpenRate()}% tasa de apertura
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meetings Agendados</CardTitle>
              <span className="text-2xl">📅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics.meetingsBooked}</div>
              <p className="text-xs text-gray-500">
                {metrics.proposalsSent} propuestas enviadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generado</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                €{metrics.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                {metrics.dealsClosed} deals cerrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>📊 Performance de Emails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Enviados</span>
                <span className="font-semibold">{metrics.emailsSent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Entregados</span>
                <span className="font-semibold text-green-600">{metrics.emailsDelivered}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Abiertos</span>
                <span className="font-semibold text-blue-600">
                  {metrics.emailsOpened} ({calculateOpenRate()}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clicks</span>
                <span className="font-semibold text-purple-600">
                  {metrics.emailsClicked} ({calculateClickRate()}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Respuestas</span>
                <span className="font-semibold text-orange-600">
                  {metrics.emailsReplied} ({calculateReplyRate()}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Funnel de Conversión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Leads Generados</span>
                  <span className="font-semibold">{metrics.leadsGenerated}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Leads Calificados</span>
                  <span className="font-semibold">{metrics.leadsQualified}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full"
                       style={{width: `${(metrics.leadsQualified/metrics.leadsGenerated)*100}%`}}>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Meetings Booked</span>
                  <span className="font-semibold">{metrics.meetingsBooked}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full"
                       style={{width: `${(metrics.meetingsBooked/metrics.leadsGenerated)*100}%`}}>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Deals Cerrados</span>
                  <span className="font-semibold">{metrics.dealsClosed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full"
                       style={{width: `${(metrics.dealsClosed/metrics.leadsGenerated)*100}%`}}>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sequence Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🤖 Performance de Secuencias de Automatización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Secuencia</th>
                    <th className="text-right p-2">Leads</th>
                    <th className="text-right p-2">Open Rate</th>
                    <th className="text-right p-2">Click Rate</th>
                    <th className="text-right p-2">Reply Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.sequences).map(([key, seq]) => (
                    <tr key={key} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{seq.name}</td>
                      <td className="p-2 text-right">{seq.totalLeads}</td>
                      <td className="p-2 text-right text-blue-600">{seq.openRate}%</td>
                      <td className="p-2 text-right text-purple-600">{seq.clickRate}%</td>
                      <td className="p-2 text-right text-orange-600">{seq.replyRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentLeads.slice(0, 10).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{lead.company}</div>
                    <div className="text-sm text-gray-500">
                      Score: {lead.score} • Source: {lead.source}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🤖 Sistema automatizado funcionando 24/7 para hacer crecer Quetz</p>
          <p className="mt-1">💚 Esos niños nos necesitan - cada lead cuenta para la escuela de Jumuzna</p>
        </div>
      </div>
    </div>
  );
};

export default QuetzDashboard;