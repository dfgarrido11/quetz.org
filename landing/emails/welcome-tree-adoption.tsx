import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WelcomeEmailTree {
  id: string;
  nameDe?: string | null;
  nameEn?: string | null;
  nameEs: string;
  nameFr?: string | null;
  species: string;
  latitude?: number | null;
  longitude?: number | null;
  plotArea?: string | null;
  image: string;
}

export interface WelcomeEmailFarmer {
  name: string;
  photoUrl?: string | null;
}

export interface WelcomeEmailAdoption {
  id: string;
  plantedAt?: Date | null;
  createdAt?: Date;
  farmer?: WelcomeEmailFarmer | null;
}

export interface WelcomeTreeAdoptionProps {
  customerName: string;
  language?: string;
  planName: string;
  amount: number;
  currency: string;
  // Optional tree-specific data — if absent, email falls back to generic content
  tree?: WelcomeEmailTree | null;
  adoption?: WelcomeEmailAdoption | null;
  micrositeUrl?: string;
  referralUrl?: string;
  baseUrl?: string;
}

// ── i18n helpers ───────────────────────────────────────────────────────────────

type Lang = "de" | "en" | "fr" | "ar" | "es";

function resolveLang(language?: string): Lang {
  if (language === "en") return "en";
  if (language === "de") return "de";
  if (language === "fr") return "fr";
  if (language === "ar") return "ar";
  return "es";
}

function t(
  lang: Lang,
  de: string,
  en: string,
  fr: string,
  ar: string,
  es: string
): string {
  if (lang === "de") return de;
  if (lang === "en") return en;
  if (lang === "fr") return fr;
  if (lang === "ar") return ar;
  return es;
}

function localName(
  lang: Lang,
  tree: WelcomeEmailTree
): string {
  if (lang === "de" && tree.nameDe) return tree.nameDe;
  if (lang === "en" && tree.nameEn) return tree.nameEn;
  if (lang === "fr" && tree.nameFr) return tree.nameFr;
  return tree.nameEs;
}

function formatDate(date?: Date | null, lang: Lang = "de"): string {
  if (!date) return "";
  const locale =
    lang === "de" ? "de-DE" :
    lang === "fr" ? "fr-FR" :
    lang === "ar" ? "ar-SA" :
    lang === "en" ? "en-GB" :
    "es-GT";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ── Subject line (exported for use in webhook) ─────────────────────────────────

export function getWelcomeSubject(language?: string): string {
  const lang = resolveLang(language);
  return t(
    lang,
    "🌳 Dein Baum hat einen Namen! Willkommen in der Quetz-Familie",
    "🌳 Your tree has a name! Welcome to the Quetz family",
    "🌳 Votre arbre a un nom ! Bienvenue dans la famille Quetz",
    "🌳 شجرتك لها اسم! مرحباً بك في عائلة Quetz",
    "🌳 ¡Tu árbol ya tiene nombre! Bienvenido/a a la familia Quetz"
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function WelcomeTreeAdoption({
  customerName,
  language,
  planName,
  amount,
  currency,
  tree,
  adoption,
  micrositeUrl,
  referralUrl,
  baseUrl = "https://quetz.org",
}: WelcomeTreeAdoptionProps) {
  const lang = resolveLang(language);
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  const displayName = customerName || t(lang, "Freund", "Friend", "Ami(e)", "صديقي", "Amigo/a");
  const displayAmount = `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  const displayPlan = planName || t(lang, "Baum-Patenschaft", "Tree Adoption", "Adoption d'arbre", "تبني شجرة", "Adopción de Árbol");
  const treeName = tree ? localName(lang, tree) : null;

  const ctaUrl = micrositeUrl ?? `${baseUrl}/mi-bosque`;
  const ctaLabel = t(lang, "🌿 Meinen Baum entdecken", "🌿 Discover My Tree", "🌿 Découvrir mon arbre", "🌿 استكشف شجرتي", "🌿 Explorar Mi Árbol");

  const previewText = treeName
    ? t(
        lang,
        `Dein ${treeName} in Zacapa, Guatemala wartet auf dich`,
        `Your ${treeName} in Zacapa, Guatemala awaits you`,
        `Votre ${treeName} à Zacapa, Guatemala vous attend`,
        `${treeName} في زاكاپا، غواتيمالا ينتظرك`,
        `Tu ${treeName} en Zacapa, Guatemala te espera`
      )
    : t(
        lang,
        "Willkommen in der Quetz-Familie — Dein Baum wächst!",
        "Welcome to the Quetz family — Your tree is growing!",
        "Bienvenue dans la famille Quetz — Votre arbre pousse !",
        "مرحباً بك في عائلة Quetz — شجرتك تنمو!",
        "¡Bienvenido/a a la familia Quetz — Tu árbol crece!"
      );

  // ── colors / constants ─────────────────────────────────────────────────────
  const GREEN_DEEP = "#081C15";
  const GREEN_MED = "#1B4332";
  const GREEN_BRAND = "#2D6A4F";
  const GREEN_MID = "#40916C";
  const GREEN_LIGHT = "#52B788";
  const CREAM = "#F8F5F0";
  const WHITE = "#FFFFFF";
  const GRAY = "#6B7280";
  const GRAY_LIGHT = "#F3F4F6";

  // ── Timeline days ──────────────────────────────────────────────────────────
  const timelineDays = [1, 7, 30, 60, 90];
  const timelineLabels: Record<number, string> = {
    1: t(lang, "GPS-Daten", "GPS Data", "Données GPS", "بيانات GPS", "Datos GPS"),
    7: t(lang, "1. Foto", "1st Photo", "1ère Photo", "الصورة الأولى", "1ª Foto"),
    30: t(lang, "Monat 1", "Month 1", "Mois 1", "الشهر 1", "Mes 1"),
    60: t(lang, "Monat 2", "Month 2", "Mois 2", "الشهر 2", "Mes 2"),
    90: t(lang, "Monat 3", "Month 3", "Mois 3", "الشهر 3", "Mes 3"),
  };

  return (
    <Html dir={dir} lang={lang}>
      <Head />
      <Preview>{previewText}</Preview>

      <Body style={{ backgroundColor: CREAM, margin: 0, padding: 0, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

        {/* ── Cinematic hero ──────────────────────────────────────────────── */}
        <Section style={{ backgroundColor: GREEN_DEEP, padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
            {/* Top brand bar */}
            <Row style={{ padding: "20px 32px 0" }}>
              <Column>
                <Text style={{ color: GREEN_LIGHT, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>
                  quetz.org
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ color: GREEN_LIGHT, fontSize: "11px", margin: 0, opacity: 0.7 }}>
                  Zacapa, Guatemala
                </Text>
              </Column>
            </Row>

            {/* Hero image */}
            <Img
              src="https://quetz.org/images/email/zacapa-hero.jpg"
              alt="Bosque Zacapa — Quetz.org"
              width="600"
              height="280"
              style={{ display: "block", width: "100%", height: "280px", objectFit: "cover", marginTop: "16px" }}
            />

            {/* Hero text overlay card */}
            <Row style={{ padding: "32px 32px 40px" }}>
              <Column>
                <Text style={{
                  color: GREEN_LIGHT,
                  fontSize: "11px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  margin: "0 0 12px",
                }}>
                  {t(lang, "Glückwunsch", "Congratulations", "Félicitations", "مبروك", "¡Felicidades")}
                </Text>

                <Heading as="h1" style={{
                  color: WHITE,
                  fontSize: "28px",
                  fontWeight: "800",
                  lineHeight: "1.25",
                  margin: "0 0 16px",
                  letterSpacing: "-0.5px",
                }}>
                  {treeName
                    ? t(
                        lang,
                        `${displayName}, dein ${treeName} wurde gepflanzt.`,
                        `${displayName}, your ${treeName} has been planted.`,
                        `${displayName}, votre ${treeName} a été planté.`,
                        `!${displayName}، تمت زراعة ${treeName} الخاص بك`,
                        `${displayName}, tu ${treeName} ha sido plantado.`
                      )
                    : t(
                        lang,
                        `${displayName}, dein Baum wartet auf dich.`,
                        `${displayName}, your tree awaits you.`,
                        `${displayName}, votre arbre vous attend.`,
                        `${displayName}، شجرتك تنتظرك.`,
                        `${displayName}, tu árbol te espera.`
                      )
                  }
                </Heading>

                <Text style={{ color: "#B7E4C7", fontSize: "15px", lineHeight: "1.7", margin: 0 }}>
                  {t(
                    lang,
                    "In diesem Moment bereitet in Zacapa, Guatemala, eine lokale Familie die Erde vor. Das ist kein gewöhnlicher Baum — es ist ein Arbeitsplatz für eine Familie, Sauerstoff für den Planeten und ein Schritt in Richtung Schule für 120 Kinder.",
                    "Right now, in Zacapa, Guatemala, a local family is preparing the soil. This is not just a tree — it's a job for a family, oxygen for the planet, and a step toward the school that 120 children are waiting for.",
                    "En ce moment même, à Zacapa, au Guatemala, une famille locale prépare la terre. Ce n'est pas qu'un arbre — c'est un emploi pour une famille, de l'oxygène pour la planète et un pas vers l'école qu'attendent 120 enfants.",
                    "في هذه اللحظة، في زاكاپا، غواتيمالا، تُهيّئ عائلة محلية التربة. إنها ليست مجرد شجرة — إنها وظيفة لعائلة، وأكسجين للكوكب، وخطوة نحو المدرسة التي ينتظرها 120 طفلاً.",
                    "En este momento, en Zacapa, Guatemala, una familia local está preparando la tierra. No es solo un árbol — es un empleo para una familia, oxígeno para el planeta, y un paso hacia la escuela que 120 niños esperan."
                  )}
                </Text>
              </Column>
            </Row>
          </Container>
        </Section>

        {/* ── Tree identity card (if tree data available) ─────────────────── */}
        {tree && (
          <Section style={{ backgroundColor: GREEN_MED, padding: "0" }}>
            <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px" }}>
              <Text style={{
                color: GREEN_LIGHT,
                fontSize: "10px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                margin: "0 0 20px",
              }}>
                {t(lang, "Dein Baum", "Your Tree", "Votre Arbre", "شجرتك", "Tu Árbol")}
              </Text>

              <Row>
                {/* Tree image */}
                <Column style={{ width: "100px", verticalAlign: "top" }}>
                  <Img
                    src={`https://quetz.org${tree.image}`}
                    alt={treeName ?? ""}
                    width="84"
                    height="84"
                    style={{ borderRadius: "12px", display: "block", objectFit: "cover" }}
                  />
                </Column>

                {/* Tree details */}
                <Column style={{ paddingLeft: "20px", verticalAlign: "top" }}>
                  <Heading as="h2" style={{ color: WHITE, fontSize: "22px", fontWeight: "800", margin: "0 0 4px" }}>
                    {treeName}
                  </Heading>
                  <Text style={{ color: GREEN_LIGHT, fontSize: "12px", margin: "0 0 12px", fontStyle: "italic" }}>
                    {tree.species.charAt(0).toUpperCase() + tree.species.slice(1)}
                  </Text>

                  {/* GPS chip */}
                  {tree.latitude && tree.longitude && (
                    <Row style={{ marginBottom: "8px" }}>
                      <Column>
                        <Text style={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          color: "#B7E4C7",
                          fontSize: "11px",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          display: "inline-block",
                          margin: 0,
                        }}>
                          📍 {tree.latitude.toFixed(4)}°N, {Math.abs(tree.longitude).toFixed(4)}°W
                        </Text>
                      </Column>
                    </Row>
                  )}

                  {/* Plot area */}
                  {tree.plotArea && (
                    <Text style={{ color: "#B7E4C7", fontSize: "12px", margin: "4px 0 0" }}>
                      🗺 {tree.plotArea}
                    </Text>
                  )}

                  {/* Plant date */}
                  {adoption?.plantedAt && (
                    <Text style={{ color: "#B7E4C7", fontSize: "12px", margin: "4px 0 0" }}>
                      🌱 {t(lang, "Gepflanzt", "Planted", "Planté", "تمت الزراعة", "Plantado")}: {formatDate(adoption.plantedAt, lang)}
                    </Text>
                  )}
                </Column>
              </Row>

              {/* Farmer / Guardian */}
              {adoption?.farmer && (
                <Row style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                  <Column style={{ width: "44px", verticalAlign: "middle" }}>
                    {adoption.farmer.photoUrl ? (
                      <Img
                        src={adoption.farmer.photoUrl}
                        alt={adoption.farmer.name}
                        width="44"
                        height="44"
                        style={{ borderRadius: "50%", display: "block", objectFit: "cover" }}
                      />
                    ) : (
                      <Text style={{
                        width: "44px",
                        height: "44px",
                        lineHeight: "44px",
                        textAlign: "center",
                        backgroundColor: GREEN_LIGHT,
                        color: GREEN_DEEP,
                        borderRadius: "50%",
                        fontSize: "20px",
                        fontWeight: "bold",
                        display: "block",
                        margin: 0,
                      }}>
                        👨‍🌾
                      </Text>
                    )}
                  </Column>
                  <Column style={{ paddingLeft: "14px", verticalAlign: "middle" }}>
                    <Text style={{ color: WHITE, fontSize: "14px", fontWeight: "700", margin: "0 0 2px" }}>
                      {adoption.farmer.name}
                    </Text>
                    <Text style={{ color: GREEN_LIGHT, fontSize: "12px", margin: 0 }}>
                      {t(lang, "Dein Waldhüter", "Your Forest Guardian", "Votre Gardien de Forêt", "حارس غابتك", "Tu Guardián del Bosque")}
                    </Text>
                  </Column>
                </Row>
              )}
            </Container>
          </Section>
        )}

        {/* ── CTA button ──────────────────────────────────────────────────── */}
        <Section style={{ backgroundColor: GREEN_BRAND, padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px", textAlign: "center" }}>
            <Button
              href={ctaUrl}
              style={{
                backgroundColor: WHITE,
                color: GREEN_BRAND,
                fontSize: "16px",
                fontWeight: "800",
                padding: "16px 40px",
                borderRadius: "50px",
                display: "inline-block",
                textDecoration: "none",
                letterSpacing: "0.5px",
              }}
            >
              {ctaLabel}
            </Button>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", marginTop: "12px" }}>
              {ctaUrl}
            </Text>
          </Container>
        </Section>

        {/* ── Plan summary ────────────────────────────────────────────────── */}
        <Section style={{ backgroundColor: WHITE, padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px" }}>
            <Heading as="h3" style={{ color: GREEN_DEEP, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 20px", fontWeight: "700" }}>
              {t(lang, "Deine Patenschaft", "Your Adoption", "Votre Adoption", "تبنيك", "Tu Adopción")}
            </Heading>

            <Row>
              <Column style={{ width: "50%", paddingRight: "16px" }}>
                <Section style={{ backgroundColor: GRAY_LIGHT, borderRadius: "12px", padding: "16px" }}>
                  <Text style={{ color: GRAY, fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px" }}>
                    {t(lang, "Plan", "Plan", "Formule", "الخطة", "Plan")}
                  </Text>
                  <Text style={{ color: GREEN_DEEP, fontSize: "16px", fontWeight: "700", margin: 0 }}>
                    {displayPlan}
                  </Text>
                </Section>
              </Column>
              <Column style={{ width: "50%", paddingLeft: "16px" }}>
                <Section style={{ backgroundColor: GRAY_LIGHT, borderRadius: "12px", padding: "16px" }}>
                  <Text style={{ color: GRAY, fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px" }}>
                    {t(lang, "Betrag", "Amount", "Montant", "المبلغ", "Cantidad")}
                  </Text>
                  <Text style={{ color: GREEN_DEEP, fontSize: "16px", fontWeight: "700", margin: 0 }}>
                    {displayAmount}
                  </Text>
                </Section>
              </Column>
            </Row>

            {/* Inclusions */}
            <Section style={{ marginTop: "20px" }}>
              {[
                `📍 ${t(lang, "GPS-Standort deines Baumes", "GPS location of your tree", "Localisation GPS de votre arbre", "موقع GPS لشجرتك", "Coordenadas GPS de tu árbol")}`,
                `📸 ${t(lang, "Monatliche Wachstumsfotos", "Monthly growth photos", "Photos mensuelles de croissance", "صور نمو شهرية", "Fotos mensuales de crecimiento")}`,
                `📊 ${t(lang, "Persönliches Impact-Dashboard", "Personal impact dashboard", "Tableau de bord d'impact personnel", "لوحة تأثير شخصية", "Panel de impacto personal")}`,
                `🏫 ${t(lang, "30% für Schulbau (120 Kinder)", "30% toward school construction (120 kids)", "30% pour construction scolaire (120 enfants)", "30% لبناء مدرسة (120 طفل)", "30% para escuela (120 niños)")}`,
              ].map((item, i) => (
                <Row key={i} style={{ marginBottom: "8px" }}>
                  <Column>
                    <Text style={{ color: GREEN_MED, fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
                      {item}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Section>

        {/* ── Quetzito mascot box ─────────────────────────────────────────── */}
        <Section style={{ backgroundColor: "#E8F5E9", padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 32px" }}>
            <Row>
              <Column style={{ width: "52px", verticalAlign: "top" }}>
                <Text style={{ fontSize: "40px", lineHeight: "1", margin: 0 }}>🦜</Text>
              </Column>
              <Column style={{ paddingLeft: "16px", verticalAlign: "top" }}>
                <Text style={{ color: GREEN_DEEP, fontSize: "15px", fontWeight: "700", margin: "0 0 6px" }}>
                  {t(lang, "Hallo! Ich bin Quetzito", "Hi! I'm Quetzito", "Bonjour ! Je suis Quetzito", "!مرحباً! أنا كويتزيتو", "¡Hola! Soy Quetzito")}
                </Text>
                <Text style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                  {t(
                    lang,
                    "Ich werde dein Begleiter auf diesem grünen Abenteuer sein. Ich schicke dir GPS-Koordinaten, Fotos und Neuigkeiten über das Wachstum deines Baumes. Mach dich bereit, Magie zu erleben!",
                    "I'll be your guide on this green adventure. I'll send you GPS coordinates, photos and news about your tree's growth. Get ready to witness magic!",
                    "Je serai votre guide dans cette aventure verte. Je vous enverrai des coordonnées GPS, des photos et des nouvelles sur la croissance de votre arbre. Préparez-vous à voir de la magie !",
                    "سأكون دليلك في هذه المغامرة الخضراء. سأرسل لك إحداثيات GPS وصوراً وأخباراً عن نمو شجرتك. استعد لمشاهدة السحر!",
                    "Seré tu guía en esta aventura verde. Te enviaré coordenadas GPS, fotos y noticias sobre el crecimiento de tu árbol. ¡Prepárate para ver magia!"
                  )}
                </Text>
              </Column>
            </Row>
          </Container>
        </Section>

        {/* ── Timeline: Day 1 / 7 / 30 / 60 / 90 ────────────────────────── */}
        <Section style={{ backgroundColor: WHITE, padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px" }}>
            <Heading as="h3" style={{ color: GREEN_DEEP, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 24px", fontWeight: "700" }}>
              {t(lang, "Was passiert als Nächstes?", "What happens next?", "Et maintenant ?", "ماذا يحدث بعد ذلك؟", "¿Qué pasa ahora?")}
            </Heading>

            {/* Timeline row */}
            <Row>
              {timelineDays.map((day, i) => (
                <Column key={day} style={{ textAlign: "center", padding: "0 4px" }}>
                  {/* Circle */}
                  <Section style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: i === 0 ? GREEN_BRAND : GRAY_LIGHT,
                    margin: "0 auto 8px",
                    lineHeight: "40px",
                    textAlign: "center",
                  }}>
                    <Text style={{
                      color: i === 0 ? WHITE : GREEN_BRAND,
                      fontSize: "11px",
                      fontWeight: "700",
                      margin: 0,
                      lineHeight: "40px",
                    }}>
                      {day === 1 ? "D1" : `D${day}`}
                    </Text>
                  </Section>
                  <Text style={{ color: GRAY, fontSize: "10px", textAlign: "center", margin: 0, lineHeight: "1.3" }}>
                    {timelineLabels[day]}
                  </Text>
                </Column>
              ))}
            </Row>

            <Hr style={{ borderColor: GRAY_LIGHT, margin: "24px 0" }} />

            {/* Step list */}
            {[
              t(lang, "Dein Baum wird in den nächsten Tagen gepflanzt", "Your tree will be planted in the coming days", "Votre arbre sera planté dans les prochains jours", "ستُزرع شجرتك في الأيام القادمة", "Tu árbol será plantado en los próximos días"),
              t(lang, "Du erhältst die GPS-Koordinaten per E-Mail", "You'll receive the GPS coordinates by email", "Vous recevrez les coordonnées GPS par e-mail", "ستتلقى إحداثيات GPS عبر البريد الإلكتروني", "Recibirás las coordenadas GPS por email"),
              t(lang, "Jeden Monat: Fotos + Wachstumsbericht", "Every month: photos + growth report", "Chaque mois : photos + rapport de croissance", "كل شهر: صور + تقرير نمو", "Cada mes: fotos + reporte de crecimiento"),
              t(lang, "Alles in deinem persönlichen Dashboard verfolgen", "Track everything in your personal dashboard", "Tout suivre dans votre tableau de bord personnel", "تابع كل شيء في لوحتك الشخصية", "Sigue todo en tu panel personal"),
            ].map((step, i) => (
              <Row key={i} style={{ marginBottom: "12px" }}>
                <Column style={{ width: "28px", verticalAlign: "top" }}>
                  <Text style={{
                    width: "22px",
                    height: "22px",
                    lineHeight: "22px",
                    textAlign: "center",
                    backgroundColor: GREEN_BRAND,
                    color: WHITE,
                    borderRadius: "50%",
                    fontSize: "11px",
                    fontWeight: "700",
                    margin: "2px 0 0",
                    display: "block",
                  }}>
                    {i + 1}
                  </Text>
                </Column>
                <Column style={{ paddingLeft: "8px" }}>
                  <Text style={{ color: GREEN_DEEP, fontSize: "14px", margin: 0, lineHeight: "1.5" }}>
                    {step}
                  </Text>
                </Column>
              </Row>
            ))}
          </Container>
        </Section>

        {/* ── Impact stats ────────────────────────────────────────────────── */}
        <Section style={{ backgroundColor: GREEN_DEEP, padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px" }}>
            <Heading as="h3" style={{ color: GREEN_LIGHT, fontSize: "12px", letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 24px", fontWeight: "700" }}>
              {t(lang, "Dein Impact", "Your Impact", "Votre Impact", "تأثيرك", "Tu Impacto")}
            </Heading>
            <Row>
              {[
                { icon: "🌳", num: t(lang, "1 Baum", "1 tree", "1 arbre", "شجرة 1", "1 árbol"), label: t(lang, "gepflanzt", "planted", "planté", "مزروعة", "plantado") },
                { icon: "👨‍👩‍👧", num: t(lang, "1 Familie", "1 family", "1 famille", "عائلة 1", "1 familia"), label: t(lang, "beschäftigt", "employed", "employée", "موظفة", "empleada") },
                { icon: "🏫", num: "30%", label: t(lang, "für die Schule", "for the school", "pour l'école", "للمدرسة", "para la escuela") },
              ].map((stat, i) => (
                <Column key={i} style={{ textAlign: "center", padding: "0 8px" }}>
                  <Text style={{ fontSize: "28px", margin: "0 0 4px" }}>{stat.icon}</Text>
                  <Text style={{ color: WHITE, fontSize: "16px", fontWeight: "800", margin: "0 0 2px" }}>{stat.num}</Text>
                  <Text style={{ color: GREEN_LIGHT, fontSize: "12px", margin: 0 }}>{stat.label}</Text>
                </Column>
              ))}
            </Row>
          </Container>
        </Section>

        {/* ── Referral ────────────────────────────────────────────────────── */}
        <Section style={{ backgroundColor: "#FFF8E7", padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px" }}>
            <Text style={{ fontSize: "32px", textAlign: "center", margin: "0 0 12px" }}>🎁</Text>
            <Heading as="h3" style={{ color: GREEN_DEEP, fontSize: "18px", fontWeight: "800", textAlign: "center", margin: "0 0 12px" }}>
              {t(lang, "Möchtest du noch jemandem eine Freude machen?", "Want to make someone else happy?", "Vous voulez rendre quelqu'un d'autre heureux ?", "هل تريد أن تُسعد شخصاً آخر؟", "¿Quieres hacer feliz a alguien más?")}
            </Heading>
            <Text style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", textAlign: "center", margin: "0 0 20px" }}>
              {t(
                lang,
                "Ein Baum ist das originellste und bedeutungsvollste Geschenk. Mach es nochmal!",
                "A tree is the most original and meaningful gift. Do it again!",
                "Un arbre est le cadeau le plus original et le plus significatif. Recommencez !",
                "الشجرة هي أكثر الهدايا أصالةً ومعنىً. افعلها مرة أخرى!",
                "Regalar un árbol es el regalo más original y significativo. ¡Hazlo de nuevo!"
              )}
            </Text>
            <Row>
              <Column style={{ textAlign: "center" }}>
                <Button
                  href={referralUrl ?? `${baseUrl}/regalar`}
                  style={{
                    backgroundColor: "#F59E0B",
                    color: WHITE,
                    fontSize: "14px",
                    fontWeight: "700",
                    padding: "12px 32px",
                    borderRadius: "50px",
                    display: "inline-block",
                    textDecoration: "none",
                  }}
                >
                  {t(lang, "🎁 Noch einen Baum verschenken", "🎁 Gift another tree", "🎁 Offrir un autre arbre", "🎁 أهدِ شجرة أخرى", "🎁 Regalar otro árbol")}
                </Button>
              </Column>
            </Row>
          </Container>
        </Section>

        {/* ── Daniel's signature ──────────────────────────────────────────── */}
        <Section style={{ backgroundColor: WHITE, padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 32px 16px" }}>
            <Hr style={{ borderColor: GRAY_LIGHT, margin: "0 0 24px" }} />
            <Row>
              <Column style={{ width: "56px" }}>
                <Img
                  src="https://quetz.org/images/team/daniel.jpg"
                  alt="Daniel Garrido"
                  width="48"
                  height="48"
                  style={{ borderRadius: "50%", display: "block", objectFit: "cover" }}
                />
              </Column>
              <Column style={{ paddingLeft: "12px", verticalAlign: "middle" }}>
                <Text style={{ color: GREEN_DEEP, fontSize: "14px", fontWeight: "700", margin: "0 0 2px" }}>
                  Daniel Garrido
                </Text>
                <Text style={{ color: GRAY, fontSize: "12px", margin: 0 }}>
                  {t(lang, "Gründer, Quetz.org", "Founder, Quetz.org", "Fondateur, Quetz.org", "مؤسس، Quetz.org", "Fundador, Quetz.org")}
                </Text>
              </Column>
            </Row>
            <Text style={{ color: GREEN_MED, fontSize: "14px", lineHeight: "1.8", marginTop: "16px" }}>
              {t(
                lang,
                `Liebe/r ${displayName},\n\nDanke — du hast heute nicht nur einen Baum gepflanzt. Du hast eine Geschichte begonnen, die eine Familie, 120 Kinder und unseren Planeten berühren wird. Ich freue mich darauf, dir jeden Schritt davon zu zeigen.\n\nMit grünen Grüßen,\nDaniel`,
                `Dear ${displayName},\n\nThank you — today you didn't just plant a tree. You started a story that will touch a family, 120 children and our planet. I look forward to showing you every step of it.\n\nWith green greetings,\nDaniel`,
                `Cher/Chère ${displayName},\n\nMerci — aujourd'hui, vous n'avez pas seulement planté un arbre. Vous avez commencé une histoire qui touchera une famille, 120 enfants et notre planète. J'ai hâte de vous montrer chaque étape.\n\nCordialement,\nDaniel`,
                `عزيزي/عزيزتي ${displayName}،\n\nشكراً لك — اليوم لم تزرع شجرة فحسب. بل بدأت قصة ستلمس عائلة و120 طفلاً وكوكبنا. أتطلع إلى إريك كل خطوة منها.\n\nمع تحياتي الخضراء،\nDaniel`,
                `Querido/a ${displayName},\n\nGracias — hoy no solo plantaste un árbol. Comenzaste una historia que tocará a una familia, 120 niños y nuestro planeta. Espero con ansias mostrarte cada paso.\n\nCon cariño verde,\nDaniel`
              )}
            </Text>
          </Container>
        </Section>

        {/* ── Footer / Impressum ───────────────────────────────────────────── */}
        <Section style={{ backgroundColor: GREEN_DEEP, padding: "0" }}>
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 32px" }}>
            <Row style={{ marginBottom: "16px" }}>
              <Column style={{ textAlign: "center" }}>
                {[
                  { href: `${baseUrl}/mi-bosque`, label: t(lang, "Mein Wald", "My Forest", "Ma Forêt", "غابتي", "Mi Bosque") },
                  { href: `${baseUrl}/transparencia`, label: t(lang, "Transparenz", "Transparency", "Transparence", "الشفافية", "Transparencia") },
                  { href: `${baseUrl}/impressum`, label: "Impressum" },
                  { href: `${baseUrl}/datenschutz`, label: t(lang, "Datenschutz", "Privacy", "Confidentialité", "الخصوصية", "Privacidad") },
                ].map((link, i) => (
                  <React.Fragment key={link.href}>
                    <Link href={link.href} style={{ color: GREEN_LIGHT, fontSize: "12px", textDecoration: "none" }}>
                      {link.label}
                    </Link>
                    {i < 3 && <Text style={{ color: GREEN_MED, fontSize: "12px", display: "inline", margin: "0 8px" }}>·</Text>}
                  </React.Fragment>
                ))}
              </Column>
            </Row>

            <Hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "0 0 16px" }} />

            <Text style={{ color: GREEN_MED, fontSize: "11px", textAlign: "center", margin: "0 0 4px", lineHeight: "1.6" }}>
              Quetz GmbH · Münster, Deutschland · dgarrido@quetz.org
            </Text>
            <Text style={{ color: "rgba(82,183,136,0.5)", fontSize: "10px", textAlign: "center", margin: 0 }}>
              {t(
                lang,
                "Du erhältst diese E-Mail, weil du einen Baum bei Quetz.org adoptiert hast.",
                "You received this email because you adopted a tree at Quetz.org.",
                "Vous avez reçu cet e-mail parce que vous avez adopté un arbre chez Quetz.org.",
                "تلقيت هذا البريد الإلكتروني لأنك تبنيت شجرة في Quetz.org.",
                "Recibiste este email porque adoptaste un árbol en Quetz.org."
              )}
            </Text>
          </Container>
        </Section>

      </Body>
    </Html>
  );
}

export default WelcomeTreeAdoption;
