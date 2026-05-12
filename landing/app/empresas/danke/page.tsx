import { Leaf, TreePine, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const PLAN_NAMES: Record<string, string> = {
  b2bSprout: "Sprout",
  b2bStarter: "Starter",
  b2bBusiness: "Business",
  b2bEnterprise: "Enterprise",
};

async function getSessionData(sessionId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "https://quetz.org";
    const res = await fetch(`${baseUrl}/api/checkout-b2b/session/${sessionId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<{
      customerEmail: string;
      customerName: string;
      planId: string;
      interval: string;
    }>;
  } catch {
    return null;
  }
}

export default async function DankePage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  const data = sessionId ? await getSessionData(sessionId) : null;

  const planName = data?.planId ? (PLAN_NAMES[data.planId] ?? data.planId) : "B2B";
  const companyOrName = data?.customerName || "Ihr Unternehmen";
  const email = data?.customerEmail ?? "";

  return (
    <div className="min-h-screen bg-[#081C15] flex flex-col">
      {/* Navbar minimal */}
      <nav className="flex items-center gap-2 px-8 py-6">
        <Leaf className="w-7 h-7 text-[#52B788]" />
        <span className="font-[Montserrat] font-bold text-xl text-white tracking-tight">quetz.org</span>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-[#52B788]/20 flex items-center justify-center mx-auto mb-8">
            <TreePine className="w-10 h-10 text-[#52B788]" />
          </div>

          {/* Headline */}
          <p className="text-[#52B788] font-[Montserrat] font-semibold text-sm tracking-[0.2em] uppercase mb-4">
            Zahlung erfolgreich
          </p>
          <h1 className="font-[Montserrat] font-bold text-3xl md:text-4xl text-white leading-tight mb-4">
            Vielen Dank, {companyOrName}!
          </h1>
          <p className="text-[#B7E4C7]/70 text-lg mb-2">
            Ihr <span className="text-[#52B788] font-semibold">{planName}</span>-Abo ist aktiv.
          </p>
          {email && (
            <p className="text-white/50 text-sm mb-10">
              Sie erhalten in Kürze eine Bestätigung an{" "}
              <span className="text-white/70">{email}</span>.
            </p>
          )}

          {/* Checklist */}
          <div className="bg-[#0D2818]/60 border border-[#52B788]/10 rounded-2xl p-6 text-left mb-8 space-y-4">
            {[
              "GPS-Tracking Ihrer Bäume wird eingerichtet",
              "Firmen-Dashboard wird aktiviert",
              "CSRD-Datenexport steht bereit",
              "Impact-Report wird in Kürze zugestellt",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#52B788] shrink-0" />
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/mi-bosque"
            className="inline-flex items-center gap-2 bg-[#52B788] hover:bg-[#40916C] text-white font-[Montserrat] font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Zum Firmen-Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-white/30 text-xs mt-8">
            Fragen? Schreiben Sie uns an{" "}
            <a href="mailto:hola@quetz.org" className="underline hover:text-white/50">hola@quetz.org</a>
          </p>
        </div>
      </div>
    </div>
  );
}
