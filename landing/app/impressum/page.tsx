'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ImpressumPage() {
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
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Angaben gemäß § 5 TMG</h2>
            <p className="font-medium">QUETZ</p>
            <p>[PLACEHOLDER: Vollständiger rechtlicher Name]</p>
            <p>[PLACEHOLDER: Straße und Hausnummer]</p>
            <p>[PLACEHOLDER: PLZ und Stadt]</p>
            <p>Guatemala / Deutschland</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Kontakt</h2>
            <p>E-Mail: admin@quetz.org</p>
            <p>Web: <a href="https://quetz.org" className="text-quetz-green hover:underline">quetz.org</a></p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Vertreten durch</h2>
            <p>[PLACEHOLDER: Name des Vertretungsberechtigten]</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Registereintrag</h2>
            <p>[PLACEHOLDER: Registergericht und Registernummer, falls zutreffend]</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Umsatzsteuer-ID</h2>
            <p>[PLACEHOLDER: Umsatzsteuer-Identifikationsnummer gemäß §27a UStG, falls zutreffend]</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>[PLACEHOLDER: Name und Anschrift des Verantwortlichen]</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Streitschlichtung</h2>
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-quetz-green hover:underline ml-1">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="mt-2">Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
            <p className="mt-2">Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Haftung für Inhalte</h2>
            <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Haftung für Links</h2>
            <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Urheberrecht</h2>
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>
          </section>
        </div>
        
        <p className="text-sm text-gray-500 mt-6 text-center">Stand: März 2026</p>
      </main>
    </div>
  );
}
