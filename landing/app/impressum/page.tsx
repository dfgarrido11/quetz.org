import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  LEGAL,
  LEGAL_LAST_UPDATED,
  LEGAL_PENDING_CONDITIONAL,
  LEGAL_PENDING_REQUIRED,
  addressLines,
  contentResponsibleName,
  hasCompleteAddress,
  isFilled,
  registerEntry,
} from '@/lib/legal';

/**
 * Hinweisbox für eine noch nicht hinterlegte Pflichtangabe (§ 5 TMG).
 * Es wird NIE ein Platzhalter-Token ausgegeben, sondern ein ehrlicher Hinweis
 * mit Kontaktmöglichkeit.
 */
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

/** Neutraler Hinweis für bedingte Angaben (nur einschlägig, wenn zutreffend). */
function PendingConditional() {
  return (
    <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
      {LEGAL_PENDING_CONDITIONAL}
    </p>
  );
}

export default function ImpressumPage() {
  const address = addressLines();
  const register = registerEntry();
  const responsible = contentResponsibleName();

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Impressum</h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Angaben gemäß § 5 TMG</h2>
            <p className="font-medium text-gray-900">{LEGAL.brandName}</p>

            {isFilled(LEGAL.legalName) ? (
              <p className="mt-1">{LEGAL.legalName}</p>
            ) : (
              <div className="mt-3">
                <PendingRequired>
                  Der vollständige rechtliche Name des Anbieters (inklusive Rechtsform) wird derzeit
                  ergänzt. Bitte fordern Sie ihn bis dahin per E-Mail an
                </PendingRequired>
              </div>
            )}

            {isFilled(LEGAL.legalForm) && <p>Rechtsform: {LEGAL.legalForm}</p>}

            {hasCompleteAddress() ? (
              <address className="mt-3 not-italic">
                {address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ) : (
              <div className="mt-3">
                <PendingRequired>
                  Die ladungsfähige Anschrift des Anbieters wird derzeit ergänzt. Bitte fordern Sie
                  sie bis dahin per E-Mail an
                </PendingRequired>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Kontakt</h2>
            <p>
              E-Mail:{' '}
              <a href={`mailto:${LEGAL.email}`} className="text-quetz-green hover:underline">
                {LEGAL.email}
              </a>
            </p>
            {isFilled(LEGAL.phone) && <p>Telefon: {LEGAL.phone}</p>}
            <p>
              Web:{' '}
              <a href={LEGAL.websiteUrl} className="text-quetz-green hover:underline">
                {LEGAL.website}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Vertreten durch</h2>
            {isFilled(LEGAL.represented) ? (
              <p>{LEGAL.represented}</p>
            ) : (
              <PendingConditional />
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Registereintrag</h2>
            {register ? <p>{register}</p> : <PendingConditional />}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Umsatzsteuer-Identifikationsnummer
            </h2>
            {isFilled(LEGAL.vatId) ? (
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: {LEGAL.vatId}
              </p>
            ) : LEGAL.isSmallBusiness ? (
              <p>
                Gemäß § 19 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer berechnet und
                keine Umsatzsteuer-Identifikationsnummer geführt.
              </p>
            ) : (
              <PendingConditional />
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            {responsible ? (
              <>
                <p>{responsible}</p>
                {isFilled(LEGAL.contentResponsibleAddress) ? (
                  <address className="not-italic">{LEGAL.contentResponsibleAddress}</address>
                ) : hasCompleteAddress() ? (
                  <address className="not-italic">
                    {address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                ) : null}
              </>
            ) : (
              <PendingRequired>
                Name und Anschrift der inhaltlich verantwortlichen Person werden derzeit ergänzt.
                Bitte fordern Sie diese bis dahin per E-Mail an
              </PendingRequired>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Streitschlichtung und Verbraucherschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-quetz-green hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-2">Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
            <p className="mt-2">
              Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle im Sinne des Verbraucherstreitbeilegungsgesetzes (VSBG)
              teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
              Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
              Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer
              konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen
              werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt
              der Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zum
              Zeitpunkt der Verlinkung nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen
              werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung
              und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien
              dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit
              die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
              Urheberrechte Dritter beachtet und als solche gekennzeichnet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Datenschutz</h2>
            <p>
              Informationen zur Verarbeitung Ihrer personenbezogenen Daten finden Sie in unserer{' '}
              <Link href="/datenschutz" className="text-quetz-green hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Stand: {LEGAL_LAST_UPDATED}
        </p>
      </main>
    </div>
  );
}
