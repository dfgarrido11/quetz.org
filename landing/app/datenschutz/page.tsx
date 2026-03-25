'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DatenschutzPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8 text-gray-700">
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Datenschutz auf einen Blick</h2>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">Allgemeine Hinweise</h3>
            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
            
            <h3 className="font-medium text-gray-800 mt-4 mb-2">Datenerfassung auf dieser Website</h3>
            <p><strong>Wer ist verantwortlich?</strong></p>
            <p>QUETZ - admin@quetz.org</p>
            
            <p className="mt-3"><strong>Wie erfassen wir Ihre Daten?</strong></p>
            <p>Ihre Daten werden erhoben, wenn Sie uns diese mitteilen (z.B. bei Registrierung oder Baum-Adoption) oder automatisch durch unsere IT-Systeme (technische Daten).</p>
            
            <p className="mt-3"><strong>Wofür nutzen wir Ihre Daten?</strong></p>
            <p>Zur Bereitstellung der Website, Verwaltung Ihrer Baum-Adoptionen und Information über den Fortschritt Ihres Beitrags.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Hosting</h2>
            <p>Wir hosten unsere Website bei Abacus.AI auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Ihre Rechte</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Auskunft:</strong> Jederzeit Auskunft über Ihre gespeicherten Daten</li>
              <li><strong>Berichtigung:</strong> Korrektur unrichtiger Daten</li>
              <li><strong>Löschung:</strong> Löschung Ihrer Daten auf Anfrage</li>
              <li><strong>Widerruf:</strong> Widerruf erteilter Einwilligungen</li>
              <li><strong>Datenübertragbarkeit:</strong> Export Ihrer Daten</li>
              <li><strong>Beschwerde:</strong> Bei der zuständigen Aufsichtsbehörde</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
            <p>Wir verwenden Cookies für die Funktionalität der Website. Sie können Cookies in Ihrem Browser deaktivieren.</p>
            <p className="mt-2"><strong>Notwendige Cookies:</strong> Für Login und Warenkorb</p>
            <p><strong>Analyse-Cookies:</strong> Google Analytics (nur mit Ihrer Einwilligung)</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Google Analytics</h2>
            <p>Diese Website nutzt Google Analytics. Die Datenverarbeitung erfolgt nur nach Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.</p>
            <p className="mt-2">Sie können die Erfassung verhindern über den Cookie-Consent-Banner.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Zahlungsanbieter Stripe</h2>
            <p>Zahlungen werden über Stripe abgewickelt. Details: <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-quetz-green hover:underline">stripe.com/de/privacy</a></p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Newsletter</h2>
            <p>Bei Newsletter-Anmeldung speichern wir Ihre E-Mail bis zur Abmeldung. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Kontakt</h2>
            <p>Bei Fragen zum Datenschutz: admin@quetz.org</p>
          </section>
        </div>
        
        <p className="text-sm text-gray-500 mt-6 text-center">Stand: März 2026</p>
      </main>
    </div>
  );
}
