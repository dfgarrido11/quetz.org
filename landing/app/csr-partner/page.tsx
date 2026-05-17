'use client';

/*
 * DESIGN: "Rainforest Canopy" — same visual system as /firmengeschenk
 * - Rainforest Canopy color tokens: #081C15, #1B4332, #0D2818, #2D6A4F
 * - Emerald accent #52B788, gold #E9C46A, Montserrat font
 * - Trilingüe: DE / EN / ES via useLanguage context
 * - Target: German CSR decision-makers (Mittelstand) + EN/ES markets
 */

import { useState, useEffect } from "react";
import {
  TreePine, Users, School, MapPin, BarChart3, Shield, ArrowDown,
  Check, ChevronRight, Leaf, Globe, Heart, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

// CDN images (shared with /firmengeschenk)
const IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/hero-canopy-KsLbgKCZWapLbdtMVAC26c.webp",
  workers: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/understory-workers-jhLXmGeuAGSeLgeTe97sXg.webp",
  children: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/school-children-FiGg2g9cBma6G5ArjEs5Gy.webp",
  roots: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/forest-floor-roots-4HVX5t3CGzqRnqYzdrThsP.webp",
  dashboard: "https://d2xsxph8kpxj0f.cloudfront.net/310419663030501357/hWt6Qa2JAiXm9muvwfCGAp/dashboard-mockup-AxefkSuahphtAKpcdH4tBU.webp",
};

/* ─── Simple helpers ─── */
function SimpleCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  return <span>{end.toLocaleString("de-DE")}{suffix}</span>;
}
function Sec({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/* ════════════════════════════════════════════════════
   TRANSLATIONS
   ════════════════════════════════════════════════════ */
const txt = {
  de: {
    navImpact: "Impact",
    navTransparenz: "Transparenz",
    navPreise: "Preise",
    navKontakt: "Kontakt",
    navCta: "Jetzt starten",
    heroTag: "Nachhaltigkeitspartner für den deutschen Mittelstand",
    heroH1: "Aufforstung, die Ihr",
    heroH1Accent: "Unternehmen verändert.",
    heroSub: "Jeder Baum schafft einen Arbeitsplatz. Jedes Abo finanziert eine Schule. 100% transparent, GPS-getrackt, CSRD-konform.",
    heroCta1: "Jetzt starten",
    heroCta2: "Impact entdecken",
    statHektar: "Hektar Waldverlust in Guatemala",
    statKinder: "Kinder erhalten eine Schule",
    statTransparenz: "Transparenz per GPS-Tracking",
    statCo2: "CO₂ pro Baum / Jahr absorbiert",
    probTag: "Das Problem",
    probH2: "Guatemala hat 17% seiner Waldfläche verloren. 47% der Kinder brechen die Schule ab.",
    probBody: "Gleichzeitig suchen deutsche Unternehmen nach glaubwürdigen CSR-Projekten für ihr CSRD-Reporting. Die meisten Anbieter liefern nur CO₂-Zertifikate — ohne echten sozialen Impact.",
    prob1Title: "Waldverlust",
    prob1Desc: "Seit 2001 hat Guatemala über 1,5 Millionen Hektar Wald verloren — eine Fläche größer als Schleswig-Holstein.",
    prob2Title: "Bildungskrise",
    prob2Desc: "47% der Kinder in ländlichen Gebieten schließen nicht einmal die Grundschule ab. Es fehlen Schulen und Lehrer.",
    prob3Title: "Greenwashing",
    prob3Desc: "80% der CO₂-Kompensationsprojekte sind nicht verifizierbar. Unternehmen riskieren Reputationsschäden.",
    solTag: "Die Lösung",
    solH2: "Ein Baum = Ein Job = Ein Schritt zur Schule.",
    sol1Title: "Aufforstung",
    sol1Desc: "Heimische Baumarten, GPS-getrackt, von lokalen Familien gepflegt.",
    sol2Title: "Arbeitsplätze",
    sol2Desc: "Jeder Baum schafft faire Arbeit für guatemaltekische Familien.",
    sol3Title: "Schulbau",
    sol3Desc: "Überschüsse finanzieren den Bau einer Schule für 120 Kinder.",
    sol4Title: "CSRD-konform",
    sol4Desc: "Alle Daten für Ihr Nachhaltigkeitsreporting auf einem Dashboard.",
    transpTag: "Radikale Transparenz",
    transpH2: "Sehen Sie genau, wo Ihr Baum wächst.",
    transpBody: "Unser digitales Dashboard zeigt Ihnen in Echtzeit: GPS-Standort jedes Baumes, CO₂-Absorption, Fortschritt des Schulbaus und die Familien, die Ihre Bäume pflegen. Keine Blackbox — sondern greifbarer Impact für Ihr Reporting.",
    transpCheck1: "GPS-Tracking jedes einzelnen Baumes",
    transpCheck2: "Echtzeit CO₂-Absorptionsdaten",
    transpCheck3: "Fortschritt des Schulbaus live verfolgen",
    transpCheck4: "Exportierbare Berichte für CSRD-Reporting",
    transpCheck5: "Personalisiertes Firmen-Dashboard",
    schoolTag: "Sozialer Impact",
    schoolH2: "120 Kinder warten auf ihre Schule.",
    schoolBody: "Mit jedem Baum-Abo finanzieren wir den Bau einer Schule in einer ländlichen Gemeinde Guatemalas. Ihre Mitarbeiter können den Fortschritt live verfolgen — ein emotionales Erlebnis, das weit über das übliche CSR-Projekt hinausgeht.",
    schoolGoal: "Ziel für den Schulbau",
    schoolKids: "Kinder erhalten Bildung",
    howTag: "So funktioniert's",
    howH2: "In 4 Schritten zum messbaren Impact",
    how1Title: "Abo wählen",
    how1Desc: "Wählen Sie ein Paket für Ihr Unternehmen — ab 5 Bäume pro Monat.",
    how2Title: "Bäume werden gepflanzt",
    how2Desc: "Lokale Familien pflanzen heimische Arten. Jeder Baum wird GPS-getrackt.",
    how3Title: "Impact verfolgen",
    how3Desc: "Verfolgen Sie Wachstum, CO₂-Daten und Schulbau-Fortschritt live.",
    how4Title: "CSRD-Report erhalten",
    how4Desc: "Exportieren Sie alle Daten direkt für Ihren Nachhaltigkeitsbericht.",
    calcTag: "Impact-Rechner",
    calcH2: "Wie viele Bäume braucht Ihr Unternehmen?",
    calcBody: "Berechnen Sie Ihre CO₂-Kompensation in Sekunden. Wählen Sie den Modus, der am besten zu Ihrem Unternehmen passt.",
    calcModeEmp: "Nach Angestellten",
    calcModeTrees: "Nach Bäumen",
    calcLabelEmp: "Anzahl Mitarbeiter:",
    calcLabelTrees: "Bäume pro Monat:",
    calcNote: "€25/Mitarbeiter/Monat — Flexibles Nachhaltigkeits-Abo für KMU",
    calcCo2: "CO₂ kompensiert/Jahr",
    calcTrees: "Bäume/Jahr zugeteilt",
    calcCost: "Monatlicher Beitrag",
    calcJobs: "Geschaffene Arbeitsplätze",
    calcCoverage: "CO₂-Fußabdruck Abdeckung",
    calcSchool: (amount: string) => `Ihr Abo trägt ${amount}/Jahr zum Bau der Schule in Zacapa bei`,
    calcCta1: (amount: string) => `Nachhaltigkeits-Abo für ${amount}/Monat starten`,
    calcCta2: (trees: number) => `Angebot anfordern für ${trees} Bäume`,
    priceTag: "Preise",
    priceH2: "Investieren Sie in echten Impact",
    priceSub: "Jeder Baum kostet €25. Davon fließen 30% direkt in den Schulbau.",
    priceMonthly: "Monatlich",
    priceYearly: "Jährlich",
    priceSave: "Sie sparen 15%",
    priceMost: "Am beliebtesten",
    priceBook: "Jetzt buchen",
    priceContact: "Kontaktieren",
    priceLoading: "Weiterleitung...",
    priceYearlySave: "Sie sparen 15%",
    priceBreakTitle: "Wohin fließt jeder Euro?",
    priceNote1: "Basierend auf €25 pro Baum – 100% transparent, 0% Greenwashing",
    priceNote2: "Wir pflanzen Kiefer und Zypresse — heimische Arten aus Zacapas Hochebenen, die schnell wachsen und erodierte Hänge stabilisieren.",
    priceTaxNote: "",
    empTag: "Employer Branding",
    empH2: "Jeder Mitarbeiter bekommt seinen eigenen Baum.",
    empBody: "Stellen Sie sich vor: Jeder Mitarbeiter von Ihrem Unternehmen erhält ein eigenes, GPS-getracktes Bäumchen. Sie können online zusehen, wie es wächst, und wissen gleichzeitig, dass ihr Baum einen lokalen Arbeitsplatz schafft.",
    empStat1: "höhere Mitarbeiterbindung",
    empStat2: "mehr Social-Media-Reichweite",
    empStat3: "CSRD-konforme Daten",
    founderTag: "Unsere Wurzeln",
    founderH2: "Warum ich das mache.",
    founderBody: "Ich bin deutsch-guatemaltekisch und lebe in Düsseldorf. In Zacapa habe ich gesehen, wie Aufforstung Arbeitsplätze schafft und Familien eine Perspektive gibt. Mit quetz.org verbinde ich deutsche Unternehmen direkt mit diesen Familien.",
    founderName: "Daniel, Gründer von quetz.org",
    contactTag: "Kontakt",
    contactH2: "Bereit, echten Impact zu schaffen?",
    contactBody: "Vereinbaren Sie ein kostenloses 15-minütiges Kennenlerngespräch. Wir zeigen Ihnen, wie quetz.org perfekt in Ihre CSR-Strategie passt.",
    formName: "Ihr Name *",
    formEmail: "E-Mail *",
    formCompany: "Unternehmen *",
    formEmployees: "Mitarbeiteranzahl",
    formSelectDefault: "Bitte wählen",
    formMessage: "Nachricht",
    formMessagePlaceholder: "Erzählen Sie uns von Ihren CSR-Zielen...",
    formCta: "Jetzt starten",
    formNote: "Wir antworten innerhalb von 24 Stunden. Keine Spam-Mails, versprochen.",
    formThanks: "Vielen Dank!",
    formThanksNote: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
    footerImprint: "Impressum",
    footerPrivacy: "Datenschutz",
    footerTerms: "AGB",
  },
  en: {
    navImpact: "Impact",
    navTransparenz: "Transparency",
    navPreise: "Pricing",
    navKontakt: "Contact",
    navCta: "Get Started",
    heroTag: "Sustainability partner for the German Mittelstand",
    heroH1: "Reforestation that changes your",
    heroH1Accent: "company. For real.",
    heroSub: "Every tree creates a job. Every subscription funds a school. 100% transparent, GPS-tracked, CSRD-compliant.",
    heroCta1: "Get Started",
    heroCta2: "Discover Impact",
    statHektar: "Hectares of forest lost in Guatemala",
    statKinder: "Children getting a school",
    statTransparenz: "Transparency via GPS tracking",
    statCo2: "CO₂ absorbed per tree / year",
    probTag: "The Problem",
    probH2: "Guatemala has lost 17% of its forest cover. 47% of children drop out of school.",
    probBody: "German companies need credible CSR projects for CSRD reporting. Most providers deliver only CO₂ certificates — without real social impact.",
    prob1Title: "Forest Loss",
    prob1Desc: "Since 2001, Guatemala has lost over 1.5 million hectares of forest — an area larger than Schleswig-Holstein.",
    prob2Title: "Education Crisis",
    prob2Desc: "47% of children in rural areas don't finish primary school. Schools and teachers are lacking.",
    prob3Title: "Greenwashing",
    prob3Desc: "80% of CO₂ offset projects are unverifiable. Companies risk serious reputational damage.",
    solTag: "The Solution",
    solH2: "One tree = One job = One step toward school.",
    sol1Title: "Reforestation",
    sol1Desc: "Native species, GPS-tracked, cared for by local families.",
    sol2Title: "Jobs",
    sol2Desc: "Every tree creates fair work for Guatemalan families.",
    sol3Title: "School",
    sol3Desc: "Surplus funds the construction of a school for 120 children.",
    sol4Title: "CSRD-compliant",
    sol4Desc: "All data for your sustainability reporting in one dashboard.",
    transpTag: "Radical Transparency",
    transpH2: "See exactly where your tree grows.",
    transpBody: "Our digital dashboard shows you in real time: GPS location of every tree, CO₂ absorption, school construction progress, and the families caring for your trees. No black box — tangible impact for your reporting.",
    transpCheck1: "GPS tracking of every individual tree",
    transpCheck2: "Real-time CO₂ absorption data",
    transpCheck3: "Follow school construction progress live",
    transpCheck4: "Exportable reports for CSRD reporting",
    transpCheck5: "Personalized company dashboard",
    schoolTag: "Social Impact",
    schoolH2: "120 children are waiting for their school.",
    schoolBody: "Every tree subscription funds the construction of a school in a rural Guatemalan community. Your employees can follow progress live — an emotional experience far beyond the typical CSR project.",
    schoolGoal: "Goal for school construction",
    schoolKids: "Children receive education",
    howTag: "How it works",
    howH2: "4 steps to measurable impact",
    how1Title: "Choose your plan",
    how1Desc: "Choose a package for your company — from 5 trees per month.",
    how2Title: "Trees get planted",
    how2Desc: "Local families plant native species. Every tree is GPS-tracked.",
    how3Title: "Track your impact",
    how3Desc: "Follow growth, CO₂ data, and school construction progress live.",
    how4Title: "Get your CSRD report",
    how4Desc: "Export all data directly for your sustainability report.",
    calcTag: "Impact Calculator",
    calcH2: "How many trees does your company need?",
    calcBody: "Calculate your CO₂ offset in seconds. Choose the mode that fits your company best.",
    calcModeEmp: "By Employees",
    calcModeTrees: "By Trees",
    calcLabelEmp: "Number of employees:",
    calcLabelTrees: "Trees per month:",
    calcNote: "€25/employee/month — Flexible sustainability subscription for SMEs",
    calcCo2: "CO₂ offset / year",
    calcTrees: "Trees allocated / year",
    calcCost: "Monthly cost",
    calcJobs: "Jobs created",
    calcCoverage: "CO₂ footprint coverage",
    calcSchool: (amount: string) => `Your subscription contributes ${amount}/year to building the school in Zacapa`,
    calcCta1: (amount: string) => `Start sustainability plan for ${amount}/month`,
    calcCta2: (trees: number) => `Request quote for ${trees} trees`,
    priceTag: "Pricing",
    priceH2: "Invest in real impact",
    priceSub: "Every tree costs €25. 30% flows directly into school construction.",
    priceMonthly: "Monthly",
    priceYearly: "Yearly",
    priceSave: "You save 15%",
    priceMost: "Most popular",
    priceBook: "Book now",
    priceContact: "Contact us",
    priceLoading: "Redirecting...",
    priceYearlySave: "You save 15%",
    priceBreakTitle: "Where does every euro go?",
    priceNote1: "Based on €25 per tree — 100% transparent, 0% greenwashing",
    priceNote2: "We plant Kiefer and Zypresse — native species from Zacapa's highlands, fast-growing and effective at stabilizing eroded slopes.",
    priceTaxNote: "Tax benefits under German law (§8 EStG) apply to companies with fiscal domicile in Germany. Consult your tax advisor.",
    empTag: "Employer Branding",
    empH2: "Every employee gets their own tree.",
    empBody: "Imagine: every employee at your company gets their own GPS-tracked sapling. They can watch it grow online, knowing their tree is creating a local job.",
    empStat1: "higher employee retention",
    empStat2: "more social media reach",
    empStat3: "CSRD-compliant data",
    founderTag: "Our Roots",
    founderH2: "Why I do this.",
    founderBody: "I'm German-Guatemalan and live in Düsseldorf. In Zacapa I saw how reforestation creates jobs and gives families a future. With quetz.org I connect German companies directly with these families.",
    founderName: "Daniel, Founder of quetz.org",
    contactTag: "Contact",
    contactH2: "Ready to create real impact?",
    contactBody: "Schedule a free 15-minute intro call. We'll show you how quetz.org fits perfectly into your CSR strategy.",
    formName: "Your Name *",
    formEmail: "Email *",
    formCompany: "Company *",
    formEmployees: "Number of employees",
    formSelectDefault: "Please select",
    formMessage: "Message",
    formMessagePlaceholder: "Tell us about your CSR goals...",
    formCta: "Get Started",
    formNote: "We reply within 24 hours. No spam, we promise.",
    formThanks: "Thank you!",
    formThanksNote: "We'll get back to you within 24 hours.",
    footerImprint: "Legal Notice",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
  },
  es: {
    navImpact: "Impacto",
    navTransparenz: "Transparencia",
    navPreise: "Precios",
    navKontakt: "Contacto",
    navCta: "Comenzar",
    heroTag: "Socio de sostenibilidad para el Mittelstand alemán",
    heroH1: "Reforestación que transforma su",
    heroH1Accent: "empresa. De verdad.",
    heroSub: "Cada árbol crea un empleo. Cada suscripción financia una escuela. 100% transparente, rastreado por GPS, conforme a CSRD.",
    heroCta1: "Comenzar",
    heroCta2: "Descubrir el impacto",
    statHektar: "Hectáreas de bosque perdido en Guatemala",
    statKinder: "Niños reciben una escuela",
    statTransparenz: "Transparencia vía GPS",
    statCo2: "CO₂ absorbido por árbol / año",
    probTag: "El Problema",
    probH2: "Guatemala ha perdido el 17% de su cubierta forestal. El 47% de los niños abandona la escuela.",
    probBody: "Las empresas alemanas buscan proyectos CSR creíbles para su reporte CSRD. La mayoría de proveedores solo ofrecen certificados de CO₂, sin impacto social real.",
    prob1Title: "Pérdida de bosque",
    prob1Desc: "Desde 2001, Guatemala ha perdido más de 1,5 millones de hectáreas de bosque, una superficie mayor que Schleswig-Holstein.",
    prob2Title: "Crisis educativa",
    prob2Desc: "El 47% de los niños en áreas rurales no termina la primaria. Faltan escuelas y maestros.",
    prob3Title: "Greenwashing",
    prob3Desc: "El 80% de los proyectos de compensación de CO₂ no son verificables. Las empresas arriesgan serios daños reputacionales.",
    solTag: "La Solución",
    solH2: "Un árbol = Un empleo = Un paso hacia la escuela.",
    sol1Title: "Reforestación",
    sol1Desc: "Especies nativas, rastreadas por GPS, cuidadas por familias locales.",
    sol2Title: "Empleos",
    sol2Desc: "Cada árbol genera trabajo digno para familias guatemaltecas.",
    sol3Title: "Escuela",
    sol3Desc: "Los excedentes financian la construcción de una escuela para 120 niños.",
    sol4Title: "Conforme a CSRD",
    sol4Desc: "Todos los datos para su informe de sostenibilidad en un panel.",
    transpTag: "Transparencia radical",
    transpH2: "Vea exactamente dónde crece su árbol.",
    transpBody: "Nuestro panel digital le muestra en tiempo real: la ubicación GPS de cada árbol, la absorción de CO₂, el avance de la construcción escolar y las familias que cuidan sus árboles. Sin caja negra, impacto tangible para su informe.",
    transpCheck1: "Seguimiento GPS de cada árbol individual",
    transpCheck2: "Datos de absorción de CO₂ en tiempo real",
    transpCheck3: "Progreso de construcción escolar en vivo",
    transpCheck4: "Informes exportables para reporte CSRD",
    transpCheck5: "Panel personalizado de empresa",
    schoolTag: "Impacto social",
    schoolH2: "120 niños esperan su escuela.",
    schoolBody: "Con cada suscripción de árboles financiamos la construcción de una escuela en una comunidad rural guatemalteca. Sus empleados pueden seguir el avance en vivo, una experiencia que va mucho más allá del proyecto CSR típico.",
    schoolGoal: "Objetivo para el edificio escolar",
    schoolKids: "Niños reciben educación",
    howTag: "Cómo funciona",
    howH2: "4 pasos para un impacto medible",
    how1Title: "Elegir el plan",
    how1Desc: "Elija el paquete para su empresa, desde 5 árboles al mes.",
    how2Title: "Se plantan los árboles",
    how2Desc: "Familias locales plantan especies nativas. Cada árbol queda rastreado por GPS.",
    how3Title: "Seguir el impacto",
    how3Desc: "Siga el crecimiento, los datos de CO₂ y el avance escolar en vivo.",
    how4Title: "Recibir el informe CSRD",
    how4Desc: "Exporte todos los datos para su informe de sostenibilidad.",
    calcTag: "Calculadora de impacto",
    calcH2: "¿Cuántos árboles necesita su empresa?",
    calcBody: "Calcule su compensación de CO₂ en segundos. Elija el modo que mejor se adapte a su empresa.",
    calcModeEmp: "Por empleados",
    calcModeTrees: "Por árboles",
    calcLabelEmp: "Número de empleados:",
    calcLabelTrees: "Árboles al mes:",
    calcNote: "€25/empleado/mes — Suscripción de sostenibilidad flexible para pymes",
    calcCo2: "CO₂ compensado / año",
    calcTrees: "Árboles / año",
    calcCost: "Coste mensual",
    calcJobs: "Empleos creados",
    calcCoverage: "Cobertura de huella de CO₂",
    calcSchool: (amount: string) => `Su suscripción aporta ${amount}/año a la construcción de la escuela en Zacapa`,
    calcCta1: (amount: string) => `Iniciar plan de sostenibilidad por ${amount}/mes`,
    calcCta2: (trees: number) => `Solicitar presupuesto para ${trees} árboles`,
    priceTag: "Precios",
    priceH2: "Invierta en impacto real",
    priceSub: "Cada árbol cuesta €25. El 30% va directamente al fondo escolar.",
    priceMonthly: "Mensual",
    priceYearly: "Anual",
    priceSave: "Ahorra un 15%",
    priceMost: "Más popular",
    priceBook: "Reservar ahora",
    priceContact: "Contactar",
    priceLoading: "Redirigiendo...",
    priceYearlySave: "Ahorra un 15%",
    priceBreakTitle: "¿A dónde va cada euro?",
    priceNote1: "Basado en €25 por árbol — 100% transparente, 0% greenwashing",
    priceNote2: "Plantamos Kiefer y Zypresse — especies nativas de las tierras altas de Zacapa, de rápido crecimiento y eficaces para estabilizar laderas erosionadas.",
    priceTaxNote: "Las ventajas fiscales (§8 EStG) aplican a empresas con domicilio fiscal en Alemania.",
    empTag: "Marca empleadora",
    empH2: "Cada empleado recibe su propio árbol.",
    empBody: "Imagine: cada empleado de su empresa recibe su propio arbolito rastreado por GPS. Puede ver cómo crece en línea y saber que su árbol genera un empleo local.",
    empStat1: "mayor retención de empleados",
    empStat2: "más alcance en redes sociales",
    empStat3: "datos conformes a CSRD",
    founderTag: "Nuestras Raíces",
    founderH2: "Por qué hago esto.",
    founderBody: "Soy germano-guatemalteco y vivo en Düsseldorf. En Zacapa vi cómo la reforestación crea empleos y da perspectivas a las familias. Con quetz.org conecto empresas alemanas directamente con esas familias.",
    founderName: "Daniel, fundador de quetz.org",
    contactTag: "Contacto",
    contactH2: "¿Listo para crear impacto real?",
    contactBody: "Reserve una llamada de presentación gratuita de 15 minutos. Le mostraremos cómo quetz.org encaja perfectamente en su estrategia CSR.",
    formName: "Su nombre *",
    formEmail: "Correo electrónico *",
    formCompany: "Empresa *",
    formEmployees: "Número de empleados",
    formSelectDefault: "Por favor elija",
    formMessage: "Mensaje",
    formMessagePlaceholder: "Cuéntenos sus objetivos de CSR...",
    formCta: "Comenzar",
    formNote: "Respondemos en 24 horas. Sin spam, lo prometemos.",
    formThanks: "¡Muchas gracias!",
    formThanksNote: "Nos ponemos en contacto en menos de 24 horas.",
    footerImprint: "Aviso legal",
    footerPrivacy: "Privacidad",
    footerTerms: "Condiciones",
  },
} as const;

type Lang = "de" | "en" | "es";
type Tx = typeof txt.de;

/* ════════════════════════════════════════════════════
   NAVIGATION
   ════════════════════════════════════════════════════ */
function Navbar({ tx, lang, onLang }: { tx: Tx; lang: Lang; onLang: (l: Lang) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#impact", label: tx.navImpact },
    { href: "#transparenz", label: tx.navTransparenz },
    { href: "#preise", label: tx.navPreise },
    { href: "#kontakt", label: tx.navKontakt },
  ];

  const langBase = "px-2 py-1 text-xs font-bold rounded transition-colors";
  const langActive = "bg-[#52B788]/20 text-[#52B788]";
  const langInactive = "text-white/40 hover:text-white";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#081C15]/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.3)] border-b border-[#52B788]/10" : "bg-gradient-to-b from-black/40 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-[72px]">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className={`flex items-center gap-2 transition-all duration-300 ${scrolled ? "" : "bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5"}`}>
            <Leaf className="w-6 h-6 text-[#52B788] group-hover:scale-110 transition-transform" />
            <span className="font-[Montserrat] font-bold text-lg text-white tracking-tight">quetz.org</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="relative px-3.5 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 group">
              {link.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-[#52B788] rounded-full transition-all duration-200 group-hover:w-3/5" />
            </a>
          ))}
          <div className="w-px h-5 mx-2 bg-white/20 rounded-full" />
          <a href="/firmengeschenk" className="px-3.5 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200">
            Firmengeschenk
          </a>
          <div className="w-px h-5 mx-2 bg-white/20 rounded-full" />
          <div className="flex gap-1">
            {(["de", "en", "es"] as Lang[]).map((l) => (
              <button key={l} onClick={() => onLang(l)} className={`${langBase} ${lang === l ? langActive : langInactive}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="#kontakt" className="hidden sm:inline-flex">
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

      {mobileOpen && (
        <div className="md:hidden bg-[#081C15]/98 backdrop-blur-xl border-t border-[#52B788]/10 shadow-2xl">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
                {link.label}
              </a>
            ))}
            <div className="h-px bg-white/10 !my-3" />
            <div className="flex gap-2 px-4">
              {(["de", "en", "es"] as Lang[]).map((l) => (
                <button key={l} onClick={() => { onLang(l); setMobileOpen(false); }} className={`${langBase} ${lang === l ? langActive : langInactive}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="#kontakt" onClick={() => setMobileOpen(false)} className="block mt-3 text-center bg-[#52B788] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-[#52B788]/20">
              {tx.navCta}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════ */
function HeroSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.hero} alt="Regenwald Guatemala" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081C15]/60 via-[#081C15]/40 to-[#081C15]/80" />
      </div>
      <div className="relative z-10 container text-center pt-24">
        <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.2em] uppercase mb-6">
          {tx.heroTag}
        </p>
        <h1 className="font-[Montserrat] font-black text-4xl md:text-6xl lg:text-7xl text-white leading-[1.05] max-w-5xl mx-auto mb-6">
          {tx.heroH1}
          <span className="block text-[#52B788]">{tx.heroH1Accent}</span>
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {tx.heroSub}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <a href="#preise">
            <Button size="lg" className="bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base px-8 py-6 shadow-xl shadow-[#52B788]/20">
              {tx.heroCta1}
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <a href="#impact">
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-[Montserrat] font-semibold text-base px-8 py-6 bg-transparent">
              {tx.heroCta2}
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: 1500000, suffix: "+", label: tx.statHektar },
            { value: 120, suffix: "", label: tx.statKinder },
            { value: 100, suffix: "%", label: tx.statTransparenz },
            { value: 22, suffix: " kg", label: tx.statCo2 },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-[Montserrat] font-black text-2xl md:text-3xl text-[#52B788]">
                <SimpleCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-white/60 text-xs md:text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ArrowDown className="w-6 h-6 text-white/40" />
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   PROBLEM
   ════════════════════════════════════════════════════ */
function ProblemSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]" id="impact">
      <div className="container">
        <Sec>
          <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.probTag}</p>
          <h2 className="font-[Montserrat] font-black text-3xl md:text-5xl text-white leading-tight max-w-3xl mb-8">
            {tx.probH2}
          </h2>
          <p className="text-[#B7E4C7]/80 text-lg max-w-2xl mb-16 leading-relaxed">{tx.probBody}</p>
        </Sec>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: TreePine, title: tx.prob1Title, desc: tx.prob1Desc, color: "#52B788" },
            { icon: School, title: tx.prob2Title, desc: tx.prob2Desc, color: "#E9C46A" },
            { icon: Shield, title: tx.prob3Title, desc: tx.prob3Desc, color: "#E76F51" },
          ].map((item, i) => (
            <Sec key={i}>
              <div className="group">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: `${item.color}20` }}>
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <h3 className="font-[Montserrat] font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-[#B7E4C7]/70 leading-relaxed">{item.desc}</p>
              </div>
            </Sec>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SOLUTION
   ════════════════════════════════════════════════════ */
function SolutionSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.workers} alt="Aufforstung Guatemala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#081C15]/90 via-[#081C15]/70 to-transparent" />
        </div>
        <div className="relative z-10 container py-24">
          <Sec>
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.solTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-5xl text-white leading-tight max-w-2xl mb-8">
              {tx.solH2}
            </h2>
          </Sec>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
            {[
              { icon: TreePine, title: tx.sol1Title, desc: tx.sol1Desc },
              { icon: Users, title: tx.sol2Title, desc: tx.sol2Desc },
              { icon: School, title: tx.sol3Title, desc: tx.sol3Desc },
              { icon: BarChart3, title: tx.sol4Title, desc: tx.sol4Desc },
            ].map((item, i) => (
              <Sec key={i}>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-[#52B788]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-[#52B788]" />
                  </div>
                  <div>
                    <h3 className="font-[Montserrat] font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Sec>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   TRANSPARENCY
   ════════════════════════════════════════════════════ */
function TransparencySection({ tx }: { tx: Tx }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]" id="transparenz">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Sec>
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.transpTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white leading-tight mb-6">{tx.transpH2}</h2>
            <p className="text-[#B7E4C7]/70 text-lg leading-relaxed mb-8">{tx.transpBody}</p>
            <div className="space-y-4">
              {[tx.transpCheck1, tx.transpCheck2, tx.transpCheck3, tx.transpCheck4, tx.transpCheck5].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#52B788]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#52B788]" />
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Sec>
          <Sec>
            <div className="relative">
              <div className="absolute -inset-4 bg-[#52B788]/10 rounded-2xl blur-xl" />
              <img src={IMAGES.dashboard} alt="quetz.org Dashboard" className="relative rounded-xl shadow-2xl shadow-black/40 w-full object-contain" />
            </div>
          </Sec>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SCHOOL
   ════════════════════════════════════════════════════ */
function SchoolSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.children} alt="Schulkinder Guatemala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#081C15]/90 via-[#081C15]/60 to-transparent" />
        </div>
        <div className="relative z-10 container py-24">
          <div className="ml-auto max-w-xl">
            <Sec>
              <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.schoolTag}</p>
              <h2 className="font-[Montserrat] font-black text-3xl md:text-5xl text-white leading-tight mb-6">{tx.schoolH2}</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">{tx.schoolBody}</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-[Montserrat] font-black text-3xl text-[#E9C46A]"><SimpleCounter end={50000} suffix=" €" /></p>
                  <p className="text-white/50 text-sm mt-1">{tx.schoolGoal}</p>
                </div>
                <div>
                  <p className="font-[Montserrat] font-black text-3xl text-[#E9C46A]"><SimpleCounter end={120} /></p>
                  <p className="text-white/50 text-sm mt-1">{tx.schoolKids}</p>
                </div>
              </div>
            </Sec>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   HOW IT WORKS
   ════════════════════════════════════════════════════ */
function HowItWorksSection({ tx }: { tx: Tx }) {
  const steps = [
    { num: "01", title: tx.how1Title, desc: tx.how1Desc },
    { num: "02", title: tx.how2Title, desc: tx.how2Desc },
    { num: "03", title: tx.how3Title, desc: tx.how3Desc },
    { num: "04", title: tx.how4Title, desc: tx.how4Desc },
  ];
  return (
    <section className="relative py-24 md:py-32 bg-[#2D6A4F]">
      <div className="container">
        <Sec>
          <div className="text-center mb-16">
            <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.howTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white">{tx.howH2}</h2>
          </div>
        </Sec>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <Sec key={i}>
              <div className="relative">
                <span className="font-[Montserrat] font-black text-6xl text-[#52B788]/20">{step.num}</span>
                <h3 className="font-[Montserrat] font-bold text-lg text-white mt-2 mb-2">{step.title}</h3>
                <p className="text-[#B7E4C7]/70 text-sm leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8">
                    <ChevronRight className="w-6 h-6 text-[#52B788]/30" />
                  </div>
                )}
              </div>
            </Sec>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   CALCULATOR
   ════════════════════════════════════════════════════ */
function CalculatorSection({ tx }: { tx: Tx }) {
  const [mode, setMode] = useState<'employees' | 'trees'>('employees');
  const [employees, setEmployees] = useState(50);
  const [trees, setTrees] = useState(20);

  const costPerEmployeePerMonth = 25;
  const treesPerEmployeePerYear = 3;
  const treePrice = 25;
  const schoolPercentage = 0.30;
  const co2PerEmployee = 8000;

  const monthlySubscription = employees * costPerEmployeePerMonth;
  const annualSubscription = monthlySubscription * 12;
  const treesAllocated = employees * treesPerEmployeePerYear;
  const co2Offset = treesAllocated * 25 / 1000;
  const schoolContribution = annualSubscription * schoolPercentage;

  const activeTrees = mode === 'employees' ? treesAllocated : trees;
  const monthlyCost = mode === 'employees' ? monthlySubscription : (trees * treePrice / 12);
  const schoolTotal = mode === 'employees' ? schoolContribution : (trees * treePrice * schoolPercentage);
  const coveragePercent = mode === 'employees'
    ? Math.min(100, Math.round((co2Offset * 1000) / (employees * co2PerEmployee) * 100))
    : null;

  const fmtEur = (n: number) => `€${n.toLocaleString("de-DE")}`;

  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]" id="calculadora">
      <div className="container">
        <Sec>
          <div className="text-center mb-12">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.calcTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white mb-4">{tx.calcH2}</h2>
            <p className="text-white/60 max-w-xl mx-auto">{tx.calcBody}</p>
          </div>
        </Sec>
        <Sec>
          <div className="max-w-3xl mx-auto">
            <div className="flex bg-[#0D2818] border border-[#52B788]/20 rounded-xl p-1 mb-6 max-w-sm mx-auto">
              <button onClick={() => setMode('employees')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${mode === 'employees' ? 'bg-[#52B788] text-[#0D2818]' : 'text-white/50 hover:text-white'}`}>
                {tx.calcModeEmp}
              </button>
              <button onClick={() => setMode('trees')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${mode === 'trees' ? 'bg-[#52B788] text-[#0D2818]' : 'text-white/50 hover:text-white'}`}>
                {tx.calcModeTrees}
              </button>
            </div>
            <div className="bg-[#0D2818]/80 border border-[#52B788]/20 rounded-2xl p-8 md:p-12">
              <div className="mb-8">
                {mode === 'employees' ? (
                  <>
                    <label className="text-white/80 text-sm font-medium mb-3 block">
                      {tx.calcLabelEmp} <span className="text-[#52B788] font-[Montserrat] font-bold text-lg">{employees}</span>
                    </label>
                    <input type="range" min="5" max="500" step="5" value={employees} onChange={(e) => setEmployees(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #52B788 ${((employees - 5) / 495) * 100}%, #0D2818 ${((employees - 5) / 495) * 100}%)` }}
                    />
                    <div className="flex justify-between text-white/30 text-xs mt-2"><span>5</span><span>500</span></div>
                    <p className="text-white/40 text-xs mt-3 text-center">{tx.calcNote}</p>
                  </>
                ) : (
                  <>
                    <label className="text-white/80 text-sm font-medium mb-3 block">
                      {tx.calcLabelTrees} <span className="text-[#52B788] font-[Montserrat] font-bold text-lg">{trees}</span>
                    </label>
                    <input type="range" min="5" max="200" step="5" value={trees} onChange={(e) => setTrees(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #52B788 ${((trees - 5) / 195) * 100}%, #0D2818 ${((trees - 5) / 195) * 100}%)` }}
                    />
                    <div className="flex justify-between text-white/30 text-xs mt-2"><span>5</span><span>200</span></div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                {[
                  { label: tx.calcCo2, value: `${co2Offset.toFixed(1)} t`, icon: Leaf, highlight: true },
                  { label: tx.calcTrees, value: activeTrees.toLocaleString('de-DE'), icon: TreePine, highlight: false },
                  { label: tx.calcCost, value: fmtEur(Math.round(monthlyCost)), icon: BarChart3, highlight: true },
                  { label: tx.calcJobs, value: `${Math.max(1, Math.ceil(activeTrees / 10))}`, icon: Users, highlight: false },
                ].map((item, i) => (
                  <div key={i} className={`text-center p-4 rounded-xl ${item.highlight ? 'bg-[#52B788]/10 border border-[#52B788]/30' : ''}`}>
                    <item.icon className="w-5 h-5 text-[#52B788] mx-auto mb-2" />
                    <p className="font-[Montserrat] font-black text-xl md:text-2xl text-white">{item.value}</p>
                    <p className="text-white/40 text-xs mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              {mode === 'employees' && coveragePercent !== null && (
                <div className="border-t border-white/10 pt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">{tx.calcCoverage}</span>
                    <span className="text-[#52B788] font-bold">{coveragePercent}%</span>
                  </div>
                  <div className="h-3 bg-[#0D2818] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#52B788] to-[#40916C] rounded-full transition-all duration-500" style={{ width: `${coveragePercent}%` }} />
                  </div>
                </div>
              )}
              <div className="mt-6 bg-[#1B4332]/60 border border-[#52B788]/20 rounded-xl p-4 text-center">
                <p className="text-[#B7E4C7] text-sm">
                  <School className="w-4 h-4 inline mr-1.5 mb-0.5 text-[#52B788]" />
                  {tx.calcSchool(fmtEur(Math.round(schoolTotal)))}
                </p>
              </div>
              <div className="mt-6 text-center">
                <a href="#kontakt" className="inline-flex items-center gap-2 bg-[#52B788] text-[#0D2818] font-bold px-8 py-3 rounded-xl hover:bg-[#40916C] transition-colors">
                  {mode === 'employees' ? tx.calcCta1(fmtEur(monthlySubscription)) : tx.calcCta2(activeTrees)}
                </a>
              </div>
            </div>
          </div>
        </Sec>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   PRICING
   ════════════════════════════════════════════════════ */
function PricingSection({ tx, lang }: { tx: Tx; lang: Lang }) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "b2bSprout", name: "Sprout", subtitle: lang === "de" ? "Probierpaket" : "",
      priceMonthly: 49, priceYearly: 499, trees: lang === "de" ? "2 Bäume / Monat" : lang === "en" ? "2 trees / month" : "2 árboles / mes",
      desc: lang === "de" ? "Ideal für den ersten Schritt in nachhaltiges B2B-CSR." : lang === "en" ? "Ideal first step into sustainable B2B CSR." : "El primer paso ideal hacia el CSR empresarial sostenible.",
      features: lang === "de"
        ? ["GPS-Verifizierung", "Transparenz-Report", "Impact-Nachweis CSRD"]
        : lang === "en"
        ? ["GPS verification", "Transparency report", "CSRD impact proof"]
        : ["Verificación GPS", "Informe de transparencia", "Prueba de impacto CSRD"],
      highlight: false, salesLed: false,
    },
    {
      id: "b2bStarter", name: "Starter", subtitle: "",
      priceMonthly: 149, priceYearly: 1519, trees: lang === "de" ? "6 Bäume / Monat" : lang === "en" ? "6 trees / month" : "6 árboles / mes",
      desc: lang === "de" ? "Perfekt für kleine Teams und den Einstieg in nachhaltiges CSR." : lang === "en" ? "Perfect for small teams starting sustainable CSR." : "Perfecto para equipos pequeños que comienzan en CSR.",
      features: lang === "de"
        ? ["6 GPS-getrackte Bäume", "Firmen-Dashboard", "Monatlicher Impact-Report", "CSRD-Datenexport", "Individueller Firmen-Bereich", "Logo auf Transparenz-Seite"]
        : lang === "en"
        ? ["6 GPS-tracked trees", "Company dashboard", "Monthly impact report", "CSRD data export", "Individual company area", "Logo on transparency page"]
        : ["6 árboles rastreados por GPS", "Panel de empresa", "Informe de impacto mensual", "Exportación de datos CSRD", "Área individual de empresa", "Logo en página de transparencia"],
      highlight: true, salesLed: false,
    },
    {
      id: "b2bBusiness", name: "Business", subtitle: "",
      priceMonthly: 499, priceYearly: 5089, trees: lang === "de" ? "20 Bäume / Monat" : lang === "en" ? "20 trees / month" : "20 árboles / mes",
      desc: lang === "de" ? "Für Unternehmen, die CSR ernst nehmen und Mitarbeiter einbinden." : lang === "en" ? "For companies serious about CSR and employee engagement." : "Para empresas que toman el CSR en serio e involucran a su equipo.",
      features: lang === "de"
        ? ["20 GPS-getrackte Bäume", "Personalisiertes Firmen-Dashboard", "Wöchentliche Updates & Fotos", "Mitarbeiter-Engagement-Toolkit", "API-Zugang", "Monatlicher CSRD-Bericht", "Account Manager"]
        : lang === "en"
        ? ["20 GPS-tracked trees", "Personalized company dashboard", "Weekly updates & photos", "Employee engagement toolkit", "API access", "Monthly CSRD report", "Account manager"]
        : ["20 árboles rastreados por GPS", "Panel personalizado de empresa", "Actualizaciones semanales y fotos", "Kit de participación de empleados", "Acceso API", "Informe CSRD mensual", "Account manager"],
      highlight: false, salesLed: false,
    },
    {
      id: "b2bEnterprise", name: "Enterprise", subtitle: "",
      priceMonthly: null as number | null, priceYearly: null as number | null,
      trees: lang === "de" ? "50+ Bäume / Monat" : lang === "en" ? "50+ trees / month" : "50+ árboles / mes",
      desc: lang === "de" ? "Maßgeschneiderte Lösungen für große Organisationen." : lang === "en" ? "Custom solutions for large organizations." : "Soluciones a medida para grandes organizaciones.",
      features: lang === "de"
        ? ["50+ GPS-getrackte Bäume", "White-Label Dashboard", "Vor-Ort-Besuche in Guatemala", "Vollständige CSRD-Integration", "PR & Medien-Paket", "Exklusiver Schulpate"]
        : lang === "en"
        ? ["50+ GPS-tracked trees", "White-label dashboard", "On-site visits in Guatemala", "Full CSRD integration", "PR & media package", "Exclusive school sponsor"]
        : ["50+ árboles rastreados por GPS", "Panel white-label", "Visitas in situ en Guatemala", "Integración CSRD completa", "Paquete PR y medios", "Patrocinador exclusivo de la escuela"],
      highlight: false, salesLed: true,
    },
  ];

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout-b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: billingInterval === "yearly" ? "year" : "month" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  }

  const breakdownLabels = lang === "de"
    ? ["Baum & Pflanzung", "Gehalt Waldwächter", "Schulbaufonds", "Technologie & GPS", "Betrieb & Admin"]
    : lang === "en"
    ? ["Tree & planting", "Forest guardian salary", "School fund", "Technology & GPS", "Operations & admin"]
    : ["Árbol y plantación", "Salario guardián forestal", "Fondo escolar", "Tecnología y GPS", "Operaciones y administración"];

  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]" id="preise">
      <div className="container">
        <Sec>
          <div className="text-center mb-10">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.priceTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white mb-4">{tx.priceH2}</h2>
            <p className="text-[#B7E4C7]/60 max-w-xl mx-auto">{tx.priceSub}</p>
          </div>
        </Sec>
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-[#0D2818]/60 border border-[#52B788]/20 rounded-full p-1">
            <button onClick={() => setBillingInterval("monthly")} className={`px-5 py-2 rounded-full text-sm font-[Montserrat] font-semibold transition-all ${billingInterval === "monthly" ? "bg-[#52B788] text-[#081C15]" : "text-white/60 hover:text-white"}`}>
              {tx.priceMonthly}
            </button>
            <button onClick={() => setBillingInterval("yearly")} className={`px-5 py-2 rounded-full text-sm font-[Montserrat] font-semibold transition-all ${billingInterval === "yearly" ? "bg-[#52B788] text-[#081C15]" : "text-white/60 hover:text-white"}`}>
              {tx.priceYearly}&nbsp;<span className={billingInterval === "yearly" ? "text-[#081C15]" : "text-[#E9C46A]"}>-15%</span>
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, i) => {
            const price = billingInterval === "yearly" ? plan.priceYearly : plan.priceMonthly;
            const isLoading = loadingPlan === plan.id;
            return (
              <Sec key={i}>
                <div className={`relative p-8 rounded-2xl h-full flex flex-col ${plan.highlight ? "bg-[#52B788]/15 border-2 border-[#52B788]/40" : "bg-[#0D2818]/60 border border-[#52B788]/10"}`}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#52B788] text-[#081C15] font-[Montserrat] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                      {tx.priceMost}
                    </div>
                  )}
                  <h3 className="font-[Montserrat] font-bold text-xl text-white mb-1">{plan.name}</h3>
                  {plan.subtitle && <p className="text-[#B7E4C7]/50 text-xs font-medium mb-1">{plan.subtitle}</p>}
                  <p className="text-[#52B788] text-sm font-medium mb-4">{plan.trees}</p>
                  <div className="mb-1">
                    {price != null ? (
                      <>
                        <span className="font-[Montserrat] font-black text-4xl text-white">€{price.toLocaleString("de-DE")}</span>
                        <span className="text-white/40 text-sm"> / {billingInterval === "yearly" ? (lang === "de" ? "Jahr" : lang === "en" ? "year" : "año") : (lang === "de" ? "Monat" : lang === "en" ? "month" : "mes")}</span>
                      </>
                    ) : (
                      <span className="font-[Montserrat] font-black text-4xl text-white">{lang === "de" ? "Individuell" : lang === "en" ? "Custom" : "A medida"}</span>
                    )}
                  </div>
                  {billingInterval === "yearly" && price != null && (
                    <p className="text-[#E9C46A] text-xs font-medium mb-2">{tx.priceYearlySave}</p>
                  )}
                  <p className="text-white/50 text-sm mb-6 leading-relaxed mt-3">{plan.desc}</p>
                  <div className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#52B788] mt-0.5 shrink-0" />
                        <span className="text-white/70 text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                  {plan.salesLed ? (
                    <a href="#kontakt">
                      <Button className="w-full font-[Montserrat] font-semibold bg-white/10 hover:bg-white/20 text-white">
                        {tx.priceContact}
                      </Button>
                    </a>
                  ) : (
                    <Button onClick={() => handleCheckout(plan.id)} disabled={isLoading} className={`w-full font-[Montserrat] font-semibold ${plan.highlight ? "bg-[#52B788] hover:bg-[#40916C] text-white" : "bg-white/10 hover:bg-white/20 text-white"}`}>
                      {isLoading ? tx.priceLoading : tx.priceBook}
                    </Button>
                  )}
                </div>
              </Sec>
            );
          })}
        </div>
        <Sec>
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="font-[Montserrat] font-bold text-xl text-white text-center mb-8">{tx.priceBreakTitle}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: breakdownLabels[0], pct: "30%", amount: "€7,50", icon: Leaf },
                { label: breakdownLabels[1], pct: "25%", amount: "€6,25", icon: Users },
                { label: breakdownLabels[2], pct: "30%", amount: "€7,50", icon: School },
                { label: breakdownLabels[3], pct: "10%", amount: "€2,50", icon: MapPin },
                { label: breakdownLabels[4], pct: "5%", amount: "€1,25", icon: Settings },
              ].map((item, i) => (
                <div key={i} className="bg-[#0D2818]/60 border border-[#52B788]/10 rounded-xl p-4 text-center">
                  <item.icon className="w-5 h-5 text-[#52B788] mx-auto mb-2" />
                  <p className="font-[Montserrat] font-black text-xl text-[#52B788] mt-2">{item.pct}</p>
                  <p className="text-white/70 text-xs mt-1">{item.label}</p>
                  <p className="text-white/40 text-xs mt-1">{item.amount}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-white/30 text-xs mt-4">{tx.priceNote1}</p>
            <p className="text-center text-white/30 text-xs mt-2">{tx.priceNote2}</p>
            {tx.priceTaxNote && (
              <p className="text-center text-[#E9C46A]/60 text-xs mt-3">{tx.priceTaxNote}</p>
            )}
          </div>
        </Sec>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   EMPLOYER BRANDING
   ════════════════════════════════════════════════════ */
function EmployerBrandingSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Sec>
            <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.empTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white leading-tight mb-6">{tx.empH2}</h2>
            <p className="text-[#B7E4C7]/70 text-lg leading-relaxed mb-8">{tx.empBody}</p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Heart, value: "87%", label: tx.empStat1 },
                { icon: Globe, value: "3x", label: tx.empStat2 },
                { icon: Leaf, value: "100%", label: tx.empStat3 },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-6 h-6 text-[#E9C46A] mx-auto mb-2" />
                  <p className="font-[Montserrat] font-black text-2xl text-white">{stat.value}</p>
                  <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </Sec>
          <Sec>
            <div className="relative">
              <div className="absolute -inset-4 bg-[#E9C46A]/5 rounded-2xl blur-xl" />
              <img src={IMAGES.roots} alt="Wurzeln des Regenwaldes" className="relative rounded-xl shadow-2xl shadow-black/40 w-full object-contain" />
            </div>
          </Sec>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   FOUNDER — "Unsere Wurzeln" (same structure as /firmengeschenk)
   ════════════════════════════════════════════════════ */
function FounderSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#081C15]">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Sec>
              <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.founderTag}</p>
              <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white leading-tight mb-6">{tx.founderH2}</h2>
              <p className="text-[#B7E4C7]/70 text-lg leading-relaxed mb-8">{tx.founderBody}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#52B788]/20 flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6 text-[#52B788]" />
                </div>
                <div>
                  <p className="font-[Montserrat] font-bold text-white">{tx.founderName}</p>
                  <p className="text-[#52B788] text-sm">Düsseldorf — Zacapa</p>
                </div>
              </div>
            </Sec>
            <Sec>
              <div className="relative">
                <div className="absolute -inset-4 bg-[#52B788]/5 rounded-2xl blur-xl" />
                <img src={IMAGES.workers} alt="Aufforstung Zacapa Guatemala" className="relative rounded-xl shadow-2xl shadow-black/40 w-full object-cover aspect-square" />
              </div>
            </Sec>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   CONTACT
   ════════════════════════════════════════════════════ */
function ContactSection({ tx }: { tx: Tx }) {
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
          <Sec>
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.contactTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white leading-tight mb-6">{tx.contactH2}</h2>
            <p className="text-[#B7E4C7]/70 text-lg leading-relaxed mb-8">{tx.contactBody}</p>
            <div className="space-y-6">
              {[
                { icon: MapPin, text: "Düsseldorf Unterbach, NRW, Deutschland" },
                { icon: Globe, text: "www.quetz.org" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-[#52B788]" />
                  <span className="text-white/70">{item.text}</span>
                </div>
              ))}
            </div>
          </Sec>
          <Sec>
            {submitted ? (
              <div className="bg-[#52B788]/10 border border-[#52B788]/30 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#52B788]/20 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-[#52B788]" />
                </div>
                <h3 className="font-[Montserrat] font-bold text-xl text-white mb-2">{tx.formThanks}</h3>
                <p className="text-white/60">{tx.formThanksNote}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">{tx.formName}</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#52B788] focus:outline-none transition-colors"
                      placeholder="Max Mustermann" />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">{tx.formEmail}</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#52B788] focus:outline-none transition-colors"
                      placeholder="max@firma.de" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">{tx.formCompany}</label>
                    <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#52B788] focus:outline-none transition-colors"
                      placeholder="Firma GmbH" />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">{tx.formEmployees}</label>
                    <select value={formData.employees} onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                      className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white focus:border-[#52B788] focus:outline-none transition-colors">
                      <option value="">{tx.formSelectDefault}</option>
                      <option value="1-50">1–50</option>
                      <option value="51-200">51–200</option>
                      <option value="201-500">201–500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">{tx.formMessage}</label>
                  <textarea rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#0D2818] border border-[#52B788]/20 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#52B788] focus:outline-none transition-colors resize-none"
                    placeholder={tx.formMessagePlaceholder} />
                </div>
                <Button type="submit" size="lg" className="w-full bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base py-6 shadow-xl shadow-[#52B788]/20">
                  {tx.formCta}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-white/30 text-xs text-center">{tx.formNote}</p>
              </form>
            )}
          </Sec>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════ */
function PageFooter({ tx }: { tx: Tx }) {
  return (
    <footer className="bg-[#081C15] border-t border-[#52B788]/10 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#52B788]" />
            <span className="font-[Montserrat] font-bold text-white">quetz.org</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="/impressum" className="text-white/40 hover:text-white/70 transition-colors">{tx.footerImprint}</a>
            <a href="/datenschutz" className="text-white/40 hover:text-white/70 transition-colors">{tx.footerPrivacy}</a>
            <a href="/agb" className="text-white/40 hover:text-white/70 transition-colors">{tx.footerTerms}</a>
          </div>
          <p className="text-white/30 text-sm">© 2026 quetz.org — Düsseldorf Unterbach, Deutschland</p>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════ */
export default function CsrPartnerPage() {
  const { language, setLanguage } = useLanguage();
  const lang = (["de", "en", "es"].includes(language) ? language : "de") as Lang;
  const tx = txt[lang];

  return (
    <main className="bg-[#081C15] text-white overflow-x-hidden">
      <Navbar tx={tx} lang={lang} onLang={(l) => setLanguage(l)} />
      <HeroSection tx={tx} />
      <ProblemSection tx={tx} />
      <SolutionSection tx={tx} />
      <TransparencySection tx={tx} />
      <SchoolSection tx={tx} />
      <HowItWorksSection tx={tx} />
      <CalculatorSection tx={tx} />
      <PricingSection tx={tx} lang={lang} />
      <EmployerBrandingSection tx={tx} />
      <FounderSection tx={tx} />
      <ContactSection tx={tx} />
      <PageFooter tx={tx} />
    </main>
  );
}
