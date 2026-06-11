"use client";

import { useState, useEffect } from "react";
import { TreePine, Leaf, ChevronRight, ChevronDown, MapPin, FileText, Heart, Users, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Images (same CDN as /firmengeschenk) ─── */
const IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/hero-canopy-KsLbgKCZWapLbdtMVAC26c.webp",
  roots: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/forest-floor-roots-4HVX5t3CGzqRnqYzdrThsP.webp",
  children: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/school-children-FiGg2g9cBma6G5ArjEs5Gy.webp",
};

const STRIPE_LINK =
  process.env.NEXT_PUBLIC_STRIPE_LINK_GEDENKBAUM ||
  "https://buy.stripe.com/14AdRa0CO5T24QPgE7b7y0b";

const PRICE = "39 €";

const SPECIES = [
  "Kiefer",
  "Zypresse",
  "Zeder",
  "Mahagoni",
  "Kaffee",
  "Kakao",
  "Avocado",
  "Mango",
  "Zitrone",
];

const FAQS = [
  {
    q: "Ist der Gedenkbaum eine Grabstätte?",
    a: "Nein. Der Gedenkbaum ist keine Grabstätte und kein Friedhof. Er ist ein lebendiges Andenken: ein echter Baum in Zacapa, Guatemala, der in Erinnerung an einen geliebten Menschen gepflanzt wird und über Jahrzehnte wächst.",
  },
  {
    q: "Was steht auf der Urkunde?",
    a: "Die persönliche Urkunde enthält den Namen der Person, an die der Baum erinnert, das Pflanzdatum, die Baumart, ein Foto des Baumes und die exakten GPS-Koordinaten. Auf Wunsch ergänzen wir eine persönliche Widmung.",
  },
  {
    q: "Wie schnell wird der Baum gepflanzt?",
    a: "Die Pflanzung erfolgt zeitnah nach Ihrer Bestellung durch lokale Familien in Zacapa. Sobald der Baum gepflanzt ist, erhalten Sie Ihre persönliche Urkunde mit Foto und GPS-Koordinaten per E-Mail, in der Regel innerhalb von 48 Stunden.",
  },
  {
    q: "Kann ich den Baum besuchen?",
    a: "Ja. Ihr Baum hat exakte GPS-Koordinaten, die auf der Urkunde stehen. Sollten Sie einmal nach Guatemala reisen, können Sie ihn besuchen. Auch ohne Reise sehen Sie über die Koordinaten und das Foto genau, wo Ihr Baum steht.",
  },
  {
    q: "Welche Baumarten gibt es?",
    a: "Wir pflanzen heimische Arten in Zacapa, Guatemala: unter anderem Kiefer, Zypresse, Zeder, Mahagoni, Kaffee, Kakao, Avocado, Mango und Zitrone. Jeder Baum wird von lokalen Familien gepflanzt und gepflegt und trägt zur CO2-Bindung bei.",
  },
];

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function GedenkbaumPage() {
  return (
    <main className="bg-[#081C15] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <DifferentiatorSection />
      <UrkundeSection />
      <ImpactSection />
      <KranzSection />
      <FAQSection />
      <FinalCTASection />
      <LegalFooter />
      <StickyBar />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#081C15]/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.3)] border-b border-[#52B788]/10" : "bg-gradient-to-b from-black/40 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-[72px]">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className={`flex items-center gap-2 transition-all duration-300 ${scrolled ? "" : "bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5"}`}>
            <Leaf className="w-6 h-6 text-[#52B788] group-hover:scale-110 transition-transform" />
            <span className="font-[Montserrat] font-bold text-lg text-white tracking-tight">quetz.org</span>
          </div>
        </a>

        <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer">
          <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-sm px-6 py-2.5 rounded-full shadow-lg shadow-[#52B788]/20 hover:shadow-xl hover:shadow-[#52B788]/30 transition-all">
            Gedenkbaum pflanzen lassen
            <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </a>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <img src={IMAGES.hero} alt="Baumkronen im Licht" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081C15]/60 via-[#081C15]/40 to-[#081C15]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-[#52B788]/15 border border-[#52B788]/30 rounded-full px-4 py-1.5 mb-8">
          <Heart className="w-4 h-4 text-[#52B788]" />
          <span className="text-[#52B788] text-sm font-semibold font-[Montserrat]">Ein Andenken mit Leben</span>
        </div>

        <h1 className="font-[Montserrat] font-black text-4xl sm:text-5xl md:text-7xl text-white leading-[1.1] mb-6">
          Ein Baum, der weiterlebt. Ein Andenken, das wächst.
        </h1>

        <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Ein echter Baum in Zacapa, Guatemala, gepflanzt in Erinnerung an einen geliebten Menschen. Mit persönlicher Urkunde, Foto und GPS-Koordinaten.
        </p>

        <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer">
          <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base sm:text-lg px-8 sm:px-10 py-4 rounded-full shadow-xl shadow-[#52B788]/25 hover:shadow-2xl hover:shadow-[#52B788]/30 hover:scale-105 transition-all duration-300">
            Gedenkbaum pflanzen lassen · {PRICE}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </a>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10">
          {[
            { icon: TreePine, text: "Echter Einzelbaum" },
            { icon: FileText, text: "Urkunde mit Foto und GPS" },
            { icon: Users, text: "Gepflanzt von lokalen Familien" },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <badge.icon className="w-4 h-4 text-[#52B788]" />
              <span className="text-white/70 text-xs sm:text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Sie wählen den Gedenkbaum",
      text: "Sie nennen uns den Namen der Person, an die der Baum erinnern soll, und auf Wunsch eine persönliche Widmung.",
    },
    {
      num: "02",
      title: "Wir pflanzen ihn in Zacapa, Guatemala",
      text: "Lokale Familien pflanzen Ihren Baum und kümmern sich um seine Pflege. Eine heimische Art, die dort über Jahrzehnte wächst.",
    },
    {
      num: "03",
      title: "Sie erhalten Ihre persönliche Urkunde",
      text: "Mit Namen, Pflanzdatum, Foto des Baumes und exakten GPS-Koordinaten. Als würdevolles Andenken, das bleibt.",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#2D6A4F]" id="ablauf">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">So funktioniert es</p>
          <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white">In drei Schritten zu einem lebendigen Andenken</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <span className="font-[Montserrat] font-900 text-6xl text-[#52B788]/20">{step.num}</span>
              <h3 className="font-[Montserrat] font-bold text-lg text-white mt-2 mb-2">{step.title}</h3>
              <p className="text-[#B7E4C7]/70 text-sm leading-relaxed">{step.text}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-8 -right-4 w-8">
                  <ChevronRight className="w-6 h-6 text-[#52B788]/30" />
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
   DIFFERENTIATOR
   ═══════════════════════════════════════════════════════ */
function DifferentiatorSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.roots} alt="Wurzeln im Waldboden" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#081C15]/90 via-[#081C15]/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Der Unterschied</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-5xl text-white leading-tight mb-6">
              Ein echter, einzelner Baum. Mit Foto und exakten GPS-Koordinaten.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Kein anonymes Waldstück und keine Sammelfläche. Ihr Gedenkbaum ist ein einzelner, echter Baum mit eigenem Standort. Sie sehen auf der Urkunde genau, wo er wächst, und erhalten ein Foto von ihm.
            </p>
            <div className="space-y-4">
              {[
                { icon: MapPin, text: "Exakte GPS-Koordinaten Ihres Baumes" },
                { icon: Camera, text: "Foto des gepflanzten Baumes" },
                { icon: TreePine, text: "Heimische Art, gepflegt von lokalen Familien" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#52B788]/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-[#52B788]" />
                  </div>
                  <span className="text-white/80 text-sm sm:text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   URKUNDE (certificate mockup)
   ═══════════════════════════════════════════════════════ */
function UrkundeSection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Die Urkunde</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white leading-tight mb-6">
              Ein würdevolles Dokument der Erinnerung.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              Die persönliche Urkunde trägt den Namen des Menschen, an den der Baum erinnert. Dazu das Pflanzdatum, die Baumart, ein Foto des Baumes und seine exakten GPS-Koordinaten.
            </p>
            <p className="text-white/70 text-lg leading-relaxed">
              Sie erhalten die Urkunde digital per E-Mail. Zum Aufbewahren, Verschenken oder Teilen mit der Familie.
            </p>
          </div>

          {/* Certificate mockup */}
          <div className="bg-[#FDFBF5] rounded-2xl p-8 sm:p-10 shadow-2xl text-[#1B4332] max-w-md mx-auto w-full">
            <div className="border-2 border-[#1B4332]/20 rounded-xl p-6 sm:p-8 text-center">
              <Leaf className="w-8 h-8 text-[#2D6A4F] mx-auto mb-3" />
              <p className="font-[Montserrat] font-bold text-xs tracking-[0.2em] uppercase text-[#2D6A4F] mb-4">Gedenkurkunde</p>
              <p className="text-sm text-[#1B4332]/60 mb-1">In liebevoller Erinnerung an</p>
              <p className="font-[Montserrat] font-bold text-2xl mb-4">Maria Schmidt</p>
              <div className="h-px bg-[#1B4332]/15 my-4" />
              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-[#1B4332]/50">Baumart</span>
                  <span className="font-semibold">Zeder</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1B4332]/50">Gepflanzt am</span>
                  <span className="font-semibold">12. Juni 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1B4332]/50">Standort</span>
                  <span className="font-semibold">Zacapa, Guatemala</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1B4332]/50">GPS</span>
                  <span className="font-semibold">14.9722 N, 89.5308 W</span>
                </div>
              </div>
              <div className="h-px bg-[#1B4332]/15 my-4" />
              <p className="text-xs text-[#1B4332]/50 italic">&ldquo;Ein Baum, der weiterlebt.&rdquo;</p>
            </div>
            <p className="text-center text-[10px] text-[#1B4332]/40 mt-3">Musterdarstellung. Ihre Urkunde wird persönlich erstellt.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   IMPACT
   ═══════════════════════════════════════════════════════ */
function ImpactSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.children} alt="Kinder der Schule in Zacapa" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#081C15]/90 via-[#081C15]/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="ml-auto max-w-xl">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Doppelte Wirkung</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white leading-tight mb-6">
              Ein Andenken, das Gutes bewirkt.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              Ihr Gedenkbaum schafft Arbeit für lokale Familien in Zacapa, die ihn pflanzen und über Jahre pflegen. Er wächst, spendet Schatten und trägt zur CO2-Bindung bei.
            </p>
            <p className="text-white/70 text-lg leading-relaxed">
              Und er bewirkt noch mehr: 30% der Nettoeinnahmen fließen in den Bau einer Schule für 120 Kinder in Zacapa. So wird aus einem Abschied ein Anfang.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SPENDE STATT KRANZ
   ═══════════════════════════════════════════════════════ */
function KranzSection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Spende statt Kranz</p>
        <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white leading-tight mb-6">
          Blumen verwelken. Ein Baum wächst über Jahrzehnte.
        </h2>
        <p className="text-[#B7E4C7]/70 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Immer mehr Familien wünschen sich statt Kränzen und Blumen ein Andenken, das bleibt. Ein Gedenkbaum ist eine moderne, würdevolle Alternative. Auch als gemeinsames Zeichen von Kolleginnen und Kollegen, Freunden oder der Familie.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {SPECIES.map((s) => (
            <span key={s} className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-white/70 text-sm">
              {s}
            </span>
          ))}
        </div>
        <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer">
          <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base px-8 py-3.5 rounded-full shadow-xl shadow-[#52B788]/25 hover:shadow-2xl transition-all">
            Gedenkbaum pflanzen lassen · {PRICE}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════ */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">Häufige Fragen</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-[#1B4332]/60 border border-[#52B788]/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-[Montserrat] font-semibold text-white text-sm sm:text-base pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#52B788] shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
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
   FINAL CTA
   ═══════════════════════════════════════════════════════ */
function FinalCTASection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-[Montserrat] font-800 text-3xl md:text-5xl text-white leading-tight mb-6">
          Manche Erinnerungen verdienen Wurzeln.
        </h2>
        <p className="text-[#B7E4C7]/70 text-lg mb-10">
          Pflanzen Sie heute einen Gedenkbaum. Ihre persönliche Urkunde erhalten Sie per E-Mail.
        </p>
        <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer">
          <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-lg px-10 py-4 rounded-full shadow-xl shadow-[#52B788]/25 hover:shadow-2xl hover:shadow-[#52B788]/30 hover:scale-105 transition-all duration-300">
            Gedenkbaum pflanzen lassen · {PRICE}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   LEGAL FOOTER
   ═══════════════════════════════════════════════════════ */
function LegalFooter() {
  return (
    <footer className="bg-[#081C15] border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/40 text-xs">quetz.org · Bäume mit echter Wirkung in Zacapa, Guatemala</p>
        <div className="flex items-center gap-5 text-white/40 text-xs">
          <a href="/impressum" className="hover:text-white/70 transition-colors">Impressum</a>
          <a href="/datenschutz" className="hover:text-white/70 transition-colors">Datenschutz</a>
          <a href="/agb" className="hover:text-white/70 transition-colors">AGB</a>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   STICKY BAR (Mobile)
   ═══════════════════════════════════════════════════════ */
function StickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#081C15]/95 backdrop-blur-xl border-t border-[#52B788]/20 px-4 py-3 flex items-center justify-between">
      <span className="text-white/70 text-xs font-medium">Gedenkbaum · {PRICE}</span>
      <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer">
        <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-sm px-5 py-2 rounded-full">
          Jetzt pflanzen lassen
        </Button>
      </a>
    </div>
  );
}
