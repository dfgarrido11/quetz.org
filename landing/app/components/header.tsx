'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Menu, X, User, Leaf, ShoppingCart } from 'lucide-react';
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
    const handleScroll = () => {
      setScrolled(window?.scrollY > 50);
    };
    window?.addEventListener?.('scroll', handleScroll);
    return () => window?.removeEventListener?.('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Inicio', href: '#inicio' },
    { name: t('trees.title'), href: '#arboles' },
    { name: t('school.title').split('.')[0], href: '#escuela' },
    { name: t('transparency.title'), href: '#transparencia' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isRTL ? 'rtl' : 'ltr'} ${
        scrolled
          ? 'bg-quetz-cream/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between h-16 sm:h-20 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <a href="#inicio" className="group transition-transform duration-300 hover:scale-[1.02]">
            <div className={`relative h-12 sm:h-14 w-auto transition-all duration-300 ${
              scrolled 
                ? '' 
                : 'bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg'
            }`}>
              <Image
                src="/logo-quetz-oficial.png"
                alt="QUETZ - Raíces que cambian vidas"
                width={150}
                height={56}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </a>

          <nav className={`hidden md:flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {navItems?.map?.((item) => (
              <a
                key={item?.name ?? ''}
                href={item?.href ?? '#'}
                className={`text-sm font-medium transition-colors hover:text-quetz-green ${scrolled ? 'text-gray-700' : 'text-white'}`}
              >
                {item?.name ?? ''}
              </a>
            )) ?? null}
            
            {/* Cart Icon */}
            <Link
              href="/carrito"
              className={`relative p-2 transition-colors hover:text-quetz-green ${scrolled ? 'text-gray-700' : 'text-white'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-quetz-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </motion.span>
              )}
            </Link>
            
            {/* Language Selector */}
            <div className={`${scrolled ? 'text-gray-700' : 'text-white'}`}>
              <LanguageSelector />
            </div>
            
            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <Link
                href="/mi-bosque"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-quetz-green ${isRTL ? 'flex-row-reverse' : ''} ${scrolled ? 'text-gray-700' : 'text-white'}`}
              >
                <Leaf className="w-4 h-4" />
                <span>{t('header.myForest')}</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-quetz-green ${isRTL ? 'flex-row-reverse' : ''} ${scrolled ? 'text-gray-700' : 'text-white'}`}
              >
                <User className="w-4 h-4" />
                <span>{t('header.enter')}</span>
              </Link>
            )}

            <button
              onClick={() => onOpenModal?.()}
              className="bg-quetz-green text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {t('header.adopt')}
            </button>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={`w-6 h-6 ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-quetz-cream/95 backdrop-blur-md border-t"
          >
            <div className={`px-4 py-4 space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
              {/* Mobile Cart */}
              <Link
                href="/carrito"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 text-gray-700 font-medium py-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-quetz-green" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-quetz-red text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </div>
                <span>Carrito {totalItems > 0 ? `(${totalItems})` : ''}</span>
              </Link>
              
              {/* Mobile Language Selector */}
              <div className="flex items-center justify-between py-2 text-gray-700">
                <LanguageSelector />
              </div>
              
              {navItems?.map?.((item) => (
                <a
                  key={item?.name ?? ''}
                  href={item?.href ?? '#'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium py-2"
                >
                  {item?.name ?? ''}
                </a>
              )) ?? null}
              
              {/* Mobile Auth */}
              {session ? (
                <Link
                  href="/mi-bosque"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 text-gray-700 font-medium py-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Leaf className="w-4 h-4 text-quetz-green" />
                  <span>{t('header.myForest')}</span>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 text-gray-700 font-medium py-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <User className="w-4 h-4" />
                  <span>{t('header.enter')}</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenModal?.();
                }}
                className="w-full bg-quetz-green text-white py-3 rounded-full font-semibold"
              >
                {t('header.adopt')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
