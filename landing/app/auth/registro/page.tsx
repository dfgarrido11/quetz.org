'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Globe, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';

// Google Icon SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const countries = [
  'Argentina', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Colombia',
  'Costa Rica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'France', 'Germany', 'Guatemala', 'Honduras', 'India', 'Mexico',
  'Netherlands', 'Nicaragua', 'Panama', 'Peru', 'Saudi Arabia', 'Spain',
  'Switzerland', 'UAE', 'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Other'
];

export default function RegistroPage() {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signIn('google', { redirect: true, callbackUrl: '/mi-bosque' });
    } catch (err) {
      setError(t('auth.googleSignUpError'));
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Register
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('auth.error'));
        setLoading(false);
        return;
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        router.replace('/auth/login');
      } else {
        router.replace('/mi-bosque');
      }
    } catch (err) {
      setError(t('auth.error'));
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-quetz-cream via-white to-green-50 flex items-center justify-center px-4 py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Link */}
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-gray-600 hover:text-quetz-green mb-8 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t('auth.backHome')}</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative h-16 w-auto mx-auto mb-4">
              <Image
                src="/logo-quetz-oficial.png"
                alt="QUETZ - Raíces que cambian vidas"
                width={240}
                height={64}
                className="h-full w-auto object-contain mx-auto"
              />
            </div>
            <p className="text-gray-600 text-sm">{t('auth.register')}</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.name')}
              </label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-quetz-green focus:border-transparent transition-all ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                  placeholder={t('auth.name')}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-quetz-green focus:border-transparent transition-all ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-quetz-green focus:border-transparent transition-all ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('auth.country')}
              </label>
              <div className="relative">
                <Globe className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-quetz-green focus:border-transparent transition-all appearance-none bg-white ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                >
                  <option value="">{t('auth.country')}</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-quetz-green text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('auth.loading')}</span>
                </>
              ) : (
                <span>{t('auth.registerBtn')}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                {t('auth.orSignUpWith')}
              </span>
            </div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className={`w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('auth.loading')}</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                <span>Google</span>
              </>
            )}
          </button>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            {t('auth.hasAccount')}{' '}
            <Link href="/auth/login" className="text-quetz-green font-semibold hover:underline">
              {t('auth.loginHere')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
