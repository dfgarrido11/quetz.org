'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Trees, Leaf, MapPin, Calendar, Cloud, Search, Filter,
  Sprout, TreePine, Flower2, Download, Loader2, X,
} from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  seed: 'Semilla',
  sprout: 'Brote',
  sapling: 'Arbolito',
  mature: 'Árbol Maduro',
};

const STAGE_ICONS: Record<string, any> = {
  seed: Sprout,
  sprout: Leaf,
  sapling: Flower2,
  mature: TreePine,
};

const STAGES_ORDER = ['seed', 'sprout', 'sapling', 'mature'];

function daysSince(dateStr: string): number {
  const planted = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24)));
}

function co2ForAge(days: number): string {
  return (days * 0.0025).toFixed(2);
}

export default function TreesPage() {
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetch('/api/trees')
      .then(r => r.json())
      .then(d => { setTrees(d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = (trees ?? []).filter((t: any) => {
    const matchSearch = (t?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t?.species ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'all' || t?.growthStage === stageFilter;
    return matchSearch && matchStage;
  });

  const generateCertificate = async (tree: any) => {
    setPdfLoading(true);
    try {
      const days = daysSince(tree?.plantedDate ?? '');
      const co2 = co2ForAge(days);
      const plantedDate = new Date(tree?.plantedDate ?? '').toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' });
      const html = `
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"></head>
      <body style="font-family:Georgia,serif;margin:0;padding:40px;background:#f0fdf4;">
        <div style="max-width:700px;margin:0 auto;background:white;border:3px solid #166534;border-radius:12px;padding:50px;text-align:center;">
          <div style="font-size:14px;color:#166534;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;">Certificado de Reforestación</div>
          <h1 style="font-size:36px;color:#166534;margin:10px 0;">Quetz.org</h1>
          <div style="width:80px;height:2px;background:#166534;margin:15px auto;"></div>
          <p style="font-size:16px;color:#333;margin:20px 0;">Certifica que el árbol</p>
          <h2 style="font-size:28px;color:#14532d;margin:10px 0;">&ldquo;${tree?.name ?? 'Mi Árbol'}&rdquo;</h2>
          <p style="font-size:14px;color:#555;">Especie: <strong>${tree?.species ?? 'Ceiba'}</strong></p>
          <p style="font-size:14px;color:#555;">Plantado el: <strong>${plantedDate}</strong></p>
          <p style="font-size:14px;color:#555;">Ubicación GPS: <strong>${tree?.locationGps ?? '14.9720, -89.5228'}</strong></p>
          <p style="font-size:14px;color:#555;">Días creciendo: <strong>${days}</strong></p>
          <div style="margin:25px auto;padding:15px;background:#f0fdf4;border-radius:8px;display:inline-block;">
            <p style="font-size:24px;color:#166534;font-weight:bold;margin:0;">${co2} kg CO₂ capturado</p>
          </div>
          <div style="margin-top:20px;">
            <p style="font-size:11px;color:#888;">Zacapa, Guatemala 🇬🇹 | quetz.org</p>
            <p style="font-size:11px;color:#888;">ID: ${tree?.id ?? 'N/A'}</p>
          </div>
        </div>
      </body></html>`;

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: html, pdf_options: { format: 'A4', print_background: true, landscape: true } }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${(tree?.name ?? 'arbol').replace(/\s+/g, '-')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-3 border-green-700 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trees className="w-6 h-6 text-green-600" /> Mis Árboles
        </h1>
        <p className="text-sm text-gray-500 mt-1">Tu bosque personal en Zacapa, Guatemala</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o especie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-900"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-900 appearance-none"
          >
            <option value="all">Todas las etapas</option>
            {STAGES_ORDER.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      {/* Growth Timeline Legend */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Etapas de Crecimiento</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-green-200" />
          {STAGES_ORDER.map((stage, i) => {
            const Icon = STAGE_ICONS[stage];
            return (
              <div key={stage} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i <= 2 ? 'bg-green-600 text-white' : 'bg-green-700 text-white'
                } shadow`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">{STAGE_LABELS[stage]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tree Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered?.map?.((tree: any, i: number) => {
          const days = daysSince(tree?.plantedDate ?? '');
          const Icon = STAGE_ICONS[tree?.growthStage ?? 'seed'] ?? Sprout;
          return (
            <motion.div
              key={tree?.id ?? i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedTree(tree)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
            >
              <div className="relative aspect-[4/3] bg-green-100">
                <Image
                  src={tree?.photoUrl ?? '/favicon.svg'}
                  alt={tree?.name ?? 'Árbol'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="400px"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-medium text-green-800">
                  <Icon className="w-3.5 h-3.5" />
                  {STAGE_LABELS[tree?.growthStage ?? 'seed']}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{tree?.name ?? 'Sin nombre'}</h3>
                <p className="text-xs text-gray-500">{tree?.species ?? 'Especie desconocida'}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-3 h-3" /> {days} días
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Cloud className="w-3 h-3" /> {co2ForAge(days)} kg CO₂
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 col-span-2">
                    <MapPin className="w-3 h-3" /> {tree?.locationGps ?? 'Zacapa, GT'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        }) ?? null}
      </div>

      {(filtered?.length ?? 0) === 0 && (
        <div className="text-center py-12">
          <Trees className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No se encontraron árboles</p>
        </div>
      )}

      {/* Tree Detail Modal */}
      {selectedTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedTree(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-green-100">
              <Image
                src={selectedTree?.photoUrl ?? '/favicon.svg'}
                alt={selectedTree?.name ?? 'Árbol'}
                fill
                className="object-cover"
                sizes="600px"
              />
              <button onClick={() => setSelectedTree(null)} className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow hover:bg-white">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedTree?.name ?? ''}</h2>
              <p className="text-sm text-gray-500 mt-1">Especie: {selectedTree?.species ?? 'Ceiba'}</p>

              {/* Growth Timeline */}
              <div className="mt-5">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Progreso de Crecimiento</h4>
                <div className="flex items-center gap-1">
                  {STAGES_ORDER.map((stage) => {
                    const currentIndex = STAGES_ORDER.indexOf(selectedTree?.growthStage ?? 'seed');
                    const stageIndex = STAGES_ORDER.indexOf(stage);
                    const isCompleted = stageIndex <= currentIndex;
                    const Icon = STAGE_ICONS[stage];
                    return (
                      <div key={stage} className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className={`text-[10px] mt-1 ${isCompleted ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{STAGE_LABELS[stage]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Días desde plantación</p>
                  <p className="text-lg font-bold text-green-800">{daysSince(selectedTree?.plantedDate ?? '')}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">CO₂ capturado</p>
                  <p className="text-lg font-bold text-blue-800">{co2ForAge(daysSince(selectedTree?.plantedDate ?? ''))} kg</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-gray-500">Coordenadas GPS</p>
                  <p className="text-sm font-medium text-amber-800">{selectedTree?.locationGps ?? 'Zacapa, GT'}</p>
                </div>
              </div>

              <button
                onClick={() => generateCertificate(selectedTree)}
                disabled={pdfLoading}
                className="mt-5 w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {pdfLoading ? 'Generando certificado...' : 'Descargar Certificado PDF'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
