"use client";

import { useState, useEffect } from "react";
import { TreePine, Check, ChevronRight, Leaf, Gift, FileText, MapPin, Shield, Clock, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

/* ─── Images (same CDN as /empresas) ─── */
const IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/hero-canopy-KsLbgKCZWapLbdtMVAC26c.webp",
  workers: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/understory-workers-jhLXmGeuAGSeLgeTe97sXg.webp",
  children: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/school-children-FiGg2g9cBma6G5ArjEs5Gy.webp",
  roots: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/forest-floor-roots-4HVX5t3CGzqRnqYzdrThsP.webp",
};

/* ─── Translations ─── */
const txt = {
  de: {
    navImpact: "Impact",
    navPakete: "Pakete",
    navAblauf: "So geht's",
    navKontakt: "Kontakt",
    navCta: "Paket auswählen",
    heroTag: "Firmengeschenk mit echtem Impact",
    heroTitle: "Das Firmengeschenk, das wächst.",
    heroSub: "Kein Kugelschreiber. Kein Notizbuch. Sondern echte Bäume in Guatemala, die Ihre Mitarbeiter jahrelang begleiten.",
    heroCta: "Paket auswählen",
    heroTrust1: "Steuerlich absetzbar",
    heroTrust2: "Zertifikat in 48h",
    heroTrust3: "DSGVO-konform",
    probTitle: "Wertschätzung zeigen, ohne im Papierkorb zu landen.",
    probText: "Mitarbeiter und Kunden vergessen den nächsten gebrandeten Kugelschreiber sofort. Ein Geschenk, das wirklich bleibt, wächst und Bedeutung hat. Das schaffen nur die wenigsten.",
    solTag: "Die Lösung",
    solTitle: "Ein Baum pro Mitarbeiter. Ein Geschenk, das bleibt.",
    sol1Title: "Echte Bäume in Zacapa, Guatemala",
    sol1Text: "Heimische Arten, von lokalen Familien gepflanzt und gepflegt. Jeder Baum hat GPS-Koordinaten.",
    sol2Title: "Personalisiertes Zertifikat",
    sol2Text: "Jeder Mitarbeiter erhält ein digitales Zertifikat mit Namen, Foto des Baumes und GPS-Standort.",
    sol3Title: "Steuerlich absetzbar",
    sol3Text: "Als Sachbezug bis 60 Euro pro Mitarbeiter steuer- und sozialversicherungsfrei (§8 Abs. 2 Satz 11 EStG). Rechnung inklusive.",
    pricingTag: "Pakete",
    pricingTitle: "Einfach. Transparent. Sofort.",
    pricingSubtitle: "Einmalzahlung. Keine Laufzeit. Keine versteckten Kosten.",
    pkgKlein: "Klein",
    pkgKleinDesc: "Ideal für kleine Teams",
    pkgMedium: "Medium",
    pkgMediumDesc: "Beliebt bei Agenturen",
    pkgGross: "Groß",
    pkgGrossDesc: "Für Sommerfeste & Events",
    pkgXl: "XL",
    pkgXlDesc: "Für Jubiläen & Großevents",
    pkgTrees: "Bäume",
    pkgCta: "Jetzt bestellen",
    pkgPopular: "Am beliebtesten",
    pkgTax: "Inkl. Rechnung · steuerlich absetzbar",
    howTag: "So funktioniert's",
    howTitle: "In 4 Schritten zum perfekten Firmengeschenk",
    how1Title: "Paket auswählen und bezahlen",
    how1Text: "Wählen Sie die passende Größe. Zahlung per Stripe, Rechnung sofort verfügbar.",
    how2Title: "Mitarbeiternamen übermitteln",
    how2Text: "Per CSV-Upload oder einzeln im Formular. Dauert 2 Minuten.",
    how3Title: "Wir pflanzen die Bäume",
    how3Text: "Lokale Familien in Zacapa pflanzen Ihre Bäume. Jeder Baum wird GPS-getrackt.",
    how4Title: "Zertifikate erhalten",
    how4Text: "Innerhalb von 48 Stunden erhalten Sie personalisierte digitale Zertifikate für jeden Mitarbeiter.",
    proofTag: "Vertrauen",
    proofTitle: "Unternehmen, die bereits schenken",
    proofQuote: "Ein Geschenk, das bei unseren Mitarbeitern wirklich angekommen ist. Einfacher Prozess, schöne Zertifikate.",
    proofCompany: "Leyton Deutschland",
    proofClaim1: "Jeder Baum mit GPS und Foto verifiziert",
    proofClaim2: "30% der Nettoeinnahmen für den Schulfonds",
    founderTag: "Unsere Wurzeln",
    founderTitle: "Warum ich das mache.",
    founderText: "Ich bin deutsch-guatemaltekisch und lebe in Düsseldorf. In Zacapa habe ich gesehen, wie Aufforstung Arbeitsplätze schafft und Familien eine Perspektive gibt. Mit quetz.org verbinde ich deutsche Unternehmen direkt mit diesen Familien.",
    founderName: "Daniel, Gründer von quetz.org",
    faqTag: "Häufige Fragen",
    faq1Q: "Ist das wirklich steuerlich absetzbar?",
    faq1A: "Ja. Als Sachbezug können Firmengeschenke bis 60 Euro pro Mitarbeiter steuer- und sozialversicherungsfrei gewährt werden (§8 Abs. 2 Satz 11 EStG). Sie erhalten eine ordentliche Rechnung für Ihre Buchhaltung.",
    faq2Q: "Wie schnell erhalten meine Mitarbeiter die Zertifikate?",
    faq2A: "Innerhalb von 48 Stunden nach Übermittlung der Namen. Bei Eilbestellungen auch schneller.",
    faq3Q: "Können wir das Zertifikat mit unserem Firmenlogo personalisieren?",
    faq3A: "Ja, ab dem Medium-Paket (25 Bäume) können Sie Ihr Logo und eine persönliche Nachricht auf dem Zertifikat platzieren.",
    faq4Q: "Was passiert, wenn ein Baum nicht überlebt?",
    faq4A: "Wir garantieren eine Überlebensrate von über 85%. Sollte ein Baum eingehen, pflanzen wir kostenlos einen neuen.",
    faq5Q: "Gibt es eine Rechnung für die Buchhaltung?",
    faq5A: "Ja, Sie erhalten automatisch eine ordentliche Rechnung mit ausgewiesener Mehrwertsteuer per E-Mail.",
    faq6Q: "Wo genau werden die Bäume gepflanzt?",
    faq6A: "In Zacapa, Guatemala. Jeder Baum hat GPS-Koordinaten, die Sie auf Ihrem Zertifikat und in unserem Dashboard einsehen können.",
    faq7Q: "Kann ich die Bäume auch als Kundengeschenk nutzen?",
    faq7A: "Absolut. Viele Unternehmen verschenken Bäume an Kunden zum Jahresende, zu Jubiläen oder als Dankeschön nach Projektabschluss. Für Kundengeschenke gilt eine separate steuerliche Freigrenze von 50 Euro pro Person (§4 Abs. 5 Nr. 1 EStG).",
    ctaTitle: "Ein Geschenk, das in fünf Jahren noch wächst.",
    ctaSub: "Jetzt Paket auswählen und Ihrem Team etwas Bleibendes schenken.",
    ctaBtn: "Paket auswählen",
    stickyText: "Ab 99€ · Steuerlich absetzbar",
    stickyCta: "Jetzt bestellen",
  },
  en: {
    navImpact: "Impact",
    navPakete: "Packages",
    navAblauf: "How it works",
    navKontakt: "Contact",
    navCta: "Choose package",
    heroTag: "Corporate gift with real impact",
    heroTitle: "The corporate gift that grows.",
    heroSub: "No pens. No notebooks. Real trees in Guatemala that accompany your employees for years.",
    heroCta: "Choose package",
    heroTrust1: "Tax deductible",
    heroTrust2: "Certificate in 48h",
    heroTrust3: "GDPR compliant",
    probTitle: "Show appreciation without ending up in the bin.",
    probText: "Employees and clients forget the next branded pen immediately. A gift that truly lasts, grows, and carries meaning. Very few manage that.",
    solTag: "The Solution",
    solTitle: "One tree per employee. A gift that lasts.",
    sol1Title: "Real trees in Zacapa, Guatemala",
    sol1Text: "Native species, planted and cared for by local families. Every tree has GPS coordinates.",
    sol2Title: "Personalized certificate",
    sol2Text: "Each employee receives a digital certificate with their name, tree photo, and GPS location.",
    sol3Title: "Tax deductible",
    sol3Text: "Deductible as a business expense. Invoice included with every order.",
    pricingTag: "Packages",
    pricingTitle: "Simple. Transparent. Immediate.",
    pricingSubtitle: "One-time payment. No commitment. No hidden costs.",
    pkgKlein: "Small",
    pkgKleinDesc: "Ideal for small teams",
    pkgMedium: "Medium",
    pkgMediumDesc: "Popular with agencies",
    pkgGross: "Large",
    pkgGrossDesc: "For summer parties & events",
    pkgXl: "XL",
    pkgXlDesc: "For anniversaries & large events",
    pkgTrees: "Trees",
    pkgCta: "Order now",
    pkgPopular: "Most popular",
    pkgTax: "Invoice included · tax deductible",
    howTag: "How it works",
    howTitle: "The perfect corporate gift in 4 steps",
    how1Title: "Choose and pay for your package",
    how1Text: "Select the right size. Payment via Stripe, invoice available immediately.",
    how2Title: "Submit employee names",
    how2Text: "Via CSV upload or individually in the form. Takes 2 minutes.",
    how3Title: "We plant the trees",
    how3Text: "Local families in Zacapa plant your trees. Each tree is GPS-tracked.",
    how4Title: "Receive certificates",
    how4Text: "Within 48 hours you receive personalized digital certificates for each employee.",
    proofTag: "Trust",
    proofTitle: "Companies already gifting",
    proofQuote: "A gift that truly resonated with our employees. Simple process, beautiful certificates.",
    proofCompany: "Leyton Deutschland",
    proofClaim1: "Every tree verified with GPS and photo",
    proofClaim2: "30% of net proceeds go to the school fund",
    founderTag: "Our Roots",
    founderTitle: "Why I do this.",
    founderText: "I am German-Guatemalan and live in Düsseldorf. In Zacapa I saw how reforestation creates jobs and gives families a future. With quetz.org I connect German companies directly with these families.",
    founderName: "Daniel, Founder of quetz.org",
    faqTag: "FAQ",
    faq1Q: "Is this really tax deductible?",
    faq1A: "Yes. Corporate gifts can be deducted as business expenses. You receive a proper invoice for your accounting.",
    faq2Q: "How quickly do my employees receive the certificates?",
    faq2A: "Within 48 hours after submitting the names. Rush orders available.",
    faq3Q: "Can we personalize the certificate with our company logo?",
    faq3A: "Yes, from the Medium package (25 trees) you can place your logo and a personal message on the certificate.",
    faq4Q: "What happens if a tree doesn't survive?",
    faq4A: "We guarantee a survival rate of over 85%. If a tree dies, we plant a new one free of charge.",
    faq5Q: "Is there an invoice for accounting?",
    faq5A: "Yes, you automatically receive a proper invoice with VAT by email.",
    faq6Q: "Where exactly are the trees planted?",
    faq6A: "In Zacapa, Guatemala. Each tree has GPS coordinates visible on your certificate and our dashboard.",
    faq7Q: "Can I also use the trees as client gifts?",
    faq7A: "Absolutely. Many companies gift trees to clients at year-end, for anniversaries, or as thank-yous after project completion.",
    ctaTitle: "A gift that still grows in five years.",
    ctaSub: "Choose your package now and give your team something lasting.",
    ctaBtn: "Choose package",
    stickyText: "From €99 · Tax deductible",
    stickyCta: "Order now",
  },
  es: {
    navImpact: "Impacto",
    navPakete: "Paquetes",
    navAblauf: "Proceso",
    navKontakt: "Contacto",
    navCta: "Elegir paquete",
    heroTag: "Regalo corporativo con impacto real",
    heroTitle: "El regalo corporativo que crece.",
    heroSub: "Ni bolígrafos. Ni libretas. Árboles reales en Guatemala que acompañan a sus empleados durante años.",
    heroCta: "Elegir paquete",
    heroTrust1: "Deducible de impuestos",
    heroTrust2: "Certificado en 48h",
    heroTrust3: "Conforme al RGPD",
    probTitle: "Mostrar aprecio sin acabar en la papelera.",
    probText: "Los empleados y clientes olvidan el siguiente bolígrafo con logo al instante. Un regalo que realmente perdura, crece y tiene significado. Muy pocos lo logran.",
    solTag: "La Solución",
    solTitle: "Un árbol por empleado. Un regalo que perdura.",
    sol1Title: "Árboles reales en Zacapa, Guatemala",
    sol1Text: "Especies nativas, plantadas y cuidadas por familias locales. Cada árbol tiene coordenadas GPS.",
    sol2Title: "Certificado personalizado",
    sol2Text: "Cada empleado recibe un certificado digital con su nombre, foto del árbol y ubicación GPS.",
    sol3Title: "Deducible de impuestos",
    sol3Text: "Deducible como gasto empresarial. Factura incluida con cada pedido.",
    pricingTag: "Paquetes",
    pricingTitle: "Simple. Transparente. Inmediato.",
    pricingSubtitle: "Pago único. Sin permanencia. Sin costes ocultos.",
    pkgKlein: "Pequeño",
    pkgKleinDesc: "Ideal para equipos pequeños",
    pkgMedium: "Medio",
    pkgMediumDesc: "Popular entre agencias",
    pkgGross: "Grande",
    pkgGrossDesc: "Para fiestas de verano y eventos",
    pkgXl: "XL",
    pkgXlDesc: "Para aniversarios y grandes eventos",
    pkgTrees: "Árboles",
    pkgCta: "Pedir ahora",
    pkgPopular: "Más popular",
    pkgTax: "Factura incluida · deducible de impuestos",
    howTag: "Proceso",
    howTitle: "El regalo corporativo perfecto en 4 pasos",
    how1Title: "Elegir paquete y pagar",
    how1Text: "Seleccione el tamaño adecuado. Pago con Stripe, factura disponible al instante.",
    how2Title: "Enviar nombres de empleados",
    how2Text: "Por CSV o individualmente en el formulario. Toma 2 minutos.",
    how3Title: "Plantamos los árboles",
    how3Text: "Familias locales en Zacapa plantan sus árboles. Cada árbol tiene seguimiento GPS.",
    how4Title: "Recibir certificados",
    how4Text: "En 48 horas recibe certificados digitales personalizados para cada empleado.",
    proofTag: "Confianza",
    proofTitle: "Empresas que ya regalan",
    proofQuote: "Un regalo que realmente conectó con nuestros empleados. Proceso sencillo, certificados bonitos.",
    proofCompany: "Leyton Deutschland",
    proofClaim1: "Cada árbol verificado con GPS y foto",
    proofClaim2: "30% de los ingresos netos para el fondo escolar",
    founderTag: "Nuestras Raíces",
    founderTitle: "Por qué hago esto.",
    founderText: "Soy alemán-guatemalteco y vivo en Düsseldorf. En Zacapa vi cómo la reforestación crea empleos y da perspectiva a las familias. Con quetz.org conecto empresas alemanas directamente con estas familias.",
    founderName: "Daniel, Fundador de quetz.org",
    faqTag: "Preguntas frecuentes",
    faq1Q: "¿Es realmente deducible de impuestos?",
    faq1A: "Sí. Los regalos corporativos son deducibles como gasto empresarial. Recibe una factura formal para su contabilidad.",
    faq2Q: "¿Qué tan rápido reciben los certificados mis empleados?",
    faq2A: "En 48 horas tras enviar los nombres. Pedidos urgentes disponibles.",
    faq3Q: "¿Podemos personalizar el certificado con nuestro logo?",
    faq3A: "Sí, desde el paquete Medio (25 árboles) puede incluir su logo y un mensaje personal en el certificado.",
    faq4Q: "¿Qué pasa si un árbol no sobrevive?",
    faq4A: "Garantizamos una tasa de supervivencia superior al 85%. Si un árbol muere, plantamos uno nuevo sin coste.",
    faq5Q: "¿Hay factura para la contabilidad?",
    faq5A: "Sí, recibe automáticamente una factura formal con IVA por email.",
    faq6Q: "¿Dónde exactamente se plantan los árboles?",
    faq6A: "En Zacapa, Guatemala. Cada árbol tiene coordenadas GPS visibles en su certificado y nuestro dashboard.",
    faq7Q: "¿Puedo usar los árboles como regalo para clientes?",
    faq7A: "Por supuesto. Muchas empresas regalan árboles a clientes a fin de año, en aniversarios o como agradecimiento tras un proyecto.",
    ctaTitle: "Un regalo que sigue creciendo en cinco años.",
    ctaSub: "Elija su paquete ahora y regale a su equipo algo que perdura.",
    ctaBtn: "Elegir paquete",
    stickyText: "Desde 99€ · Deducible de impuestos",
    stickyCta: "Pedir ahora",
  },
};

type Lang = "de" | "en" | "es";

/* ─── Pricing Data ─── */
const PACKAGES = [
  { id: "klein", trees: 10, price: 99, popular: false },
  { id: "medium", trees: 25, price: 229, popular: true },
  { id: "gross", trees: 50, price: 449, popular: false },
  { id: "xl", trees: 100, price: 849, popular: false },
];

const STRIPE_LINKS: Record<string, string> = {
  klein: process.env.NEXT_PUBLIC_STRIPE_LINK_KLEIN || "#pakete",
  medium: process.env.NEXT_PUBLIC_STRIPE_LINK_MEDIUM || "#pakete",
  gross: process.env.NEXT_PUBLIC_STRIPE_LINK_GROSS || "#pakete",
  xl: process.env.NEXT_PUBLIC_STRIPE_LINK_XL || "#pakete",
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function FirmengeschenkPage() {
  const { language } = useLanguage();
  const lang = (["de", "en", "es"].includes(language) ? language : "de") as Lang;
  const tx = txt[lang];

  return (
    <main className="bg-[#081C15] text-white overflow-x-hidden">
      <Navbar tx={tx} />
      <HeroSection tx={tx} />
      <ProblemSection tx={tx} />
      <SolutionSection tx={tx} />
      <PricingSection tx={tx} lang={lang} />
      <HowItWorksSection tx={tx} />
      <SocialProofSection tx={tx} />
      <FounderSection tx={tx} />
      <FAQSection tx={tx} />
      <FinalCTASection tx={tx} />
      <StickyBar tx={tx} />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════ */
function Navbar({ tx }: { tx: typeof txt.de }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#impact", label: tx.navImpact },
    { href: "#pakete", label: tx.navPakete },
    { href: "#ablauf", label: tx.navAblauf },
    { href: "#kontakt", label: tx.navKontakt },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#081C15]/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.3)] border-b border-[#52B788]/10" : "bg-gradient-to-b from-black/40 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-[72px]">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className={`flex items-center gap-2 transition-all duration-300 ${scrolled ? "" : "bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5"}`}>
            <Leaf className="w-6 h-6 text-[#52B788] group-hover:scale-110 transition-transform" />
            <span className="font-[Montserrat] font-bold text-lg text-white tracking-tight">quetz.org</span>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="relative px-3.5 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 group">
              {link.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-[#52B788] rounded-full transition-all duration-200 group-hover:w-3/5" />
            </a>
          ))}
          <div className="w-px h-5 mx-2 bg-white/20 rounded-full" />
          <a href="/csr-partner" className="px-3.5 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200">
            CSR-Abo
          </a>
        </div>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <a href="#pakete" className="hidden sm:inline-flex">
            <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-sm px-6 py-2.5 rounded-full shadow-lg shadow-[#52B788]/20 hover:shadow-xl hover:shadow-[#52B788]/30 transition-all">
              {tx.navCta}
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </a>
          <button className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#081C15]/98 backdrop-blur-xl border-t border-[#52B788]/10 shadow-2xl">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
                {link.label}
              </a>
            ))}
            <div className="h-px bg-white/10 !my-3" />
            <a href="#pakete" onClick={() => setMobileOpen(false)} className="block mt-3 text-center bg-[#52B788] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-[#52B788]/20">
              {tx.navCta}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */
function HeroSection({ tx }: { tx: typeof txt.de }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <img src={IMAGES.hero} alt="Rainforest canopy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081C15]/60 via-[#081C15]/40 to-[#081C15]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 bg-[#52B788]/15 border border-[#52B788]/30 rounded-full px-4 py-1.5 mb-8">
          <Gift className="w-4 h-4 text-[#52B788]" />
          <span className="text-[#52B788] text-sm font-semibold font-[Montserrat]">{tx.heroTag}</span>
        </div>

        {/* H1 */}
        <h1 className="font-[Montserrat] font-black text-4xl sm:text-5xl md:text-7xl text-white leading-[1.1] mb-6">
          {tx.heroTitle}
        </h1>

        {/* Subtitle */}
        <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          {tx.heroSub}
        </p>

        {/* CTA */}
        <a href="#pakete">
          <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base sm:text-lg px-8 sm:px-10 py-4 rounded-full shadow-xl shadow-[#52B788]/25 hover:shadow-2xl hover:shadow-[#52B788]/30 hover:scale-105 transition-all duration-300">
            {tx.heroCta}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </a>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10">
          {[
            { icon: Shield, text: tx.heroTrust1 },
            { icon: Clock, text: tx.heroTrust2 },
            { icon: FileText, text: tx.heroTrust3 },
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
   PROBLEM
   ═══════════════════════════════════════════════════════ */
function ProblemSection({ tx }: { tx: typeof txt.de }) {
  return (
    <section className="relative py-20 md:py-28 bg-[#1B4332]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-[Montserrat] font-800 text-2xl sm:text-3xl md:text-4xl text-white leading-tight mb-6">
          {tx.probTitle}
        </h2>
        <p className="text-[#B7E4C7]/70 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
          {tx.probText}
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SOLUTION
   ═══════════════════════════════════════════════════════ */
function SolutionSection({ tx }: { tx: typeof txt.de }) {
  return (
    <section className="relative overflow-hidden" id="impact">
      <div className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.workers} alt="Aufforstung Guatemala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#081C15]/90 via-[#081C15]/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.solTag}</p>
          <h2 className="font-[Montserrat] font-800 text-3xl md:text-5xl text-white leading-tight max-w-2xl mb-12">
            {tx.solTitle}
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl">
            {[
              { icon: TreePine, title: tx.sol1Title, text: tx.sol1Text, color: "#52B788" },
              { icon: FileText, title: tx.sol2Title, text: tx.sol2Text, color: "#E9C46A" },
              { icon: Shield, title: tx.sol3Title, text: tx.sol3Text, color: "#52B788" },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: `${item.color}20` }}>
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <h3 className="font-[Montserrat] font-bold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════ */
function PricingSection({ tx, lang }: { tx: typeof txt.de; lang: Lang }) {
  const pkgNames: Record<string, string> = {
    klein: tx.pkgKlein,
    medium: tx.pkgMedium,
    gross: tx.pkgGross,
    xl: tx.pkgXl,
  };
  const pkgDescs: Record<string, string> = {
    klein: tx.pkgKleinDesc,
    medium: tx.pkgMediumDesc,
    gross: tx.pkgGrossDesc,
    xl: tx.pkgXlDesc,
  };

  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]" id="pakete">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.pricingTag}</p>
          <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white mb-4">{tx.pricingTitle}</h2>
          <p className="text-[#B7E4C7]/60 max-w-xl mx-auto">{tx.pricingSubtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className={`relative p-8 rounded-2xl flex flex-col ${pkg.popular ? "bg-[#52B788]/15 border-2 border-[#52B788]/40 scale-[1.02]" : "bg-[#1B4332]/60 border border-[#52B788]/10"}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#52B788] text-[#081C15] font-[Montserrat] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                  {tx.pkgPopular}
                </div>
              )}
              <h3 className="font-[Montserrat] font-bold text-xl text-white mb-1">{pkgNames[pkg.id]}</h3>
              <p className="text-[#52B788] text-sm font-medium mb-1">{pkg.trees} {tx.pkgTrees}</p>
              <p className="text-white/50 text-xs mb-4">{pkgDescs[pkg.id]}</p>
              <div className="mb-4">
                <span className="font-[Montserrat] font-900 text-4xl text-white">{lang === "en" ? `€${pkg.price}` : `${pkg.price}€`}</span>
              </div>
              <p className="text-[#52B788]/70 text-xs mb-6 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {tx.pkgTax}
              </p>
              <div className="mt-auto">
                <a href={STRIPE_LINKS[pkg.id]} target="_blank" rel="noopener noreferrer">
                  <Button className={`w-full font-[Montserrat] font-bold rounded-full py-3 transition-all ${pkg.popular ? "bg-[#52B788] hover:bg-[#40916C] text-white shadow-lg shadow-[#52B788]/20" : "bg-white/10 hover:bg-white/20 text-white"}`}>
                    {tx.pkgCta}
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </a>
              </div>
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
function HowItWorksSection({ tx }: { tx: typeof txt.de }) {
  const steps = [
    { num: "01", title: tx.how1Title, text: tx.how1Text },
    { num: "02", title: tx.how2Title, text: tx.how2Text },
    { num: "03", title: tx.how3Title, text: tx.how3Text },
    { num: "04", title: tx.how4Title, text: tx.how4Text },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#2D6A4F]" id="ablauf">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.howTag}</p>
          <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white">{tx.howTitle}</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <span className="font-[Montserrat] font-900 text-6xl text-[#52B788]/20">{step.num}</span>
              <h3 className="font-[Montserrat] font-bold text-lg text-white mt-2 mb-2">{step.title}</h3>
              <p className="text-[#B7E4C7]/70 text-sm leading-relaxed">{step.text}</p>
              {i < 3 && (
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
   SOCIAL PROOF
   ═══════════════════════════════════════════════════════ */
function SocialProofSection({ tx }: { tx: typeof txt.de }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.proofTag}</p>
          <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white">{tx.proofTitle}</h2>
        </div>

        {/* Quote */}
        <div className="bg-[#0D2818]/60 border border-[#52B788]/10 rounded-2xl p-8 md:p-12 mb-12">
          <blockquote className="text-white/80 text-lg md:text-xl leading-relaxed italic mb-6">
            &ldquo;{tx.proofQuote}&rdquo;
          </blockquote>
          <p className="text-[#52B788] font-[Montserrat] font-semibold">{tx.proofCompany}</p>
        </div>

        {/* Verifiable claims */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[tx.proofClaim1, tx.proofClaim2].map((claim, i) => (
            <div key={i} className="flex items-center justify-center gap-3 bg-[#0D2818]/60 border border-[#52B788]/10 rounded-2xl px-6 py-5">
              <svg className="w-5 h-5 text-[#52B788] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-white/80 font-[Montserrat] font-semibold text-sm md:text-base">{claim}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOUNDER
   ═══════════════════════════════════════════════════════ */
function FounderSection({ tx }: { tx: typeof txt.de }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.roots} alt="Forest roots" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#081C15]/90 via-[#081C15]/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="ml-auto max-w-xl">
            <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.founderTag}</p>
            <h2 className="font-[Montserrat] font-800 text-3xl md:text-4xl text-white leading-tight mb-6">
              {tx.founderTitle}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              {tx.founderText}
            </p>
            <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm">
              {tx.founderName}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════ */
function FAQSection({ tx }: { tx: typeof txt.de }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: tx.faq1Q, a: tx.faq1A },
    { q: tx.faq2Q, a: tx.faq2A },
    { q: tx.faq3Q, a: tx.faq3A },
    { q: tx.faq4Q, a: tx.faq4A },
    { q: tx.faq5Q, a: tx.faq5A },
    { q: tx.faq6Q, a: tx.faq6A },
    { q: tx.faq7Q, a: tx.faq7A },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]" id="kontakt">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.faqTag}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
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
function FinalCTASection({ tx }: { tx: typeof txt.de }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-[Montserrat] font-800 text-3xl md:text-5xl text-white leading-tight mb-6">
          {tx.ctaTitle}
        </h2>
        <p className="text-[#B7E4C7]/70 text-lg mb-10">
          {tx.ctaSub}
        </p>
        <a href="#pakete">
          <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-lg px-10 py-4 rounded-full shadow-xl shadow-[#52B788]/25 hover:shadow-2xl hover:shadow-[#52B788]/30 hover:scale-105 transition-all duration-300">
            {tx.ctaBtn}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   STICKY BAR (Mobile)
   ═══════════════════════════════════════════════════════ */
function StickyBar({ tx }: { tx: typeof txt.de }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#081C15]/95 backdrop-blur-xl border-t border-[#52B788]/20 px-4 py-3 flex items-center justify-between">
      <span className="text-white/70 text-xs font-medium">{tx.stickyText}</span>
      <a href={STRIPE_LINKS.medium}>
        <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-sm px-5 py-2 rounded-full">
          {tx.stickyCta}
        </Button>
      </a>
    </div>
  );
}
