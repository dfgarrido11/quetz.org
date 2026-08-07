import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  COOKIES,
  LEGAL,
  LEGAL_LAST_UPDATED,
  LEGAL_PENDING_REQUIRED,
  PRIVACY,
  PROCESSORS,
  RETENTION,
  addressLines,
  hasCompleteAddress,
  isFilled,
} from '@/lib/legal';

function PendingRequired({ children }: { children?: React.ReactNode }) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
      <p>
        {children ?? LEGAL_PENDING_REQUIRED}{' '}
        <a href={`mailto:${LEGAL.email}`} className="font-medium underline">
          {LEGAL.email}
        </a>
      </p>
    </div>
  );
}

const LEGAL_BASES = [
  {
    purpose: 'Bereitstellung der Website, Server-Logfiles, IT-Sicherheit',
    basis: 'Art. 6 Abs. 1 lit. f DSGVO',
    detail:
      'Berechtigtes Interesse an einem stabilen, sicheren und missbrauchsfreien Betrieb unseres Angebots.',
  },
  {
    purpose: 'Baum-Adoption, Abonnement, Geschenkbestellung, Zahlungsabwicklung, Versand von Zertifikaten',
    basis: 'Art. 6 Abs. 1 lit. b DSGVO',
    detail: 'Erfüllung des mit Ihnen geschlossenen Vertrags bzw. vorvertragliche Maßnahmen.',
  },
  {
    purpose: 'Nutzerkonto und Adoptions-Dashboard',
    basis: 'Art. 6 Abs. 1 lit. b DSGVO',
    detail: 'Bereitstellung der von Ihnen angeforderten Funktionen Ihres Kontos.',
  },
  {
    purpose: 'Rechnungsstellung, Buchhaltung, steuerliche Aufbewahrung',
    basis: 'Art. 6 Abs. 1 lit. c DSGVO',
    detail: 'Erfüllung rechtlicher Verpflichtungen nach § 147 AO und § 257 HGB.',
  },
  {
    purpose: 'Newsletter-Versand',
    basis: 'Art. 6 Abs. 1 lit. a DSGVO',
    detail: 'Ihre ausdrückliche Einwilligung, die Sie jederzeit mit Wirkung für die Zukunft widerrufen können.',
  },
  {
    purpose: 'Analyse-Cookies (Google Analytics) und Marketing-Cookies (Meta-Pixel)',
    basis: 'Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG',
    detail:
      'Ihre über den Cookie-Banner erteilte Einwilligung. Ohne Einwilligung findet keine Analyse- oder Marketingmessung statt.',
  },
  {
    purpose: 'Beantwortung von Kontaktanfragen und Chat-Anfragen an „Quetzito“',
    basis: 'Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO',
    detail:
      'Bearbeitung Ihrer Anfrage; bei vertragsbezogenen Anfragen zur Vertragsanbahnung oder -erfüllung.',
  },
  {
    purpose: 'Anfragen von Unternehmen (CSR-/Firmengeschenk-Formulare), Übermittlung an unser CRM',
    basis: 'Art. 6 Abs. 1 lit. b und lit. f DSGVO',
    detail:
      'Anbahnung und Verwaltung von Geschäftsbeziehungen; berechtigtes Interesse an geordneter Nachverfolgung geschäftlicher Anfragen.',
  },
];

export default function DatenschutzPage() {
  const address = addressLines();

  return (
    <div className="min-h-screen bg-quetz-cream">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-quetz-green">
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Datenschutzerklärung</h1>
        <p className="text-gray-600 mb-8">
          Informationen zur Verarbeitung personenbezogener Daten gemäß Art. 12 bis 14 DSGVO
        </p>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-10 text-gray-700">
          {/* 1 ─ Verantwortlicher */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Verantwortlicher im Sinne der DSGVO
            </h2>
            <p className="mb-3">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p className="font-medium text-gray-900">{LEGAL.brandName}</p>
            {isFilled(LEGAL.legalName) && <p>{LEGAL.legalName}</p>}
            {hasCompleteAddress() && (
              <address className="not-italic">
                {address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            )}
            <p className="mt-2">
              E-Mail:{' '}
              <a href={`mailto:${LEGAL.email}`} className="text-quetz-green hover:underline">
                {LEGAL.email}
              </a>
            </p>
            {isFilled(LEGAL.phone) && <p>Telefon: {LEGAL.phone}</p>}

            {(!isFilled(LEGAL.legalName) || !hasCompleteAddress()) && (
              <div className="mt-4">
                <PendingRequired>
                  Der vollständige Name und die Anschrift des Verantwortlichen werden derzeit
                  ergänzt und sind identisch mit den Angaben im Impressum. Bitte fordern Sie sie bis
                  dahin per E-Mail an
                </PendingRequired>
              </div>
            )}

            <p className="mt-4 text-sm text-gray-600">
              Dieselben Angaben finden Sie in unserem{' '}
              <Link href="/impressum" className="text-quetz-green hover:underline">
                Impressum
              </Link>
              .
            </p>
          </section>

          {/* 2 ─ Datenschutzbeauftragter */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Datenschutzbeauftragter</h2>
            {PRIVACY.dpoRequired && isFilled(PRIVACY.dpoName) ? (
              <p>
                Unser Datenschutzbeauftragter ist {PRIVACY.dpoName}
                {isFilled(PRIVACY.dpoEmail) && (
                  <>
                    , erreichbar unter{' '}
                    <a
                      href={`mailto:${PRIVACY.dpoEmail}`}
                      className="text-quetz-green hover:underline"
                    >
                      {PRIVACY.dpoEmail}
                    </a>
                  </>
                )}
                .
              </p>
            ) : PRIVACY.dpoRequired ? (
              <PendingRequired>
                Die Kontaktdaten unseres Datenschutzbeauftragten werden derzeit ergänzt. Bis dahin
                erreichen Sie uns in allen Datenschutzfragen unter
              </PendingRequired>
            ) : (
              <p>
                Wir sind gesetzlich nicht zur Benennung eines Datenschutzbeauftragten verpflichtet
                (Art. 37 DSGVO i.V.m. § 38 BDSG). Alle Anliegen zum Datenschutz richten Sie bitte
                an{' '}
                <a
                  href={`mailto:${PRIVACY.privacyContactEmail}`}
                  className="text-quetz-green hover:underline"
                >
                  {PRIVACY.privacyContactEmail}
                </a>
                .
              </p>
            )}
          </section>

          {/* 3 ─ Welche Daten */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Welche Daten wir verarbeiten
            </h2>

            <h3 className="font-medium text-gray-900 mt-4 mb-2">3.1 Server-Logfiles</h3>
            <p>
              Beim Aufruf unserer Website werden automatisch Informationen an den Server
              übermittelt und in Logfiles gespeichert: IP-Adresse, Datum und Uhrzeit des Zugriffs,
              aufgerufene URL, übertragene Datenmenge, Referrer-URL, verwendeter Browser und
              Betriebssystem. Diese Daten sind technisch erforderlich, um Ihnen die Website
              auszuliefern, und dienen der Sicherheit und Stabilität unseres Angebots. Eine
              Zusammenführung mit anderen Datenquellen findet nicht statt.
            </p>

            <h3 className="font-medium text-gray-900 mt-4 mb-2">
              3.2 Baum-Adoption, Abonnement und Geschenkbestellung
            </h3>
            <p>
              Wenn Sie einen Baum adoptieren, ein Abonnement abschließen oder ein Geschenk
              bestellen, verarbeiten wir: Vor- und Nachname, E-Mail-Adresse, Land, bei physischem
              Versand zusätzlich Lieferanschrift und ggf. Telefonnummer, sowie Bestell-, Zahlungs-
              und Abonnementdaten, die zugeordneten Bäume und die von Ihnen gewählten Optionen
              (z.B. Widmung eines Geschenkbaums). Die vollständigen Kartendaten erhalten wir nicht;
              diese werden ausschließlich von unserem Zahlungsdienstleister verarbeitet.
            </p>

            <h3 className="font-medium text-gray-900 mt-4 mb-2">3.3 Nutzerkonto und Dashboard</h3>
            <p>
              Für Ihr Konto speichern wir E-Mail-Adresse, Name, ein gehashtes Passwort bzw. die
              Zuordnung zu Ihrem Login-Anbieter sowie Ihre Adoptionen und Sitzungsdaten.
            </p>

            <h3 className="font-medium text-gray-900 mt-4 mb-2">3.4 Kontakt und Newsletter</h3>
            <p>
              Wenn Sie uns per E-Mail oder Formular kontaktieren oder sich für unseren Newsletter
              anmelden, verarbeiten wir die von Ihnen angegebenen Daten (mindestens E-Mail-Adresse,
              ggf. Name, Firma und Nachrichtentext) sowie den Nachweis Ihrer Einwilligung
              (Zeitpunkt der Anmeldung).
            </p>

            <h3 className="font-medium text-gray-900 mt-4 mb-2">
              3.5 Chat-Assistent „Quetzito“
            </h3>
            <p>
              Unsere Website bietet einen KI-gestützten Chat-Assistenten an. Die von Ihnen
              eingegebenen Nachrichten werden zur Erzeugung einer Antwort an unseren
              Auftragsverarbeiter Anthropic PBC (USA) übermittelt. Wir speichern die Chatverläufe
              nicht dauerhaft; lediglich technische Fehlermeldungen werden zur Fehleranalyse
              protokolliert. <strong>Bitte geben Sie im Chat keine sensiblen personenbezogenen
              Daten ein</strong> (z.B. Gesundheitsdaten, Zahlungsdaten oder Passwörter). Der Chat
              wird ausschließlich zur Beantwortung Ihrer Fragen verwendet und nicht zum Training
              von KI-Modellen freigegeben.
            </p>

            <h3 className="font-medium text-gray-900 mt-4 mb-2">
              3.6 Anfragen von Unternehmen (B2B/CSR)
            </h3>
            <p>
              Bei Anfragen über unsere Firmenkunden-Formulare verarbeiten wir Name, Firma,
              E-Mail-Adresse, ggf. Telefonnummer, Position und Ihren Anfrageinhalt sowie
              Kampagnenparameter (z.B. utm_source), um Ihre Anfrage zuordnen und beantworten zu
              können.
            </p>
          </section>

          {/* 4 ─ Rechtsgrundlagen */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Rechtsgrundlagen der Verarbeitung
            </h2>
            <p className="mb-4">
              Wir verarbeiten personenbezogene Daten nur, wenn dafür eine Rechtsgrundlage besteht:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">Zweck</th>
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">
                      Rechtsgrundlage
                    </th>
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">
                      Erläuterung
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LEGAL_BASES.map((item) => (
                    <tr key={item.purpose} className="align-top">
                      <td className="border border-gray-200 p-3">{item.purpose}</td>
                      <td className="border border-gray-200 p-3 whitespace-nowrap">{item.basis}</td>
                      <td className="border border-gray-200 p-3">{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5 ─ Hosting */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Hosting und technische Bereitstellung
            </h2>
            <p>
              Diese Website wird bei der <strong>Railway Corporation</strong> gehostet. Railway
              stellt die Anwendungsserver und die PostgreSQL-Datenbank bereit, in der Ihre Konto-,
              Adoptions- und Bestelldaten gespeichert werden. Vorgelagert nutzen wir{' '}
              <strong>Cloudflare, Inc.</strong> als Content Delivery Network, DNS-Anbieter sowie
              zum Schutz vor Angriffen und automatisiertem Missbrauch. Beide Anbieter verarbeiten
              die Daten als Auftragsverarbeiter nach Art. 28 DSGVO ausschließlich nach unserer
              Weisung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und lit. f DSGVO.
            </p>
            <p className="mt-2">
              Die von unserer Website verwendete Schriftart „Inter“ wird über Google Fonts geladen.
              Dabei wird Ihre IP-Adresse an Google übermittelt.
            </p>
          </section>

          {/* 6 ─ Empfänger */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Empfänger und Auftragsverarbeiter
            </h2>
            <p className="mb-4">
              Wir geben Ihre Daten nur weiter, soweit dies zur Erbringung unserer Leistungen
              erforderlich ist, Sie eingewilligt haben oder wir gesetzlich dazu verpflichtet sind.
              Mit allen Dienstleistern, die Daten in unserem Auftrag verarbeiten, bestehen Verträge
              zur Auftragsverarbeitung nach Art. 28 DSGVO. Wir verkaufen Ihre Daten nicht.
            </p>
            <div className="space-y-4">
              {PROCESSORS.map((p) => (
                <div key={p.name} className="rounded-lg border border-gray-200 p-4">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="mt-1 text-sm">{p.purpose}</p>
                  <dl className="mt-2 grid gap-1 text-sm text-gray-600 sm:grid-cols-2">
                    <div>
                      <dt className="inline font-medium">Sitz/Verarbeitung: </dt>
                      <dd className="inline">{p.location}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Rechtsgrundlage: </dt>
                      <dd className="inline">{p.legalBasis}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="inline font-medium">Garantie: </dt>
                      <dd className="inline">{p.safeguard}</dd>
                    </div>
                  </dl>
                  <a
                    href={p.privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-quetz-green hover:underline"
                  >
                    Datenschutzerklärung des Anbieters
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Daneben können Daten an Steuerberatung, Buchhaltung, Banken sowie — bei rechtlicher
              Verpflichtung — an Behörden und Gerichte übermittelt werden.
            </p>
          </section>

          {/* 7 ─ Drittland */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Übermittlung in Drittländer
            </h2>
            <p>
              Einige der oben genannten Dienstleister verarbeiten Daten außerhalb der Europäischen
              Union bzw. des Europäischen Wirtschaftsraums, insbesondere in den{' '}
              <strong>Vereinigten Staaten von Amerika</strong> (Railway, Cloudflare, Resend,
              Anthropic, Google, Meta, HubSpot, Stripe Inc.) und in den{' '}
              <strong>Vereinigten Arabischen Emiraten</strong> (Telegram).
            </p>
            <p className="mt-3">Diese Übermittlungen stützen wir auf folgende Garantien:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong>Angemessenheitsbeschluss der EU-Kommission:</strong> Für in den USA
                ansässige Unternehmen, die unter dem{' '}
                <a
                  href="https://www.dataprivacyframework.gov/list"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-quetz-green hover:underline"
                >
                  EU-US Data Privacy Framework
                </a>{' '}
                zertifiziert sind (Durchführungsbeschluss (EU) 2023/1795 vom 10. Juli 2023), gilt
                ein angemessenes Datenschutzniveau.
              </li>
              <li>
                <strong>EU-Standardvertragsklauseln (SCC):</strong> Für alle übrigen Übermittlungen
                haben wir mit den Anbietern die Standardvertragsklauseln der EU-Kommission
                (Durchführungsbeschluss (EU) 2021/914) nach Art. 46 Abs. 2 lit. c DSGVO
                vereinbart, ergänzt um zusätzliche technische Schutzmaßnahmen wie
                Transportverschlüsselung und Datenminimierung.
              </li>
            </ul>
            <p className="mt-3">
              Wir weisen darauf hin, dass in Drittländern trotz dieser Garantien nicht in jedem
              Fall ein mit der EU vollständig vergleichbares Datenschutzniveau gewährleistet werden
              kann und insbesondere der Zugriff staatlicher Stellen sowie die Durchsetzung Ihrer
              Rechte erschwert sein können. Kopien der vereinbarten Garantien erhalten Sie auf
              Anfrage unter{' '}
              <a
                href={`mailto:${PRIVACY.privacyContactEmail}`}
                className="text-quetz-green hover:underline"
              >
                {PRIVACY.privacyContactEmail}
              </a>
              .
            </p>
          </section>

          {/* 8 ─ Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Cookies, lokale Speicherung und Einwilligung
            </h2>
            <p>
              Beim ersten Besuch unserer Website erscheint ein Einwilligungsbanner. Dort können Sie
              zwischen „Alle akzeptieren“, „Nur notwendige“ und einer individuellen Auswahl in den
              Einstellungen wählen. Notwendige Cookies sind für den Betrieb der Website
              erforderlich und lassen sich nicht abwählen; Rechtsgrundlage ist § 25 Abs. 2 Nr. 2
              TDDDG in Verbindung mit Art. 6 Abs. 1 lit. f DSGVO. Analyse- und Marketing-Cookies
              werden ausschließlich nach Ihrer aktiven Einwilligung gesetzt (§ 25 Abs. 1 TDDDG,
              Art. 6 Abs. 1 lit. a DSGVO).
            </p>
            <p className="mt-2">
              Ihre Auswahl wird lokal in Ihrem Browser unter dem Schlüssel{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">quetz_cookie_consent</code>{' '}
              gespeichert. Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft
              widerrufen, indem Sie diesen Eintrag sowie die gesetzten Cookies in den
              Browser-Einstellungen löschen — das Banner erscheint dann erneut. Alternativ genügt
              eine formlose Nachricht an{' '}
              <a
                href={`mailto:${PRIVACY.privacyContactEmail}`}
                className="text-quetz-green hover:underline"
              >
                {PRIVACY.privacyContactEmail}
              </a>
              .
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">Name</th>
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">
                      Kategorie
                    </th>
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">
                      Speicherort
                    </th>
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">Zweck</th>
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">
                      Speicherdauer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIES.map((c) => (
                    <tr key={c.name} className="align-top">
                      <td className="border border-gray-200 p-3 font-mono text-xs">{c.name}</td>
                      <td className="border border-gray-200 p-3 whitespace-nowrap">{c.type}</td>
                      <td className="border border-gray-200 p-3 whitespace-nowrap">{c.storage}</td>
                      <td className="border border-gray-200 p-3">{c.purpose}</td>
                      <td className="border border-gray-200 p-3">{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 9 ─ Speicherdauer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Speicherdauer</h2>
            <p className="mb-4">
              Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke
              erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Danach werden die
              Daten gelöscht oder anonymisiert.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">
                      Datenkategorie
                    </th>
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">
                      Speicherdauer
                    </th>
                    <th className="border border-gray-200 p-3 font-semibold text-gray-900">
                      Grund
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RETENTION.map((r) => (
                    <tr key={r.category} className="align-top">
                      <td className="border border-gray-200 p-3">{r.category}</td>
                      <td className="border border-gray-200 p-3">{r.duration}</td>
                      <td className="border border-gray-200 p-3">{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 10 ─ Betroffenenrechte */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Ihre Rechte</h2>
            <p className="mb-4">
              Ihnen stehen als betroffener Person die folgenden Rechte zu. Zur Ausübung genügt eine
              formlose Nachricht an{' '}
              <a
                href={`mailto:${PRIVACY.privacyContactEmail}`}
                className="text-quetz-green hover:underline"
              >
                {PRIVACY.privacyContactEmail}
              </a>
              . Wir antworten unverzüglich, spätestens innerhalb eines Monats.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Auskunft (Art. 15 DSGVO):</strong> Bestätigung, ob und welche Daten wir zu
                Ihnen verarbeiten, sowie eine Kopie dieser Daten.
              </li>
              <li>
                <strong>Berichtigung (Art. 16 DSGVO):</strong> Korrektur unrichtiger und
                Vervollständigung unvollständiger Daten.
              </li>
              <li>
                <strong>Löschung (Art. 17 DSGVO):</strong> Löschung Ihrer Daten, sofern keine
                gesetzliche Aufbewahrungspflicht oder ein anderer Ausnahmetatbestand entgegensteht.
              </li>
              <li>
                <strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sperrung der
                Verarbeitung, z.B. während wir die Richtigkeit Ihrer Daten prüfen.
              </li>
              <li>
                <strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Herausgabe der von Ihnen
                bereitgestellten Daten in einem strukturierten, gängigen und maschinenlesbaren
                Format bzw. direkte Übermittlung an einen anderen Verantwortlichen.
              </li>
              <li>
                <strong>Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO):</strong> Sie können eine
                erteilte Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. Die
                Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.
              </li>
              <li>
                <strong>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO):</strong> siehe
                Abschnitt 12.
              </li>
            </ul>

            <div className="mt-6 rounded-lg border-l-4 border-quetz-green bg-green-50 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">
                Widerspruchsrecht nach Art. 21 DSGVO
              </h3>
              <p className="text-sm">
                <strong>
                  Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
                  jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die
                  aufgrund von Art. 6 Abs. 1 lit. e oder lit. f DSGVO erfolgt, Widerspruch
                  einzulegen.
                </strong>{' '}
                Legen Sie Widerspruch ein, verarbeiten wir die betroffenen Daten nicht mehr, es sei
                denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen,
                die Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient
                der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.
              </p>
              <p className="text-sm mt-3">
                <strong>
                  Werden Ihre Daten verarbeitet, um Direktwerbung zu betreiben, haben Sie das Recht,
                  jederzeit und ohne Angabe von Gründen Widerspruch gegen diese Verarbeitung
                  einzulegen; dies gilt auch für ein damit verbundenes Profiling.
                </strong>{' '}
                Nach Ihrem Widerspruch werden die Daten für Zwecke der Direktwerbung nicht mehr
                verarbeitet.
              </p>
              <p className="text-sm mt-3">
                Ihren Widerspruch richten Sie formlos an{' '}
                <a
                  href={`mailto:${PRIVACY.privacyContactEmail}`}
                  className="font-medium text-quetz-green hover:underline"
                >
                  {PRIVACY.privacyContactEmail}
                </a>
                .
              </p>
            </div>
          </section>

          {/* 11 ─ Art. 22 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              11. Keine automatisierte Entscheidungsfindung
            </h2>
            <p>
              Wir verwenden keine automatisierte Entscheidungsfindung einschließlich Profiling im
              Sinne von Art. 22 Abs. 1 und 4 DSGVO, die Ihnen gegenüber rechtliche Wirkung entfaltet
              oder Sie in ähnlicher Weise erheblich beeinträchtigt.
            </p>
            <p className="mt-2">
              Unser KI-Chat-Assistent „Quetzito“ erzeugt ausschließlich informative Antworten. Er
              trifft keine Entscheidungen über Verträge, Preise, Zahlungen oder Ihre Rechte. Auch
              die reichweitenbezogene Auswertung mit Google Analytics und dem Meta-Pixel dient
              lediglich statistischen Zwecken und führt zu keiner Sie betreffenden Einzelentscheidung.
            </p>
          </section>

          {/* 12 ─ Aufsichtsbehörde */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              12. Beschwerderecht bei einer Aufsichtsbehörde
            </h2>
            <p>
              Unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe
              steht Ihnen nach Art. 77 DSGVO das Recht zu, sich bei einer Datenschutz-Aufsichts&shy;behörde
              zu beschweren — insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts, Ihres
              Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.
            </p>
            {isFilled(PRIVACY.supervisoryAuthority) ? (
              <p className="mt-2">
                Die für uns zuständige Aufsichtsbehörde ist: {PRIVACY.supervisoryAuthority}
                {isFilled(PRIVACY.supervisoryAuthorityUrl) && (
                  <>
                    {' '}
                    (
                    <a
                      href={PRIVACY.supervisoryAuthorityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-quetz-green hover:underline"
                    >
                      Website der Behörde
                    </a>
                    )
                  </>
                )}
                .
              </p>
            ) : (
              <p className="mt-2">
                Zuständig ist die Datenschutzbehörde des Bundeslandes, in dem wir unseren Sitz
                haben. Eine vollständige Liste der deutschen Aufsichtsbehörden mit Anschriften
                finden Sie beim Bundesbeauftragten für den Datenschutz und die Informationsfreiheit:{' '}
                <a
                  href="https://www.bfdi.bund.de/DE/Service/Anschriften/anschriften_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-quetz-green hover:underline"
                >
                  bfdi.bund.de
                </a>
                .
              </p>
            )}
          </section>

          {/* 13 ─ Bereitstellungspflicht */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              13. Erforderlichkeit der Bereitstellung
            </h2>
            <p>
              Die Bereitstellung Ihrer Daten ist weder gesetzlich noch vertraglich vorgeschrieben.
              Ohne die für eine Bestellung erforderlichen Angaben (insbesondere Name, E-Mail-Adresse
              und ggf. Lieferanschrift) können wir jedoch keinen Vertrag mit Ihnen schließen und
              keine Adoption, kein Zertifikat und keinen Versand durchführen.
            </p>
          </section>

          {/* 14 ─ Datensicherheit */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Datensicherheit</h2>
            <p>
              Wir treffen technische und organisatorische Maßnahmen nach Art. 32 DSGVO, um Ihre
              Daten gegen Verlust, Manipulation und unberechtigten Zugriff zu schützen. Die
              Übertragung erfolgt durchgehend TLS-verschlüsselt (erkennbar am „https://“ in der
              Adresszeile). Passwörter werden ausschließlich als kryptografischer Hash gespeichert.
              Der Zugriff auf personenbezogene Daten ist auf die Personen beschränkt, die ihn zur
              Aufgabenerfüllung benötigen.
            </p>
          </section>

          {/* 15 ─ Änderungen */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              15. Änderungen dieser Datenschutzerklärung
            </h2>
            <p>
              Wir passen diese Datenschutzerklärung an, sobald sich die Rechtslage, unsere
              Verarbeitungstätigkeiten oder die eingesetzten Dienstleister ändern. Es gilt jeweils
              die hier veröffentlichte Fassung. Das Datum der letzten Aktualisierung finden Sie
              unten auf dieser Seite.
            </p>
          </section>

          {/* 16 ─ Kontakt */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              16. Kontakt in Datenschutzfragen
            </h2>
            <p>
              Für Fragen, Auskunftsersuchen, Widersprüche oder Löschanträge erreichen Sie uns unter{' '}
              <a
                href={`mailto:${PRIVACY.privacyContactEmail}`}
                className="text-quetz-green hover:underline"
              >
                {PRIVACY.privacyContactEmail}
              </a>
              . Die vollständigen Angaben zum Verantwortlichen finden Sie in Abschnitt 1 und in
              unserem{' '}
              <Link href="/impressum" className="text-quetz-green hover:underline">
                Impressum
              </Link>
              .
            </p>
          </section>
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">Stand: {LEGAL_LAST_UPDATED}</p>
      </main>
    </div>
  );
}
