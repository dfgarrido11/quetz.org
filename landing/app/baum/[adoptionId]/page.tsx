import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShareButtons } from "./share-buttons";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { adoptionId: string };
  searchParams: { lang?: string };
}

// ── i18n ───────────────────────────────────────────────────────────────────────

type Lang = "de" | "en" | "fr" | "ar" | "es";

function resolveLang(lang?: string): Lang {
  if (lang === "en") return "en";
  if (lang === "de") return "de";
  if (lang === "fr") return "fr";
  if (lang === "ar") return "ar";
  return "de"; // default DE per brand strategy
}

function t(lang: Lang, de: string, en: string, fr: string, ar: string, es: string): string {
  if (lang === "de") return de;
  if (lang === "en") return en;
  if (lang === "fr") return fr;
  if (lang === "ar") return ar;
  return es;
}

function treeName(lang: Lang, tree: { nameEs: string; nameDe?: string | null; nameEn?: string | null; nameFr?: string | null }): string {
  if (lang === "de" && tree.nameDe) return tree.nameDe;
  if (lang === "en" && tree.nameEn) return tree.nameEn;
  if (lang === "fr" && tree.nameFr) return tree.nameFr;
  return tree.nameEs;
}

function treeDesc(lang: Lang, tree: { descEs: string; descDe?: string | null; descEn?: string | null; descFr?: string | null }): string {
  if (lang === "de" && tree.descDe) return tree.descDe;
  if (lang === "en" && tree.descEn) return tree.descEn;
  if (lang === "fr" && tree.descFr) return tree.descFr;
  return tree.descEs;
}

function treeImpact(lang: Lang, tree: { impactEs?: string | null; impactDe?: string | null; impactEn?: string | null; impactFr?: string | null }): string | null {
  if (lang === "de" && tree.impactDe) return tree.impactDe;
  if (lang === "en" && tree.impactEn) return tree.impactEn;
  if (lang === "fr" && tree.impactFr) return tree.impactFr;
  return tree.impactEs ?? null;
}

function farmerStory(lang: Lang, farmer: { storyEs?: string | null; storyDe?: string | null; storyEn?: string | null; storyFr?: string | null }): string | null {
  if (lang === "de" && farmer.storyDe) return farmer.storyDe;
  if (lang === "en" && farmer.storyEn) return farmer.storyEn;
  if (lang === "fr" && farmer.storyFr) return farmer.storyFr;
  return farmer.storyEs ?? null;
}

function formatDate(date: Date, lang: Lang): string {
  const locale =
    lang === "de" ? "de-DE" :
    lang === "fr" ? "fr-FR" :
    lang === "ar" ? "ar-SA" :
    lang === "en" ? "en-GB" :
    "es-GT";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
}

// ── Data fetching ──────────────────────────────────────────────────────────────

async function getAdoptionData(adoptionId: string) {
  const adoption = await prisma.adoption.findUnique({
    where: { id: adoptionId },
    include: {
      tree: true,
      farmer: true,
      user: { select: { name: true, country: true } },
    },
  });
  return adoption;
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const adoption = await getAdoptionData(params.adoptionId);
  if (!adoption?.tree) {
    return { title: "Mein Baum — Quetz.org" };
  }

  const lang = resolveLang(searchParams.lang);
  const name = treeName(lang, adoption.tree);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://quetz.org";

  return {
    title: `${name} — Zacapa, Guatemala | Quetz.org`,
    description: t(
      lang,
      `Entdecke ${name}s Reise im Herzen von Guatemala. Gepflanzt mit Liebe, gewachsen für die Zukunft.`,
      `Discover the journey of this ${name} in the heart of Guatemala. Planted with love, grown for the future.`,
      `Découvrez le voyage de ce ${name} au cœur du Guatemala. Planté avec amour, grandi pour l'avenir.`,
      `اكتشف رحلة ${name} في قلب غواتيمالا. زُرع بحب، ونما من أجل المستقبل.`,
      `Descubre el viaje de este ${name} en el corazón de Guatemala. Plantado con amor, crecido para el futuro.`
    ),
    openGraph: {
      title: `${name} — Zacapa, Guatemala`,
      description: t(
        lang,
        `Jeder Baum hat einen Namen, eine Familie und einen Ort.`,
        `Every tree has a name, a family and a place.`,
        `Chaque arbre a un nom, une famille et un lieu.`,
        `لكل شجرة اسم وعائلة ومكان.`,
        `Cada árbol tiene un nombre, una familia y un lugar.`
      ),
      images: [{ url: `${baseUrl}${adoption.tree.image}`, width: 1200, height: 630, alt: name }],
      url: `${baseUrl}/baum/${params.adoptionId}`,
    },
    twitter: { card: "summary_large_image" },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function BaumPage({ params, searchParams }: PageProps) {
  const adoption = await getAdoptionData(params.adoptionId);

  if (!adoption) notFound();

  const lang = resolveLang(searchParams.lang);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://quetz.org";
  const micrositeUrl = `${baseUrl}/baum/${params.adoptionId}`;

  const tree = adoption.tree;
  const farmer = adoption.farmer;
  const name = tree ? treeName(lang, tree) : t(lang, "Dein Baum", "Your Tree", "Votre Arbre", "شجرتك", "Tu Árbol");

  // Timeline events
  const timelineEvents = [
    {
      date: adoption.createdAt,
      icon: "💚",
      label: t(lang, "Patenschaft begonnen", "Adoption started", "Adoption commencée", "بدأ التبني", "Adopción iniciada"),
      done: true,
    },
    ...(adoption.plantedAt
      ? [{
          date: adoption.plantedAt,
          icon: "🌱",
          label: t(lang, "Baum gepflanzt", "Tree planted", "Arbre planté", "تمت الزراعة", "Árbol plantado"),
          done: true,
        }]
      : [{
          date: null,
          icon: "🌱",
          label: t(lang, "Pflanzung in Vorbereitung", "Planting in preparation", "Plantation en préparation", "التحضير للزراعة", "Plantación en preparación"),
          done: false,
        }]
    ),
    {
      date: adoption.nextUpdateAt,
      icon: "📸",
      label: t(lang, "Nächstes Foto-Update", "Next photo update", "Prochain mise à jour photo", "تحديث الصورة القادم", "Próxima actualización"),
      done: false,
    },
  ];

  const GREEN_DEEP = "#081C15";
  const GREEN_BRAND = "#2D6A4F";
  const GREEN_LIGHT = "#52B788";
  const CREAM = "#F8F5F0";
  const WHITE = "#FFFFFF";
  const GRAY = "#6B7280";

  return (
    <main style={{ backgroundColor: CREAM, minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* ── Cinematic hero ────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${GREEN_DEEP} 0%, ${GREEN_BRAND} 100%)`,
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background texture */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${baseUrl}/images/email/zacapa-hero.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.25,
        }} />

        <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto", padding: "80px 24px 60px" }}>
          {/* Brand nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px" }}>
            <Link href="/" style={{ color: GREEN_LIGHT, fontSize: "13px", letterSpacing: "3px", textTransform: "uppercase", textDecoration: "none", fontWeight: "700" }}>
              quetz.org
            </Link>
            <Link href="/mi-bosque" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", textDecoration: "none" }}>
              {t(lang, "← Mein Wald", "← My Forest", "← Ma Forêt", "← غابتي", "← Mi Bosque")}
            </Link>
          </div>

          <p style={{ color: GREEN_LIGHT, fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 12px" }}>
            {t(lang, "Dein Baum", "Your Tree", "Votre Arbre", "شجرتك", "Tu Árbol")}
          </p>

          <h1 style={{ color: WHITE, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: "900", margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-1px" }}>
            {name}
          </h1>

          <p style={{ color: "#B7E4C7", fontSize: "16px", lineHeight: 1.7, margin: "0 0 32px", maxWidth: "520px" }}>
            {tree ? treeDesc(lang, tree) : ""}
          </p>

          {/* Identity pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {tree?.plotArea && (
              <span style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#B7E4C7", fontSize: "13px", padding: "6px 16px", borderRadius: "20px", backdropFilter: "blur(8px)" }}>
                📍 {tree.plotArea}
              </span>
            )}
            {tree?.latitude && tree?.longitude && (
              <span style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#B7E4C7", fontSize: "12px", padding: "6px 16px", borderRadius: "20px", fontFamily: "monospace", backdropFilter: "blur(8px)" }}>
                {tree.latitude.toFixed(4)}°N {Math.abs(tree.longitude).toFixed(4)}°W
              </span>
            )}
            <span style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#B7E4C7", fontSize: "13px", padding: "6px 16px", borderRadius: "20px" }}>
              🌍 Zacapa, Guatemala
            </span>
            {tree && (
              <span style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#B7E4C7", fontSize: "13px", padding: "6px 16px", borderRadius: "20px" }}>
                💨 {tree.impactCo2Kg} kg CO₂ / {t(lang, "Jahr", "year", "an", "سنة", "año")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Location map ──────────────────────────────────────────────────── */}
      {tree?.latitude && tree?.longitude && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 0" }}>
          <h2 style={{ color: GREEN_DEEP, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 20px", fontWeight: "700" }}>
            {t(lang, "Standort", "Location", "Localisation", "الموقع", "Ubicación")}
          </h2>
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <iframe
              src={`https://www.google.com/maps?q=${tree.latitude},${tree.longitude}&z=15&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title={t(lang, `Standort: ${name}`, `Location: ${name}`, `Localisation: ${name}`, `موقع: ${name}`, `Ubicación: ${name}`)}
            />
          </div>
          {tree.plotArea && (
            <p style={{ color: "#6B7280", fontSize: "12px", margin: "10px 0 0" }}>
              📍 {tree.plotArea}
            </p>
          )}
        </section>
      )}

      {/* ── Species card ───────────────────────────────────────────────────── */}
      {tree && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 0" }}>
          <h2 style={{ color: GREEN_DEEP, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 20px", fontWeight: "700" }}>
            {t(lang, "Baumart", "Tree Species", "Espèce", "النوع", "Especie")}
          </h2>
          <div style={{ backgroundColor: WHITE, borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <img
                src={`${baseUrl}${tree.image}`}
                alt={name}
                style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover", flexShrink: 0 }}
              />
              <div>
                <h3 style={{ color: GREEN_DEEP, fontSize: "20px", fontWeight: "800", margin: "0 0 4px" }}>{name}</h3>
                <p style={{ color: GRAY, fontSize: "13px", fontStyle: "italic", margin: "0 0 12px" }}>{tree.species}</p>
                {treeImpact(lang, tree) && (
                  <p style={{ color: GREEN_BRAND, fontSize: "14px", fontWeight: "600", margin: "0 0 8px" }}>
                    🌿 {treeImpact(lang, tree)}
                  </p>
                )}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
                  <span style={{ backgroundColor: "#E8F5E9", color: GREEN_BRAND, fontSize: "12px", padding: "4px 12px", borderRadius: "12px" }}>
                    💨 {tree.impactCo2Kg} kg CO₂ / {t(lang, "Jahr", "year", "an", "سنة", "año")}
                  </span>
                  <span style={{ backgroundColor: "#E8F5E9", color: GREEN_BRAND, fontSize: "12px", padding: "4px 12px", borderRadius: "12px" }}>
                    👨‍👩‍👧 {tree.impactFamilies} {t(lang, "Familien", "families", "familles", "عائلات", "familias")}
                  </span>
                  <span style={{ backgroundColor: "#E8F5E9", color: GREEN_BRAND, fontSize: "12px", padding: "4px 12px", borderRadius: "12px" }}>
                    💶 {tree.priceBaseEur} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Guardian / Farmer ─────────────────────────────────────────────── */}
      {farmer && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 0" }}>
          <h2 style={{ color: GREEN_DEEP, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 20px", fontWeight: "700" }}>
            {t(lang, "Dein Waldhüter", "Your Forest Guardian", "Votre Gardien de Forêt", "حارس غابتك", "Tu Guardián del Bosque")}
          </h2>
          <div style={{ backgroundColor: WHITE, borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              {farmer.photoUrl ? (
                <img
                  src={farmer.photoUrl}
                  alt={farmer.name}
                  style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
                  👨‍🌾
                </div>
              )}
              <div>
                <h3 style={{ color: GREEN_DEEP, fontSize: "18px", fontWeight: "800", margin: "0 0 4px" }}>{farmer.name}</h3>
                {farmer.location && (
                  <p style={{ color: GRAY, fontSize: "13px", margin: "0 0 12px" }}>📍 {farmer.location}</p>
                )}
                {farmerStory(lang, farmer) && (
                  <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                    {farmerStory(lang, farmer)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 0" }}>
        <h2 style={{ color: GREEN_DEEP, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 20px", fontWeight: "700" }}>
          {t(lang, "Reise deines Baumes", "Tree Journey", "Voyage de votre Arbre", "رحلة شجرتك", "Viaje de tu Árbol")}
        </h2>
        <div style={{ backgroundColor: WHITE, borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          {timelineEvents.map((event, i) => (
            <div key={i} style={{ display: "flex", gap: "16px", marginBottom: i < timelineEvents.length - 1 ? "24px" : 0, position: "relative" }}>
              {/* Line */}
              {i < timelineEvents.length - 1 && (
                <div style={{ position: "absolute", left: "19px", top: "40px", bottom: "-24px", width: "2px", backgroundColor: event.done ? GREEN_LIGHT : "#E5E7EB" }} />
              )}
              {/* Icon circle */}
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: event.done ? GREEN_LIGHT : "#F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
              }}>
                {event.icon}
              </div>
              <div style={{ paddingTop: "8px" }}>
                <p style={{ color: event.done ? GREEN_DEEP : GRAY, fontSize: "15px", fontWeight: event.done ? "700" : "400", margin: "0 0 4px" }}>
                  {event.label}
                </p>
                {event.date && (
                  <p style={{ color: GRAY, fontSize: "12px", margin: 0 }}>
                    {formatDate(event.date, lang)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Photo gallery ─────────────────────────────────────────────────── */}
      {(adoption.photos?.length > 0 || adoption.lastPhotoUrl) && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 0" }}>
          <h2 style={{ color: GREEN_DEEP, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 20px", fontWeight: "700" }}>
            {t(lang, "Fotos aus Zacapa", "Photos from Zacapa", "Photos de Zacapa", "صور من زاكاپا", "Fotos desde Zacapa")}
          </h2>
          {(() => {
            const allPhotos = adoption.photos?.length > 0
              ? adoption.photos
              : adoption.lastPhotoUrl ? [adoption.lastPhotoUrl] : [];
            const isSingle = allPhotos.length === 1;
            return (
              <div style={{
                display: "grid",
                gridTemplateColumns: isSingle ? "1fr" : "repeat(2, 1fr)",
                gap: "12px",
              }}>
                {allPhotos.map((src: string, idx: number) => (
                  <div key={idx} style={{ position: "relative", overflow: "hidden", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
                    <img
                      src={src}
                      alt={`${name} — Foto ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: isSingle ? "420px" : "260px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ))}
              </div>
            );
          })()}
          <p style={{ color: "#6B7280", fontSize: "12px", margin: "12px 0 0", textAlign: "right" }}>
            📍 {t(lang, "Zacapa, Guatemala — April 2026", "Zacapa, Guatemala — April 2026", "Zacapa, Guatemala — Avril 2026", "زاكاپا، غواتيمالا — أبريل 2026", "Zacapa, Guatemala — Abril 2026")}
          </p>
        </section>
      )}

      {/* ── Share ─────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 0" }}>
        <h2 style={{ color: GREEN_DEEP, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 16px", fontWeight: "700" }}>
          {t(lang, "Teile deinen Baum", "Share Your Tree", "Partagez votre Arbre", "شارك شجرتك", "Comparte tu Árbol")}
        </h2>
        <ShareButtons url={micrositeUrl} treeName={name} lang={lang} />
      </section>

      {/* ── CTA adopt another ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ backgroundColor: GREEN_DEEP, borderRadius: "20px", padding: "40px", textAlign: "center" }}>
          <p style={{ color: GREEN_LIGHT, fontSize: "32px", margin: "0 0 12px" }}>🌳</p>
          <h2 style={{ color: WHITE, fontSize: "22px", fontWeight: "800", margin: "0 0 12px" }}>
            {t(lang, "Noch einen Baum adoptieren", "Adopt Another Tree", "Adopter un autre arbre", "تبنَّ شجرة أخرى", "Adoptar Otro Árbol")}
          </h2>
          <p style={{ color: "#B7E4C7", fontSize: "14px", lineHeight: "1.7", margin: "0 0 24px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
            {t(
              lang,
              "Jeder neue Baum bedeutet einen weiteren Arbeitsplatz für eine Familie in Zacapa.",
              "Each new tree means one more job for a family in Zacapa.",
              "Chaque nouvel arbre représente un emploi de plus pour une famille à Zacapa.",
              "كل شجرة جديدة تعني وظيفة إضافية لعائلة في زاكاپا.",
              "Cada árbol nuevo significa un empleo más para una familia en Zacapa."
            )}
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              backgroundColor: GREEN_LIGHT,
              color: GREEN_DEEP,
              fontSize: "15px",
              fontWeight: "800",
              padding: "14px 36px",
              borderRadius: "50px",
              textDecoration: "none",
            }}
          >
            {t(lang, "🌿 Jetzt adoptieren", "🌿 Adopt Now", "🌿 Adopter Maintenant", "🌿 تبنَّ الآن", "🌿 Adoptar Ahora")}
          </Link>
        </div>
      </section>

    </main>
  );
}
