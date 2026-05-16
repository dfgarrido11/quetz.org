'use client';

/*
 * /firmengeschenk - B2B One-Time Gift Landing Page
 * Design: Clean, professional, light background (quetz-cream)
 * Tone: Sie-Form, direct, no AI-prose, no em-dashes
 * Stack: Same as quetz.org (Next.js App Router, Tailwind, Radix, Lucide)
 * No mascot on this page - professional B2B tone
 */

import { useState, useEffect } from 'react';
import {
  TreePine,
  MapPin,
  Award,
  FileCheck,
  ChevronRight,
  Check,
  Upload,
  Send,
  Leaf,
  ArrowDown,
  Shield,
  Building2,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ─── Stripe Payment Links (replace with real links) ─── */
const STRIPE_LINKS = {
  klein: process.env.NEXT_PUBLIC_STRIPE_LINK_KLEIN || '#paket-klein',
  medium: process.env.NEXT_PUBLIC_STRIPE_LINK_MEDIUM || '#paket-medium',
  gross: process.env.NEXT_PUBLIC_STRIPE_LINK_GROSS || '#paket-gross',
  xl: process.env.NEXT_PUBLIC_STRIPE_LINK_XL || '#paket-xl',
};

/* ─── CDN Images (reuse existing + new) ─── */
const IMAGES = {
  hero: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/hero-canopy-KsLbgKCZWapLbdtMVAC26c.webp',
  workers:
    'https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/understory-workers-jhLXmGeuAGSeLgeTe97sXg.webp',
  school:
    'https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/school-children-FiGg2g9cBma6G5ArjEs5Gy.webp',
};

/* ═══════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              scrolled
                ? 'text-gray-400 hover:text-gray-700'
                : 'text-white/70 hover:text-white'
            }`}
            title="Zur Startseite"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Startseite
          </a>
          <a href="/firmengeschenk" className="flex items-center gap-2">
            <Leaf className={`w-6 h-6 ${scrolled ? 'text-[#2D6A4F]' : 'text-[#52B788]'}`} />
            <span
              className={`font-[Montserrat] font-bold text-lg tracking-tight ${
                scrolled ? 'text-[#1B4332]' : 'text-white'
              }`}
            >
              quetz.org
            </span>
          </a>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '#pakete', label: 'Pakete' },
            { href: '#so-funktionierts', label: "So funktioniert's" },
            { href: '#faq', label: 'FAQ' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? 'text-gray-500 hover:text-gray-900'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <a href="#pakete">
          <Button className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-[Montserrat] font-semibold text-sm px-5">
            Paket auswählen
          </Button>
        </a>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   MOBILE STICKY BAR
   ═══════════════════════════════════════════════════════ */
function MobileStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
      <a href={STRIPE_LINKS.medium} target="_blank" rel="noopener noreferrer">
        <Button className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-[Montserrat] font-semibold text-sm py-3">
          25 Bäume bestellen · 229€
          <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </a>
      <p className="text-center text-[10px] text-gray-400 mt-1.5">
        DSGVO-konform · Steuerlich absetzbar · Made in Germany
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   1. HERO
   ═══════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="Aufforstung in Zacapa, Guatemala"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081C15]/70 via-[#081C15]/50 to-[#081C15]/80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase mb-6">
          Firmengeschenk mit echtem Impact
        </p>
        <h1 className="font-[Montserrat] font-black text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
          Das Firmengeschenk,
          <span className="block text-[#52B788]">das wächst.</span>
        </h1>
        <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Ihre Mitarbeiter vergessen den nächsten Kugelschreiber sofort.
          Schenken Sie echte Bäume in Guatemala. Mit Zertifikat, Foto und GPS-Koordinaten.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a href="#pakete">
            <Button
              size="lg"
              className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base px-8 py-6 shadow-xl shadow-[#52B788]/20"
            >
              Paket auswählen
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <a href="#so-funktionierts">
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-[Montserrat] font-semibold text-base px-8 py-6 bg-transparent"
            >
              So funktioniert's
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-white/50 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> DSGVO-konform
          </span>
          <span className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" /> Steuerlich absetzbar
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Made in Germany
          </span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   2. PROBLEM-AGITATION
   ═══════════════════════════════════════════════════════ */
function ProblemSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#F5F5F0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-[Montserrat] font-extrabold text-2xl sm:text-3xl text-[#1B4332] leading-tight mb-6">
          Wertschätzung zeigen, ohne im Papierkorb zu landen.
        </h2>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          Mitarbeiter und Kunden vergessen den nächsten gebrandeten Kugelschreiber sofort.
          Ein Geschenk, das wirklich bleibt, wächst und Bedeutung hat. Das schaffen nur die wenigsten.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   3. SOLUTION - 3 Columns
   ═══════════════════════════════════════════════════════ */
function SolutionSection() {
  const features = [
    {
      icon: TreePine,
      title: 'Echte Bäume in Zacapa, Guatemala',
      desc: 'Heimische Baumarten, gepflanzt von lokalen Familien. Jeder Baum schafft einen Arbeitsplatz und wird GPS-getrackt.',
    },
    {
      icon: Award,
      title: 'Personalisiertes Zertifikat',
      desc: 'Jeder Mitarbeiter erhält ein eigenes Zertifikat mit Namen, Foto des Baumes und GPS-Koordinaten.',
    },
    {
      icon: FileCheck,
      title: 'Steuerlich absetzbar',
      desc: 'Als Firmengeschenk voll absetzbar. Sie erhalten eine ordentliche Rechnung für Ihre Buchhaltung.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#2D6A4F] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-3">
            Die Lösung
          </p>
          <h2 className="font-[Montserrat] font-extrabold text-2xl sm:text-3xl text-[#1B4332]">
            Ein Geschenk mit Substanz
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
          {features.map((f, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center mx-auto mb-5">
                <f.icon className="w-8 h-8 text-[#2D6A4F]" />
              </div>
              <h3 className="font-[Montserrat] font-bold text-lg text-[#1B4332] mb-3">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   4. PRICING PACKAGES
   ═══════════════════════════════════════════════════════ */
function PricingSection() {
  const packages = [
    {
      id: 'klein',
      name: 'Klein',
      trees: 10,
      price: 99,
      perTree: '9,90',
      tagline: 'Ideal für kleine Teams',
      highlight: false,
      link: STRIPE_LINKS.klein,
    },
    {
      id: 'medium',
      name: 'Medium',
      trees: 25,
      price: 229,
      perTree: '9,16',
      tagline: 'Beliebt bei Agenturen',
      highlight: true,
      link: STRIPE_LINKS.medium,
    },
    {
      id: 'gross',
      name: 'Groß',
      trees: 50,
      price: 449,
      perTree: '8,98',
      tagline: 'Für Sommerfeste & Events',
      highlight: false,
      link: STRIPE_LINKS.gross,
    },
    {
      id: 'xl',
      name: 'XL',
      trees: 100,
      price: 849,
      perTree: '8,49',
      tagline: 'Für Jubiläen & Großevents',
      highlight: false,
      link: STRIPE_LINKS.xl,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F5F5F0]" id="pakete">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-[#2D6A4F] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-3">
            Pakete
          </p>
          <h2 className="font-[Montserrat] font-extrabold text-2xl sm:text-3xl text-[#1B4332] mb-3">
            Einmal bestellen. Nachhaltig beeindrucken.
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Kein Abo. Keine versteckten Kosten. Sie bestellen, wir pflanzen, Ihr Team freut sich.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl p-6 sm:p-7 flex flex-col transition-shadow duration-200 ${
                pkg.highlight
                  ? 'bg-white border-2 border-[#2D6A4F] shadow-lg shadow-[#2D6A4F]/10'
                  : 'bg-white border border-gray-200 hover:shadow-md'
              }`}
            >
              {pkg.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2D6A4F] text-white font-[Montserrat] font-bold text-[11px] px-4 py-1 rounded-full whitespace-nowrap">
                  Am beliebtesten
                </div>
              )}
              <h3 className="font-[Montserrat] font-bold text-lg text-[#1B4332]">{pkg.name}</h3>
              <p className="text-[#2D6A4F] text-sm font-medium mt-1">
                {pkg.trees} Bäume
              </p>
              <div className="mt-4 mb-1">
                <span className="font-[Montserrat] font-black text-4xl text-[#1B4332]">
                  {pkg.price}€
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-4">{pkg.perTree}€ pro Baum</p>
              <p className="text-gray-500 text-sm mb-6 flex-1">{pkg.tagline}</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  `${pkg.trees} GPS-getrackte Bäume`,
                  'Personalisierte Zertifikate',
                  'Rechnung für Buchhaltung',
                  'Digitale Übergabe-Karten',
                ].map((feat, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2D6A4F] mt-0.5 shrink-0" />
                    <span className="text-gray-600 text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
              <a href={pkg.link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                <Button
                  className={`w-full font-[Montserrat] font-semibold ${
                    pkg.highlight
                      ? 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white'
                      : 'bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F]'
                  }`}
                >
                  Jetzt bestellen
                </Button>
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Alle Preise inkl. MwSt. Zahlung per Kreditkarte, SEPA oder Rechnung.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   5. SO FUNKTIONIERTS - 4 Steps
   ═══════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      icon: TreePine,
      title: 'Paket auswählen und bezahlen',
      desc: 'Wählen Sie die passende Größe für Ihr Team. Sichere Zahlung per Stripe.',
    },
    {
      num: '02',
      icon: Upload,
      title: 'Mitarbeiternamen hochladen',
      desc: 'Per Formular oder CSV-Datei. Wir brauchen nur die Vornamen.',
    },
    {
      num: '03',
      icon: MapPin,
      title: 'Wir pflanzen die Bäume in Zacapa',
      desc: 'Lokale Familien pflanzen heimische Arten. Jeder Baum wird GPS-getrackt.',
    },
    {
      num: '04',
      icon: Send,
      title: 'Zertifikate digital erhalten',
      desc: 'Personalisierte Zertifikate als PDF. Fertig zum Verschenken.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white" id="so-funktionierts">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#2D6A4F] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-3">
            So funktioniert's
          </p>
          <h2 className="font-[Montserrat] font-extrabold text-2xl sm:text-3xl text-[#1B4332]">
            In 4 Schritten zum perfekten Firmengeschenk
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              <span className="font-[Montserrat] font-black text-5xl text-[#2D6A4F]/10">
                {step.num}
              </span>
              <div className="w-12 h-12 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center mx-auto mt-2 mb-4">
                <step.icon className="w-6 h-6 text-[#2D6A4F]" />
              </div>
              <h3 className="font-[Montserrat] font-bold text-base text-[#1B4332] mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              {i < 3 && (
                <div className="hidden lg:block absolute top-10 -right-4">
                  <ChevronRight className="w-5 h-5 text-[#2D6A4F]/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   6. SOCIAL PROOF
   ═══════════════════════════════════════════════════════ */
function SocialProofSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#F5F5F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Client quote */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-[#2D6A4F]" />
            <span className="font-[Montserrat] font-bold text-sm text-[#1B4332] tracking-wide">
              LEYTON DEUTSCHLAND
            </span>
          </div>
          <blockquote className="text-gray-600 text-base sm:text-lg italic leading-relaxed mb-4">
            &ldquo;Wir wollten unseren Mitarbeitern etwas schenken, das über den üblichen Gutschein hinausgeht.
            Die Baumadoptionen von quetz haben genau das geschafft. Jeder im Team hat sich über sein
            persönliches Zertifikat gefreut.&rdquo;
          </blockquote>
          <p className="text-gray-400 text-sm">Leyton Deutschland, Düsseldorf</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { value: '500+', label: 'Bäume gepflanzt' },
            { value: '12', label: 'Familien unterstützt' },
            { value: '30%', label: 'Schule finanziert' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-[Montserrat] font-black text-2xl sm:text-3xl text-[#2D6A4F]">
                {stat.value}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   7. UNSERE WURZELN (Founder Story)
   ═══════════════════════════════════════════════════════ */
function FounderSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-[280px_1fr] gap-10 items-center">
          {/* Founder photo placeholder */}
          <div className="mx-auto md:mx-0">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-gradient-to-br from-[#2D6A4F]/20 to-[#52B788]/10 flex items-center justify-center overflow-hidden">
              {/* Replace with real founder photo */}
              <div className="text-center p-6">
                <Heart className="w-10 h-10 text-[#2D6A4F] mx-auto mb-3" />
                <p className="text-[#2D6A4F] font-[Montserrat] font-bold text-sm">Foto folgt</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[#2D6A4F] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-3">
              Unsere Wurzeln
            </p>
            <h2 className="font-[Montserrat] font-extrabold text-2xl sm:text-3xl text-[#1B4332] leading-tight mb-5">
              Warum ein Deutsch-Guatemalteke aus Düsseldorf Bäume pflanzt.
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              Ich bin in Guatemala aufgewachsen und lebe seit Jahren in Düsseldorf.
              In Zacapa habe ich gesehen, wie Entwaldung Familien die Lebensgrundlage nimmt.
              Mit quetz.org verbinde ich beide Welten: Deutsche Unternehmen, die Gutes tun wollen,
              und guatemaltekische Familien, die davon leben.
            </p>
            <p className="text-gray-500 text-sm">
              Kein Konzern. Keine Agentur dazwischen. Direkt.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   8. FAQ
   ═══════════════════════════════════════════════════════ */
function FAQSection() {
  const faqs = [
    {
      q: 'Ist das wirklich steuerlich absetzbar?',
      a: 'Ja. Sie erhalten eine ordentliche Rechnung mit ausgewiesener MwSt. Firmengeschenke sind als Betriebsausgabe absetzbar. Sprechen Sie mit Ihrem Steuerberater über die genaue Behandlung in Ihrem Fall.',
    },
    {
      q: 'Wie schnell erhalten meine Mitarbeiter die Zertifikate?',
      a: 'Nach Eingang Ihrer Zahlung und der Mitarbeiternamen erhalten Sie die personalisierten Zertifikate innerhalb von 5 Werktagen als PDF per E-Mail.',
    },
    {
      q: 'Können wir das Zertifikat mit unserem Firmenlogo personalisieren?',
      a: 'Ja, ab dem Medium-Paket (25 Bäume) können wir Ihr Firmenlogo auf die Zertifikate drucken. Senden Sie uns einfach Ihr Logo nach der Bestellung.',
    },
    {
      q: 'Was passiert, wenn ein Baum nicht überlebt?',
      a: 'Unsere Bäume werden von lokalen Familien gepflegt, die Überlebensrate liegt bei über 85%. Sollte ein Baum nicht überleben, pflanzen wir kostenlos einen neuen.',
    },
    {
      q: 'Gibt es eine Rechnung für die Buchhaltung?',
      a: 'Ja. Sie erhalten automatisch eine ordentliche Rechnung mit allen steuerlich relevanten Angaben. Unsere Firma ist in Deutschland registriert.',
    },
    {
      q: 'Wo genau werden die Bäume gepflanzt?',
      a: 'Alle Bäume werden in Zacapa, Guatemala gepflanzt. Jeder Baum erhält GPS-Koordinaten, die auf dem Zertifikat vermerkt sind.',
    },
    {
      q: 'Kann ich die Bäume auch als Kundengeschenk nutzen?',
      a: 'Selbstverständlich. Viele Unternehmen nutzen unsere Pakete als Geschenk für Kunden, Partner oder als Give-away bei Events.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F5F5F0]" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-[#2D6A4F] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-3">
            Häufige Fragen
          </p>
          <h2 className="font-[Montserrat] font-extrabold text-2xl sm:text-3xl text-[#1B4332]">
            Alles, was Sie wissen müssen
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-white rounded-xl border border-gray-200 px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-left font-[Montserrat] font-semibold text-sm sm:text-base text-[#1B4332] py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-500 text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   9. CTA FINAL
   ═══════════════════════════════════════════════════════ */
function FinalCTASection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={IMAGES.workers}
          alt="Aufforstung Guatemala"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#081C15]/85" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-[Montserrat] font-extrabold text-2xl sm:text-4xl text-white leading-tight mb-5">
          Ein Geschenk, das in fünf Jahren noch wächst.
        </h2>
        <p className="text-white/70 text-base sm:text-lg mb-10 max-w-xl mx-auto">
          Bestellen Sie jetzt und überraschen Sie Ihr Team mit etwas, das wirklich Bedeutung hat.
        </p>
        <a href="#pakete">
          <Button
            size="lg"
            className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base px-10 py-6 shadow-xl shadow-[#52B788]/20"
          >
            Jetzt Paket auswählen
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER (Minimal)
   ═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-[#1B4332] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#52B788]" />
            <span className="font-[Montserrat] font-bold text-white text-sm">quetz.org</span>
          </div>
          <div className="flex gap-6 text-white/50 text-xs">
            <a href="/impressum" className="hover:text-white transition-colors">Impressum</a>
            <a href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</a>
            <a href="/agb" className="hover:text-white transition-colors">AGB</a>
          </div>
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} quetz.org
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════ */
export default function FirmengeschenkPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <PricingSection />
      <HowItWorksSection />
      <SocialProofSection />
      <FounderSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
      <MobileStickyBar />
    </main>
  );
}
