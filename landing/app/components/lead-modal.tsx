'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Globe, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const countries = [
  'Argentina', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Colombia',
  'Costa Rica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'France', 'Germany', 'Guatemala', 'Honduras', 'India', 'Italy', 'Mexico',
  'Netherlands', 'Nicaragua', 'Panama', 'Peru', 'Portugal', 'Saudi Arabia',
  'Spain', 'Switzerland', 'UAE', 'United Kingdom', 'United States', 'Uruguay',
  'Venezuela', 'Other'
];

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [formData, setFormData] = useState({ nombre: '', email: '', pais: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response?.ok) {
        setSuccess(true);
        setFormData({ nombre: '', email: '', pais: '' });
        setTimeout(() => {
          setSuccess(false);
          onClose?.();
        }, 3000);
      } else {
        const data = await response?.json?.();
        setError(data?.error ?? 'Error');
      }
    } catch {
      setError('Error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e?.target ?? {};
    setFormData((prev) => ({ ...(prev ?? {}), [name ?? '']: value ?? '' }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isRTL ? 'rtl' : 'ltr'}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e?.stopPropagation?.()}
          >
            <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('lead.title')}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-quetz-green mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">{t('lead.success')}</h4>
                <p className="text-gray-600">{t('lead.successMsg')}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-gray-600 text-sm mb-4">{t('lead.subtitle')}</p>
                
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('lead.name')}
                  </label>
                  <div className="relative">
                    <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                    <input
                      type="text"
                      name="nombre"
                      value={formData?.nombre ?? ''}
                      onChange={handleChange}
                      required
                      className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-quetz-green focus:border-transparent outline-none transition-all ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'}`}
                      placeholder={t('lead.name')}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('lead.email')}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData?.email ?? ''}
                      onChange={handleChange}
                      required
                      className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-quetz-green focus:border-transparent outline-none transition-all ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'}`}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('lead.country')}
                  </label>
                  <div className="relative">
                    <Globe className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                    <select
                      name="pais"
                      value={formData?.pais ?? ''}
                      onChange={handleChange}
                      required
                      className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-quetz-green focus:border-transparent outline-none transition-all appearance-none bg-white ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'}`}
                    >
                      <option value="">{t('lead.country')}</option>
                      {countries?.map?.((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      )) ?? null}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-quetz-green hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('auth.loading')}
                    </>
                  ) : (
                    t('lead.submit')
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
