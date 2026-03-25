'use client';

import { Heart, Mail, Instagram, Facebook, Linkedin, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const { t, isRTL, language } = useLanguage();

  const legalLinks = {
    de: [
      { href: '/impressum', label: 'Impressum' },
      { href: '/datenschutz', label: 'Datenschutz' },
      { href: '/agb', label: 'AGB' },
    ],
    es: [
      { href: '/impressum', label: 'Aviso Legal' },
      { href: '/datenschutz', label: 'Privacidad' },
      { href: '/agb', label: 'Términos' },
    ],
    en: [
      { href: '/impressum', label: 'Legal Notice' },
      { href: '/datenschutz', label: 'Privacy' },
      { href: '/agb', label: 'Terms' },
    ],
    fr: [
      { href: '/impressum', label: 'Mentions légales' },
      { href: '/datenschutz', label: 'Confidentialité' },
      { href: '/agb', label: 'CGV' },
    ],
    ar: [
      { href: '/impressum', label: 'إشعار قانوني' },
      { href: '/datenschutz', label: 'الخصوصية' },
      { href: '/agb', label: 'الشروط' },
    ],
  };

  const links = legalLinks[language] || legalLinks.de;
  
  return (
    <footer className={`bg-gray-900 text-white py-12 sm:py-16 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex flex-col md:flex-row items-center justify-between gap-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
            <div className={`flex items-center justify-center mb-4 ${isRTL ? 'md:justify-end' : 'md:justify-start'}`}>
              <div className="relative h-14 w-auto">
                <Image
                  src="/logo-quetz-oficial.png"
                  alt="QUETZ Logo"
                  width={200}
                  height={56}
                  className="h-full w-auto object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <p className="text-gray-400 max-w-md text-sm italic">
              &quot;{t('hero.tagline')}&quot;
            </p>
            
            {/* Trust badges */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>SSL</span>
              </div>
              <div className="text-xs text-gray-500">DSGVO</div>
              <div className="text-xs text-gray-500">Stripe</div>
            </div>
          </div>

          <div className={`flex flex-col items-center gap-4 ${isRTL ? 'md:items-start' : 'md:items-end'}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <a href="https://instagram.com/quetz.org" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/quetz.org" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/quetz" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:admin@quetz.org" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <a href="mailto:admin@quetz.org" className="text-gray-400 hover:text-white transition-colors text-sm">
              admin@quetz.org
            </a>
          </div>
        </div>

        {/* Legal Links - Required for Germany */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className={`text-gray-500 text-sm flex items-center justify-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {t('footer.madeWith')} <Heart className="w-4 h-4 text-quetz-red" /> {t('footer.inGuatemala')}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
