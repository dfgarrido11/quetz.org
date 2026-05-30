"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  TreePine,
  Check,
  ChevronRight,
  Leaf,
  Gift,
  FileText,
  MapPin,
  Shield,
  Clock,
  Users,
  ChevronDown,
  Star,
  Sparkles,
  Heart,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import Footer from "@/app/components/footer";

/* ─── CDN Images (real Zacapa photos) ─── */
const IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/hero-canopy-KsLbgKCZWapLbdtMVAC26c.webp",
  workers:
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/understory-workers-jhLXmGeuAGSeLgeTe97sXg.webp",
  children:
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/school-children-FiGg2g9cBma6G5ArjEs5Gy.webp",
  roots:
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/forest-floor-roots-4HVX5t3CGzqRnqYzdrThsP.webp",
};

/* ─── Local tree images from /public/trees ─── */
const TREE_IMAGES: Record<string, string> = {
  cafe: "/trees/cafe.jpg",
  pino: "/trees/pino.jpg",
  cipres: "/trees/cipres.jpg",
  aguacate: "/trees/aguacate.jpg",
  mango: "/trees/mango.jpg",
  limon: "/trees/limon.jpg",
};

/* ─── Translations ─── */
const txt = {
  de: {
    navImpact: "Impact",
    navPakete: "Pakete",
    navAblauf: "So geht's",
    navKontakt: "Kontakt",
    navCta: "Angebot anfordern",

    heroTag: "Firmengeschenk mit echtem Impact",
    heroTitle: "Verschenken Sie keinen Baum.",
    heroTitleLine2: "Verschenken Sie eine Geschichte.",
    heroSub:
      "Echte Baume in Zacapa, Guatemala. Jeder Baum schafft Arbeit fur lokale Familien und finanziert eine Schule fur 120 Kinder.",
    heroCta1: "Angebot anfordern",
    heroCta2: "Pakete ansehen",
    heroTrust1: "Steuerlich absetzbar",
    heroTrust2: "Zertifikat in 48h",
    heroTrust3: "DSGVO-konform",

    gruendungTag: "Limitiertes Angebot 2026",
    gruendungTitle: "Werden Sie Grundungspartner.",
    gruendungSub:
      "Die ersten 5 Unternehmen, die einsteigen, erhalten exklusive Vorteile ohne Laufzeit oder Bedingungen.",
    gruendungUrgency: "Noch 5 Platze verfugbar",
    gruendungBenefit1: "Logo auf quetz.org",
    gruendungBenefit2: "Erwahnung auf LinkedIn",
    gruendungBenefit3: "Namensgebung im Schulprojekt",
    gruendungBenefit4: "Echtzeit-Dashboard",
    gruendungBenefit5: "Personalisierte Zertifikate",
    gruendungBenefit6: "Foto jedes Baumes",
    gruendungCta: "Jetzt Platz sichern",
    gruendungNote: "Keine Laufzeit. Kein Abo. Einmalige Entscheidung.",

    diffTag: "Warum quetz.org",
    diffTitle: "Kein Baum wie der andere.",
    diff1Title: "Geschichte mit Gesicht",
    diff1Text:
      "Jeder Baum hat einen Namen, GPS-Koordinaten und ein echtes Foto. Ihre Mitarbeiter erhalten nicht nur ein Zertifikat, sondern eine Geschichte.",
    diff2Title: "30 % fur die Schule",
    diff2Text:
      "Ein Drittel jedes Kaufs fliesst direkt in das Schulprojekt in Zacapa. 120 Kinder lernen dort, weil Unternehmen wie Ihres sich entschieden haben.",
    diff3Title: "Foto + GPS pro Baum",
    diff3Text:
      "Transparenz ist kein Marketingbegriff. Jeder Baum ist geortet, fotografiert und in Ihrem Dashboard sichtbar.",
    diff4Title: "In 24 h startklar",
    diff4Text:
      "Paket auswahlen, Namen ubermitteln, fertig. Zertifikate versandfähig in 24 bis 48 Stunden.",

    pricingTag: "Pakete",
    pricingTitle: "Einfach. Transparent. Sofort.",
    pricingSubtitle:
      "Einmalzahlung. Keine Laufzeit. Keine versteckten Kosten.",
    pkgKlein: "Klein",
    pkgKleinDesc: "Ideal fur kleine Teams",
    pkgMedium: "Medium",
    pkgMediumDesc: "Beliebt bei Agenturen",
    pkgGross: "Gros",
    pkgGrossDesc: "Fur Sommerfeste & Events",
    pkgTrees: "Baume",
    pkgCta: "Jetzt bestellen",
    pkgPopular: "Am beliebtesten",
    pkgTax: "Inkl. Rechnung · steuerlich absetzbar",
    pkgCustomNote:
      "Grossere Mengen und monatliche Abonnements ab 49 EUR/Monat auf Anfrage.",
    pkgCustomCta: "Angebot anfordern",

    speciesTag: "Baumarten nach Zone",
    speciesTitle: "Heimische Arten. Echter Boden.",
    speciesMountainLabel: "Bergzone (Montagna)",
    speciesValleyLabel: "Talzone (Valle)",
    speciesMountain: ["Kaffee", "Kiefer", "Zypresse"],
    speciesValley: ["Avocado", "Mango", "Maracuja", "Limette", "Jocote", "Banane", "Papaya"],
    speciesNote:
      "Alle Arten sind heimisch in Zacapa und werden von lokalen Familien gepflanzt und gepflegt.",

    howTag: "So funktioniert's",
    howTitle: "In 4 Schritten zum perfekten Firmengeschenk",
    how1Title: "Paket auswahlen und bezahlen",
    how1Text:
      "Wahlen Sie die passende Grose. Zahlung per Stripe, Rechnung sofort verfugbar.",
    how2Title: "Mitarbeiternamen ubermitteln",
    how2Text: "Per CSV-Upload oder einzeln im Formular. Dauert 2 Minuten.",
    how3Title: "Wir pflanzen die Baume",
    how3Text:
      "Lokale Familien in Zacapa pflanzen Ihre Baume. Jeder Baum wird GPS-getrackt.",
    how4Title: "Zertifikate erhalten",
    how4Text:
      "Innerhalb von 48 Stunden erhalten Sie personalisierte digitale Zertifikate fur jeden Mitarbeiter.",

    proofTag: "Vertrauen",
    proofTitle: "Unternehmen, die bereits schenken",
    proofQuote:
      "Ein Geschenk, das bei unseren Mitarbeitern wirklich angekommen ist. Einfacher Prozess, schone Zertifikate.",
    proofCompany: "Leyton Deutschland",
    proofStat1Label: "Baume gepflanzt",
    proofStat2Label: "Familien unterstutzt",
    proofStat3Label: "Schule finanziert",

    founderTag: "Unsere Wurzeln",
    founderTitle: "Warum ich das mache.",
    founderText:
      "Ich bin deutsch-guatemaltekisch und lebe in Dusseldorf. In Zacapa habe ich gesehen, wie Aufforstung Arbeitspla tze schafft und Familien eine Perspektive gibt. Mit quetz.org verbinde ich deutsche Unternehmen direkt mit diesen Familien.",
    founderName: "Daniel, Grunder von quetz.org",

    formTag: "Angebot anfordern",
    formTitle: "Lassen Sie uns gemeinsam etwas pflanzen.",
    formSub:
      "Teilen Sie uns kurz mit, was Sie suchen. Wir melden uns innerhalb von 24 Stunden mit einem individuellen Angebot.",
    formCompany: "Firmenname",
    formEmail: "E-Mail-Adresse",
    formEmployees: "Mitarbeiterzahl",
    formMessage: "Nachricht (optional)",
    formMessagePlaceholder:
      "Fur wie viele Personen suchen Sie ein Geschenk? Gibt es einen besonderen Anlass?",
    formConsent:
      "Ich habe die Datenschutzerklarung gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu.",
    formConsentLink: "Datenschutzerklarung",
    formCta: "Anfrage senden",
    formSuccess:
      "Vielen Dank! Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
    formError:
      "Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an hola@quetz.org.",
    formRequired: "Bitte fullen Sie alle Pflichtfelder aus.",
    formConsentRequired: "Bitte stimmen Sie der Datenschutzerklarung zu.",

    faqTag: "Haufige Fragen",
    faq1Q: "Ist das wirklich steuerlich absetzbar?",
    faq1A: "Ja. Als Sachbezug konnen Firmengeschenke bis 60 Euro pro Mitarbeiter steuer- und sozialversicherungsfrei gewahrt werden (Paragraph 8 Abs. 2 Satz 11 EStG). Sie erhalten eine ordentliche Rechnung fur Ihre Buchhaltung.",
    faq2Q: "Wie schnell erhalten meine Mitarbeiter die Zertifikate?",
    faq2A: "Innerhalb von 48 Stunden nach Ubermittlung der Namen. Bei Eilbestellungen auch schneller.",
    faq3Q: "Konnen wir das Zertifikat mit unserem Firmenlogo personalisieren?",
    faq3A: "Ja, ab dem Medium-Paket (25 Baume) konnen Sie Ihr Logo und eine personliche Nachricht auf dem Zertifikat platzieren.",
    faq4Q: "Was passiert, wenn ein Baum nicht uberlebt?",
    faq4A: "Wir garantieren eine Uberlebensrate von uber 85 %. Sollte ein Baum eingehen, pflanzen wir kostenlos einen neuen.",
    faq5Q: "Wo genau werden die Baume gepflanzt?",
    faq5A: "In Zacapa, Guatemala. Jeder Baum hat GPS-Koordinaten, die Sie auf Ihrem Zertifikat und in unserem Dashboard einsehen konnen.",

    ctaTitle: "Ein Geschenk, das in funf Jahren noch wachst.",
    ctaSub:
      "Jetzt Paket auswahlen und Ihrem Team etwas Bleibendes schenken.",
    ctaBtn: "Paket auswahlen",
    stickyText: "Ab 99 EUR · Steuerlich absetzbar",
    stickyCta: "Jetzt bestellen",
  },
  en: {
    navImpact: "Impact",
    navPakete: "Packages",
    navAblauf: "How it works",
    navKontakt: "Contact",
    navCta: "Request a quote",

    heroTag: "Corporate gift with real impact",
    heroTitle: "Don't give a tree.",
    heroTitleLine2: "Give a story.",
    heroSub:
      "Real trees in Zacapa, Guatemala. Each tree creates work for local families and funds a school for 120 children.",
    heroCta1: "Request a quote",
    heroCta2: "View packages",
    heroTrust1: "Tax deductible",
    heroTrust2: "Certificate in 48h",
    heroTrust3: "GDPR compliant",

    gruendungTag: "Limited offer 2026",
    gruendungTitle: "Become a founding partner.",
    gruendungSub:
      "The first 5 companies to join receive exclusive benefits with no commitment or conditions.",
    gruendungUrgency: "5 spots remaining",
    gruendungBenefit1: "Logo on quetz.org",
    gruendungBenefit2: "LinkedIn mention",
    gruendungBenefit3: "Naming rights for school project",
    gruendungBenefit4: "Real-time dashboard",
    gruendungBenefit5: "Personalized certificates",
    gruendungBenefit6: "Photo of each tree",
    gruendungCta: "Secure your spot",
    gruendungNote: "No commitment. No subscription. A one-time decision.",

    diffTag: "Why quetz.org",
    diffTitle: "No tree like any other.",
    diff1Title: "A story with a face",
    diff1Text:
      "Every tree has a name, GPS coordinates, and a real photo. Your employees receive not just a certificate, but a story.",
    diff2Title: "30% for the school",
    diff2Text:
      "One third of every purchase flows directly into the school project in Zacapa. 120 children learn there because companies like yours chose to act.",
    diff3Title: "Photo + GPS per tree",
    diff3Text:
      "Transparency is not a marketing buzzword. Every tree is geolocated, photographed, and visible in your dashboard.",
    diff4Title: "Ready in 24h",
    diff4Text:
      "Choose a package, submit names, done. Certificates ready to send in 24 to 48 hours.",

    pricingTag: "Packages",
    pricingTitle: "Simple. Transparent. Immediate.",
    pricingSubtitle: "One-time payment. No commitment. No hidden costs.",
    pkgKlein: "Small",
    pkgKleinDesc: "Ideal for small teams",
    pkgMedium: "Medium",
    pkgMediumDesc: "Popular with agencies",
    pkgGross: "Large",
    pkgGrossDesc: "For summer parties & events",
    pkgTrees: "Trees",
    pkgCta: "Order now",
    pkgPopular: "Most popular",
    pkgTax: "Invoice included · tax deductible",
    pkgCustomNote:
      "Larger quantities and monthly subscriptions from EUR 49/month available on request.",
    pkgCustomCta: "Request a quote",

    speciesTag: "Tree species by zone",
    speciesTitle: "Native species. Real soil.",
    speciesMountainLabel: "Mountain zone",
    speciesValleyLabel: "Valley zone",
    speciesMountain: ["Coffee", "Pine", "Cypress"],
    speciesValley: ["Avocado", "Mango", "Passion fruit", "Lime", "Jocote", "Banana", "Papaya"],
    speciesNote:
      "All species are native to Zacapa and are planted and cared for by local families.",

    howTag: "How it works",
    howTitle: "The perfect corporate gift in 4 steps",
    how1Title: "Choose and pay for your package",
    how1Text:
      "Select the right size. Payment via Stripe, invoice available immediately.",
    how2Title: "Submit employee names",
    how2Text: "Via CSV upload or individually in the form. Takes 2 minutes.",
    how3Title: "We plant the trees",
    how3Text:
      "Local families in Zacapa plant your trees. Each tree is GPS-tracked.",
    how4Title: "Receive certificates",
    how4Text:
      "Within 48 hours you receive personalized digital certificates for each employee.",

    proofTag: "Trust",
    proofTitle: "Companies already gifting",
    proofQuote:
      "A gift that truly resonated with our employees. Simple process, beautiful certificates.",
    proofCompany: "Leyton Deutschland",
    proofStat1Label: "Trees planted",
    proofStat2Label: "Families supported",
    proofStat3Label: "School funded",

    founderTag: "Our Roots",
    founderTitle: "Why I do this.",
    founderText:
      "I am German-Guatemalan and live in Dusseldorf. In Zacapa I saw how reforestation creates jobs and gives families a future. With quetz.org I connect German companies directly with these families.",
    founderName: "Daniel, Founder of quetz.org",

    formTag: "Request a quote",
    formTitle: "Let's plant something together.",
    formSub:
      "Tell us briefly what you are looking for. We will get back to you within 24 hours with a tailored offer.",
    formCompany: "Company name",
    formEmail: "Email address",
    formEmployees: "Number of employees",
    formMessage: "Message (optional)",
    formMessagePlaceholder:
      "How many people are you looking to gift? Is there a special occasion?",
    formConsent:
      "I have read the Privacy Policy and consent to the processing of my data to handle my request.",
    formConsentLink: "Privacy Policy",
    formCta: "Send request",
    formSuccess:
      "Thank you! We will be in touch within 24 hours.",
    formError:
      "An error occurred while sending. Please try again or write to us at hola@quetz.org.",
    formRequired: "Please fill in all required fields.",
    formConsentRequired: "Please accept the Privacy Policy.",

    faqTag: "Frequently asked questions",
    faq1Q: "Is this really tax deductible?",
    faq1A: "Yes. Corporate gifts can be deducted as business expenses. You receive a proper invoice for your accounting.",
    faq2Q: "How quickly do my employees receive the certificates?",
    faq2A: "Within 48 hours after submitting the names. Rush orders available.",
    faq3Q: "Can we personalize the certificate with our company logo?",
    faq3A: "Yes, from the Medium package (25 trees) you can place your logo and a personal message on the certificate.",
    faq4Q: "What happens if a tree does not survive?",
    faq4A: "We guarantee a survival rate of over 85%. If a tree dies, we plant a new one free of charge.",
    faq5Q: "Where exactly are the trees planted?",
    faq5A: "In Zacapa, Guatemala. Each tree has GPS coordinates visible on your certificate and our dashboard.",

    ctaTitle: "A gift that still grows in five years.",
    ctaSub:
      "Choose your package now and give your team something lasting.",
    ctaBtn: "Choose package",
    stickyText: "From EUR 99 · Tax deductible",
    stickyCta: "Order now",
  },
  es: {
    navImpact: "Impacto",
    navPakete: "Paquetes",
    navAblauf: "Proceso",
    navKontakt: "Contacto",
    navCta: "Solicitar oferta",

    heroTag: "Regalo corporativo con impacto real",
    heroTitle: "No regale un arbol.",
    heroTitleLine2: "Regale una historia.",
    heroSub:
      "Arboles reales en Zacapa, Guatemala. Cada arbol crea empleo para familias locales y financia una escuela para 120 ninos.",
    heroCta1: "Solicitar oferta",
    heroCta2: "Ver paquetes",
    heroTrust1: "Deducible de impuestos",
    heroTrust2: "Certificado en 48h",
    heroTrust3: "Conforme al RGPD",

    gruendungTag: "Oferta limitada 2026",
    gruendungTitle: "Conviertase en socio fundador.",
    gruendungSub:
      "Las primeras 5 empresas que se unan reciben ventajas exclusivas sin permanencia ni condiciones.",
    gruendungUrgency: "Quedan 5 plazas",
    gruendungBenefit1: "Logo en quetz.org",
    gruendungBenefit2: "Mencion en LinkedIn",
    gruendungBenefit3: "Nombrar el proyecto escuela",
    gruendungBenefit4: "Dashboard en tiempo real",
    gruendungBenefit5: "Certificados personalizados",
    gruendungBenefit6: "Foto de cada arbol",
    gruendungCta: "Reservar mi plaza",
    gruendungNote: "Sin permanencia. Sin suscripcion. Una decision unica.",

    diffTag: "Por que quetz.org",
    diffTitle: "Ningun arbol como otro.",
    diff1Title: "Historia con cara",
    diff1Text:
      "Cada arbol tiene nombre, coordenadas GPS y una foto real. Sus empleados reciben no solo un certificado, sino una historia.",
    diff2Title: "30 % para la escuela",
    diff2Text:
      "Un tercio de cada compra va directamente al proyecto escolar en Zacapa. 120 ninos estudian alli porque empresas como la suya decidieron actuar.",
    diff3Title: "Foto + GPS por arbol",
    diff3Text:
      "La transparencia no es un termino de marketing. Cada arbol esta geolocali zado, fotografiado y visible en su dashboard.",
    diff4Title: "Listo en 24 h",
    diff4Text:
      "Elija paquete, envie nombres, listo. Certificados listos en 24 a 48 horas.",

    pricingTag: "Paquetes",
    pricingTitle: "Simple. Transparente. Inmediato.",
    pricingSubtitle: "Pago unico. Sin permanencia. Sin costes ocultos.",
    pkgKlein: "Pequeno",
    pkgKleinDesc: "Ideal para equipos pequenos",
    pkgMedium: "Medio",
    pkgMediumDesc: "Popular entre agencias",
    pkgGross: "Grande",
    pkgGrossDesc: "Para fiestas de verano y eventos",
    pkgTrees: "Arboles",
    pkgCta: "Pedir ahora",
    pkgPopular: "Mas popular",
    pkgTax: "Factura incluida · deducible de impuestos",
    pkgCustomNote:
      "Cantidades mayores y suscripciones mensuales desde 49 EUR/mes bajo peticion.",
    pkgCustomCta: "Solicitar oferta",

    speciesTag: "Especies por zona",
    speciesTitle: "Especies nativas. Tierra real.",
    speciesMountainLabel: "Zona montana",
    speciesValleyLabel: "Zona valle",
    speciesMountain: ["Cafe", "Pino", "Cipres"],
    speciesValley: ["Aguacate", "Mango", "Maracuya", "Limon", "Jocote", "Platano", "Papaya"],
    speciesNote:
      "Todas las especies son nativas de Zacapa y son plantadas y cuidadas por familias locales.",

    howTag: "Proceso",
    howTitle: "El regalo corporativo perfecto en 4 pasos",
    how1Title: "Elegir paquete y pagar",
    how1Text:
      "Seleccione el tamano adecuado. Pago con Stripe, factura disponible al instante.",
    how2Title: "Enviar nombres de empleados",
    how2Text: "Por CSV o individualmente en el formulario. Toma 2 minutos.",
    how3Title: "Plantamos los arboles",
    how3Text:
      "Familias locales en Zacapa plantan sus arboles. Cada arbol tiene seguimiento GPS.",
    how4Title: "Recibir certificados",
    how4Text:
      "En 48 horas recibe certificados digitales personalizados para cada empleado.",

    proofTag: "Confianza",
    proofTitle: "Empresas que ya regalan",
    proofQuote:
      "Un regalo que realmente conecto con nuestros empleados. Proceso sencillo, certificados bonitos.",
    proofCompany: "Leyton Deutschland",
    proofStat1Label: "Arboles plantados",
    proofStat2Label: "Familias apoyadas",
    proofStat3Label: "Escuela financiada",

    founderTag: "Nuestras Raices",
    founderTitle: "Por que hago esto.",
    founderText:
      "Soy aleman-guatemalteco y vivo en Dusseldorf. En Zacapa vi como la reforestacion crea empleos y da perspectiva a las familias. Con quetz.org conecto empresas alemanas directamente con estas familias.",
    founderName: "Daniel, Fundador de quetz.org",

    formTag: "Solicitar oferta",
    formTitle: "Plantemos algo juntos.",
    formSub:
      "Cuentenos brevemente lo que busca. Le responderemos en 24 horas con una oferta personalizada.",
    formCompany: "Nombre de la empresa",
    formEmail: "Correo electronico",
    formEmployees: "Numero de empleados",
    formMessage: "Mensaje (opcional)",
    formMessagePlaceholder:
      "Para cuantas personas busca un regalo? Hay una ocasion especial?",
    formConsent:
      "He leido la politica de privacidad y acepto el tratamiento de mis datos para gestionar mi solicitud.",
    formConsentLink: "politica de privacidad",
    formCta: "Enviar solicitud",
    formSuccess:
      "Muchas gracias. Nos pondremos en contacto en 24 horas.",
    formError:
      "Se produjo un error al enviar. Intentelo de nuevo o escribanos a hola@quetz.org.",
    formRequired: "Por favor complete todos los campos obligatorios.",
    formConsentRequired: "Por favor acepte la politica de privacidad.",

    faqTag: "Preguntas frecuentes",
    faq1Q: "Es realmente deducible de impuestos?",
    faq1A: "Si. Los regalos corporativos son deducibles como gasto empresarial. Recibe una factura formal para su contabilidad.",
    faq2Q: "Que tan rapido reciben los certificados mis empleados?",
    faq2A: "En 48 horas tras enviar los nombres. Pedidos urgentes disponibles.",
    faq3Q: "Podemos personalizar el certificado con nuestro logo?",
    faq3A: "Si, desde el paquete Medio (25 arboles) puede incluir su logo y un mensaje personal en el certificado.",
    faq4Q: "Que pasa si un arbol no sobrevive?",
    faq4A: "Garantizamos una tasa de supervivencia superior al 85 %. Si un arbol muere, plantamos uno nuevo sin coste.",
    faq5Q: "Donde exactamente se plantan los arboles?",
    faq5A: "En Zacapa, Guatemala. Cada arbol tiene coordenadas GPS visibles en su certificado y nuestro dashboard.",

    ctaTitle: "Un regalo que sigue creciendo en cinco anos.",
    ctaSub:
      "Elija su paquete ahora y regale a su equipo algo que perdura.",
    ctaBtn: "Elegir paquete",
    stickyText: "Desde 99 EUR · Deducible de impuestos",
    stickyCta: "Pedir ahora",
  },
};

type Lang = "de" | "en" | "es";
type TxType = typeof txt.de;

/* ─── Pricing Data ─── */
const PACKAGES = [
  { id: "klein", trees: 10, price: 99, popular: false },
  { id: "medium", trees: 25, price: 229, popular: true },
  { id: "gross", trees: 50, price: 449, popular: false },
];

const STRIPE_LINKS: Record<string, string> = {
  klein: process.env.NEXT_PUBLIC_STRIPE_LINK_KLEIN || "#pakete",
  medium: process.env.NEXT_PUBLIC_STRIPE_LINK_MEDIUM || "#pakete",
  gross: process.env.NEXT_PUBLIC_STRIPE_LINK_GROSS || "#pakete",
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
      <GruendungspartnerSection tx={tx} />
      <DifferentiatorsSection tx={tx} />
      <SolutionSection tx={tx} />
      <PricingSection tx={tx} lang={lang} />
      <SpeciesSection tx={tx} />
      <HowItWorksSection tx={tx} />
      <SocialProofSection tx={tx} />
      <FounderSection tx={tx} />
      <AngebotFormSection tx={tx} />
      <FAQSection tx={tx} />
      <FinalCTASection tx={tx} />
      <StickyBar tx={tx} />
      <Footer />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════ */
function Navbar({ tx }: { tx: TxType }) {
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#081C15]/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.3)] border-b border-[#52B788]/10"
          : "bg-gradient-to-b from-black/40 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-[72px]">
        <a href="/" className="flex items-center gap-2.5 group">
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${
              scrolled ? "" : "bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5"
            }`}
          >
            <Leaf className="w-6 h-6 text-[#52B788] group-hover:scale-110 transition-transform" />
            <span className="font-[Montserrat] font-bold text-lg text-white tracking-tight">
              quetz.org
            </span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative px-3.5 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 group"
            >
              {link.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-[#52B788] rounded-full transition-all duration-200 group-hover:w-3/5" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="#kontakt" className="hidden sm:inline-flex">
            <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-sm px-6 py-2.5 rounded-full shadow-lg shadow-[#52B788]/20 hover:shadow-xl hover:shadow-[#52B788]/30 transition-all">
              {tx.navCta}
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </a>
          <button
            className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#081C15]/98 backdrop-blur-xl border-t border-[#52B788]/10 shadow-2xl">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-white/10 !my-3" />
            <a
              href="#kontakt"
              onClick={() => setMobileOpen(false)}
              className="block mt-3 text-center bg-[#52B788] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-[#52B788]/20"
            >
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
function HeroSection({ tx }: { tx: TxType }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <Image
          src={IMAGES.hero}
          alt="Regenwalddach in Zacapa, Guatemala"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081C15]/60 via-[#081C15]/40 to-[#081C15]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-[#52B788]/15 border border-[#52B788]/30 rounded-full px-4 py-1.5 mb-8">
          <Gift className="w-4 h-4 text-[#52B788]" />
          <span className="text-[#52B788] text-sm font-semibold font-[Montserrat]">
            {tx.heroTag}
          </span>
        </div>

        <h1 className="font-[Montserrat] font-black text-4xl sm:text-5xl md:text-6xl text-white leading-[1.05] mb-6">
          <span className="block">{tx.heroTitle}</span>
          <span className="block text-[#95D5B2]">{tx.heroTitleLine2}</span>
        </h1>

        <p className="text-white/75 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          {tx.heroSub}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#kontakt">
            <Button className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base sm:text-lg px-8 sm:px-10 py-4 rounded-full shadow-xl shadow-[#52B788]/25 hover:shadow-2xl hover:shadow-[#52B788]/30 hover:scale-105 transition-all duration-300">
              {tx.heroCta1}
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <a href="#pakete">
            <Button
              variant="outline"
              className="border-white/30 text-white bg-white/5 hover:bg-white/15 font-[Montserrat] font-semibold text-base sm:text-lg px-8 sm:px-10 py-4 rounded-full transition-all duration-300"
            >
              {tx.heroCta2}
            </Button>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10">
          {[
            { icon: Shield, text: tx.heroTrust1 },
            { icon: Clock, text: tx.heroTrust2 },
            { icon: FileText, text: tx.heroTrust3 },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
            >
              <badge.icon className="w-4 h-4 text-[#52B788]" />
              <span className="text-white/70 text-xs sm:text-sm font-medium">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   GRUNDUNGSPARTNER 2026
   ═══════════════════════════════════════════════════════ */
function GruendungspartnerSection({ tx }: { tx: TxType }) {
  const benefits = [
    tx.gruendungBenefit1,
    tx.gruendungBenefit2,
    tx.gruendungBenefit3,
    tx.gruendungBenefit4,
    tx.gruendungBenefit5,
    tx.gruendungBenefit6,
  ];

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#1B4332] to-[#0D2818] overflow-hidden">
      {/* Urgency badge */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10">
        <div className="bg-[#E9C46A] text-[#081C15] font-[Montserrat] font-bold text-xs sm:text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          {tx.gruendungUrgency}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
              {tx.gruendungTag}
            </p>
            <h2 className="font-[Montserrat] font-black text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-6">
              {tx.gruendungTitle}
            </h2>
            <p className="text-[#B7E4C7]/80 text-lg leading-relaxed mb-8">
              {tx.gruendungSub}
            </p>
            <div className="flex flex-col gap-3">
              <a href="#kontakt">
                <Button className="bg-[#E9C46A] hover:bg-[#F4A261] text-[#081C15] font-[Montserrat] font-bold text-base px-8 py-3.5 rounded-full shadow-lg hover:scale-105 transition-all duration-300">
                  {tx.gruendungCta}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <p className="text-white/40 text-sm">{tx.gruendungNote}</p>
            </div>
          </div>

          <div className="bg-[#081C15]/60 border border-[#52B788]/20 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-[#E9C46A] fill-[#E9C46A]" />
              <span className="font-[Montserrat] font-bold text-white text-lg">
                Exklusiv fur Grundungspartner
              </span>
            </div>
            <ul className="space-y-3">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#52B788]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#52B788]" />
                  </span>
                  <span className="text-white/80 text-sm font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-[#52B788]/15">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`h-3 flex-1 rounded-full ${
                      n <= 3 ? "bg-[#E9C46A]" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-white/40 text-xs mt-2">3 von 5 Platzen vergeben</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   4 DIFFERENTIATORS
   ═══════════════════════════════════════════════════════ */
function DifferentiatorsSection({ tx }: { tx: TxType }) {
  const items = [
    {
      icon: Heart,
      title: tx.diff1Title,
      text: tx.diff1Text,
      color: "#E9C46A",
    },
    {
      icon: Users,
      title: tx.diff2Title,
      text: tx.diff2Text,
      color: "#52B788",
    },
    {
      icon: MapPin,
      title: tx.diff3Title,
      text: tx.diff3Text,
      color: "#52B788",
    },
    {
      icon: Clock,
      title: tx.diff4Title,
      text: tx.diff4Text,
      color: "#95D5B2",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-[#0D2818]" id="impact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
            {tx.diffTag}
          </p>
          <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white">
            {tx.diffTitle}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-[#1B4332]/40 border border-[#52B788]/10 hover:border-[#52B788]/30 hover:bg-[#1B4332]/60 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <h3 className="font-[Montserrat] font-bold text-lg text-white mb-3">
                {item.title}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SOLUTION (Zacapa workers + impact)
   ═══════════════════════════════════════════════════════ */
function SolutionSection({ tx }: { tx: TxType }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={IMAGES.workers}
            alt="Aufforstung in Zacapa Guatemala"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#081C15]/90 via-[#081C15]/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <h2 className="font-[Montserrat] font-black text-3xl md:text-5xl text-white leading-tight mb-6">
              Echte Familien.{" "}
              <span className="text-[#95D5B2]">Echter Impact.</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              In Zacapa pflanzen und pflegen Familien die Baume, die Ihre Mitarbeiter symbolisch adoptieren. Jeder Kauf schafft Arbeit, schutzt den Boden und finanziert die lokale Schule.
            </p>
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src={IMAGES.children}
                alt="Schulkinder in Zacapa Guatemala"
                width={560}
                height={280}
                className="w-full h-56 object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, 560px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#081C15]/80 to-transparent p-4">
                <p className="text-white text-sm font-medium">
                  120 Kinder besuchen die Schule in Zacapa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════ */
function PricingSection({ tx, lang }: { tx: TxType; lang: Lang }) {
  const pkgNames: Record<string, string> = {
    klein: tx.pkgKlein,
    medium: tx.pkgMedium,
    gross: tx.pkgGross,
  };
  const pkgDescs: Record<string, string> = {
    klein: tx.pkgKleinDesc,
    medium: tx.pkgMediumDesc,
    gross: tx.pkgGrossDesc,
  };

  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]" id="pakete">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
            {tx.pricingTag}
          </p>
          <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white mb-4">
            {tx.pricingTitle}
          </h2>
          <p className="text-[#B7E4C7]/60 max-w-xl mx-auto">{tx.pricingSubtitle}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative p-8 rounded-2xl flex flex-col ${
                pkg.popular
                  ? "bg-[#52B788]/15 border-2 border-[#52B788]/40 scale-[1.03]"
                  : "bg-[#1B4332]/60 border border-[#52B788]/10"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#52B788] text-[#081C15] font-[Montserrat] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                  {tx.pkgPopular}
                </div>
              )}
              <h3 className="font-[Montserrat] font-bold text-xl text-white mb-1">
                {pkgNames[pkg.id]}
              </h3>
              <p className="text-[#52B788] text-sm font-medium mb-1">
                {pkg.trees} {tx.pkgTrees}
              </p>
              <p className="text-white/50 text-xs mb-4">{pkgDescs[pkg.id]}</p>
              <div className="mb-4">
                <span className="font-[Montserrat] font-black text-4xl text-white">
                  {lang === "en" ? `€${pkg.price}` : `${pkg.price} €`}
                </span>
              </div>
              <p className="text-[#52B788]/70 text-xs mb-6 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                {tx.pkgTax}
              </p>
              <div className="mt-auto">
                <a href={STRIPE_LINKS[pkg.id]} target="_blank" rel="noopener noreferrer">
                  <Button
                    className={`w-full font-[Montserrat] font-bold rounded-full py-3 transition-all ${
                      pkg.popular
                        ? "bg-[#52B788] hover:bg-[#40916C] text-white shadow-lg shadow-[#52B788]/20"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {tx.pkgCta}
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Anfrage note */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="bg-[#1B4332]/40 border border-[#52B788]/15 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm text-center sm:text-left">
              {tx.pkgCustomNote}
            </p>
            <a href="#kontakt" className="shrink-0">
              <Button
                variant="outline"
                className="border-[#52B788]/40 text-[#52B788] hover:bg-[#52B788]/10 font-[Montserrat] font-semibold text-sm px-6 py-2.5 rounded-full"
              >
                {tx.pkgCustomCta}
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SPECIES BY ZONE
   ═══════════════════════════════════════════════════════ */
const MOUNTAIN_SPECIES = [
  { key: "cafe", image: TREE_IMAGES.cafe, labelDe: "Kaffee", labelEn: "Coffee", labelEs: "Cafe" },
  { key: "pino", image: TREE_IMAGES.pino, labelDe: "Kiefer", labelEn: "Pine", labelEs: "Pino" },
  { key: "cipres", image: TREE_IMAGES.cipres, labelDe: "Zypresse", labelEn: "Cypress", labelEs: "Cipres" },
];

const VALLEY_SPECIES = [
  { key: "aguacate", image: TREE_IMAGES.aguacate, labelDe: "Avocado", labelEn: "Avocado", labelEs: "Aguacate" },
  { key: "mango", image: TREE_IMAGES.mango, labelDe: "Mango", labelEn: "Mango", labelEs: "Mango" },
  { key: "limon", image: TREE_IMAGES.limon, labelDe: "Limette", labelEn: "Lime", labelEs: "Limon" },
  { key: "maracuja", image: null, labelDe: "Maracuja", labelEn: "Passion fruit", labelEs: "Maracuya" },
  { key: "jocote", image: null, labelDe: "Jocote", labelEn: "Jocote", labelEs: "Jocote" },
  { key: "banane", image: null, labelDe: "Banane", labelEn: "Banana", labelEs: "Platano" },
  { key: "papaya", image: null, labelDe: "Papaya", labelEn: "Papaya", labelEs: "Papaya" },
];

type SpeciesItem = {
  key: string;
  image: string | null;
  labelDe: string;
  labelEn: string;
  labelEs: string;
};

function SpeciesCard({ species, lang }: { species: SpeciesItem; lang: Lang }) {
  const label =
    lang === "en" ? species.labelEn : lang === "es" ? species.labelEs : species.labelDe;

  return (
    <div className="group relative rounded-xl overflow-hidden bg-[#1B4332]/50 border border-[#52B788]/10 hover:border-[#52B788]/30 transition-all duration-300">
      <div className="relative h-32 w-full bg-[#0D2818]">
        {species.image ? (
          <Image
            src={species.image}
            alt={label}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 160px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <TreePine className="w-8 h-8 text-[#52B788]/30" />
            <span className="text-[#52B788]/30 text-xs text-center px-2">
              FOTO REAL PENDIENTE
            </span>
          </div>
        )}
      </div>
      <div className="p-3 text-center">
        <p className="font-[Montserrat] font-semibold text-white text-sm">{label}</p>
      </div>
    </div>
  );
}

function SpeciesSection({ tx }: { tx: TxType }) {
  const { language } = useLanguage();
  const lang = (["de", "en", "es"].includes(language) ? language : "de") as Lang;

  return (
    <section className="relative py-20 md:py-28 bg-[#1B4332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#95D5B2] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
            {tx.speciesTag}
          </p>
          <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white mb-4">
            {tx.speciesTitle}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Mountain zone */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#52B788]/20 flex items-center justify-center">
                <TreePine className="w-4 h-4 text-[#52B788]" />
              </div>
              <h3 className="font-[Montserrat] font-bold text-white text-lg">
                {tx.speciesMountainLabel}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MOUNTAIN_SPECIES.map((s) => (
                <SpeciesCard key={s.key} species={s} lang={lang} />
              ))}
            </div>
          </div>

          {/* Valley zone */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#95D5B2]/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-[#95D5B2]" />
              </div>
              <h3 className="font-[Montserrat] font-bold text-white text-lg">
                {tx.speciesValleyLabel}
              </h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {VALLEY_SPECIES.map((s) => (
                <SpeciesCard key={s.key} species={s} lang={lang} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-white/40 text-sm mt-8 max-w-xl mx-auto">
          {tx.speciesNote}
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════ */
function HowItWorksSection({ tx }: { tx: TxType }) {
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
          <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
            {tx.howTag}
          </p>
          <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white">
            {tx.howTitle}
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <span className="font-[Montserrat] font-black text-6xl text-[#52B788]/20">
                {step.num}
              </span>
              <h3 className="font-[Montserrat] font-bold text-lg text-white mt-2 mb-2">
                {step.title}
              </h3>
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
function SocialProofSection({ tx }: { tx: TxType }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
            {tx.proofTag}
          </p>
          <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white">
            {tx.proofTitle}
          </h2>
        </div>

        <div className="bg-[#0D2818]/60 border border-[#52B788]/10 rounded-2xl p-8 md:p-12 mb-12">
          <blockquote className="text-white/80 text-lg md:text-xl leading-relaxed italic mb-6">
            &ldquo;{tx.proofQuote}&rdquo;
          </blockquote>
          <p className="text-[#52B788] font-[Montserrat] font-semibold">{tx.proofCompany}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { value: "500+", label: tx.proofStat1Label },
            { value: "12", label: tx.proofStat2Label },
            { value: "30%", label: tx.proofStat3Label },
          ].map((stat, i) => (
            <div key={i}>
              <p className="font-[Montserrat] font-black text-3xl md:text-4xl text-[#52B788]">
                {stat.value}
              </p>
              <p className="text-white/50 text-sm mt-1">{stat.label}</p>
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
function FounderSection({ tx }: { tx: TxType }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={IMAGES.roots}
            alt="Waldwurzeln in Guatemala"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#081C15]/90 via-[#081C15]/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="ml-auto max-w-xl">
            <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
              {tx.founderTag}
            </p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white leading-tight mb-6">
              {tx.founderTitle}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-6">{tx.founderText}</p>
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
   ANGEBOT FORM
   ═══════════════════════════════════════════════════════ */
function AngebotFormSection({ tx }: { tx: TxType }) {
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    employees: "",
    message: "",
    consent: false,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [validationError, setValidationError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === "checkbox"
      ? target.checked
      : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
    setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName || !form.email || !form.employees) {
      setValidationError(tx.formRequired);
      return;
    }
    if (!form.consent) {
      setValidationError(tx.formConsentRequired);
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          email: form.email,
          employees: form.employees,
          message: form.message,
          contactName: form.companyName,
          country: "DE",
        }),
      });

      if (!res.ok) throw new Error("API error");
      setStatus("success");
      setForm({ companyName: "", email: "", employees: "", message: "", consent: false });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]" id="kontakt">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Copy */}
          <div className="md:pt-4">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
              {tx.formTag}
            </p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white leading-tight mb-6">
              {tx.formTitle}
            </h2>
            <p className="text-[#B7E4C7]/70 text-lg leading-relaxed mb-8">{tx.formSub}</p>

            {/* Trust signals */}
            <div className="space-y-3">
              {[
                { icon: Clock, text: "Antwort innerhalb von 24 Stunden" },
                { icon: Shield, text: "DSGVO-konform. Keine Weitergabe an Dritte." },
                { icon: TreePine, text: "Individuelles Angebot fur Ihre Teamgrosse" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-[#52B788] shrink-0" />
                  <span className="text-white/60 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-[#1B4332]/50 border border-[#52B788]/15 rounded-2xl p-8">
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#52B788]/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#52B788]" />
                </div>
                <p className="text-white font-[Montserrat] font-bold text-lg mb-2">
                  {tx.formSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {tx.formCompany} <span className="text-[#52B788]">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#081C15]/60 border border-[#52B788]/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#52B788]/50 focus:ring-1 focus:ring-[#52B788]/30 transition-all"
                    placeholder="Muster GmbH"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {tx.formEmail} <span className="text-[#52B788]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#081C15]/60 border border-[#52B788]/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#52B788]/50 focus:ring-1 focus:ring-[#52B788]/30 transition-all"
                    placeholder="kontakt@muster.de"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {tx.formEmployees} <span className="text-[#52B788]">*</span>
                  </label>
                  <select
                    name="employees"
                    value={form.employees}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#081C15]/60 border border-[#52B788]/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#52B788]/50 focus:ring-1 focus:ring-[#52B788]/30 transition-all appearance-none"
                  >
                    <option value="" className="bg-[#0D2818]">
                      Bitte wahlen...
                    </option>
                    <option value="1-10" className="bg-[#0D2818]">1-10</option>
                    <option value="11-25" className="bg-[#0D2818]">11-25</option>
                    <option value="26-50" className="bg-[#0D2818]">26-50</option>
                    <option value="51-200" className="bg-[#0D2818]">51-200</option>
                    <option value="201+" className="bg-[#0D2818]">201+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {tx.formMessage}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-[#081C15]/60 border border-[#52B788]/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#52B788]/50 focus:ring-1 focus:ring-[#52B788]/30 transition-all resize-none"
                    placeholder={tx.formMessagePlaceholder}
                  />
                </div>

                {/* DSGVO Consent */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent"
                    id="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-[#52B788] shrink-0 cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-white/55 text-xs leading-relaxed cursor-pointer">
                    {tx.formConsent.replace(tx.formConsentLink, "")}{" "}
                    <a
                      href="/datenschutz"
                      className="text-[#52B788] hover:text-[#95D5B2] underline underline-offset-2 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tx.formConsentLink}
                    </a>
                    .
                  </label>
                </div>

                {validationError && (
                  <p className="text-red-400 text-xs">{validationError}</p>
                )}

                {status === "error" && (
                  <p className="text-red-400 text-xs">{tx.formError}</p>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold py-3.5 rounded-full shadow-lg shadow-[#52B788]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      ...
                    </span>
                  ) : (
                    <>
                      {tx.formCta}
                      <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════ */
function FAQSection({ tx }: { tx: TxType }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: tx.faq1Q, a: tx.faq1A },
    { q: tx.faq2Q, a: tx.faq2A },
    { q: tx.faq3Q, a: tx.faq3A },
    { q: tx.faq4Q, a: tx.faq4A },
    { q: tx.faq5Q, a: tx.faq5A },
  ];

  return (
    <section className="relative py-20 md:py-24 bg-[#081C15]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">
            {tx.faqTag}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-[#1B4332]/60 border border-[#52B788]/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-[Montserrat] font-semibold text-white text-sm sm:text-base pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#52B788] shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
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
function FinalCTASection({ tx }: { tx: TxType }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-[Montserrat] font-black text-3xl md:text-5xl text-white leading-tight mb-6">
          {tx.ctaTitle}
        </h2>
        <p className="text-[#B7E4C7]/70 text-lg mb-10">{tx.ctaSub}</p>
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
function StickyBar({ tx }: { tx: TxType }) {
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
