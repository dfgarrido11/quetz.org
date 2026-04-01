'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Menu, X, User, Leaf, ShoppingCart, ShoppingBag, Building2, TreePine } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';
import { useCartStore } from '@/lib/cart-store';
import LanguageSelector from './language-selector';

interface HeaderProps {
  onOpenModal: () => void;
}

export default function Header({ onOpenModal }: HeaderProps) {
  const { data: session, status } = useSession() || {};
  const { t, isRTL } = useLanguage();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window?.scrollY > 60);
    window?.addEventListener?.('scroll', handleScroll);
    return () => window?.removeEventListener?.('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: t('trees.title'), href: '#arboles' },
    { name: t('school.title').split('.')[0], href: '#escuela' },
    { name: t('transparency.title'), href: '/transparencia' },
  ];

  const shopLabel = t('header.shop') || 'Tienda';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${isRTL ? 'rtl' : 'ltr'}`}>

      {/* Announcement bar — visible only when not scrolled */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-quetz-green text-white text-center text-xs font-semibold tracking-wide py-1.5 px-4"
          >
            🌱 {t('header.adopt')} — {t('school.title').split('.')[0]} · Zacapa, Guatemala
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div
        className={`transition-all duration-400 ${
          scrolled
            ? 'bg-white/96 backdrop-blur-2xl shadow-[0_1px_24px_rgba(0,0,0,0.07)] border-b border-gray-100/80'
            : 'bg-gradient-to-b from-black/35 via-black/10 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 sm:h-[70px] ${isRTL ? 'flex-row-reverse' : ''}`}>

            {/* Logo */}
            <a href="#inicio" className="flex-shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={`relative h-10 sm:h-12 w-auto transition-all duration-300 ${
                  scrolled ? '' : 'bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg shadow-black/10'
                }`}
              >
                <Image
                  src="/logo-quetz-oficial.png"
                  alt="QUETZ"
                  width={140}
                  height={48}
                  className="h-full w-auto object-contain"
                  priority
                />
              </motion.div>
            </a>

            {/* Desktop nav */}
            <nav className={`hidden md:flex items-center gap-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>

              {navItems?.map?.((item) => (
                <a
                  key={item?.name ?? ''}
                  href={item?.href ?? '#'}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    scrolled
                      ? 'text-gray-600 hover:text-quetz-green hover:bg-green-50/70'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item?.name ?? ''}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-quetz-green rounded-full transition-all duration-200 group-hover:w-3/5" />
                </a>
              )) ?? null}

              {/* Separator */}
              <div className={`w-px h-4 mx-1.5 rounded-full ${scrolled ? 'bg-gray-200' : 'bg-white/25'}`} />

              {/* For Companies */}
              <Link
                href="/empresas"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-600 hover:text-quetz-green hover:bg-green-50/70'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                {t('header.forCompanies')}
              </Link>

              {/* Separator */}
              <div className={`w-px h-4 mx-1.5 rounded-full ${scrolled ? 'bg-gray-200' : 'bg-white/25'}`} />

              {/* Shop */}
              <Link
                href="/shop"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  scrolled
                    ? 'text-quetz-green hover:bg-green-50/70'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {shopLabel}
              </Link>

              {/* Cart */}
              <Link
                href="/carrito"
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-500 hover:text-quetz-green hover:bg-green-50/70'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-quetz-red text-white text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-0.5 leading-none"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Language */}
              <div className={scrolled ? 'text-gray-600' : 'text-white'}>
                <LanguageSelector />
              </div>

              {/* Separator */}
              <div className={`w-px h-4 mx-1.5 rounded-full ${scrolled ? 'bg-gray-200' : 'bg-white/25'}`} />

              {/* Auth */}
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-gray-200/50 animate-pulse" />
              ) : session ? (
                <Link
                  href="/mi-bosque"
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    scrolled
                      ? 'text-gray-600 hover:text-quetz-green hover:bg-green-50/70'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Leaf className="w-4 h-4 text-quetz-green" />
                  {t('header.myForest')}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    scrolled
                      ? 'text-gray-600 hover:text-quetz-green hover:bg-green-50/70'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-4 h-4" />
                  {t('header.enter')}
                </Link>
              )}

              {/* CTA */}
              <motion.button
                onClick={() => onOpenModal?.()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="ml-2 flex items-center gap-2 bg-quetz-green text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md shadow-green-900/20 hover:bg-green-700 hover:shadow-lg hover:shadow-green-900/25 transition-all duration-200"
              >
                <TreePine className="w-4 h-4" />
                {t('header.adopt')}
              </motion.button>
            </nav>

            {/* Mobile: cart + hamburger */}
            <div className="flex md:hidden items-center gap-1.5">
              <Link
                href="/carrito"
                className={`relative p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-quetz-red text-white text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-0.5">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-white/98 backdrop-blur-2xl border-b border-gray-100 shadow-2xl"
          >
            <div className={`px-5 py-4 space-y-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>

              {navItems?.map?.((item) => (
                <a
                  key={item?.name ?? ''}
                  href={item?.href ?? '#'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 font-medium py-2.5 px-3 rounded-xl hover:bg-green-50 hover:text-quetz-green transition-colors"
                >
                  {item?.name ?? ''}
                </a>
              )) ?? null}

              <div className="h-px bg-gray-100 !my-3" />

              <Link
                href="/empresas"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 font-medium py-2.5 px-3 rounded-xl hover:bg-green-50 hover:text-quetz-green transition-colors"
              >
                <Building2 className="w-4 h-4 text-quetz-green" />
                {t('header.forCompanies')}
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 font-medium py-2.5 px-3 rounded-xl hover:bg-green-50 hover:text-quetz-green transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-quetz-green" />
                {shopLabel}
              </Link>

              <div className="h-px bg-gray-100 !my-3" />

              <div className="flex items-center justify-between py-2 px-3">
                <span className="text-sm text-gray-500 font-medium">Idioma</span>
                <LanguageSelector />
              </div>

              <div className="h-px bg-gray-100 !my-3" />

              {session ? (
                <Link
                  href="/mi-bosque"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 font-medium py-2.5 px-3 rounded-xl hover:bg-green-50 hover:text-quetz-green transition-colors"
                >
                  <Leaf className="w-4 h-4 text-quetz-green" />
                  {t('header.myForest')}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 font-medium py-2.5 px-3 rounded-xl hover:bg-green-50 hover:text-quetz-green transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t('header.enter')}
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenModal?.();
                }}
                className="w-full !mt-4 flex items-center justify-center gap-2 bg-quetz-green text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-green-900/20 hover:bg-green-700 transition-all"
              >
                <TreePine className="w-5 h-5" />
                {t('header.adopt')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
