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
  Check, ChevronRight, Leaf, Globe, Settings, FileText, Gauge,
  Receipt, CalendarClock, AlertTriangle, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

/* ════════════════════════════════════════════════════
   BOOKING / 15-MINUTEN-CALL
   ════════════════════════════════════════════════════ */
// TODO-DANIEL: Calendly/cal.com Link hier einsetzen
// Sobald BOOKING_URL gesetzt ist, ersetzt sie automatisch den mailto-Fallback.
// Beispiel: const BOOKING_URL: string = 'https://cal.com/quetz/15min';
const BOOKING_URL: string = '';
const BOOKING_EMAIL = 'dgarrido@quetz.org';
const BOOKING_MAILTO =
  `mailto:${BOOKING_EMAIL}` +
  `?subject=${encodeURIComponent('15-Minuten-Call — quetz.org für Unternehmen')}` +
  `&body=${encodeURIComponent(
    'Hallo Daniel,\n\nwir würden gerne einen 15-Minuten-Call vereinbaren.\n\n' +
    'Unternehmen:\nAnzahl Mitarbeiter:\nWunschtermine (2–3 Vorschläge):\n\nViele Grüße'
  )}`;
const bookingHref = BOOKING_URL || BOOKING_MAILTO;
// Externer Booking-Link öffnet in neuem Tab, mailto nicht.
const bookingTarget = BOOKING_URL ? '_blank' : undefined;

/* ════════════════════════════════════════════════════
   RECHENGRUNDLAGEN (transparent, an einem Ort)
   CO2_PER_TREE = 25 kg/Jahr — identisch zu app/api/transparency/route.ts
   ════════════════════════════════════════════════════ */
const CO2_KG_PER_TREE_PER_YEAR = 25;
const CO2_ESTIMATE_YEARS = 20;
const PRICE_PER_EMPLOYEE_MONTH = 12;
const PRICE_PER_TREE = 25;
const SCHOOL_SHARE = 0.3;

/** Bäume pro Jahr aus einem Jahresbudget (abgerundet, damit nichts versprochen wird, das nicht gedeckt ist). */
function treesFromAnnualBudget(annualBudget: number): number {
  return Math.floor(annualBudget / PRICE_PER_TREE);
}
/** Geschätzte CO₂-Bindung in Tonnen über CO2_ESTIMATE_YEARS Jahre. */
function estimatedCo2Tonnes(trees: number): number {
  return (trees * CO2_KG_PER_TREE_PER_YEAR * CO2_ESTIMATE_YEARS) / 1000;
}
const fmtEur = (n: number) => `€${Math.round(n).toLocaleString("de-DE")}`;

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
    navReporting: "Reporting",
    navKontakt: "Kontakt",
    navCta: "Jetzt starten",
    heroTag: "Nachhaltigkeitspartner für den deutschen Mittelstand",
    heroH1: "Aufforstung, die Ihr",
    heroH1Accent: "Unternehmen verändert.",
    heroSub: "Jeder Baum schafft Arbeit vor Ort. Jedes Abo finanziert eine Schule. GPS-getrackt, nachvollziehbar und dokumentiert für Ihr Nachhaltigkeitsreporting.",
    heroCta1: "Jetzt starten",
    heroCta2: "Impact entdecken",
    statHektar: "Hektar Waldverlust in Guatemala",
    statKinder: "Kinder erhalten eine Schule",
    statTransparenz: "Transparenz per GPS-Tracking",
    statCo2: "kg CO₂ pro Baum / Jahr (Schätzwert)",
    probTag: "Das Problem",
    probH2: "Guatemala hat 17% seiner Waldfläche verloren. 47% der Kinder brechen die Schule ab.",
    probBody: "Gleichzeitig suchen deutsche Unternehmen nach glaubwürdigen CSR-Projekten für ihr CSRD-Reporting. Die meisten Anbieter liefern nur CO₂-Zertifikate — ohne echten sozialen Impact.",
    prob1Title: "Waldverlust",
    prob1Desc: "Seit 2001 hat Guatemala über 1,5 Millionen Hektar Wald verloren — eine Fläche größer als Schleswig-Holstein.",
    prob2Title: "Bildungskrise",
    prob2Desc: "47% der Kinder in ländlichen Gebieten schließen nicht einmal die Grundschule ab. Es fehlen Schulen und Lehrer.",
    prob3Title: "Greenwashing",
    prob3Desc: "Viele CO₂-Kompensationsprojekte lassen sich von außen nicht überprüfen. Wer damit wirbt, riskiert Reputationsschäden — deshalb versprechen wir keine Kompensation, sondern zeigen nachprüfbare Pflanzungen.",
    solTag: "Die Lösung",
    solH2: "Ein Baum = Ein Job = Ein Schritt zur Schule.",
    sol1Title: "Aufforstung",
    sol1Desc: "Heimische Baumarten, GPS-getrackt, von lokalen Familien gepflegt.",
    sol2Title: "Arbeitsplätze",
    sol2Desc: "Jeder Baum schafft faire Arbeit für guatemaltekische Familien.",
    sol3Title: "Schulbau",
    sol3Desc: "Überschüsse finanzieren den Bau einer Schule für 120 Kinder.",
    sol4Title: "Dokumentiert",
    sol4Desc: "Alle Daten aufbereitet für Ihr eigenes Nachhaltigkeitsreporting — auf einem Dashboard.",
    transpTag: "Radikale Transparenz",
    transpH2: "Sehen Sie genau, wo Ihr Baum wächst.",
    transpBody: "Unser digitales Dashboard zeigt Ihnen in Echtzeit: GPS-Standort jedes Baumes, CO₂-Absorption, Fortschritt des Schulbaus und die Familien, die Ihre Bäume pflegen. Keine Blackbox — sondern greifbarer Impact für Ihr Reporting.",
    transpCheck1: "GPS-Tracking jedes einzelnen Baumes",
    transpCheck2: "CO₂-Schätzwerte auf Basis der tatsächlichen Baumzahl",
    transpCheck3: "Fortschritt des Schulbaus live verfolgen",
    transpCheck4: "Exportierbare Daten als Zulieferung für Ihr Nachhaltigkeitsreporting",
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
    how4Title: "Dokumentation erhalten",
    how4Desc: "Alle Daten exportierbar — als Zulieferung für Ihren eigenen Nachhaltigkeitsbericht.",
    calcTag: "Impact-Rechner",
    calcH2: "Ein Baum pro Mitarbeiter — was heißt das konkret?",
    calcBody: "Geben Sie Ihre Teamgröße ein. Sie sehen sofort Beitrag, Anzahl der Bäume und eine ehrlich gekennzeichnete CO₂-Schätzung.",
    calcModeEmp: "Nach Mitarbeitern",
    calcModeTrees: "Nach Bäumen",
    calcLabelEmp: "Anzahl Mitarbeiter:",
    calcLabelTrees: "Bäume pro Monat:",
    calcPerEmpNote: "12 € pro Mitarbeiter und Monat — bewusst innerhalb der 50-€-Sachbezugsgrenze",
    calcPerTreeNote: "25 € pro Baum — inklusive Pflanzung, Pflege und GPS-Erfassung",
    calcFormulaEmp: (emp: number, annual: string, trees: string) =>
      `${emp} Mitarbeiter × 12 € = ${annual} pro Jahr = ${trees} Bäume/Jahr`,
    calcFormulaTrees: (trees: number, monthly: string, annual: string) =>
      `${trees} Bäume × 25 € = ${monthly} pro Monat = ${annual} pro Jahr`,
    calcMonthly: "Monatlicher Beitrag",
    calcAnnual: "Jahresbeitrag",
    calcTrees: "Bäume pro Jahr",
    calcCo2: "geschätzte CO₂-Bindung über 20 Jahre",
    calcCo2Warn: "Schätzwert, kein zertifiziertes Kompensationsprodukt",
    calcAssumption: "Rechengrundlage: 25 kg CO₂ pro Baum und Jahr, hochgerechnet auf 20 Jahre Wachstum. Das ist ein interner Schätzwert — keine gemessene, geprüfte oder von Dritten zertifizierte Zahl. Es entsteht dadurch kein Anspruch auf CO₂-Kompensation und kein Carbon Credit.",
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
    volTag: "Mengenstaffel",
    volH2: "Preise für ganze Teams — eine jährliche Rechnung.",
    volBody: "Ein Baum pro Mitarbeiter, abgerechnet über eine jährliche Sammelrechnung. 12 € pro Mitarbeiter und Monat — unabhängig von der Teamgröße, ohne versteckte Staffel.",
    volEmployeesLabel: "Mitarbeiter",
    volPerEmpMonth: "pro Mitarbeiter / Monat",
    volPerEmpYear: "pro Mitarbeiter / Jahr",
    volTotalYear: "Gesamt pro Jahr",
    volTreesYear: "Bäume pro Jahr",
    volCo2: "geschätzte CO₂-Bindung / 20 Jahre",
    volMath: (emp: number, perEmpYear: string, total: string) =>
      `${emp} × ${perEmpYear} = ${total}`,
    volInvoice1: "Jährliche Sammelrechnung — ein Beleg für die Buchhaltung",
    volInvoice2: "Zahlung per Überweisung, Zahlungsziel 30 Tage",
    volInvoice3: "Mitarbeiterliste kann unterjährig angepasst werden",
    volNote: "Alle Preise netto zzgl. gesetzlicher USt. Ab 200 Mitarbeitern besprechen wir die Konditionen im 15-Minuten-Call.",
    volCta: "Angebot für mein Team anfordern",
    taxTag: "Steuerlicher Rahmen",
    taxH2: "50 € Sachbezug pro Mitarbeiter und Monat — steuer- und sozialabgabenfrei.",
    taxBody: "Arbeitgeber in Deutschland können ihren Mitarbeitern monatlich Sachzuwendungen bis zu 50 € gewähren, ohne dass Lohnsteuer oder Sozialabgaben anfallen (§ 8 Abs. 2 S. 11 EStG). Ein eigener, GPS-getrackter Baum für 12 € im Monat liegt deutlich innerhalb dieser Freigrenze — es bleibt also Spielraum für weitere Sachbezüge.",
    tax1Title: "Freigrenze, nicht Freibetrag",
    tax1Desc: "Wird die 50-€-Grenze in einem Monat überschritten, ist der gesamte Betrag steuerpflichtig — nicht nur der übersteigende Teil. Genau deshalb kalkulieren wir bewusst mit 12 € und lassen Puffer.",
    tax2Title: "Sachzuwendung, keine Geldleistung",
    tax2Desc: "Der Mitarbeiter erhält einen konkreten Baum mit GPS-Standort und Urkunde auf seinen Namen — eine Sachzuwendung, keine Barauszahlung.",
    tax3Title: "Betriebsausgabe",
    tax3Desc: "Die Aufwendungen sind für das Unternehmen in der Regel als Betriebsausgabe abziehbar. Wir stellen eine ordnungsgemäße Rechnung mit ausgewiesener Umsatzsteuer.",
    taxExample: "Beispiel: 12 € Baum-Sachbezug + 38 € verbleibender Spielraum = 50 € monatliche Freigrenze.",
    taxDisclaimer: "Hinweis: Dies ist eine allgemeine Information und keine Steuerberatung. Die steuerliche Behandlung hängt von der konkreten Ausgestaltung und vom Einzelfall ab. Bitte lassen Sie das Modell vor der Einführung von Ihrem Steuerberater bestätigen.",
    repTag: "Reporting",
    repH2: "Was Ihr Unternehmen konkret bekommt.",
    repBody: "Drei Bausteine, die Sie direkt in Ihre eigene Nachhaltigkeitskommunikation und -berichterstattung übernehmen können.",
    rep1Title: "Live-Impact-Dashboard",
    rep1Desc: "Ein Firmen-Login mit dem aktuellen Stand: Anzahl der Bäume, GPS-Koordinaten, Pflanzdatum, Fotos aus dem Feld und der Fortschritt des Schulprojekts.",
    rep2Title: "Jährliches PDF-Zertifikat",
    rep2Desc: "Einmal im Jahr ein PDF auf den Namen Ihres Unternehmens: Pflanzzeitraum, Anzahl der Bäume, Arten und Standorte — nutzbar für interne Kommunikation, Website und Messeauftritte.",
    rep3Title: "Dokumentation für Ihr Reporting",
    rep3Desc: "Strukturierte Daten und vorformulierte Textbausteine, die Sie in Ihren eigenen Nachhaltigkeitsbericht übernehmen können — etwa für die narrative Darstellung von Umwelt- und Sozialmaßnahmen nach CSRD/ESRS.",
    repHonestTitle: "Was wir ausdrücklich nicht liefern",
    repHonest1: "Keine CO₂-Zertifikate, keine Carbon Credits, keinen zertifizierten Kompensationsanspruch.",
    repHonest2: "Keinen fertigen CSRD-Bericht. Unsere Unterlagen sind eine Datenquelle, die Ihr Reporting unterstützt — sie ersetzen weder Ihren Bericht noch dessen Prüfung.",
    repHonest3: "Keine geprüften CO₂-Zahlen. Unsere Angaben sind gekennzeichnete Schätzwerte auf Basis von 25 kg CO₂ pro Baum und Jahr.",
    repHonestNote: "Wir sagen lieber, was wir belegen können — das ist der ganze Punkt.",
    callTag: "Direkter Kontakt",
    callH2: "15 Minuten reichen, um zu sehen, ob es passt.",
    callBody: "Kein Verkaufsgespräch und kein Vertrag am Telefon. Wir schauen gemeinsam auf Ihre Teamgröße, Ihr Budget und darauf, welche Unterlagen Sie für Ihr Reporting brauchen.",
    callCta: "15-Minuten-Call vereinbaren",
    callAlt: "Oder schreiben Sie direkt an dgarrido@quetz.org",
    callBullet1: "Konkretes Angebot für Ihre Teamgröße",
    callBullet2: "Wie die 50-€-Sachbezugsgrenze in Ihrem Fall greift",
    callBullet3: "Welche Unterlagen Sie für Ihr Nachhaltigkeitsreporting erhalten",
    empTag: "Employer Branding",
    empH2: "Jeder Mitarbeiter bekommt seinen eigenen Baum.",
    empBody: "Stellen Sie sich vor: Jeder Mitarbeiter von Ihrem Unternehmen erhält ein eigenes, GPS-getracktes Bäumchen. Sie können online zusehen, wie es wächst, und wissen gleichzeitig, dass ihr Baum Arbeit vor Ort schafft.",
    empStat1: "eigener Baum pro Mitarbeiter, auf den Namen ausgestellt",
    empStat2: "Sachzuwendung innerhalb der 50-€-Freigrenze",
    empStat3: "GPS-Standort und Fotos für jeden Baum",
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
    formSending: "Wird gesendet ...",
    formError: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie direkt an dgarrido@quetz.org.",
    formEmployeesRequired: "Mitarbeiteranzahl *",
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
    navReporting: "Reporting",
    navKontakt: "Contact",
    navCta: "Get Started",
    heroTag: "Sustainability partner for the German Mittelstand",
    heroH1: "Reforestation that changes your",
    heroH1Accent: "company. For real.",
    heroSub: "Every tree creates local work. Every subscription funds a school. GPS-tracked, verifiable and documented for your sustainability reporting.",
    heroCta1: "Get Started",
    heroCta2: "Discover Impact",
    statHektar: "Hectares of forest lost in Guatemala",
    statKinder: "Children getting a school",
    statTransparenz: "Transparency via GPS tracking",
    statCo2: "kg CO₂ per tree / year (estimate)",
    probTag: "The Problem",
    probH2: "Guatemala has lost 17% of its forest cover. 47% of children drop out of school.",
    probBody: "German companies need credible CSR projects for CSRD reporting. Most providers deliver only CO₂ certificates — without real social impact.",
    prob1Title: "Forest Loss",
    prob1Desc: "Since 2001, Guatemala has lost over 1.5 million hectares of forest — an area larger than Schleswig-Holstein.",
    prob2Title: "Education Crisis",
    prob2Desc: "47% of children in rural areas don't finish primary school. Schools and teachers are lacking.",
    prob3Title: "Greenwashing",
    prob3Desc: "Many CO₂ offset projects cannot be verified from the outside. Advertising with them is a reputational risk — which is why we promise no offsetting, only verifiable planting.",
    solTag: "The Solution",
    solH2: "One tree = One job = One step toward school.",
    sol1Title: "Reforestation",
    sol1Desc: "Native species, GPS-tracked, cared for by local families.",
    sol2Title: "Jobs",
    sol2Desc: "Every tree creates fair work for Guatemalan families.",
    sol3Title: "School",
    sol3Desc: "Surplus funds the construction of a school for 120 children.",
    sol4Title: "Documented",
    sol4Desc: "All data prepared to feed your own sustainability reporting — in one dashboard.",
    transpTag: "Radical Transparency",
    transpH2: "See exactly where your tree grows.",
    transpBody: "Our digital dashboard shows you in real time: GPS location of every tree, CO₂ absorption, school construction progress, and the families caring for your trees. No black box — tangible impact for your reporting.",
    transpCheck1: "GPS tracking of every individual tree",
    transpCheck2: "CO₂ estimates based on the actual number of trees",
    transpCheck3: "Follow school construction progress live",
    transpCheck4: "Exportable data to feed your sustainability reporting",
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
    how4Title: "Get your documentation",
    how4Desc: "All data exportable — as input for your own sustainability report.",
    calcTag: "Impact Calculator",
    calcH2: "One tree per employee — what does that actually mean?",
    calcBody: "Enter your team size. You immediately see the contribution, the number of trees and a clearly labelled CO₂ estimate.",
    calcModeEmp: "By Employees",
    calcModeTrees: "By Trees",
    calcLabelEmp: "Number of employees:",
    calcLabelTrees: "Trees per month:",
    calcPerEmpNote: "€12 per employee per month — deliberately within the German €50 non-cash benefit limit",
    calcPerTreeNote: "€25 per tree — including planting, care and GPS registration",
    calcFormulaEmp: (emp: number, annual: string, trees: string) =>
      `${emp} employees × €12 = ${annual} per year = ${trees} trees/year`,
    calcFormulaTrees: (trees: number, monthly: string, annual: string) =>
      `${trees} trees × €25 = ${monthly} per month = ${annual} per year`,
    calcMonthly: "Monthly contribution",
    calcAnnual: "Annual contribution",
    calcTrees: "Trees per year",
    calcCo2: "estimated CO₂ storage over 20 years",
    calcCo2Warn: "Estimate — not a certified offset product",
    calcAssumption: "Basis of calculation: 25 kg CO₂ per tree per year, projected over 20 years of growth. This is an internal estimate — not a measured, audited or third-party certified figure. It creates no offsetting claim and no carbon credit.",
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
    priceTaxNote: "Tax benefits under German law (§ 8 EStG) apply to companies with fiscal domicile in Germany. Consult your tax advisor.",
    volTag: "Volume pricing",
    volH2: "Pricing for whole teams — one annual invoice.",
    volBody: "One tree per employee, billed via a single annual invoice. €12 per employee per month — regardless of team size, with no hidden tiers.",
    volEmployeesLabel: "employees",
    volPerEmpMonth: "per employee / month",
    volPerEmpYear: "per employee / year",
    volTotalYear: "Total per year",
    volTreesYear: "Trees per year",
    volCo2: "estimated CO₂ storage / 20 years",
    volMath: (emp: number, perEmpYear: string, total: string) =>
      `${emp} × ${perEmpYear} = ${total}`,
    volInvoice1: "Annual consolidated invoice — one document for accounting",
    volInvoice2: "Payment by bank transfer, 30 days net",
    volInvoice3: "Employee list can be adjusted during the year",
    volNote: "All prices net, plus statutory VAT. Above 200 employees we discuss terms in the 15-minute call.",
    volCta: "Request a quote for my team",
    taxTag: "Tax framework",
    taxH2: "€50 non-cash benefit per employee per month — free of tax and social contributions.",
    taxBody: "Employers in Germany may grant each employee non-cash benefits (\"Sachzuwendung\") of up to €50 per month without payroll tax or social security contributions (§ 8 Abs. 2 S. 11 EStG). A GPS-tracked tree at €12 a month sits well inside that allowance, leaving room for further benefits.",
    tax1Title: "Threshold, not an allowance",
    tax1Desc: "If the €50 limit is exceeded in a month, the entire amount becomes taxable — not just the excess. That is exactly why we deliberately calculate with €12 and keep a buffer.",
    tax2Title: "Non-cash benefit, not a payment",
    tax2Desc: "The employee receives a specific tree with a GPS location and a certificate in their name — a benefit in kind, not a cash payout.",
    tax3Title: "Business expense",
    tax3Desc: "The costs are generally deductible as a business expense. We issue a proper invoice with VAT shown separately.",
    taxExample: "Example: €12 tree benefit + €38 remaining room = the €50 monthly threshold.",
    taxDisclaimer: "Please note: this is general information, not tax advice. The tax treatment depends on the specific setup and on your individual case. Please have the model confirmed by your tax advisor (Steuerberater) before rolling it out.",
    repTag: "Reporting",
    repH2: "What your company actually receives.",
    repBody: "Three building blocks you can take straight into your own sustainability communication and reporting.",
    rep1Title: "Live impact dashboard",
    rep1Desc: "A company login with the current status: number of trees, GPS coordinates, planting date, field photos and the progress of the school project.",
    rep2Title: "Annual PDF certificate",
    rep2Desc: "Once a year, a PDF in your company's name: planting period, number of trees, species and locations — usable for internal communication, your website and trade fairs.",
    rep3Title: "Documentation for your reporting",
    rep3Desc: "Structured data and pre-written text blocks you can take into your own sustainability report — for example for the narrative disclosure of environmental and social measures under CSRD/ESRS.",
    repHonestTitle: "What we explicitly do not deliver",
    repHonest1: "No CO₂ certificates, no carbon credits, no certified offsetting claim.",
    repHonest2: "No finished CSRD report. Our documentation is a data source that supports your reporting — it replaces neither your report nor its audit.",
    repHonest3: "No audited CO₂ figures. Our numbers are labelled estimates based on 25 kg CO₂ per tree per year.",
    repHonestNote: "We would rather say what we can prove — that is the whole point.",
    callTag: "Direct contact",
    callH2: "15 minutes is enough to see whether this fits.",
    callBody: "No sales pitch, no contract on the phone. We look together at your team size, your budget and which documents you need for your reporting.",
    callCta: "Book a 15-minute call",
    callAlt: "Or write directly to dgarrido@quetz.org",
    callBullet1: "A concrete quote for your team size",
    callBullet2: "How the €50 non-cash benefit threshold applies in your case",
    callBullet3: "Which documents you receive for your sustainability reporting",
    empTag: "Employer Branding",
    empH2: "Every employee gets their own tree.",
    empBody: "Imagine: every employee at your company gets their own GPS-tracked sapling. They can watch it grow online, knowing their tree creates local work.",
    empStat1: "an own tree per employee, issued in their name",
    empStat2: "a benefit in kind inside the €50 monthly threshold",
    empStat3: "GPS location and photos for every tree",
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
    formSending: "Sending ...",
    formError: "We could not send your request. Please try again or write directly to dgarrido@quetz.org.",
    formEmployeesRequired: "Number of employees *",
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
    navReporting: "Reporte",
    navKontakt: "Contacto",
    navCta: "Comenzar",
    heroTag: "Socio de sostenibilidad para el Mittelstand alemán",
    heroH1: "Reforestación que transforma su",
    heroH1Accent: "empresa. De verdad.",
    heroSub: "Cada árbol genera trabajo local. Cada suscripción financia una escuela. Rastreado por GPS, verificable y documentado para su informe de sostenibilidad.",
    heroCta1: "Comenzar",
    heroCta2: "Descubrir el impacto",
    statHektar: "Hectáreas de bosque perdido en Guatemala",
    statKinder: "Niños reciben una escuela",
    statTransparenz: "Transparencia vía GPS",
    statCo2: "kg CO₂ por árbol / año (estimación)",
    probTag: "El Problema",
    probH2: "Guatemala ha perdido el 17% de su cubierta forestal. El 47% de los niños abandona la escuela.",
    probBody: "Las empresas alemanas buscan proyectos CSR creíbles para su reporte CSRD. La mayoría de proveedores solo ofrecen certificados de CO₂, sin impacto social real.",
    prob1Title: "Pérdida de bosque",
    prob1Desc: "Desde 2001, Guatemala ha perdido más de 1,5 millones de hectáreas de bosque, una superficie mayor que Schleswig-Holstein.",
    prob2Title: "Crisis educativa",
    prob2Desc: "El 47% de los niños en áreas rurales no termina la primaria. Faltan escuelas y maestros.",
    prob3Title: "Greenwashing",
    prob3Desc: "Muchos proyectos de compensación de CO₂ no se pueden verificar desde fuera. Publicitarlos es un riesgo reputacional: por eso no prometemos compensación, sino plantaciones verificables.",
    solTag: "La Solución",
    solH2: "Un árbol = Un empleo = Un paso hacia la escuela.",
    sol1Title: "Reforestación",
    sol1Desc: "Especies nativas, rastreadas por GPS, cuidadas por familias locales.",
    sol2Title: "Empleos",
    sol2Desc: "Cada árbol genera trabajo digno para familias guatemaltecas.",
    sol3Title: "Escuela",
    sol3Desc: "Los excedentes financian la construcción de una escuela para 120 niños.",
    sol4Title: "Documentado",
    sol4Desc: "Todos los datos preparados para alimentar su propio informe de sostenibilidad, en un solo panel.",
    transpTag: "Transparencia radical",
    transpH2: "Vea exactamente dónde crece su árbol.",
    transpBody: "Nuestro panel digital le muestra en tiempo real: la ubicación GPS de cada árbol, la absorción de CO₂, el avance de la construcción escolar y las familias que cuidan sus árboles. Sin caja negra, impacto tangible para su informe.",
    transpCheck1: "Seguimiento GPS de cada árbol individual",
    transpCheck2: "Estimaciones de CO₂ basadas en el número real de árboles",
    transpCheck3: "Progreso de construcción escolar en vivo",
    transpCheck4: "Datos exportables para alimentar su informe de sostenibilidad",
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
    how4Title: "Recibir la documentación",
    how4Desc: "Todos los datos exportables, como insumo para su propio informe de sostenibilidad.",
    calcTag: "Calculadora de impacto",
    calcH2: "Un árbol por empleado: ¿qué significa en concreto?",
    calcBody: "Introduzca el tamaño de su equipo. Verá al instante la aportación, el número de árboles y una estimación de CO₂ claramente etiquetada.",
    calcModeEmp: "Por empleados",
    calcModeTrees: "Por árboles",
    calcLabelEmp: "Número de empleados:",
    calcLabelTrees: "Árboles al mes:",
    calcPerEmpNote: "12 € por empleado y mes — deliberadamente dentro del límite alemán de 50 € en especie",
    calcPerTreeNote: "25 € por árbol — incluye plantación, cuidado y registro GPS",
    calcFormulaEmp: (emp: number, annual: string, trees: string) =>
      `${emp} empleados × 12 € = ${annual} al año = ${trees} árboles/año`,
    calcFormulaTrees: (trees: number, monthly: string, annual: string) =>
      `${trees} árboles × 25 € = ${monthly} al mes = ${annual} al año`,
    calcMonthly: "Aportación mensual",
    calcAnnual: "Aportación anual",
    calcTrees: "Árboles por año",
    calcCo2: "fijación de CO₂ estimada a 20 años",
    calcCo2Warn: "Estimación — no es un producto de compensación certificado",
    calcAssumption: "Base de cálculo: 25 kg de CO₂ por árbol y año, proyectado a 20 años de crecimiento. Es una estimación interna, no una cifra medida, auditada ni certificada por terceros. No genera derecho a compensación de CO₂ ni bonos de carbono.",
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
    priceTaxNote: "Las ventajas fiscales (§ 8 EStG) aplican a empresas con domicilio fiscal en Alemania.",
    volTag: "Precios por volumen",
    volH2: "Precios para equipos completos: una sola factura anual.",
    volBody: "Un árbol por empleado, facturado mediante una única factura anual. 12 € por empleado y mes, sin importar el tamaño del equipo y sin escalas ocultas.",
    volEmployeesLabel: "empleados",
    volPerEmpMonth: "por empleado / mes",
    volPerEmpYear: "por empleado / año",
    volTotalYear: "Total por año",
    volTreesYear: "Árboles por año",
    volCo2: "fijación de CO₂ estimada / 20 años",
    volMath: (emp: number, perEmpYear: string, total: string) =>
      `${emp} × ${perEmpYear} = ${total}`,
    volInvoice1: "Factura anual agrupada: un solo documento para contabilidad",
    volInvoice2: "Pago por transferencia, 30 días netos",
    volInvoice3: "La lista de empleados puede ajustarse durante el año",
    volNote: "Todos los precios netos, más el IVA legal. A partir de 200 empleados acordamos las condiciones en la llamada de 15 minutos.",
    volCta: "Solicitar oferta para mi equipo",
    taxTag: "Marco fiscal",
    taxH2: "50 € en especie por empleado y mes, libres de impuestos y cotizaciones.",
    taxBody: "En Alemania, los empleadores pueden conceder a cada empleado prestaciones en especie (\"Sachzuwendung\") de hasta 50 € al mes sin retención de IRPF ni cotizaciones sociales (§ 8 Abs. 2 S. 11 EStG). Un árbol propio rastreado por GPS por 12 € al mes queda holgadamente dentro de ese límite.",
    tax1Title: "Límite, no importe exento",
    tax1Desc: "Si en un mes se supera el límite de 50 €, tributa el importe completo y no solo el exceso. Por eso calculamos deliberadamente con 12 € y dejamos margen.",
    tax2Title: "Prestación en especie, no dinero",
    tax2Desc: "El empleado recibe un árbol concreto con ubicación GPS y un certificado a su nombre: una prestación en especie, no un pago en efectivo.",
    tax3Title: "Gasto deducible",
    tax3Desc: "Los costes son, por regla general, deducibles como gasto de explotación. Emitimos una factura formal con el IVA desglosado.",
    taxExample: "Ejemplo: 12 € de árbol en especie + 38 € de margen restante = el límite mensual de 50 €.",
    taxDisclaimer: "Aviso: esta es información general y no asesoramiento fiscal. El tratamiento fiscal depende del diseño concreto y de cada caso. Haga confirmar el modelo por su asesor fiscal (Steuerberater) antes de implantarlo.",
    repTag: "Reporte",
    repH2: "Qué recibe su empresa en concreto.",
    repBody: "Tres componentes que puede incorporar directamente a su propia comunicación e informe de sostenibilidad.",
    rep1Title: "Panel de impacto en vivo",
    rep1Desc: "Un acceso de empresa con el estado actual: número de árboles, coordenadas GPS, fecha de plantación, fotos de campo y avance del proyecto escolar.",
    rep2Title: "Certificado PDF anual",
    rep2Desc: "Una vez al año, un PDF a nombre de su empresa: periodo de plantación, número de árboles, especies y ubicaciones, útil para comunicación interna, web y ferias.",
    rep3Title: "Documentación para su informe",
    rep3Desc: "Datos estructurados y textos preparados que puede incorporar a su propio informe de sostenibilidad, por ejemplo para la parte narrativa de medidas ambientales y sociales según CSRD/ESRS.",
    repHonestTitle: "Lo que expresamente no ofrecemos",
    repHonest1: "Ni certificados de CO₂, ni bonos de carbono, ni derecho a compensación certificada.",
    repHonest2: "Ningún informe CSRD terminado. Nuestra documentación es una fuente de datos que apoya su informe; no lo sustituye ni sustituye su auditoría.",
    repHonest3: "Ninguna cifra de CO₂ auditada. Nuestros datos son estimaciones etiquetadas como tales, basadas en 25 kg de CO₂ por árbol y año.",
    repHonestNote: "Preferimos decir lo que podemos demostrar: de eso se trata.",
    callTag: "Contacto directo",
    callH2: "Con 15 minutos basta para ver si encaja.",
    callBody: "Sin discurso de venta ni contratos por teléfono. Revisamos juntos el tamaño de su equipo, su presupuesto y qué documentación necesita para su informe.",
    callCta: "Reservar llamada de 15 minutos",
    callAlt: "O escriba directamente a dgarrido@quetz.org",
    callBullet1: "Una oferta concreta para el tamaño de su equipo",
    callBullet2: "Cómo aplica el límite de 50 € en especie en su caso",
    callBullet3: "Qué documentación recibe para su informe de sostenibilidad",
    empTag: "Marca empleadora",
    empH2: "Cada empleado recibe su propio árbol.",
    empBody: "Imagine: cada empleado de su empresa recibe su propio arbolito rastreado por GPS. Puede ver cómo crece en línea y saber que su árbol genera trabajo local.",
    empStat1: "un árbol propio por empleado, emitido a su nombre",
    empStat2: "prestación en especie dentro del límite de 50 € al mes",
    empStat3: "ubicación GPS y fotos de cada árbol",
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
    formSending: "Enviando ...",
    formError: "No se ha podido enviar su solicitud. Inténtelo de nuevo o escriba directamente a dgarrido@quetz.org.",
    formEmployeesRequired: "Número de empleados *",
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
    { href: "#reporting", label: tx.navReporting },
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

  /* — Mitarbeiter-Modus (Primärmodus) —
     employees × 12 €/Monat  →  ×12 Monate  →  Jahresbudget  →  ÷ 25 € = Bäume/Jahr */
  const empMonthly = employees * PRICE_PER_EMPLOYEE_MONTH;
  const empAnnual = empMonthly * 12;
  const empTreesPerYear = treesFromAnnualBudget(empAnnual);

  /* — Baum-Modus (Sekundärmodus) —
     trees Bäume/Monat × 25 € = Monatsbeitrag */
  const treeMonthly = trees * PRICE_PER_TREE;
  const treeAnnual = treeMonthly * 12;
  const treeTreesPerYear = trees * 12;

  const monthly = mode === 'employees' ? empMonthly : treeMonthly;
  const annual = mode === 'employees' ? empAnnual : treeAnnual;
  const treesPerYear = mode === 'employees' ? empTreesPerYear : treeTreesPerYear;
  const co2Tonnes = estimatedCo2Tonnes(treesPerYear);
  const schoolTotal = annual * SCHOOL_SHARE;

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
                    <label htmlFor="calc-employees" className="text-white/80 text-sm font-medium mb-3 block">
                      {tx.calcLabelEmp} <span className="text-[#52B788] font-[Montserrat] font-bold text-lg">{employees}</span>
                    </label>
                    <input id="calc-employees" type="range" min="5" max="500" step="5" value={employees} onChange={(e) => setEmployees(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #52B788 ${((employees - 5) / 495) * 100}%, #0D2818 ${((employees - 5) / 495) * 100}%)` }}
                    />
                    <div className="flex justify-between text-white/30 text-xs mt-2"><span>5</span><span>500</span></div>
                    <p className="text-white/40 text-xs mt-3 text-center">{tx.calcPerEmpNote}</p>
                  </>
                ) : (
                  <>
                    <label htmlFor="calc-trees" className="text-white/80 text-sm font-medium mb-3 block">
                      {tx.calcLabelTrees} <span className="text-[#52B788] font-[Montserrat] font-bold text-lg">{trees}</span>
                    </label>
                    <input id="calc-trees" type="range" min="5" max="200" step="5" value={trees} onChange={(e) => setTrees(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #52B788 ${((trees - 5) / 195) * 100}%, #0D2818 ${((trees - 5) / 195) * 100}%)` }}
                    />
                    <div className="flex justify-between text-white/30 text-xs mt-2"><span>5</span><span>200</span></div>
                    <p className="text-white/40 text-xs mt-3 text-center">{tx.calcPerTreeNote}</p>
                  </>
                )}
              </div>

              {/* Rechenweg sichtbar machen — nichts passiert in einer Blackbox */}
              <div className="bg-[#52B788]/10 border border-[#52B788]/30 rounded-xl px-4 py-4 mb-6 text-center">
                <p className="font-[Montserrat] font-bold text-base md:text-lg text-white break-words">
                  {mode === 'employees'
                    ? tx.calcFormulaEmp(employees, fmtEur(empAnnual), empTreesPerYear.toLocaleString('de-DE'))
                    : tx.calcFormulaTrees(trees, fmtEur(treeMonthly), fmtEur(treeAnnual))}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: tx.calcMonthly, value: fmtEur(monthly), icon: BarChart3, highlight: true },
                  { label: tx.calcAnnual, value: fmtEur(annual), icon: Receipt, highlight: false },
                  { label: tx.calcTrees, value: treesPerYear.toLocaleString('de-DE'), icon: TreePine, highlight: false },
                  { label: tx.calcCo2, value: `${co2Tonnes.toLocaleString('de-DE', { maximumFractionDigits: 1 })} t`, icon: Leaf, highlight: true },
                ].map((item, i) => (
                  <div key={i} className={`text-center p-4 rounded-xl ${item.highlight ? 'bg-[#52B788]/10 border border-[#52B788]/30' : 'bg-[#1B4332]/40'}`}>
                    <item.icon className="w-5 h-5 text-[#52B788] mx-auto mb-2" />
                    <p className="font-[Montserrat] font-black text-xl md:text-2xl text-white">{item.value}</p>
                    <p className="text-white/40 text-xs mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* ANTI-GREENWASHING: CO₂-Zahl ehrlich einordnen, direkt neben dem Ergebnis */}
              <div className="bg-[#E9C46A]/10 border border-[#E9C46A]/30 rounded-xl p-4 mb-6">
                <p className="flex items-start gap-2 text-[#E9C46A] text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{tx.calcCo2Warn}</span>
                </p>
                <p className="text-white/50 text-xs leading-relaxed mt-2 pl-6">{tx.calcAssumption}</p>
              </div>

              <div className="bg-[#1B4332]/60 border border-[#52B788]/20 rounded-xl p-4 text-center">
                <p className="text-[#B7E4C7] text-sm">
                  <School className="w-4 h-4 inline mr-1.5 mb-0.5 text-[#52B788]" />
                  {tx.calcSchool(fmtEur(schoolTotal))}
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a href="#kontakt" className="inline-flex items-center justify-center gap-2 bg-[#52B788] text-[#0D2818] font-bold px-8 py-3 rounded-xl hover:bg-[#40916C] hover:text-white transition-colors text-center">
                  {mode === 'employees' ? tx.calcCta1(fmtEur(monthly)) : tx.calcCta2(treesPerYear)}
                </a>
                <a href={bookingHref} target={bookingTarget} rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border border-[#52B788]/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#52B788]/10 transition-colors text-center">
                  <CalendarClock className="w-4 h-4" />
                  {tx.callCta}
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
   VOLUMEN-STAFFEL B2B (10 / 50 / 200 Mitarbeiter, Jahresrechnung)
   ════════════════════════════════════════════════════ */
function VolumePricingSection({ tx }: { tx: Tx }) {
  const perEmpYear = PRICE_PER_EMPLOYEE_MONTH * 12; // 144 €
  const tiers = [10, 50, 200].map((emp) => {
    const total = emp * perEmpYear;
    const treesYear = treesFromAnnualBudget(total);
    return { emp, total, treesYear, co2: estimatedCo2Tonnes(treesYear) };
  });

  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]" id="mengenstaffel">
      <div className="container">
        <Sec>
          <div className="text-center mb-12">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.volTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white mb-4">{tx.volH2}</h2>
            <p className="text-[#B7E4C7]/70 max-w-2xl mx-auto">{tx.volBody}</p>
          </div>
        </Sec>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <Sec key={tier.emp}>
              <div className="h-full flex flex-col bg-[#081C15]/70 border border-[#52B788]/20 rounded-2xl p-8">
                <p className="font-[Montserrat] font-black text-4xl text-white">
                  {tier.emp}
                  <span className="text-[#52B788] text-base font-bold ml-2">{tx.volEmployeesLabel}</span>
                </p>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">{tx.volPerEmpMonth}</span>
                    <span className="text-white font-semibold">{fmtEur(PRICE_PER_EMPLOYEE_MONTH)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">{tx.volPerEmpYear}</span>
                    <span className="text-white font-semibold">{fmtEur(perEmpYear)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">{tx.volTreesYear}</span>
                    <span className="text-white font-semibold">{tier.treesYear.toLocaleString('de-DE')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">{tx.volCo2}</span>
                    <span className="text-white/70">
                      ≈ {tier.co2.toLocaleString('de-DE', { maximumFractionDigits: 1 })} t
                    </span>
                  </div>
                </div>
                {/* Rechenweg: pro Mitarbeiter → Gesamt */}
                <p className="text-[#B7E4C7]/60 text-xs mt-5 font-mono">
                  {tx.volMath(tier.emp, fmtEur(perEmpYear), fmtEur(tier.total))}
                </p>
                <div className="mt-4 bg-[#52B788]/10 border border-[#52B788]/30 rounded-xl p-4 text-center">
                  <p className="text-white/50 text-xs">{tx.volTotalYear}</p>
                  <p className="font-[Montserrat] font-black text-2xl text-[#52B788] mt-1">{fmtEur(tier.total)}</p>
                </div>
              </div>
            </Sec>
          ))}
        </div>
        <Sec>
          <div className="max-w-3xl mx-auto mt-10">
            <div className="grid sm:grid-cols-3 gap-4">
              {[tx.volInvoice1, tx.volInvoice2, tx.volInvoice3].map((item, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#081C15]/60 border border-[#52B788]/10 rounded-xl p-4">
                  <Receipt className="w-4 h-4 text-[#52B788] shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-white/35 text-xs mt-6">{tx.volNote}</p>
            <p className="text-center text-white/35 text-xs mt-2">{tx.calcCo2Warn}</p>
            <div className="text-center mt-6">
              <a href="#kontakt" className="inline-flex items-center gap-2 bg-[#52B788] text-[#081C15] font-bold px-8 py-3 rounded-xl hover:bg-[#40916C] hover:text-white transition-colors">
                {tx.volCta}
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Sec>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   SACHZUWENDUNGS-FREIBETRAG (§ 8 Abs. 2 S. 11 EStG)
   ════════════════════════════════════════════════════ */
function TaxBenefitSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#1B4332]" id="sachzuwendung">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <Sec>
            <p className="text-[#E9C46A] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.taxTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white leading-tight mb-6">{tx.taxH2}</h2>
            <p className="text-[#B7E4C7]/80 text-lg leading-relaxed mb-8">{tx.taxBody}</p>
          </Sec>
          <Sec>
            <div className="bg-[#0D2818]/70 border border-[#E9C46A]/20 rounded-2xl p-6 mb-8">
              <div className="flex h-6 rounded-full overflow-hidden bg-[#081C15]">
                <div className="bg-[#52B788] flex items-center justify-center" style={{ width: "24%" }}>
                  <span className="text-[#081C15] text-[10px] font-bold">12 €</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-white/40 text-[10px] font-bold">38 €</span>
                </div>
              </div>
              <p className="text-white/60 text-sm mt-3 text-center">{tx.taxExample}</p>
            </div>
          </Sec>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: tx.tax1Title, desc: tx.tax1Desc },
              { icon: TreePine, title: tx.tax2Title, desc: tx.tax2Desc },
              { icon: Receipt, title: tx.tax3Title, desc: tx.tax3Desc },
            ].map((item, i) => (
              <Sec key={i}>
                <div className="h-full bg-[#0D2818]/60 border border-[#52B788]/10 rounded-2xl p-6">
                  <div className="w-11 h-11 rounded-full bg-[#E9C46A]/15 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-[#E9C46A]" />
                  </div>
                  <h3 className="font-[Montserrat] font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[#B7E4C7]/70 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Sec>
            ))}
          </div>
          <Sec>
            <div className="mt-8 bg-[#081C15]/60 border border-white/10 rounded-xl p-5">
              <p className="text-white/45 text-xs leading-relaxed">{tx.taxDisclaimer}</p>
            </div>
          </Sec>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   REPORTING — was das Unternehmen tatsächlich erhält
   (bewusst OHNE Kompensations-/Zertifikatsversprechen)
   ════════════════════════════════════════════════════ */
function ReportingSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative py-24 md:py-32 bg-[#0D2818]" id="reporting">
      <div className="container">
        <Sec>
          <div className="text-center mb-14">
            <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.repTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-4xl text-white mb-4">{tx.repH2}</h2>
            <p className="text-[#B7E4C7]/70 max-w-2xl mx-auto">{tx.repBody}</p>
          </div>
        </Sec>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Gauge, title: tx.rep1Title, desc: tx.rep1Desc },
            { icon: FileText, title: tx.rep2Title, desc: tx.rep2Desc },
            { icon: BarChart3, title: tx.rep3Title, desc: tx.rep3Desc },
          ].map((item, i) => (
            <Sec key={i}>
              <div className="h-full bg-[#081C15]/70 border border-[#52B788]/15 rounded-2xl p-7">
                <div className="w-12 h-12 rounded-xl bg-[#52B788]/15 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-[#52B788]" />
                </div>
                <h3 className="font-[Montserrat] font-bold text-lg text-white mb-3">{item.title}</h3>
                <p className="text-[#B7E4C7]/70 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </Sec>
          ))}
        </div>
        <Sec>
          <div className="max-w-3xl mx-auto mt-12 bg-[#1B4332]/60 border border-[#E9C46A]/25 rounded-2xl p-7">
            <h3 className="flex items-center gap-2 font-[Montserrat] font-bold text-white mb-4">
              <Shield className="w-5 h-5 text-[#E9C46A]" />
              {tx.repHonestTitle}
            </h3>
            <ul className="space-y-3">
              {[tx.repHonest1, tx.repHonest2, tx.repHonest3].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#E9C46A]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#E9C46A] text-xs font-bold leading-none">–</span>
                  </span>
                  <span className="text-white/70 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[#B7E4C7]/60 text-sm italic mt-5">{tx.repHonestNote}</p>
          </div>
        </Sec>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   15-MINUTEN-CALL CTA
   ════════════════════════════════════════════════════ */
function BookingCtaSection({ tx }: { tx: Tx }) {
  return (
    <section className="relative py-20 md:py-28 bg-[#2D6A4F]" id="call">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <Sec>
            <p className="text-[#B7E4C7] font-[Montserrat] font-semibold text-sm tracking-[0.15em] uppercase mb-4">{tx.callTag}</p>
            <h2 className="font-[Montserrat] font-black text-3xl md:text-5xl text-white leading-tight mb-6">{tx.callH2}</h2>
            <p className="text-white/75 text-lg leading-relaxed mb-8">{tx.callBody}</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
              {[tx.callBullet1, tx.callBullet2, tx.callBullet3].map((item, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#081C15]/40 border border-white/10 rounded-xl p-4">
                  <Check className="w-4 h-4 text-[#B7E4C7] shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            {/* TODO-DANIEL: Calendly/cal.com Link hier einsetzen — siehe BOOKING_URL oben in dieser Datei.
                Solange BOOKING_URL leer ist, greift der mailto-Fallback. */}
            <a
              href={bookingHref}
              target={bookingTarget}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#E9C46A] text-[#081C15] font-[Montserrat] font-bold text-base md:text-lg px-10 py-5 rounded-2xl shadow-xl shadow-black/25 hover:bg-[#f0d288] transition-colors"
            >
              <CalendarClock className="w-5 h-5" />
              {tx.callCta}
            </a>
            <p className="flex items-center justify-center gap-2 text-white/50 text-sm mt-5">
              <Mail className="w-4 h-4" />
              {tx.callAlt}
            </p>
          </Sec>
        </div>
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
        ? ["GPS-Verifizierung", "Transparenz-Report", "Impact-Dokumentation"]
        : lang === "en"
        ? ["GPS verification", "Transparency report", "Impact documentation"]
        : ["Verificación GPS", "Informe de transparencia", "Documentación de impacto"],
      highlight: false, salesLed: false,
    },
    {
      id: "b2bStarter", name: "Starter", subtitle: "",
      priceMonthly: 149, priceYearly: 1519, trees: lang === "de" ? "6 Bäume / Monat" : lang === "en" ? "6 trees / month" : "6 árboles / mes",
      desc: lang === "de" ? "Perfekt für kleine Teams und den Einstieg in nachhaltiges CSR." : lang === "en" ? "Perfect for small teams starting sustainable CSR." : "Perfecto para equipos pequeños que comienzan en CSR.",
      features: lang === "de"
        ? ["6 GPS-getrackte Bäume", "Firmen-Dashboard", "Monatlicher Impact-Report", "Datenexport fürs Nachhaltigkeitsreporting", "Individueller Firmen-Bereich", "Logo auf Transparenz-Seite"]
        : lang === "en"
        ? ["6 GPS-tracked trees", "Company dashboard", "Monthly impact report", "Data export for sustainability reporting", "Individual company area", "Logo on transparency page"]
        : ["6 árboles rastreados por GPS", "Panel de empresa", "Informe de impacto mensual", "Exportación de datos para el informe de sostenibilidad", "Área individual de empresa", "Logo en página de transparencia"],
      highlight: true, salesLed: false,
    },
    {
      id: "b2bBusiness", name: "Business", subtitle: "",
      priceMonthly: 499, priceYearly: 5089, trees: lang === "de" ? "20 Bäume / Monat" : lang === "en" ? "20 trees / month" : "20 árboles / mes",
      desc: lang === "de" ? "Für Unternehmen, die CSR ernst nehmen und Mitarbeiter einbinden." : lang === "en" ? "For companies serious about CSR and employee engagement." : "Para empresas que toman el CSR en serio e involucran a su equipo.",
      features: lang === "de"
        ? ["20 GPS-getrackte Bäume", "Personalisiertes Firmen-Dashboard", "Wöchentliche Updates & Fotos", "Mitarbeiter-Engagement-Toolkit", "API-Zugang", "Monatlicher Impact-Bericht", "Account Manager"]
        : lang === "en"
        ? ["20 GPS-tracked trees", "Personalized company dashboard", "Weekly updates & photos", "Employee engagement toolkit", "API access", "Monthly impact report", "Account manager"]
        : ["20 árboles rastreados por GPS", "Panel personalizado de empresa", "Actualizaciones semanales y fotos", "Kit de participación de empleados", "Acceso API", "Informe de impacto mensual", "Account manager"],
      highlight: false, salesLed: false,
    },
    {
      id: "b2bEnterprise", name: "Enterprise", subtitle: "",
      priceMonthly: null as number | null, priceYearly: null as number | null,
      trees: lang === "de" ? "50+ Bäume / Monat" : lang === "en" ? "50+ trees / month" : "50+ árboles / mes",
      desc: lang === "de" ? "Maßgeschneiderte Lösungen für große Organisationen." : lang === "en" ? "Custom solutions for large organizations." : "Soluciones a medida para grandes organizaciones.",
      features: lang === "de"
        ? ["50+ GPS-getrackte Bäume", "White-Label Dashboard", "Vor-Ort-Besuche in Guatemala", "Datenaufbereitung für Ihr CSRD/ESRS-Reporting", "PR & Medien-Paket", "Exklusiver Schulpate"]
        : lang === "en"
        ? ["50+ GPS-tracked trees", "White-label dashboard", "On-site visits in Guatemala", "Data prepared to feed your CSRD/ESRS reporting", "PR & media package", "Exclusive school sponsor"]
        : ["50+ árboles rastreados por GPS", "Panel white-label", "Visitas in situ en Guatemala", "Datos preparados para su reporte CSRD/ESRS", "Paquete PR y medios", "Patrocinador exclusivo de la escuela"],
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
              {/* Bewusst ohne erfundene Prozentzahlen — nur überprüfbare Leistungen. */}
              {[
                { icon: TreePine, label: tx.empStat1 },
                { icon: Receipt, label: tx.empStat2 },
                { icon: MapPin, label: tx.empStat3 },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-6 h-6 text-[#E9C46A] mx-auto mb-2" />
                  <p className="text-white/60 text-xs mt-1 leading-relaxed">{stat.label}</p>
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
function ContactSection({ tx, lang }: { tx: Tx; lang: Lang }) {
  const [formData, setFormData] = useState({ name: "", email: "", company: "", employees: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Feldnamen werden auf das Schema von /api/corporate gemappt:
     companyName, contactName, email, employees (Pflicht) + country, phone, message (optional) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.company,
          contactName: formData.name,
          email: formData.email,
          employees: formData.employees,
          country: lang === "de" ? "Deutschland" : lang === "es" ? "—" : "—",
          phone: "",
          message: formData.message,
        }),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data: { success?: boolean; error?: string } = await res.json();
      if (!data.success) throw new Error(data.error || "Unknown error");
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Corporate contact form submit failed:", err);
      setError(tx.formError);
    } finally {
      setSending(false);
    }
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
                    <label className="text-white/60 text-sm mb-1.5 block">{tx.formEmployeesRequired}</label>
                    <select required value={formData.employees} onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
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
                {error && (
                  <div role="alert" className="flex items-start gap-2 bg-[#E76F51]/10 border border-[#E76F51]/40 rounded-lg px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
                    <span className="text-[#E76F51] text-sm leading-relaxed">{error}</span>
                  </div>
                )}
                <Button type="submit" size="lg" disabled={sending} className="w-full bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-bold text-base py-6 shadow-xl shadow-[#52B788]/20 disabled:opacity-60">
                  {sending ? tx.formSending : tx.formCta}
                  {!sending && <ChevronRight className="ml-2 w-5 h-5" />}
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
      <VolumePricingSection tx={tx} />
      <TaxBenefitSection tx={tx} />
      <ReportingSection tx={tx} />
      <BookingCtaSection tx={tx} />
      <EmployerBrandingSection tx={tx} />
      <FounderSection tx={tx} />
      <ContactSection tx={tx} lang={lang} />
      <PageFooter tx={tx} />
    </main>
  );
}
