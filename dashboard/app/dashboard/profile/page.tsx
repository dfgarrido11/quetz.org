'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Crown, Save, Loader2, CheckCircle, Download,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession() || {};
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setProfile(d);
        setName(d?.name ?? '');
        setEmail(d?.email ?? '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const generateAnnualReport = async () => {
    setPdfLoading(true);
    try {
      const impactRes = await fetch('/api/impact');
      const impactData = await impactRes.json();
      const metrics = impactData?.metrics ?? {};
      const userName = profile?.name ?? 'Suscriptor';

      const html = `
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"></head>
      <body style="font-family:Georgia,serif;margin:0;padding:40px;background:#f0fdf4;">
        <div style="max-width:700px;margin:0 auto;background:white;border:3px solid #166534;border-radius:12px;padding:50px;">
          <div style="text-align:center;margin-bottom:30px;">
            <h1 style="font-size:32px;color:#166534;margin:0;">Quetz.org</h1>
            <p style="color:#555;font-size:14px;">Certificado de Impacto Anual</p>
            <div style="width:80px;height:2px;background:#166534;margin:15px auto;"></div>
          </div>
          <p style="font-size:16px;color:#333;text-align:center;">Certificamos que <strong>${userName}</strong> ha contribuido significativamente a la reforestación de Zacapa, Guatemala:</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:30px 0;">
            <div style="background:#f0fdf4;padding:20px;border-radius:8px;text-align:center;">
              <p style="font-size:28px;font-weight:bold;color:#166534;margin:0;">${metrics?.totalTrees ?? 0}</p>
              <p style="font-size:12px;color:#555;margin:5px 0 0;">Árboles Plantados</p>
            </div>
            <div style="background:#eff6ff;padding:20px;border-radius:8px;text-align:center;">
              <p style="font-size:28px;font-weight:bold;color:#1e40af;margin:0;">${metrics?.totalCo2Tons ?? 0}</p>
              <p style="font-size:12px;color:#555;margin:5px 0 0;">Toneladas CO₂</p>
            </div>
            <div style="background:#fffbeb;padding:20px;border-radius:8px;text-align:center;">
              <p style="font-size:28px;font-weight:bold;color:#92400e;margin:0;">${metrics?.schoolSqm ?? 0}</p>
              <p style="font-size:12px;color:#555;margin:5px 0 0;">m² de Escuela</p>
            </div>
            <div style="background:#faf5ff;padding:20px;border-radius:8px;text-align:center;">
              <p style="font-size:28px;font-weight:bold;color:#6b21a8;margin:0;">${metrics?.childrenBenefited ?? 0}</p>
              <p style="font-size:12px;color:#555;margin:5px 0 0;">Niños Beneficiados</p>
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#888;margin-top:30px;">Generado el ${new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="text-align:center;font-size:11px;color:#aaa;">Zacapa, Guatemala 🇬🇹 | quetz.org</p>
        </div>
      </body></html>`;

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: html, pdf_options: { format: 'A4', print_background: true } }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'certificado-impacto-anual-quetz.pdf';
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

  const subStart = profile?.subscriptionStart ? new Date(profile.subscriptionStart).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-green-600" /> Mi Perfil
        </h1>
        <p className="text-sm text-gray-500 mt-1">Administra tu información personal</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 md:col-span-2"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Información Personal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              {saved && (
                <span className="text-green-600 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Guardado
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Subscription Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Suscripción</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium text-gray-900 capitalize">{profile?.subscriptionTier ?? 'standard'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Desde:</span>
                <span className="font-medium text-gray-900">{subStart}</span>
              </div>
              <div className="mt-3 bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">€35/mes</p>
                <p className="text-xs text-green-600">Tu contribución mensual</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Certificados</h3>
            <button
              onClick={generateAnnualReport}
              disabled={pdfLoading}
              className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {pdfLoading ? 'Generando...' : 'Certificado Anual'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
