import { Leaf, TreePine, Check, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

export default function FirmengeschenkDankePage() {
  return (
    <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-7 h-7 text-[#2D6A4F]" />
          <span className="font-[Montserrat] font-bold text-xl text-[#1B4332]">quetz.org</span>
        </div>

        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-[#2D6A4F]" />
        </div>

        <h1 className="font-[Montserrat] font-extrabold text-2xl sm:text-3xl text-[#1B4332] mb-4">
          Vielen Dank für Ihre Bestellung!
        </h1>

        <p className="text-gray-600 text-base leading-relaxed mb-6">
          Ihre Bäume werden in den nächsten Tagen in Zacapa, Guatemala gepflanzt.
          Sie erhalten eine Bestätigung per E-Mail.
        </p>

        {/* Next steps */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left mb-8">
          <h2 className="font-[Montserrat] font-bold text-base text-[#1B4332] mb-4">
            So geht es weiter:
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: Mail,
                text: 'Prüfen Sie Ihr Postfach. Wir senden Ihnen ein Formular für die Mitarbeiternamen.',
              },
              {
                icon: TreePine,
                text: 'Wir pflanzen die Bäume und erstellen die personalisierten Zertifikate.',
              },
              {
                icon: Check,
                text: 'Sie erhalten die Zertifikate als PDF innerhalb von 5 Werktagen.',
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <step.icon className="w-4 h-4 text-[#2D6A4F]" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#2D6A4F] font-[Montserrat] font-semibold text-sm hover:underline"
        >
          Zurück zur Startseite
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
