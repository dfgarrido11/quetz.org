'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { ArrowLeft, Download, Share2, Leaf, MapPin, Calendar, User, TreePine, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CertificateData {
  id: string;
  userName: string;
  treeName: string;
  treeSpecies: string;
  treeImage: string;
  farmerName: string | null;
  farmerLocation: string | null;
  adoptedAt: string;
  quantity: number;
  co2PerYear: number;
  impactFamilies: number;
}

export default function CertificadoPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const certRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const adoptionId = params?.id as string;

  useEffect(() => {
    if (!adoptionId) return;
    fetch(`/api/certificado/${adoptionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Error loading certificate'))
      .finally(() => setLoading(false));
  }, [adoptionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: 'Mi certificado de adopción — quetz.org', url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  };

  const formattedDate = data
    ? new Date(data.adoptedAt).toLocaleDateString(
        language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-GB' : 'es-ES',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )
    : '';

  // Short certificate ID for display
  const shortId = adoptionId ? adoptionId.slice(-8).toUpperCase() : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-emerald-700 font-medium">Cargando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center p-8">
          <TreePine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Certificado no encontrado</h2>
          <p className="text-gray-500 mb-6">Este certificado no existe o no tienes acceso.</p>
          <Link href="/mi-bosque" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
            {t('cert.backToForest')}
          </Link>
        </div>
      </div>
    );
  }

  const treeName = language === 'de' ? data.treeName : data.treeName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 print:bg-white">
      {/* Action Bar - hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/mi-bosque" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t('cert.backToForest')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {t('cert.share')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('cert.download')}
            </button>
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div className="max-w-3xl mx-auto px-4 py-10 print:py-0 print:px-0 print:max-w-full">
        <div
          ref={certRef}
          className="bg-white rounded-3xl print:rounded-none shadow-2xl print:shadow-none overflow-hidden relative"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {/* Top decorative band */}
          <div className="h-3 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500" />

          {/* Header */}
          <div className="relative bg-gradient-to-br from-emerald-800 to-green-900 text-white px-8 pt-10 pb-16">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="relative flex flex-col items-center text-center">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-6">
                <Leaf className="w-8 h-8 text-emerald-300" />
                <span className="text-2xl font-bold tracking-wider text-emerald-100">QUETZ</span>
                <Leaf className="w-8 h-8 text-emerald-300 scale-x-[-1]" />
              </div>

              <Award className="w-16 h-16 text-yellow-300 mb-4 drop-shadow-lg" />

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
                {t('cert.title')}
              </h1>
              <p className="text-emerald-200 text-sm tracking-widest uppercase">
                quetz.org · Zacapa, Guatemala
              </p>
            </div>
          </div>

          {/* Wave divider */}
          <div className="-mt-8 relative z-10">
            <svg viewBox="0 0 1200 80" className="w-full" preserveAspectRatio="none">
              <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" fill="white" />
            </svg>
          </div>

          {/* Main content */}
          <div className="px-8 md:px-16 pb-10 -mt-4">
            {/* Certificate text */}
            <div className="text-center mb-8">
              <p className="text-gray-500 text-lg mb-3">{t('cert.subtitle')}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                {data.userName}
              </h2>
              <p className="text-gray-500 text-lg mb-2">{t('cert.hasAdopted')}</p>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-6 py-2">
                <TreePine className="w-5 h-5 text-emerald-600" />
                <span className="text-xl font-bold text-emerald-800">
                  {data.quantity > 1 ? `${data.quantity} × ` : ''}{treeName}
                </span>
              </div>
              <p className="text-gray-500 mt-3 flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-500" />
                {t('cert.treeIn')}
              </p>
            </div>

            {/* Tree image + details */}
            <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
              {/* Tree photo */}
              <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-4 border-emerald-100">
                <Image
                  src={data.treeImage || '/trees/cafe.jpg'}
                  alt={treeName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {data.farmerName && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{t('cert.caredBy')}</span>
                    </div>
                    <p className="font-bold text-gray-800">{data.farmerName}</p>
                    {data.farmerLocation && <p className="text-xs text-gray-500">{data.farmerLocation}</p>}
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{t('cert.adoptedOn')}</span>
                  </div>
                  <p className="font-bold text-gray-800">{formattedDate}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">{t('cert.impact')}</span>
                  </div>
                  <p className="font-bold text-gray-800">
                    {(data.co2PerYear * data.quantity).toFixed(0)} {t('cert.co2')}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t('cert.certId')}</span>
                  </div>
                  <p className="font-bold text-gray-800 font-mono text-sm">QUETZ-{shortId}</p>
                </div>
              </div>
            </div>

            {/* School contribution note */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-8 text-center">
              <p className="text-emerald-800 text-sm leading-relaxed">
                🏫 Con esta adopción también contribuyes a la construcción de la <strong>Escuela de Jumuzna</strong>, Zacapa — un futuro para 120 niños.
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400">{t('cert.verifyAt')}</p>
                <p className="text-sm font-semibold text-emerald-700">quetz.org/certificado/{adoptionId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-800">quetz.org</span>
                <span className="text-xs text-gray-400">· Raíces que cambian vidas</span>
              </div>
            </div>
          </div>

          {/* Bottom decorative band */}
          <div className="h-3 bg-gradient-to-r from-teal-500 via-green-500 to-emerald-600" />
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          [ref="certRef"], [ref="certRef"] * { visibility: visible; }
          .max-w-3xl { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
