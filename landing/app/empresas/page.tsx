'use client';

/*
 * DESIGN: "Rainforest Canopy" — Immersive Vertical Descent
 * - Full-bleed cinematic sections simulating forest layers
 * - Color gradient from bright emerald (canopy) to dark earth (roots)
 * - Montserrat for headlines, Work Sans for body
 * - Emotional first, data second
 * - Target: German CSR decision-makers (Mittelstand)
 */

import { useState, useEffect, useRef } from "react";
// Animations removed for performance
import { TreePine, Users, School, MapPin, BarChart3, Shield, ArrowDown, Check, ChevronRight, Leaf, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// CDN image URLs
const IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/hero-canopy-KsLbgKCZWapLbdtMVAC26c.webp",
  workers: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/understory-workers-jhLXmGeuAGSeLgeTe97sXg.webp",
  children: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/school-children-FiGg2g9cBma6G5ArjEs5Gy.webp",
  roots: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/forest-floor-roots-4HVX5t3CGzqRnqYzdrThsP.webp",
  dashboard: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/dashboard-mockup-AxefkSuahphtAKpcdH4tBU.webp",
};

/* ─── Simple Counter (No Animation) ─── */
function SimpleCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  return <span>{end.toLocaleString("de-DE")}{suffix}</span>;
}

/* ─── Simple Section Wrapper (No Animation) ─── */
function SimpleSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/* ─── Navigation ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#081C15]/90 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="container flex items-center justify-between py-4">
        <a href="#" className="flex items-center gap-2">
          <Leaf className="w-7 h-7 text-[#52B788]" />
          <span className="font-[Montserrat] font-bold text-xl text-white tracking-tight">quetz.org</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#impact" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Impact</a>
          <a href="#transparenz" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Transparenz</a>
          <a href="#preise" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Preise</a>
          <a href="#kontakt" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Kontakt</a>
        </div>
        <a href="#kontakt">
          <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-semibold text-sm px-6">
            Jetzt starten
          </Button>
        </a>
      </div>
    </nav>
  );
}

/* ─── HERO: Canopy Layer ─── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={IMAGES.hero} alt="Regenwald Guatemala" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081C15]/60 via-[#081C15]/40 to-[#081C15]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center pt-24">
        <div
        >
          <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.2em] uppercase mb-6">
            Nachhaltigkeitspartner für den deutschen Mittelstand
          </p>
          <h1 className="font-[Montserrat] font-900 text-4xl md:text-6xl lg:text-7xl text-white leading-[1.05] max-w-5xl mx-auto mb-6">
            Aufforstung, die Ihr
            <span className="block text-[#52B788]">Unternehmen verändert.</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Jeder Baum schafft einen Arbeitsplatz. Jedes Abo finanziert eine Schule.
            100% transparent, GPS-getrackt, CSRD-konform.
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <a href="/empresas">
            <Button size="lg" className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base px-8 py-6 shadow-xl shadow-[#52B788]/20">
              Jetzt starten
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <a href="#impact">
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-[Montserrat] font-semibold text-base px-8 py-6 bg-transparent">
              Impact entdecken
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: 1500000, suffix: "+", label: "Hektar Waldverlust in Guatemala" },
            { value: 120, suffix: "", label: "Kinder erhalten eine Schule" },
            { value: 100, suffix: "%", label: "Transparenz per GPS-Tracking" },
            { value: 22, suffix: " kg", label: "CO₂ pro Baum / Jahr absorbiert" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-[Montserrat] font-800 text-2xl md:text-3xl text-[#52B788]">
                <SimpleCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-white/60 text-xs md:text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quetzito flotando */}
      <img
        src="/mascot/quetzito-aventurero.png"
        alt="Quetzito"
        className="absolute bottom-24 right-8 md:right-24 w-28 md:w-40 z-20 pointer-events-none drop-shadow-2xl mascot-float mascot-hover"
      />

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ArrowDown className="w-6 h-6 text-white/40" />
      </div>
    </section>
  );
}

/* ─── PROBLEM: The Crisis ─── */
function ProblemSection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]" id="impact">
      <div className="container">
        <SimpleSection>
          <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Das Problem</p>
          <h2 className="font-[Montserrat] font-800 text-3xl md:text-5xl text-white leading-tight max-w-3xl mb-8">
            Guatemala hat 17% seiner Waldfläche verloren. 47% der Kinder brechen die Schule ab.
          </h2>
          <p className="text-[#B7E4C7]/80 text-lg max-w-2xl mb-16 leading-relaxed">
            Gleichzeitig suchen deutsche Unternehmen nach glaubwürdigen CSR-Projekten für ihr CSRD-Reporting.
            Die meisten Anbieter liefern nur CO₂-Zertifikate — ohne echten sozialen Impact.
          </p>
        </SimpleSection>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: TreePine, title: "Waldverlust", desc: "Seit 2001 hat Guatemala über 1,5 Millionen Hektar Wald verloren — eine Fläche größer als Schleswig-Holstein.", color: "#52B788" },
            { icon: School, title: "Bildungskrise", desc: "47% der Kinder in ländlichen Gebieten schließen nicht einmal die Grundschule ab. Es fehlen Schulen und Lehrer.", color: "#E9C46A" },
            { icon: Shield, title: "Greenwashing", desc: "80% der CO₂-Kompensationsprojekte sind nicht verifizierbar. Unternehmen riskieren Reputationsschäden.", color: "#E76F51" },
          ].map((item, i) => (
            <SimpleSection key={i}>
              <div className="group">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: `${item.color}20` }}>
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <h3 className="font-[Montserrat] font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-[#B7E4C7]/70 leading-relaxed">{item.desc}</p>
              </div>
            </SimpleSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SOLUTION: Understory Layer ─── */
function SolutionSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed image */}
      <div className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.workers} alt="Aufforstung Guatemala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#081C15]/90 via-[#081C15]/70 to-transparent" />
        </div>
        <div className="relative z-10 container py-24">
          <SimpleSection>
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Die Lösung</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-5xl text-white leading-tight max-w-2xl mb-8">
              Ein Baum = Ein Job = Ein Schritt zur Schule.
            </h2>
          </SimpleSection>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
            {[
              { icon: TreePine, title: "Aufforstung", desc: "Heimische Baumarten, GPS-getrackt, von lokalen Familien gepflegt." },
              { icon: Users, title: "Arbeitsplätze", desc: "Jeder Baum schafft faire Arbeit für guatemaltekische Familien." },
              { icon: School, title: "Schulbau", desc: "Überschüsse finanzieren den Bau einer Schule für 120 Kinder." },
              { icon: BarChart3, title: "CSRD-konform", desc: "Alle Daten für Ihr Nachhaltigkeitsreporting auf einem Dashboard." },
            ].map((item, i) => (
              <SimpleSection key={i}>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-[#52B788]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-[#52B788]" />
                  </div>
                  <div>
                    <h3 className="font-[Montserrat] font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </SimpleSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TRANSPARENCY: Dashboard ─── */
function TransparencySection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]" id="transparenz">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <SimpleSection>
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Radikale Transparenz</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white leading-tight mb-6">
              Sehen Sie genau, wo Ihr Baum wächst.
            </h2>
            <p className="text-[#B7E4C7]/70 text-lg leading-relaxed mb-8">
              Unser digitales Dashboard zeigt Ihnen in Echtzeit: GPS-Standort jedes Baumes,
              CO₂-Absorption, Fortschritt des Schulbaus und die Familien, die Ihre Bäume pflegen.
              Keine Blackbox — sondern greifbarer Impact für Ihr Reporting.
            </p>
            <div className="space-y-4">
              {[
                "GPS-Tracking jedes einzelnen Baumes",
                "Echtzeit CO₂-Absorptionsdaten",
                "Fortschritt des Schulbaus live verfolgen",
                "Exportierbare Berichte für CSRD-Reporting",
                "Personalisiertes Firmen-Dashboard",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52B788]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#52B788]" />
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </SimpleSection>

          <SimpleSection>
            <div className="relative">
              <div className="absolute -inset-4 bg-[#52B788]/10 rounded-2xl blur-xl" />
              <img
                src={IMAGES.dashboard}
                alt="quetz.org Dashboard"
                className="relative rounded-xl shadow-2xl shadow-black/40 w-full object-contain"
              />
            </div>
          </SimpleSection>
        </div>
      </div>
    </section>
  );
}

/* ─── SCHOOL: Children Layer ─── */
function SchoolSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.children} alt="Schulkinder Guatemala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#081C15]/90 via-[#081C15]/60 to-transparent" />
        </div>
        <div className="relative z-10 container py-24">
          {/* Quetzito maestro */}
          <img
            src="/mascot/quetzito-maestro.png"
            alt="Quetzito Maestro"
            className="hidden md:block absolute left-8 bottom-0 w-36 z-20 pointer-events-none drop-shadow-2xl mascot-float mascot-hover"
          />
          <div className="ml-auto max-w-xl">
            <SimpleSection>
              <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Sozialer Impact</p>
              <h2 className="font-[Montserrat] font-800 text-3xl md:text-5xl text-white leading-tight mb-6">
                120 Kinder warten auf ihre Schule.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Mit jedem Baum-Abo finanzieren wir den Bau einer Schule in einer ländlichen Gemeinde Guatemalas.
                Ihre Mitarbeiter können den Fortschritt live verfolgen — ein emotionales Erlebnis,
                das weit über das übliche CSR-Projekt hinausgeht.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-[Montserrat] font-800 text-3xl text-[#E9C46A]">
                    <SimpleCounter end={50000} suffix=" €" />
                  </p>
                  <p className="text-white/50 text-sm mt-1">Ziel für den Schulbau</p>
                </div>
                <div>
                  <p className="font-[Montserrat] font-800 text-3xl text-[#E9C46A]">
                    <SimpleCounter end={120} />
                  </p>
                  <p className="text-white/50 text-sm mt-1">Kinder erhalten Bildung</p>
                </div>
              </div>
            </SimpleSection>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Abo wählen", desc: "Wählen Sie ein Paket für Ihr Unternehmen — ab 5 Bäume pro Monat." },
    { num: "02", title: "Bäume werden gepflanzt", desc: "Lokale Familien pflanzen heimische Arten. Jeder Baum wird GPS-getrackt." },
    { num: "03", title: "Impact verfolgen", desc: "Verfolgen Sie Wachstum, CO₂-Daten und Schulbau-Fortschritt live." },
    { num: "04", title: "CSRD-Report erhalten", desc: "Exportieren Sie alle Daten direkt für Ihren Nachhaltigkeitsbericht." },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#2D6A4F]">
      <div className="container">
        <SimpleSection>
          <div className="text-center mb-16">
            <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">So funktioniert's</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white">In 4 Schritten zum messbaren Impact</h2>
          </div>
        </SimpleSection>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <SimpleSection key={i}>
              <div className="relative">
                <span className="font-[Montserrat] font-900 text-6xl text-[#52B788]/20">{step.num}</span>
                <h3 className="font-[Montserrat] font-bold text-lg text-white mt-2 mb-2">{step.title}</h3>
                <p className="text-[#B7E4C7]/70 text-sm leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8">
                    <ChevronRight className="w-6 h-6 text-[#52B788]/30" />
                  </div>
                )}
              </div>
            </SimpleSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ─── */
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "175",
      period: "/ Monat",
      trees: "5 Bäume / Monat",
      desc: "Perfekt für kleine Teams und den Einstieg in nachhaltiges CSR.",
      features: [
        "5 GPS-getrackte Bäume",
        "Firmen-Dashboard",
        "Monatlicher Impact-Report",
        "CSRD-Datenexport",
        "Quetzito-Maskottchen für Ihre Kommunikation",
      ],
      highlight: false,
    },
    {
      name: "Business",
      price: "625",
      period: "/ Monat",
      trees: "20 Bäume / Monat",
      desc: "Für Unternehmen, die CSR ernst nehmen und Mitarbeiter einbinden.",
      features: [
        "20 GPS-getrackte Bäume",
        "Personalisiertes Firmen-Dashboard",
        "Wöchentliche Updates & Fotos",
        "Mitarbeiter-Engagement-Toolkit",
        "Dedizierter Ansprechpartner",
        "Ihr Logo auf der Schulwand",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Individuell",
      period: "",
      trees: "50+ Bäume / Monat",
      desc: "Maßgeschneiderte Lösungen für große Organisationen.",
      features: [
        "50+ GPS-getrackte Bäume",
        "White-Label Dashboard",
        "Vor-Ort-Besuche in Guatemala",
        "Vollständige CSRD-Integration",
        "PR & Medien-Paket",
        "Exklusiver Schulpate",
      ],
      highlight: false,
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]" id="preise">
      <div className="container">
        <SimpleSection>
          <div className="text-center mb-16">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Preise</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white mb-4">
              Investieren Sie in echten Impact
            </h2>
            <p className="text-[#B7E4C7]/60 max-w-xl mx-auto">
              Jeder Baum kostet €35/Monat. Davon fließen €5 direkt in den Schulbau.
            </p>
          </div>
        </SimpleSection>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <SimpleSection key={i}>
              <div className={`relative p-8 rounded-2xl h-full flex flex-col ${plan.highlight
                ? "bg-[#52B788]/15 border-2 border-[#52B788]/40"
                : "bg-[#0D2818]/60 border border-[#52B788]/10"
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#52B788] text-[#081C15] font-[Montserrat] font-bold text-xs px-4 py-1 rounded-full">
                    Beliebteste Wahl
                  </div>
                )}
                <h3 className="font-[Montserrat] font-bold text-xl text-white mb-1">{plan.name}</h3>
                <p className="text-[#52B788] text-sm font-medium mb-4">{plan.trees}</p>
                <div className="mb-4">
                  <span className="font-[Montserrat] font-900 text-4xl text-white">€{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
                <p className="text-white/50 text-sm mb-6 leading-relaxed">{plan.desc}</p>
                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#52B788] mt-0.5 shrink-0" />
                      <span className="text-white/70 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#kontakt">
                  <Button className={`w-full font-[Montserrat] font-semibold ${plan.highlight
                    ? "bg-[#52B788] hover:bg-[#40916C] text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                  }`}>
                    Jetzt starten
                  </Button>
                </a>
              </div>
            </SimpleSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── EMPLOYER BRANDING ─── */
function EmployerBrandingSection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <SimpleSection>
            <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Employer Branding</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white leading-tight mb-6">
              Jeder Mitarbeiter bekommt seinen eigenen Baum.
            </h2>
            <p className="text-[#B7E4C7]/70 text-lg leading-relaxed mb-8">
              Stellen Sie sich vor: Jeder Mitarbeiter von Ihrem Unternehmen erhält ein eigenes,
              GPS-getracktes Bäumchen. Sie können online zusehen, wie es wächst, und wissen gleichzeitig,
              dass ihr Baum einen lokalen Arbeitsplatz schafft.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Heart, value: "87%", label: "höhere Mitarbeiterbindung" },
                { icon: Globe, value: "3x", label: "mehr Social-Media-Reichweite" },
                { icon: Leaf, value: "100%", label: "CSRD-konforme Daten" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-6 h-6 text-[#E9C46A] mx-auto mb-2" />
                  <p className="font-[Montserrat] font-800 text-2xl text-white">{stat.value}</p>
                  <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </SimpleSection>

          <SimpleSection>
            <div className="relative">
              <div className="absolute -inset-4 bg-[#E9C46A]/5 rounded-2xl blur-xl" />
              <img
                src={IMAGES.roots}
                alt="Wurzeln des Regenwaldes"
                className="relative rounded-xl shadow-2xl shadow-black/40 w-full object-contain"
              />
            </div>
          </SimpleSection>
        </div>
      </div>
    </section>
  );
}

/* ─── CO2 CALCULATOR ─── */
function CalculatorSection() {
  const [mode, setMode] = useState<'employees' | 'trees'>('employees');
  const [employees, setEmployees] = useState(50);
  const [trees, setTrees] = useState(20);

  // NEW SUBSCRIPTION MODEL - optimized for German Mittelstand
  const costPerEmployeePerMonth = 25; // €/employee/month
  const treesPerEmployeePerYear = 3; // trees allocated per employee annually
  const treePrice = 25; // € per tree
  const schoolPercentage = 0.30; // 30% goes to school

  const monthlySubscription = employees * costPerEmployeePerMonth;
  const annualSubscription = monthlySubscription * 12;
  const treesAllocated = employees * treesPerEmployeePerYear;
  const co2Offset = treesAllocated * 25 / 1000; // 25kg CO2 per tree per year, convert to tonnes
  const schoolContribution = annualSubscription * schoolPercentage;

  // For trees mode, use direct calculation
  const activeTrees = mode === 'employees' ? treesAllocated : trees;
  const monthlyCost = mode === 'employees' ? monthlySubscription : (trees * treePrice / 12);
  const schoolTotal = mode === 'employees' ? schoolContribution : (trees * treePrice * schoolPercentage);
  const jobs = Math.max(1, Math.ceil(activeTrees / 10));
  const coveragePercent = mode === 'employees'
    ? Math.min(100, Math.round((co2Offset * 1000) / (employees * co2PerEmployee) * 100))
    : null;

  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]" id="calculadora">
      <div className="container">
        <SimpleSection>
          <div className="text-center mb-12">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Impact-Rechner</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white mb-4">
              Wie viele Bäume braucht Ihr Unternehmen?
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Berechnen Sie Ihre CO₂-Kompensation in Sekunden. Wählen Sie den Modus, der am besten zu Ihrem Unternehmen passt.
            </p>
          </div>
        </SimpleSection>

        <SimpleSection>
          <div className="max-w-3xl mx-auto">
            {/* Mode toggle */}
            <div className="flex bg-[#0D2818] border border-[#52B788]/20 rounded-xl p-1 mb-6 max-w-sm mx-auto">
              <button
                onClick={() => setMode('employees')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'employees'
                    ? 'bg-[#52B788] text-[#0D2818]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Nach Angestellten
              </button>
              <button
                onClick={() => setMode('trees')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'trees'
                    ? 'bg-[#52B788] text-[#0D2818]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Nach Bäumen
              </button>
            </div>

            <div className="bg-[#0D2818]/80 border border-[#52B788]/20 rounded-2xl p-8 md:p-12">
              {/* Slider */}
              <div className="mb-8">
                {mode === 'employees' ? (
                  <>
                    <label className="text-white/80 text-sm font-medium mb-3 block">
                      Anzahl Mitarbeiter:{' '}
                      <span className="text-[#52B788] font-[Montserrat] font-bold text-lg">{employees}</span>
                    </label>
                    <input
                      type="range" min="5" max="500" step="5" value={employees}
                      onChange={(e) => setEmployees(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #52B788 ${((employees - 5) / 495) * 100}%, #0D2818 ${((employees - 5) / 495) * 100}%)` }}
                    />
                    <div className="flex justify-between text-white/30 text-xs mt-2"><span>5</span><span>500</span></div>
                    <p className="text-white/40 text-xs mt-3 text-center">
                      €25/Mitarbeiter/Monat - Flexibles Nachhaltigkeits-Abo für KMU
                    </p>
                  </>
                ) : (
                  <>
                    <label className="text-white/80 text-sm font-medium mb-3 block">
                      Bäume pro Monat:{' '}
                      <span className="text-[#52B788] font-[Montserrat] font-bold text-lg">{trees}</span>
                    </label>
                    <input
                      type="range" min="5" max="200" step="5" value={trees}
                      onChange={(e) => setTrees(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #52B788 ${((trees - 5) / 195) * 100}%, #0D2818 ${((trees - 5) / 195) * 100}%)` }}
                    />
                    <div className="flex justify-between text-white/30 text-xs mt-2"><span>5</span><span>200</span></div>
                  </>
                )}
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                {[
                  { label: mode === 'employees' ? 'CO₂ kompensiert/Jahr' : 'CO₂ / Jahr', value: `${co2Offset.toFixed(1)} t`, icon: Leaf, highlight: true },
                  { label: mode === 'employees' ? 'Bäume/Jahr zugeteilt' : 'Benötigte Bäume', value: activeTrees.toLocaleString('de-DE'), icon: TreePine, highlight: false },
                  { label: mode === 'employees' ? 'Monatlicher Beitrag' : 'Monatliche Kosten', value: `€${monthlyCost.toLocaleString('de-DE')}`, icon: BarChart3, highlight: true },
                  { label: 'Geschaffene Arbeitsplätze', value: `${Math.max(1, Math.ceil(activeTrees / 10))}`, icon: Users, highlight: false },
                ].map((item, i) => (
                  <div key={i} className={`text-center p-4 rounded-xl ${
                    item.highlight ? 'bg-[#52B788]/10 border border-[#52B788]/30' : ''
                  }`}>
                    <item.icon className="w-5 h-5 text-[#52B788] mx-auto mb-2" />
                    <p className="font-[Montserrat] font-800 text-xl md:text-2xl text-white">{item.value}</p>
                    <p className="text-white/40 text-xs mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Coverage bar (only in employee mode) */}
              {mode === 'employees' && coveragePercent !== null && (
                <div className="border-t border-white/10 pt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">CO₂-Fußabdruck Abdeckung</span>
                    <span className="text-[#52B788] font-bold">{coveragePercent}%</span>
                  </div>
                  <div className="h-3 bg-[#0D2818] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#52B788] to-[#40916C] rounded-full transition-all duration-500"
                      style={{ width: `${coveragePercent}%` }}
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-2 text-center">
                    Mit {activeTrees} Bäumen/Jahr und €{monthlySubscription}/Monat schaffen Sie nachhaltigen Impact für {employees} Mitarbeiter
                  </p>
                </div>
              )}

              {/* School contribution highlight */}
              <div className="mt-6 bg-blue-900/30 border border-blue-500/20 rounded-xl p-4 text-center">
                <p className="text-blue-300 text-sm">
                  🏫 Ihr Abo trägt <strong className="text-white">€{schoolTotal.toLocaleString('de-DE')}/Jahr</strong> zum Bau der Jumuzna-Schule bei
                </p>
              </div>

              {/* CTA */}
              <div className="mt-6 text-center">
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-2 bg-[#52B788] text-[#0D2818] font-bold px-8 py-3 rounded-xl hover:bg-[#40916C] transition-colors"
                >
                  {mode === 'employees'
                    ? `Nachhaltigkeits-Abo für €${monthlySubscription}/Monat starten`
                    : `Angebot anfordern für ${activeTrees} Bäume`
                  }
                </a>
              </div>
            </div>
          </div>
        </SimpleSection>
      </div>
    </section>
  );
}

/* ─── CONTACT / CTA ─── */
function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", company: "", employees: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="relative py-24 md:py-32 bg-[#081C15]" id="kontakt">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16">
          <SimpleSection>
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Kontakt</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white leading-tight mb-6">
              Bereit, echten Impact zu schaffen?
            </h2>
            <p className="text-[#B7E4C7]/70 text-lg leading-relaxed mb-8">
              Vereinbaren Sie ein kostenloses 15-minütiges Kennenlerngespräch. Wir zeigen Ihnen,
              wie quetz.org perfekt in Ihre CSR-Strategie passt.
            </p>
            <div className="space-y-6">
              {[
                { icon: MapPin, text: "Erkrath, NRW, Deutschland" },
                { icon: Globe, text: "www.quetz.org" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-[#52B788]" />
                  <span className="text-white/70">{item.text}</span>
                </div>
              ))}
            </div>
          </SimpleSection>

          <SimpleSection>
            {submitted ? (
              <div className="bg-[#52B788]/10 border border-[#52B788]/30 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#52B788]/20 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-[#52B788]" />
                </div>
                <h3 className="font-[Montserrat] font-bold text-xl text-white mb-2">Vielen Dank!</h3>
                <p className="text-white/60">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Ihr Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#52B788] focus:outline-none transition-colors"
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">E-Mail *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#52B788] focus:outline-none transition-colors"
                      placeholder="max@firma.de"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Unternehmen *</label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#52B788] focus:outline-none transition-colors"
                      placeholder="Firma GmbH"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Mitarbeiteranzahl</label>
                    <select
                      value={formData.employees}
                      onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                      className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white focus:border-[#52B788] focus:outline-none transition-colors"
                    >
                      <option value="select">Bitte wählen</option>
                      <option value="1-50">1–50</option>
                      <option value="51-200">51–200</option>
                      <option value="201-500">201–500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">Nachricht</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#52B788] focus:outline-none transition-colors resize-none"
                    placeholder="Erzählen Sie uns von Ihren CSR-Zielen..."
                  />
                </div>
                <Button type="submit" size="lg" className="w-full bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base py-6 shadow-xl shadow-[#52B788]/20">
                  Jetzt starten
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-white/30 text-xs text-center">
                  Wir antworten innerhalb von 24 Stunden. Keine Spam-Mails, versprochen.
                </p>
              </form>
            )}
          </SimpleSection>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="bg-[#081C15] border-t border-[#52B788]/10 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#52B788]" />
            <span className="font-[Montserrat] font-bold text-white">quetz.org</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="text-white/40 hover:text-white/70 transition-colors">Impressum</a>
            <a href="#" className="text-white/40 hover:text-white/70 transition-colors">Datenschutz</a>
            <a href="#" className="text-white/40 hover:text-white/70 transition-colors">AGB</a>
          </div>
          <p className="text-white/30 text-sm">
            © 2026 quetz.org — Erkrath, Deutschland
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN PAGE ─── */
export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <TransparencySection />
      <SchoolSection />
      <HowItWorksSection />
      <CalculatorSection />
      <PricingSection />
      <EmployerBrandingSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
