'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Calendar, Users, Target, Trophy, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'urgent';
  category: 'grants' | 'outreach' | 'content' | 'seo' | 'development' | 'funding';
  deadline?: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  roi: string;
}

const MANUS_TODOS: TodoItem[] = [
  // URGENTE - Abril 2026
  {
    id: '1',
    title: 'INSCRIBIR KUER.NRW 2026',
    description: 'Deadline 15 abril. Premio €7,000 + coaching + inversores. Documentación ya preparada por Manus.',
    status: 'urgent',
    category: 'grants',
    deadline: '2026-04-15',
    impact: 'high',
    effort: 'medium',
    roi: '€7,000 potencial'
  },
  {
    id: '2',
    title: 'Cold Emails a 50 Empresas CSR',
    description: 'Manus ya personalizó los 50 emails. Enviar 10 por semana. Meta: 1-2 conversiones.',
    status: 'pending',
    category: 'outreach',
    deadline: '2026-04-30',
    impact: 'high',
    effort: 'low',
    roi: '€500-2,000 MRR'
  },
  {
    id: '3',
    title: 'Publicar Contenido Instagram',
    description: 'Carousel 5 slides listo + fotos vivero + videos guardián. Programar 3-4 posts/semana.',
    status: 'pending',
    category: 'content',
    deadline: '2026-04-07',
    impact: 'medium',
    effort: 'low',
    roi: '300 seguidores en 30 días'
  },

  // DINERO INMEDIATO
  {
    id: '4',
    title: 'Gründungsstipendium NRW',
    description: '€1,200/mes × 12 = €14,400. Concept Proposal preparado por Manus.',
    status: 'pending',
    category: 'grants',
    deadline: '2026-09-30',
    impact: 'high',
    effort: 'medium',
    roi: '€14,400 garantizado'
  },
  {
    id: '5',
    title: 'Implementar SEO Básico',
    description: 'Meta tags + sitemap + 4 blog posts en alemán. Keywords research completo.',
    status: 'pending',
    category: 'seo',
    deadline: '2026-05-31',
    impact: 'high',
    effort: 'medium',
    roi: 'Tráfico orgánico alemán'
  },
  {
    id: '6',
    title: 'Landing Page B2B (/empresas)',
    description: 'Calculadora de impacto + caso uso CSRD + formulario directo',
    status: 'pending',
    category: 'development',
    deadline: '2026-05-15',
    impact: 'high',
    effort: 'medium',
    roi: 'Conversión B2B mejorada'
  },

  // GRANTS GRANDES
  {
    id: '7',
    title: 'develoPPP.de Application',
    description: 'Hasta €200,000 (50% gobierno). Projektskizze preparada. Necesita partner alemán.',
    status: 'pending',
    category: 'grants',
    deadline: '2026-07-31',
    impact: 'high',
    effort: 'high',
    roi: '€200,000 potencial'
  },
  {
    id: '8',
    title: 'Grüne Gründungen.NRW 7ª Ronda',
    description: '€150,000-€300,000. Documentación técnica en preparación.',
    status: 'pending',
    category: 'grants',
    deadline: '2026-09-15',
    impact: 'high',
    effort: 'high',
    roi: '€300,000 potencial'
  },

  // AUTOMATIZACIÓN
  {
    id: '9',
    title: 'Sistema de Referidos Waldfreunde',
    description: 'Links únicos + dashboard + 20% descuento automático + emails. Ya diseñado.',
    status: 'pending',
    category: 'development',
    deadline: '2026-06-30',
    impact: 'medium',
    effort: 'high',
    roi: 'Crecimiento orgánico'
  },
  {
    id: '10',
    title: 'Mejorar Onboarding B2B',
    description: 'Flujo automatizado: calculadora → plan → pago → dashboard inmediato',
    status: 'pending',
    category: 'development',
    deadline: '2026-06-15',
    impact: 'medium',
    effort: 'medium',
    roi: 'Conversión automática'
  },

  // COMPLETADOS POR MANUS
  {
    id: '11',
    title: '50 Empresas CSR Identificadas',
    description: 'Excel con empresas NRW puntuadas y datos de contacto',
    status: 'completed',
    category: 'outreach',
    impact: 'high',
    effort: 'low',
    roi: 'Base de leads calificada'
  },
  {
    id: '12',
    title: 'Análisis Competitivo DACH',
    description: 'Treedom, Plant-for-Planet, etc. Precios, gaps, oportunidades',
    status: 'completed',
    category: 'outreach',
    impact: 'high',
    effort: 'low',
    roi: 'Estrategia de posicionamiento'
  },
  {
    id: '13',
    title: 'Investor Deck 14 Slides',
    description: 'Presentación profesional lista para presentar',
    status: 'completed',
    category: 'funding',
    impact: 'high',
    effort: 'low',
    roi: 'Material de fundraising'
  },
  {
    id: '14',
    title: 'Calendario Contenido 90 Días',
    description: 'Posts LinkedIn/Instagram en alemán programados',
    status: 'completed',
    category: 'content',
    impact: 'medium',
    effort: 'low',
    roi: 'Presencia profesional'
  },
  {
    id: '15',
    title: 'Cold Email Playbook DACH',
    description: '3 secuencias × 5 emails en alemán personalizados',
    status: 'completed',
    category: 'outreach',
    impact: 'high',
    effort: 'low',
    roi: 'Herramienta de conversión'
  }
];

export default function ManusTodoPage() {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'pending' | 'completed'>('all');

  const filteredTodos = MANUS_TODOS.filter(todo =>
    filter === 'all' || todo.status === filter
  );

  const getStatusIcon = (status: TodoItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: TodoItem['category']) => {
    switch (category) {
      case 'grants':
        return 'bg-green-100 text-green-800';
      case 'outreach':
        return 'bg-blue-100 text-blue-800';
      case 'content':
        return 'bg-purple-100 text-purple-800';
      case 'seo':
        return 'bg-orange-100 text-orange-800';
      case 'development':
        return 'bg-gray-100 text-gray-800';
      case 'funding':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const urgentTodos = MANUS_TODOS.filter(t => t.status === 'urgent').length;
  const pendingTodos = MANUS_TODOS.filter(t => t.status === 'pending').length;
  const completedTodos = MANUS_TODOS.filter(t => t.status === 'completed').length;
  const totalROI = '€500K+ potencial';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MANUS TODO DASHBOARD</h1>
            <p className="text-gray-600">Plan maestro para construir la escuela en 2026</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-quetz-green">{totalROI}</div>
            <div className="text-sm text-gray-500">ROI potencial total</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-red-700">{urgentTodos}</div>
                <div className="text-sm text-red-600">Urgente</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{pendingTodos}</div>
                <div className="text-sm text-blue-600">Pendiente</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-700">{completedTodos}</div>
                <div className="text-sm text-green-600">Completado</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-yellow-700">€49K</div>
                <div className="text-sm text-yellow-600">Meta escuela</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'urgent', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === status
                  ? 'bg-quetz-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'urgent' ? 'Urgente' : status === 'pending' ? 'Pendiente' : 'Completado'}
            </button>
          ))}
        </div>
      </div>

      {/* TODO List */}
      <div className="space-y-4">
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${
              todo.status === 'urgent' ? 'border-red-200 bg-red-50' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-4">
              {getStatusIcon(todo.status)}

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-semibold ${
                      todo.status === 'urgent' ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(todo.category)}`}>
                      {todo.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {todo.deadline && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(todo.deadline).toLocaleDateString('de-DE')}
                      </div>
                    )}
                    <div className="text-sm font-medium text-quetz-green">
                      {todo.roi}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600">{todo.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      todo.impact === 'high' ? 'bg-red-100 text-red-700' :
                      todo.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      Impacto: {todo.impact}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      todo.effort === 'high' ? 'bg-red-100 text-red-700' :
                      todo.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      Esfuerzo: {todo.effort}
                    </div>
                  </div>

                  {todo.status !== 'completed' && (
                    <div className="flex items-center gap-2">
                      <button className="text-quetz-green hover:text-quetz-green/80 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Summary */}
      <div className="bg-gradient-to-r from-quetz-green to-green-600 rounded-xl text-white p-6">
        <h3 className="text-xl font-bold mb-4">PRÓXIMOS PASOS INMEDIATOS</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="font-semibold mb-1">ESTA SEMANA</div>
            <div className="text-sm opacity-90">• Inscribir KUER.NRW (deadline 15 abril)</div>
            <div className="text-sm opacity-90">• Enviar primeros 10 cold emails</div>
            <div className="text-sm opacity-90">• Publicar en Instagram</div>
          </div>
          <div>
            <div className="font-semibold mb-1">ESTE MES</div>
            <div className="text-sm opacity-90">• Completar 50 cold emails</div>
            <div className="text-sm opacity-90">• Aplicar Gründungsstipendium</div>
            <div className="text-sm opacity-90">• Implementar SEO básico</div>
          </div>
          <div>
            <div className="font-semibold mb-1">META 2026</div>
            <div className="text-sm opacity-90">• €49,600 para la escuela</div>
            <div className="text-sm opacity-90">• 200 suscriptores individuales</div>
            <div className="text-sm opacity-90">• 3 empresas CSR activas</div>
          </div>
        </div>
      </div>
    </div>
  );
}