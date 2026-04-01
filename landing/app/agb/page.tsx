'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AGBPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8 text-gray-700">
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">§1 Geltungsbereich</h2>
            <p>Diese AGB gelten für alle Verträge zwischen QUETZ und dem Kunden über Baum-Adoptionen, Spenden und Abonnements auf quetz.org.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">§2 Vertragsgegenstand</h2>
            <p><strong>Baum-Adoption:</strong> Symbolische Adoption inkl. Pflanzung, Pflege, Dashboard-Zugang und Beitrag zum Schulbauprojekt in Zacapa.</p>
            <p className="mt-2"><strong>Abonnements:</strong> Monatliche Baumpflanzungen gemäß gewähltem Plan.</p>
            <p className="mt-2"><strong>Spenden:</strong> Direkte Unterstützung des Schulbau-Projekts.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">§3 Preise und Zahlung</h2>
            <p>Alle Preise in Euro, Endpreise. Zahlung über Stripe (Kreditkarte, SEPA, Sofortüberweisung).</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">§4 Widerrufsrecht</h2>
            <p>Spenden: Kein Widerrufsrecht (freiwillige Zuwendung).</p>
            <p className="mt-2">Baum-Adoptionen: Widerrufsrecht erlischt mit Pflanzungsbeginn (§ 356 Abs. 5 BGB).</p>
            <p className="mt-2">Abonnements: Jederzeit zum Monatsende kündbar.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">§5 Kündigung</h2>
            <p>Kündigung per E-Mail an admin@quetz.org oder im Kundenkonto. Wirksam zum Monatsende.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">§6 Mittelverwendung</h2>
            <p>Ein Teil jeder Adoption fließt direkt an die lokalen Bauernfamilien, ein weiterer Teil in den Schulbaufonds für 120 Kinder in Zacapa. Transparent dokumentiert auf quetz.org/transparencia.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">§7 Haftung</h2>
            <p>Keine Haftung bei höherer Gewalt. Ersatzpflanzung bei Baumausfall möglich.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">§8 Schlussbestimmungen</h2>
            <p>Deutsches Recht. Gesetzlicher Gerichtsstand für Verbraucher.</p>
          </section>
        </div>
        
        <p className="text-sm text-gray-500 mt-6 text-center">Stand: März 2026</p>
      </main>
    </div>
  );
}
