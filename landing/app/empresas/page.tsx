'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, BarChart3, Mail, Send, CheckCircle, Loader2, ArrowLeft, TreePine, Globe, Heart, Camera, Shield, TrendingUp, Leaf, MapPin, Award } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';
import Image from 'next/image';

const packages = [
  {
    id: 'starter',
    trees: '25–50',
    pricePerTree: '25€',
    color: 'from-emerald-500 to-green-600',
    features: ['perEmployee', 'certificate', 'dashboard', 'quarterlyReport'],
  },
  {
    id: 'growth',
    trees: '50–200',
    pricePerTree: '22€',
    color: 'from-quetz-blue to-indigo-600',
    popular: true,
    features: ['perEmployee', 'certificate', 'dashboard', 'monthlyReport', 'brandedPage', 'photoUpdates'],
  },
  {
    id: 'impact',
    trees: '200+',
    pricePerTree: '19€',
    color: 'from-amber-500 to-orange-600',
    features: ['perEmployee', 'certificate', 'dashboard', 'monthlyReport', 'brandedPage', 'photoUpdates', 'schoolNaming', 'eventDay'],
  },
];

export default function EmpresasPage() {
  const { t, isRTL, language } = useLanguage();
  const [formData, setFormData] = useState({
    companyName: '',
    country: '',
    contactName: '',
    email: '',
    phone: '',
    employees: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('corporate.sendError'));
      }
      setIsSuccess(true);
    } catch (error) {
      console.error('Error:', error);
      alert(t('corporate.sendError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const differentiators = [
    { icon: Globe, key: 'diff1' },
    { icon: Heart, key: 'diff2' },
    { icon: Camera, key: 'diff3' },
    { icon: Shield, key: 'diff4' },
  ];

  const impactNumbers = [
    { value: '9', labelKey: 'impactSpecies' },
    { value: '100%', labelKey: 'impactTransparency' },
    { value: '30%', labelKey: 'impactSocial' },
    { value: '25kg', labelKey: 'impactCO2' },
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-quetz-cream flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 bg-quetz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-quetz-green" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('corporate.successTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('corporate.successMsg')}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-quetz-green text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('corporate.back')}</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-quetz-cream ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-quetz-green via-emerald-700 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border border-white/30 rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('corporate.back')}</span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TreePine className="w-4 h-4" />
              <span>{t('corporate.badge')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
              {t('corporate.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              {t('corporate.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#packages" className="bg-white text-quetz-green font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors text-lg">
                {t('corporate.seePricing')}
              </a>
              <a href="#form" className="border-2 border-white/50 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/10 transition-colors text-lg">
                {t('corporate.requestProposal')}
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Impact Numbers Bar */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {impactNumbers.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-quetz-green">{item.value}</div>
                <div className="text-sm text-gray-600 mt-1">{t(`corporate.${item.labelKey}`)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why QUETZ vs competitors */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('corporate.whyTitle')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('corporate.whySubtitle')}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((diff, i) => {
            const Icon = diff.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-quetz-green/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-quetz-green" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{t(`corporate.${diff.key}Title`)}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t(`corporate.${diff.key}Text`)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pricing Packages */}
      <div id="packages" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('corporate.pricingTitle')}</h2>
            <p className="text-gray-600 max-w-xl mx-auto">{t('corporate.pricingSubtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i }}
                className={`relative rounded-2xl overflow-hidden ${
                  pkg.popular ? 'ring-2 ring-quetz-blue shadow-xl scale-105' : 'shadow-md'
                }`}
              >
                {pkg.popular && (
                  <div className="bg-quetz-blue text-white text-center py-2 text-sm font-bold">
                    {t('corporate.popular')}
                  </div>
                )}
                <div className="bg-white p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t(`corporate.pkg${pkg.id}Name`)}</h3>
                  <p className="text-gray-500 text-sm mb-4">{pkg.trees} {t('corporate.trees')}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-gray-900">{pkg.pricePerTree}</span>
                    <span className="text-gray-500">/ {t('corporate.perTree')}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-quetz-green flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{t(`corporate.feat${feat}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#form"
                    className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-quetz-blue to-indigo-600 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {t('corporate.requestProposal')}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('corporate.howItWorks')}</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((step) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * step }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-quetz-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {step}
              </div>
              <p className="text-gray-700 font-medium">{t(`corporate.step${step}`)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form section */}
      <div id="form" className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('corporate.formTitle')}</h2>
              <p className="text-gray-600">{t('corporate.formSubtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('corporate.companyName')}</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-quetz-green focus:border-transparent bg-white"
                  placeholder={t('corporate.companyPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('corporate.country')}</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-quetz-green focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('corporate.employees')}</label>
                  <select
                    required
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-quetz-green focus:border-transparent bg-white"
                  >
                    <option value="">{t('corporate.selectEmployees')}</option>
                    <option value="1-10">1–10</option>
                    <option value="11-50">11–50</option>
                    <option value="51-200">51–200</option>
                    <option value="201-500">201–500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('corporate.contactName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-quetz-green focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('corporate.contactEmail')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-quetz-green focus:border-transparent bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('corporate.contactPhone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('corporate.phonePlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-quetz-green focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('corporate.message')}</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-quetz-green focus:border-transparent bg-white"
                  placeholder={t('corporate.messagePlaceholder')}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-quetz-green to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t('corporate.sending')}</>
                ) : (
                  <><Send className="w-5 h-5" /> {t('corporate.send')}</>
                )}
              </button>
              <p className="text-sm text-gray-500 text-center">
                {t('corporate.footer')}
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Trust section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>Stripe Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span>DSGVO Konform</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span>Zacapa, Guatemala</span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            <span>9 {t('corporate.treeSpecies')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
