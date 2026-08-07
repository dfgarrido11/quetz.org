/**
 * Zentrale rechtliche Stammdaten für Impressum (§ 5 TMG / § 18 MStV)
 * und Datenschutzerklärung (Art. 13/14 DSGVO).
 *
 * WICHTIG: Diese Datei ist die EINZIGE Quelle der Wahrheit. /impressum und
 * /datenschutz lesen beide hier, damit die Angaben nicht auseinanderlaufen.
 *
 * ⚠️  ALLE mit `TODO-DANIEL` markierten Felder sind absichtlich leer.
 *     Es dürfen KEINE erfundenen Daten eingetragen werden — nur die echten
 *     Angaben aus Gewerbeanmeldung / Handelsregisterauszug / Finanzamt.
 *     Solange ein Pflichtfeld leer ist, zeigt die Seite einen sichtbaren
 *     Hinweis statt einer Falschangabe.
 */

export interface LegalEntity {
  /** Marken-/Auftrittsname (kein Pflichtfeld, immer gesetzt) */
  brandName: string;
  /** TODO-DANIEL: Vollständiger rechtlicher Name INKL. Rechtsform, exakt wie in
   *  Gewerbeanmeldung/Handelsregister. Beispielform: "Vorname Nachname" bei
   *  Einzelunternehmen, sonst "<Firma> GmbH" / "<Verein> e.V." / "<Firma> UG (haftungsbeschränkt)". */
  legalName: string;
  /** TODO-DANIEL: Rechtsform ausgeschrieben, falls nicht schon in legalName enthalten
   *  (z.B. "Einzelunternehmen", "GmbH", "eingetragener Verein", "gGmbH"). Sonst leer lassen. */
  legalForm: string;
  /** TODO-DANIEL: Ladungsfähige Anschrift — Straße und Hausnummer.
   *  Postfach ist NICHT zulässig (§ 5 Abs. 1 Nr. 1 TMG). */
  street: string;
  /** TODO-DANIEL: PLZ (z.B. "10115") */
  postalCode: string;
  /** TODO-DANIEL: Ort (z.B. "Berlin") */
  city: string;
  /** TODO-DANIEL: Land des Firmensitzes (z.B. "Deutschland"). Der Sitz bestimmt
   *  die zuständige Aufsichtsbehörde — bitte konsistent zu supervisoryAuthority. */
  country: string;
  /** TODO-DANIEL: Nur bei juristischen Personen (GmbH/UG/e.V./gGmbH) Pflicht:
   *  Name des/der Vertretungsberechtigten (Geschäftsführer:in / Vorstand).
   *  Bei Einzelunternehmen leer lassen. */
  represented: string;
  /** TODO-DANIEL: Nur falls im Register eingetragen: Registergericht
   *  (z.B. "Amtsgericht Charlottenburg"). Sonst leer lassen. */
  registerCourt: string;
  /** TODO-DANIEL: Nur falls eingetragen: Registerart + Nummer
   *  (z.B. "HRB 123456" / "VR 12345"). Sonst leer lassen. */
  registerNumber: string;
  /** TODO-DANIEL: USt-IdNr. gemäß § 27a UStG (Format "DE123456789"), falls vorhanden.
   *  Bei Kleinunternehmerregelung (§ 19 UStG) leer lassen — siehe smallBusinessNote. */
  vatId: string;
  /** TODO-DANIEL: Auf `true` setzen, wenn die Kleinunternehmerregelung nach
   *  § 19 UStG greift (dann wird statt der USt-IdNr. ein entsprechender Hinweis gezeigt). */
  isSmallBusiness: boolean;
  /** TODO-DANIEL: Inhaltlich Verantwortliche:r nach § 18 Abs. 2 MStV.
   *  Muss eine natürliche Person mit Wohnsitz in Deutschland/EU sein.
   *  Leer lassen, wenn identisch mit `represented`/`legalName` — dann wird dieser Wert genutzt. */
  contentResponsible: string;
  /** TODO-DANIEL: Anschrift des/der inhaltlich Verantwortlichen, falls abweichend
   *  von der Firmenanschrift. Sonst leer lassen. */
  contentResponsibleAddress: string;
  /** Kontakt — bereits belegt, § 5 Abs. 1 Nr. 2 TMG erfüllt */
  email: string;
  /** TODO-DANIEL: OPTIONAL. Telefonnummer ist keine Pflicht, solange eine
   *  schnelle elektronische Kontaktaufnahme möglich ist (EuGH C-298/07).
   *  Wenn vorhanden, hier eintragen. */
  phone: string;
  website: string;
  websiteUrl: string;
}

export const LEGAL: LegalEntity = {
  brandName: 'QUETZ',
  legalName: '',
  legalForm: '',
  street: '',
  postalCode: '',
  city: '',
  country: '',
  represented: '',
  registerCourt: '',
  registerNumber: '',
  vatId: '',
  isSmallBusiness: false,
  contentResponsible: '',
  contentResponsibleAddress: '',
  email: 'admin@quetz.org',
  phone: '',
  website: 'quetz.org',
  websiteUrl: 'https://quetz.org',
};

/**
 * Datenschutz-spezifische Angaben.
 */
export interface PrivacyConfig {
  /** TODO-DANIEL: Ist ein Datenschutzbeauftragter erforderlich?
   *  Pflicht nach Art. 37 DSGVO i.V.m. § 38 BDSG, wenn
   *  (a) i.d.R. mind. 20 Personen ständig mit automatisierter Verarbeitung
   *      personenbezogener Daten beschäftigt sind, ODER
   *  (b) Kerntätigkeit = umfangreiche regelmäßige Überwachung / besondere
   *      Datenkategorien (Art. 9), ODER
   *  (c) eine Datenschutz-Folgenabschätzung nach Art. 35 nötig ist.
   *  Bei QUETZ derzeit vermutlich NICHT erforderlich — bitte prüfen und
   *  `dpoRequired` entsprechend setzen. */
  dpoRequired: boolean;
  /** TODO-DANIEL: Nur ausfüllen, wenn dpoRequired = true.
   *  Name bzw. Firma des/der Datenschutzbeauftragten. */
  dpoName: string;
  /** TODO-DANIEL: Nur ausfüllen, wenn dpoRequired = true. Kontakt-E-Mail des DSB. */
  dpoEmail: string;
  /** TODO-DANIEL: Zuständige Datenschutz-Aufsichtsbehörde nach Sitz des
   *  Verantwortlichen, z.B. "Berliner Beauftragte für Datenschutz und
   *  Informationsfreiheit". Solange leer, wird generisch auf die
   *  Behördenliste des BfDI verwiesen. */
  supervisoryAuthority: string;
  /** TODO-DANIEL: Website der zuständigen Aufsichtsbehörde (volle URL). */
  supervisoryAuthorityUrl: string;
  /** Datenschutz-Kontaktadresse (Betroffenenanfragen) */
  privacyContactEmail: string;
}

export const PRIVACY: PrivacyConfig = {
  dpoRequired: false,
  dpoName: '',
  dpoEmail: '',
  supervisoryAuthority: '',
  supervisoryAuthorityUrl: '',
  privacyContactEmail: 'admin@quetz.org',
};

/** Stand-Datum, das auf beiden Rechtsseiten angezeigt wird. */
export const LEGAL_LAST_UPDATED = 'August 2026';

/** Hinweis, der anstelle eines noch nicht hinterlegten Pflichtfelds erscheint. */
export const LEGAL_PENDING_REQUIRED =
  'Diese Pflichtangabe wird derzeit ergänzt. Bitte fordern Sie sie bis dahin per E-Mail an admin@quetz.org an — wir senden sie Ihnen unverzüglich zu.';

/** Hinweis für Angaben, die nur unter bestimmten Voraussetzungen zu machen sind. */
export const LEGAL_PENDING_CONDITIONAL =
  'Sofern diese Angabe für uns einschlägig ist, wird sie hier ergänzt. Anfragen bitte an admin@quetz.org.';

/** true, wenn ein Feld tatsächlich befüllt ist (und nicht nur Leerzeichen enthält). */
export function isFilled(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Vollständige Anschrift als Zeilen-Array — nur befüllte Zeilen. */
export function addressLines(entity: LegalEntity = LEGAL): string[] {
  const cityLine = [entity.postalCode, entity.city].filter(isFilled).join(' ').trim();
  return [entity.street, cityLine, entity.country].filter(isFilled);
}

/** true, wenn die ladungsfähige Anschrift vollständig ist. */
export function hasCompleteAddress(entity: LegalEntity = LEGAL): boolean {
  return isFilled(entity.street) && isFilled(entity.postalCode) && isFilled(entity.city);
}

/** Registereintrag als Anzeigetext, oder null wenn nicht hinterlegt. */
export function registerEntry(entity: LegalEntity = LEGAL): string | null {
  const parts = [entity.registerCourt, entity.registerNumber].filter(isFilled);
  return parts.length > 0 ? parts.join(', ') : null;
}

/** Name des/der inhaltlich Verantwortlichen nach § 18 Abs. 2 MStV. */
export function contentResponsibleName(entity: LegalEntity = LEGAL): string | null {
  if (isFilled(entity.contentResponsible)) return entity.contentResponsible;
  if (isFilled(entity.represented)) return entity.represented;
  if (isFilled(entity.legalName)) return entity.legalName;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auftragsverarbeiter / Empfänger
// Ermittelt aus dem tatsächlichen Code-Bestand (Dockerfile/Railway-Deployment,
// app/components/google-analytics.tsx, app/components/meta-pixel.tsx,
// lib/stripe.ts, lib/email.ts (Resend), lib/hubspot.ts, app/api/chat/route.ts
// (Anthropic), app/api/gelato/*, app/api/stripe/webhook (Telegram),
// app/globals.css (Google Fonts)).
// ─────────────────────────────────────────────────────────────────────────────

export interface Processor {
  name: string;
  purpose: string;
  /** Sitz / Ort der Verarbeitung */
  location: string;
  /** true = Datenübermittlung in ein Drittland außerhalb EU/EWR */
  thirdCountry: boolean;
  /** Garantie für die Drittlandübermittlung (Art. 44 ff. DSGVO) */
  safeguard: string;
  legalBasis: string;
  privacyUrl: string;
}

export const PROCESSORS: Processor[] = [
  {
    name: 'Railway Corporation',
    purpose:
      'Hosting der Website und der Anwendung, Betrieb der PostgreSQL-Datenbank, Server-Logfiles',
    location: 'USA (Rechenzentrumsregion siehe Hinweis unten)',
    thirdCountry: true,
    safeguard: 'Auftragsverarbeitungsvertrag mit EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. b und lit. f DSGVO',
    privacyUrl: 'https://railway.com/legal/privacy',
  },
  {
    name: 'Cloudflare, Inc.',
    purpose:
      'Content Delivery Network, DNS, Schutz vor Angriffen (DDoS/Bot), TLS-Terminierung',
    location: 'USA / weltweites Edge-Netz',
    thirdCountry: true,
    safeguard: 'EU-US Data Privacy Framework sowie EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. f DSGVO (sicherer und performanter Betrieb)',
    privacyUrl: 'https://www.cloudflare.com/privacypolicy/',
  },
  {
    name: 'Stripe Payments Europe, Ltd. (Irland) / Stripe, Inc. (USA)',
    purpose:
      'Abwicklung von Zahlungen, Abonnements und Rückerstattungen (Name, E-Mail, Zahlungs- und Rechnungsdaten)',
    location: 'Irland, USA',
    thirdCountry: true,
    safeguard: 'EU-US Data Privacy Framework sowie EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)',
    privacyUrl: 'https://stripe.com/de/privacy',
  },
  {
    name: 'Resend (Plus Five Five, Inc.)',
    purpose:
      'Versand von Transaktions- und Systemmails (Bestätigungen, Zertifikate, Newsletter): E-Mail-Adresse, Name, Inhalt der Nachricht, Zustellstatus',
    location: 'USA',
    thirdCountry: true,
    safeguard: 'Auftragsverarbeitungsvertrag mit EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. a und lit. b DSGVO',
    privacyUrl: 'https://resend.com/legal/privacy-policy',
  },
  {
    name: 'Google Ireland Limited / Google LLC',
    purpose:
      'Google Analytics 4 (Reichweitenmessung, nur nach Einwilligung) sowie Auslieferung der Schriftart "Inter" über Google Fonts',
    location: 'Irland, USA',
    thirdCountry: true,
    safeguard: 'EU-US Data Privacy Framework sowie EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), § 25 Abs. 1 TDDDG',
    privacyUrl: 'https://policies.google.com/privacy',
  },
  {
    name: 'Meta Platforms Ireland Limited',
    purpose:
      'Meta-Pixel: Messung von Kampagnenerfolg und Reichweite, Bildung von Zielgruppen (nur nach Einwilligung)',
    location: 'Irland, USA',
    thirdCountry: true,
    safeguard: 'EU-US Data Privacy Framework sowie EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), § 25 Abs. 1 TDDDG',
    privacyUrl: 'https://www.facebook.com/privacy/policy',
  },
  {
    name: 'Anthropic PBC',
    purpose:
      'Betrieb unseres Chat-Assistenten „Quetzito“ (Claude-API): Verarbeitung der von Ihnen eingegebenen Chat-Nachrichten zur Erzeugung der Antwort',
    location: 'USA',
    thirdCountry: true,
    safeguard: 'Auftragsverarbeitungsvertrag mit EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. f DSGVO (Beantwortung Ihrer Anfrage)',
    privacyUrl: 'https://www.anthropic.com/legal/privacy',
  },
  {
    name: 'Gelato ASA',
    purpose:
      'Druck und Versand physischer Adoptions-Zertifikate und Geschenkprodukte: Name, Lieferanschrift, E-Mail, ggf. Telefonnummer',
    location: 'Norwegen (EWR), Produktion über lokale Partner weltweit',
    thirdCountry: false,
    safeguard:
      'Verarbeitung innerhalb des EWR; bei Produktion außerhalb des EWR EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)',
    privacyUrl: 'https://www.gelato.com/legal/privacy-policy',
  },
  {
    name: 'HubSpot Ireland Limited / HubSpot, Inc.',
    purpose:
      'CRM für Geschäftskunden-Anfragen (B2B/CSR): Name, Firma, E-Mail, Telefon, Anfrageinhalt. Betrifft ausschließlich Firmenkontakte, nicht Privatadoptionen.',
    location: 'Irland, USA',
    thirdCountry: true,
    safeguard: 'EU-US Data Privacy Framework sowie EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. b und lit. f DSGVO (Anbahnung/Erfüllung von Geschäftsbeziehungen)',
    privacyUrl: 'https://legal.hubspot.com/de/privacy-policy',
  },
  {
    name: 'Telegram FZ-LLC',
    purpose:
      'Interne Sofortbenachrichtigung unseres Teams über neue Bestellungen. Übermittelt werden Name und E-Mail-Adresse der Kundin/des Kunden sowie der Bestellbetrag.',
    location: 'Vereinigte Arabische Emirate',
    thirdCountry: true,
    safeguard: 'EU-Standardvertragsklauseln (SCC)',
    legalBasis: 'Art. 6 Abs. 1 lit. f DSGVO (zeitnahe Auftragsbearbeitung)',
    privacyUrl: 'https://telegram.org/privacy',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Speicherdauer je Datenkategorie
// ─────────────────────────────────────────────────────────────────────────────

export interface RetentionRule {
  category: string;
  duration: string;
  reason: string;
}

export const RETENTION: RetentionRule[] = [
  {
    category: 'Server-Logfiles (IP-Adresse, Zeitstempel, User-Agent, angefragte URL)',
    duration: 'maximal 30 Tage, danach automatische Löschung',
    reason: 'Sicherstellung des Betriebs und Abwehr von Angriffen',
  },
  {
    category: 'Kunden- und Adoptionsdaten (Name, E-Mail, Adoptionen, Bäume, Zertifikate)',
    duration: 'für die Dauer der Adoption bzw. des Abonnements und danach bis zum Ablauf der handels- und steuerrechtlichen Aufbewahrungsfristen',
    reason: 'Vertragserfüllung; anschließend § 147 AO / § 257 HGB',
  },
  {
    category: 'Rechnungs-, Zahlungs- und Buchungsdaten',
    duration: '10 Jahre ab Ende des Kalenderjahres der Rechnungsstellung',
    reason: '§ 147 Abs. 3 AO, § 257 Abs. 4 HGB',
  },
  {
    category: 'Newsletter-Anmeldung (E-Mail-Adresse, Einwilligungsnachweis)',
    duration: 'bis zum Widerruf der Einwilligung bzw. zur Abmeldung; der Einwilligungsnachweis danach bis zu 3 Jahre',
    reason: 'Art. 7 Abs. 1 DSGVO (Nachweispflicht), Verjährungsfristen',
  },
  {
    category: 'Kontaktanfragen per E-Mail und Firmenkunden-Formular',
    duration: 'bis zur abschließenden Bearbeitung, längstens 24 Monate — sofern keine gesetzliche Aufbewahrungspflicht besteht',
    reason: 'Bearbeitung Ihrer Anfrage, anschließende Nachvollziehbarkeit',
  },
  {
    category: 'Chat-Nachrichten an „Quetzito“',
    duration: 'werden von uns nicht dauerhaft gespeichert; die Verarbeitung erfolgt nur zur Beantwortung. Nur technische Fehlermeldungen werden bis zu 90 Tage protokolliert.',
    reason: 'Beantwortung Ihrer Anfrage, Fehleranalyse',
  },
  {
    category: 'Einwilligungs-Einstellungen (Cookie-Banner)',
    duration: 'bis zum Löschen durch Sie im Browser (lokal in Ihrem Gerät gespeichert)',
    reason: 'Nachweis und Respektierung Ihrer Auswahl',
  },
  {
    category: 'Sprachauswahl-Cookie „quetz_lang“',
    duration: '12 Monate',
    reason: 'Anzeige der Website in Ihrer bevorzugten Sprache',
  },
  {
    category: 'Analyse- und Marketing-Cookies (Google Analytics, Meta-Pixel)',
    duration: 'anbieterabhängig, in der Regel bis zu 14 Monate — Löschung durch Widerruf der Einwilligung jederzeit möglich',
    reason: 'Reichweitenmessung, Kampagnenerfolg',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Cookies / lokale Speicherung — aus dem Code ermittelt
// (app/components/cookie-banner.tsx, lib/language-context.tsx)
// ─────────────────────────────────────────────────────────────────────────────

export interface CookieEntry {
  name: string;
  type: 'Notwendig' | 'Analyse' | 'Marketing';
  storage: string;
  purpose: string;
  duration: string;
}

export const COOKIES: CookieEntry[] = [
  {
    name: 'quetz_cookie_consent',
    type: 'Notwendig',
    storage: 'localStorage',
    purpose: 'Speichert Ihre Auswahl im Cookie-Banner, damit dieser nicht erneut erscheint und nicht eingewilligte Dienste unterbleiben.',
    duration: 'bis zur Löschung durch Sie',
  },
  {
    name: 'quetz_lang',
    type: 'Notwendig',
    storage: 'Cookie',
    purpose: 'Speichert die von Ihnen gewählte bzw. aus den Browsereinstellungen erkannte Sprache (de/es/en/fr/ar).',
    duration: '12 Monate',
  },
  {
    name: 'next-auth.session-token, next-auth.csrf-token',
    type: 'Notwendig',
    storage: 'Cookie',
    purpose: 'Anmeldung am Nutzerkonto/Dashboard und Schutz vor Cross-Site-Request-Forgery.',
    duration: 'Sitzung bzw. bis zur Abmeldung',
  },
  {
    name: 'Warenkorb-Daten',
    type: 'Notwendig',
    storage: 'localStorage',
    purpose: 'Merkt sich die von Ihnen ausgewählten Bäume und Pläne bis zum Abschluss der Bestellung.',
    duration: 'bis zur Löschung durch Sie',
  },
  {
    name: '_ga, _ga_*',
    type: 'Analyse',
    storage: 'Cookie',
    purpose: 'Google Analytics 4: Unterscheidung von Besucher:innen und Messung der Seitennutzung. Wird nur bei Ihrer Einwilligung gesetzt.',
    duration: 'bis zu 14 Monate',
  },
  {
    name: '_fbp',
    type: 'Marketing',
    storage: 'Cookie',
    purpose: 'Meta-Pixel: Zuordnung von Website-Aktionen zu Werbekampagnen. Wird nur bei Ihrer Einwilligung gesetzt.',
    duration: 'bis zu 3 Monate',
  },
  {
    name: '__cf_bm, cf_clearance',
    type: 'Notwendig',
    storage: 'Cookie',
    purpose: 'Cloudflare: Unterscheidung von Menschen und Bots, Schutz vor missbräuchlichen Zugriffen.',
    duration: 'bis zu 30 Minuten bzw. bis zu 12 Monate',
  },
];
