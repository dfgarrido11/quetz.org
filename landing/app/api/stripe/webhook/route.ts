export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { renderWelcomeEmail } from "@/emails/render";
import { getWelcomeSubject } from "@/emails/welcome-tree-adoption";
import { B2B_PLANS, B2bPlanId } from "@/lib/plans";

function getSubjectLine(language: string | undefined): string {
  if (language === "en") return "🌳 Your tree has a name! Welcome to the Quetz family";
  if (language === "de") return "🌳 Dein Baum hat einen Namen! Willkommen in der Quetz-Familie";
  if (language === "fr") return "🌳 Votre arbre a un nom ! Bienvenue dans la famille Quetz";
  if (language === "ar") return "🌳 شجرتك لها اسم! مرحباً بك في عائلة Quetz";
  return "🌳 ¡Tu árbol ya tiene nombre! Bienvenido/a a la familia Quetz";
}

function buildWelcomeEmail(
  customerName: string,
  language: string | undefined,
  planName: string,
  amount: number,
  currency: string
): string {
  const lang = language === "en" ? "en"
    : language === "de" ? "de"
    : language === "fr" ? "fr"
    : language === "ar" ? "ar"
    : "es";

  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  const name = customerName || (
    lang === "en" ? "Friend"
    : lang === "de" ? "Freund"
    : lang === "fr" ? "Ami(e)"
    : lang === "ar" ? "صديقي"
    : "Amigo/a"
  );

  // ── Header tagline ─────────────────────────────────────────────────────────
  const tagline =
    lang === "en" ? "Where every tree changes a life"
    : lang === "de" ? "Wo jeder Baum ein Leben verändert"
    : lang === "fr" ? "Où chaque arbre change une vie"
    : lang === "ar" ? "حيث تغيّر كل شجرة حياةً"
    : "Donde cada árbol cambia una vida";

  // ── Hero paragraph ─────────────────────────────────────────────────────────
  const heroTitle =
    lang === "en" ? `Congratulations, ${name}! 🎉`
    : lang === "de" ? `Herzlichen Glückwunsch, ${name}! 🎉`
    : lang === "fr" ? `Félicitations, ${name} ! 🎉`
    : lang === "ar" ? `!${name} ،مبروك 🎉`
    : `¡Felicidades, ${name}! 🎉`;

  const heroParagraph =
    lang === "en"
      ? `You are now part of something extraordinary. Right now, in Zacapa, Guatemala, a local family is preparing the soil where <strong>YOUR tree</strong> will grow. This is not just a tree — it's a job for a family, oxygen for the planet, and one more step toward the school that 120 children are waiting for.`
    : lang === "de"
      ? `Du bist jetzt Teil von etwas Außergewöhnlichem. In diesem Moment bereitet in Zacapa, Guatemala, eine lokale Familie die Erde vor, in der <strong>DEIN Baum</strong> wachsen wird. Das ist kein gewöhnlicher Baum — es ist ein Arbeitsplatz für eine Familie, Sauerstoff für den Planeten und ein weiterer Schritt in Richtung der Schule, auf die 120 Kinder warten.`
    : lang === "fr"
      ? `Vous faites désormais partie de quelque chose d'extraordinaire. En ce moment même, à Zacapa, au Guatemala, une famille locale prépare la terre où <strong>VOTRE arbre</strong> grandira. Ce n'est pas qu'un arbre — c'est un emploi pour une famille, de l'oxygène pour la planète, et un pas de plus vers l'école qu'attendent 120 enfants.`
    : lang === "ar"
      ? `أنت الآن جزء من شيء استثنائي. في هذه اللحظة، في زاكاپا، غواتيمالا، تُهيّئ عائلة محلية التربة حيث ستنمو <strong>شجرتك</strong>. إنها ليست مجرد شجرة — إنها وظيفة لعائلة، وأكسجين للكوكب، وخطوة أخرى نحو المدرسة التي ينتظرها 120 طفلاً.`
      : `Ahora eres parte de algo extraordinario. En este momento, en Zacapa, Guatemala, una familia local está preparando la tierra donde crecerá <strong>TU árbol</strong>. No es solo un árbol — es un empleo para una familia, oxígeno para el planeta, y un paso más hacia la escuela que 120 niños esperan.`;

  // ── Quetzito box ───────────────────────────────────────────────────────────
  const quetzitoText =
    lang === "en"
      ? `<strong>Hi! I'm Quetzito 🦜</strong> and I'll be your guide on this green adventure. I'll send you GPS coordinates, photos, and news about how your tree is growing. Get ready to witness magic!`
    : lang === "de"
      ? `<strong>Hallo! Ich bin Quetzito 🦜</strong> und ich werde dein Begleiter auf diesem grünen Abenteuer sein. Ich schicke dir GPS-Koordinaten, Fotos und Neuigkeiten darüber, wie dein Baum wächst. Mach dich bereit, Magie zu erleben!`
    : lang === "fr"
      ? `<strong>Bonjour ! Je suis Quetzito 🦜</strong> et je serai votre guide dans cette aventure verte. Je vous enverrai des coordonnées GPS, des photos et des nouvelles sur la croissance de votre arbre. Préparez-vous à voir de la magie !`
    : lang === "ar"
      ? `<strong>!مرحباً! أنا كويتزيتو 🦜</strong> وسأكون دليلك في هذه المغامرة الخضراء. سأرسل لك إحداثيات GPS وصوراً وأخباراً عن نمو شجرتك. استعد لمشاهدة السحر!`
      : `<strong>¡Hola! Soy Quetzito 🦜</strong> y seré tu guía en esta aventura verde. Te enviaré fotos, coordenadas GPS y noticias sobre cómo crece tu árbol. ¡Prepárate para ver magia!`;

  // ── Plan summary labels ────────────────────────────────────────────────────
  const planLabel =
    lang === "en" ? "Your Plan"
    : lang === "de" ? "Dein Plan"
    : lang === "fr" ? "Votre formule"
    : lang === "ar" ? "خطتك"
    : "Tu Plan";

  const amountLabel =
    lang === "en" ? "Amount paid"
    : lang === "de" ? "Bezahlter Betrag"
    : lang === "fr" ? "Montant payé"
    : lang === "ar" ? "المبلغ المدفوع"
    : "Cantidad pagada";

  const includedLabel =
    lang === "en" ? "What's included:"
    : lang === "de" ? "Enthalten:"
    : lang === "fr" ? "Ce qui est inclus :"
    : lang === "ar" ? ":ما يشمله"
    : "¿Qué incluye?";

  const inclusions = [
    lang === "en" ? "📍 GPS location of your tree"
    : lang === "de" ? "📍 GPS-Standort deines Baumes"
    : lang === "fr" ? "📍 Localisation GPS de votre arbre"
    : lang === "ar" ? "📍 موقع GPS لشجرتك"
    : "📍 Coordenadas GPS de tu árbol",

    lang === "en" ? "📸 Monthly growth photos"
    : lang === "de" ? "📸 Monatliche Wachstumsfotos"
    : lang === "fr" ? "📸 Photos mensuelles de croissance"
    : lang === "ar" ? "📸 صور نمو شهرية"
    : "📸 Fotos mensuales de crecimiento",

    lang === "en" ? "📊 Personal impact dashboard"
    : lang === "de" ? "📊 Persönliches Impact-Dashboard"
    : lang === "fr" ? "📊 Tableau de bord d'impact personnel"
    : lang === "ar" ? "📊 لوحة تأثير شخصية"
    : "📊 Panel de impacto personal",

    lang === "en" ? "🏫 30% goes to build a school for 120 children"
    : lang === "de" ? "🏫 30% gehen in den Bau einer Schule für 120 Kinder"
    : lang === "fr" ? "🏫 30 % financent la construction d'une école pour 120 enfants"
    : lang === "ar" ? "🏫 30% تذهب لبناء مدرسة لـ 120 طفلاً"
    : "🏫 30% va para construir una escuela para 120 niños",
  ];

  const displayAmount = `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  const displayPlan = planName || (
    lang === "en" ? "Tree Adoption"
    : lang === "de" ? "Baum-Patenschaft"
    : lang === "fr" ? "Adoption d'arbre"
    : lang === "ar" ? "تبني شجرة"
    : "Adopción de Árbol"
  );

  // ── Impact stats ───────────────────────────────────────────────────────────
  const impactStats = [
    {
      icon: "🌳",
      num: lang === "en" ? "1 tree" : lang === "de" ? "1 Baum" : lang === "fr" ? "1 arbre" : lang === "ar" ? "شجرة 1" : "1 árbol",
      label: lang === "en" ? "planted" : lang === "de" ? "gepflanzt" : lang === "fr" ? "planté" : lang === "ar" ? "مزروعة" : "plantado",
    },
    {
      icon: "👨‍👩‍👧",
      num: lang === "en" ? "1 family" : lang === "de" ? "1 Familie" : lang === "fr" ? "1 famille" : lang === "ar" ? "عائلة 1" : "1 familia",
      label: lang === "en" ? "employed" : lang === "de" ? "beschäftigt" : lang === "fr" ? "employée" : lang === "ar" ? "موظفة" : "empleada",
    },
    {
      icon: "🏫",
      num: "30%",
      label: lang === "en" ? "for the school" : lang === "de" ? "für die Schule" : lang === "fr" ? "pour l'école" : lang === "ar" ? "للمدرسة" : "para la escuela",
    },
  ];

  // ── Next steps ─────────────────────────────────────────────────────────────
  const nextStepsTitle =
    lang === "en" ? "What happens next?"
    : lang === "de" ? "Was passiert als Nächstes?"
    : lang === "fr" ? "Et maintenant ?"
    : lang === "ar" ? "ماذا يحدث بعد ذلك؟"
    : "¿Qué pasa ahora?";

  const steps = lang === "en" ? [
    "Your tree will be planted in the coming days",
    "You'll receive the GPS coordinates by email",
    "Every month we'll send you photos and a growth report",
    "You can follow everything in your personal dashboard",
  ] : lang === "de" ? [
    "Dein Baum wird in den nächsten Tagen gepflanzt",
    "Du erhältst die GPS-Koordinaten per E-Mail",
    "Jeden Monat senden wir dir Fotos und einen Wachstumsbericht",
    "Du kannst alles in deinem persönlichen Dashboard verfolgen",
  ] : lang === "fr" ? [
    "Votre arbre sera planté dans les prochains jours",
    "Vous recevrez les coordonnées GPS par e-mail",
    "Chaque mois, nous vous enverrons des photos et un rapport de croissance",
    "Vous pouvez tout suivre dans votre tableau de bord personnel",
  ] : lang === "ar" ? [
    "ستُزرع شجرتك في الأيام القادمة",
    "ستتلقى إحداثيات GPS عبر البريد الإلكتروني",
    "كل شهر سنرسل لك صوراً وتقرير نمو",
    "يمكنك متابعة كل شيء في لوحتك الشخصية",
  ] : [
    "Tu árbol será plantado en los próximos días",
    "Recibirás las coordenadas GPS por email",
    "Cada mes te enviaremos fotos y un reporte de crecimiento",
    "Puedes seguir todo en tu panel personal",
  ];

  const stepNums = ["①", "②", "③", "④"];

  // ── CTA ────────────────────────────────────────────────────────────────────
  const ctaText =
    lang === "en" ? "🌿 Explore My Forest"
    : lang === "de" ? "🌿 Meinen Wald entdecken"
    : lang === "fr" ? "🌿 Explorer ma forêt"
    : lang === "ar" ? "🌿 استكشف غابتي"
    : "🌿 Explorar Mi Bosque";

  // ── Share / referral ───────────────────────────────────────────────────────
  const shareTitle =
    lang === "en" ? "💚 Share the love"
    : lang === "de" ? "💚 Teile die Liebe"
    : lang === "fr" ? "💚 Partagez l'amour"
    : lang === "ar" ? "💚 انشر المحبة"
    : "💚 Comparte el amor";

  const shareText =
    lang === "en"
      ? "Would you like someone special to also have their own tree? Gift a tree and transform another life."
    : lang === "de"
      ? "Möchtest du, dass jemand Besonderes auch seinen eigenen Baum hat? Verschenke einen Baum und verändere ein weiteres Leben."
    : lang === "fr"
      ? "Vous souhaitez qu'une personne chère ait elle aussi son propre arbre ? Offrez un arbre et transformez une autre vie."
    : lang === "ar"
      ? "هل تريد أن يكون لشخص عزيز شجرته الخاصة؟ أهدِ شجرة وغيّر حياةً أخرى."
      : "¿Te gustaría que alguien especial también tenga su propio árbol? Regala un árbol y transforma otra vida.";

  const giftBtnText =
    lang === "en" ? "Gift a Tree 🎁"
    : lang === "de" ? "Einen Baum verschenken 🎁"
    : lang === "fr" ? "Offrir un arbre 🎁"
    : lang === "ar" ? "أهدِ شجرة 🎁"
    : "Regalar un Árbol 🎁";

  const shareLabel =
    lang === "en" ? "Share your impact:"
    : lang === "de" ? "Teile deinen Impact:"
    : lang === "fr" ? "Partagez votre impact :"
    : lang === "ar" ? ":شارك تأثيرك"
    : "Comparte tu impacto:";

  const waText = encodeURIComponent(
    lang === "en"
      ? `I just adopted a tree in Guatemala with Quetz.org 🌳 Every tree creates a job and helps build a school for 120 children. Check it out! https://quetz.org`
    : lang === "de"
      ? `Ich habe gerade einen Baum in Guatemala mit Quetz.org adoptiert 🌳 Jeder Baum schafft einen Arbeitsplatz und hilft beim Bau einer Schule für 120 Kinder. Schaut mal! https://quetz.org`
    : lang === "fr"
      ? `Je viens d'adopter un arbre au Guatemala avec Quetz.org 🌳 Chaque arbre crée un emploi et aide à construire une école pour 120 enfants. Regardez ! https://quetz.org`
    : lang === "ar"
      ? `لقد تبنيت للتو شجرة في غواتيمالا مع Quetz.org 🌳 كل شجرة توفر وظيفة وتساعد في بناء مدرسة لـ 120 طفلاً. تفضل! https://quetz.org`
      : `Acabo de adoptar un árbol en Guatemala con Quetz.org 🌳 Cada árbol crea un empleo y ayuda a construir una escuela para 120 niños. ¡Mira! https://quetz.org`
  );

  const waLinkText = lang === "en" ? "WhatsApp" : lang === "de" ? "WhatsApp" : lang === "fr" ? "WhatsApp" : lang === "ar" ? "واتساب" : "WhatsApp";

  const emailSubjectShare = encodeURIComponent(
    lang === "en" ? "I adopted a tree with Quetz.org 🌳"
    : lang === "de" ? "Ich habe einen Baum mit Quetz.org adoptiert 🌳"
    : lang === "fr" ? "J'ai adopté un arbre avec Quetz.org 🌳"
    : lang === "ar" ? "لقد تبنيت شجرة مع Quetz.org 🌳"
    : "Acabo de adoptar un árbol con Quetz.org 🌳"
  );

  const emailBodyShare = encodeURIComponent(
    lang === "en"
      ? `Hi! I just adopted a tree in Guatemala with Quetz.org and I wanted to share it with you. Every tree creates a job for a local family and helps build a school for 120 children. Check it out: https://quetz.org`
    : lang === "de"
      ? `Hallo! Ich habe gerade einen Baum in Guatemala mit Quetz.org adoptiert und wollte es mit dir teilen. Jeder Baum schafft Arbeit für eine lokale Familie und hilft beim Bau einer Schule für 120 Kinder. Schau mal: https://quetz.org`
    : lang === "fr"
      ? `Salut ! Je viens d'adopter un arbre au Guatemala avec Quetz.org et je voulais le partager avec toi. Chaque arbre crée un emploi pour une famille locale et aide à construire une école pour 120 enfants. Regarde : https://quetz.org`
    : lang === "ar"
      ? `مرحباً! لقد تبنيت للتو شجرة في غواتيمالا مع Quetz.org وأردت مشاركتك ذلك. كل شجرة توفر وظيفة لعائلة محلية وتساعد في بناء مدرسة لـ 120 طفلاً. اطلع: https://quetz.org`
      : `¡Hola! Acabo de adoptar un árbol en Guatemala con Quetz.org y quería compartirlo contigo. Cada árbol crea un empleo para una familia local y ayuda a construir una escuela para 120 niños. ¡Mira: https://quetz.org`
  );

  const emailLinkText = lang === "en" ? "Email" : lang === "de" ? "E-Mail" : lang === "fr" ? "E-mail" : lang === "ar" ? "بريد إلكتروني" : "Email";

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerLove =
    lang === "en" ? "With love from Guatemala 🇬🇹"
    : lang === "de" ? "Mit Liebe aus Guatemala 🇬🇹"
    : lang === "fr" ? "Avec amour depuis le Guatemala 🇬🇹"
    : lang === "ar" ? "🇬🇹 بمحبة من غواتيمالا"
    : "Con amor desde Guatemala 🇬🇹";

  const unsubNote =
    lang === "en" ? "You're receiving this email because you adopted a tree with Quetz.org."
    : lang === "de" ? "Du erhältst diese E-Mail, weil du einen Baum bei Quetz.org adoptiert hast."
    : lang === "fr" ? "Vous recevez cet e-mail car vous avez adopté un arbre avec Quetz.org."
    : lang === "ar" ? "تلقيت هذا البريد الإلكتروني لأنك تبنيت شجرة مع Quetz.org."
    : "Recibes este email porque adoptaste un árbol con Quetz.org.";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quetz.org</title>
</head>
<body style="margin:0;padding:0;background-color:#d8f3dc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#d8f3dc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(8,28,21,0.18);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(160deg,#081C15 0%,#1B4332 50%,#52B788 100%);padding:48px 32px 40px;text-align:center;">
              <div style="font-size:42px;font-weight:900;color:#ffffff;letter-spacing:-1px;margin-bottom:8px;text-shadow:0 2px 8px rgba(0,0,0,0.3);">
                QUETZ.ORG
              </div>
              <div style="font-size:14px;color:#B7E4C7;letter-spacing:3px;text-transform:uppercase;margin-bottom:0;">
                ${tagline}
              </div>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding:40px 32px 28px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:26px;font-weight:800;color:#081C15;margin:0 0 16px;line-height:1.2;">
                ${heroTitle}
              </p>
              <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 0;">
                ${heroParagraph}
              </p>
            </td>
          </tr>

          <!-- QUETZITO MASCOT BOX -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="background:linear-gradient(135deg,#1B4332 0%,#2D6A4F 60%,#52B788 100%);border-radius:12px;padding:20px 24px;overflow:hidden;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:96px;vertical-align:top;${isRtl ? "padding-left:16px;" : "padding-right:16px;"}">
                      <img src="https://www.quetz.org/mascot/quetzito-aventurero.png"
                           alt="Quetzito"
                           width="80"
                           style="width:80px;height:auto;border-radius:50%;border:3px solid #52B788;display:block;" />
                    </td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#ffffff;">
                        ${quetzitoText}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- PLAN SUMMARY -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="background:#f8fffe;border:1.5px solid #B7E4C7;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(82,183,136,0.08);">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${planLabel}</td>
                  </tr>
                  <tr>
                    <td style="font-size:20px;font-weight:700;color:#081C15;">${displayPlan}</td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="font-size:13px;color:#6b7280;padding-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${amountLabel}</td>
                  </tr>
                  <tr>
                    <td style="font-size:22px;font-weight:800;color:#2D6A4F;">${displayAmount}</td>
                  </tr>
                </table>
                <p style="font-size:13px;font-weight:700;color:#374151;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">${includedLabel}</p>
                ${inclusions.map(item => `
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#374151;line-height:1.5;border-bottom:1px solid #d8f3dc;">
                      ${item}
                    </td>
                  </tr>
                </table>`).join("")}
              </div>
            </td>
          </tr>

          <!-- YOUR IMPACT -->
          <tr>
            <td style="padding:0 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${impactStats.map(stat => `
                  <td width="33%" style="text-align:center;padding:0 6px;">
                    <div style="background:linear-gradient(135deg,#2D6A4F,#52B788);border-radius:12px;padding:20px 8px;box-shadow:0 4px 12px rgba(45,106,79,0.25);">
                      <div style="font-size:28px;margin-bottom:4px;">${stat.icon}</div>
                      <div style="font-size:15px;font-weight:800;color:#ffffff;margin-bottom:2px;">${stat.num}</div>
                      <div style="font-size:12px;color:#B7E4C7;">${stat.label}</div>
                    </div>
                  </td>`).join("")}
                </tr>
              </table>
            </td>
          </tr>

          <!-- NEXT STEPS -->
          <tr>
            <td style="padding:0 32px 32px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:17px;font-weight:700;color:#081C15;margin:0 0 16px;">
                ${nextStepsTitle}
              </p>
              ${steps.map((step, i) => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td style="width:36px;vertical-align:top;${isRtl ? "padding-left:12px;" : "padding-right:12px;"}">
                    <div style="width:32px;height:32px;background:linear-gradient(135deg,#2D6A4F,#52B788);border-radius:50%;text-align:center;line-height:32px;font-size:16px;color:#ffffff;font-weight:700;">
                      ${stepNums[i]}
                    </div>
                  </td>
                  <td style="vertical-align:middle;font-size:14px;color:#374151;line-height:1.6;padding-top:5px;">
                    ${step}
                  </td>
                </tr>
              </table>`).join("")}
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding:0 32px 36px;text-align:center;">
              <a href="https://quetz.org/mi-bosque"
                 style="display:inline-block;background:linear-gradient(135deg,#081C15 0%,#2D6A4F 50%,#52B788 100%);color:#ffffff;text-decoration:none;font-size:17px;font-weight:800;padding:16px 44px;border-radius:50px;letter-spacing:0.5px;box-shadow:0 6px 20px rgba(8,28,21,0.35);">
                ${ctaText}
              </a>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 32px;">
              <div style="border-top:2px solid #d8f3dc;"></div>
            </td>
          </tr>

          <!-- SHARE / REFERRAL -->
          <tr>
            <td style="padding:32px 32px 28px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:18px;font-weight:800;color:#081C15;margin:0 0 10px;">${shareTitle}</p>
              <p style="font-size:14px;line-height:1.7;color:#374151;margin:0 0 20px;">${shareText}</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td align="${isRtl ? "right" : "left"}">
                    <a href="https://quetz.org/regalar"
                       style="display:inline-block;background:linear-gradient(135deg,#E9C46A,#f4a261);color:#081C15;text-decoration:none;font-size:15px;font-weight:700;padding:13px 32px;border-radius:50px;box-shadow:0 4px 14px rgba(233,196,106,0.4);">
                      ${giftBtnText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size:13px;color:#6b7280;margin:0 0 8px;font-weight:600;">${shareLabel}</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="${isRtl ? "padding-left:16px;" : "padding-right:16px;"}">
                    <a href="https://wa.me/?text=${waText}"
                       style="display:inline-flex;align-items:center;gap:6px;background:#25D366;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 18px;border-radius:20px;">
                      📱 ${waLinkText}
                    </a>
                  </td>
                  <td>
                    <a href="mailto:?subject=${emailSubjectShare}&body=${emailBodyShare}"
                       style="display:inline-flex;align-items:center;gap:6px;background:#2D6A4F;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 18px;border-radius:20px;">
                      ✉️ ${emailLinkText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:linear-gradient(135deg,#081C15,#1B4332);padding:28px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#B7E4C7;">
                ${footerLove}
              </p>
              <p style="margin:0 0 12px;font-size:13px;color:#52B788;">
                <a href="https://quetz.org" style="color:#52B788;text-decoration:none;">quetz.org</a>
                &nbsp;&bull;&nbsp;
                <a href="mailto:hola@quetz.org" style="color:#52B788;text-decoration:none;">hola@quetz.org</a>
              </p>
              <p style="margin:0;font-size:11px;color:#6b7280;">
                ${unsubNote}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendTelegramNotification(
  customerName: string,
  customerEmail: string,
  planName: string,
  amount: number,
  currency: string
): Promise<void> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const text =
      `🌳 <b>¡Nueva compra en Quetz.org!</b>\n\n` +
      `👤 <b>Cliente:</b> ${customerName || "—"}\n` +
      `📧 <b>Email:</b> ${customerEmail}\n` +
      `📋 <b>Plan:</b> ${planName || "Tree Adoption"}\n` +
      `💰 <b>Monto:</b> ${amount.toFixed(2)} ${currency.toUpperCase()}\n\n` +
      `🎉 ¡Otro árbol para Guatemala!`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, parse_mode: "HTML", text }),
    });
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}

// ── Gift helpers ──────────────────────────────────────────────────────────────

const GIFT_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateGiftCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += GIFT_CODE_CHARS[Math.floor(Math.random() * GIFT_CODE_CHARS.length)];
  }
  return code;
}

async function uniqueGiftCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateGiftCode();
    const existing = await prisma.gift.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique gift code");
}

function buildGiftRecipientEmail(
  recipientName: string,
  senderName: string,
  message: string,
  code: string,
  planName: string,
  occasion: string,
  language: string | undefined
): string {
  const lang = language === "en" ? "en" : language === "de" ? "de" : language === "fr" ? "fr" : language === "ar" ? "ar" : "es";
  const isRtl = lang === "ar";

  const occasionEmoji: Record<string, string> = { cumpleanos: "🎂", navidad: "🎄", sanValentin: "❤️", otro: "🎁", gift: "🎁" };
  const emoji = occasionEmoji[occasion] ?? "🎁";
  const activationUrl = `https://quetz.org/regalo/${code}`;

  const headerSub = lang === "en" ? "A very special gift" : lang === "de" ? "Ein ganz besonderes Geschenk" : lang === "fr" ? "Un cadeau très spécial" : lang === "ar" ? "هدية مميزة جداً" : "Un regalo muy especial";
  const heroTitle = lang === "en" ? `Hello, ${recipientName}! 🌟` : lang === "de" ? `Hallo, ${recipientName}! 🌟` : lang === "fr" ? `Bonjour, ${recipientName} ! 🌟` : lang === "ar" ? `!${recipientName} ،مرحباً 🌟` : `¡Hola, ${recipientName}! 🌟`;
  const heroCopy = lang === "en"
    ? `<strong>${senderName}</strong> thought of you and gifted you something unique: <strong>a real tree in Guatemala</strong>. This is no ordinary gift — it's life, a job for a family, and part of the school that 120 children are waiting for.`
    : lang === "de"
    ? `<strong>${senderName}</strong> hat an dich gedacht und dir etwas Einzigartiges geschenkt: <strong>einen echten Baum in Guatemala</strong>. Das ist kein gewöhnliches Geschenk — es ist Leben, ein Arbeitsplatz für eine Familie und Teil der Schule, auf die 120 Kinder warten.`
    : lang === "fr"
    ? `<strong>${senderName}</strong> a pensé à vous et vous a offert quelque chose d'unique : <strong>un vrai arbre au Guatemala</strong>. Ce n'est pas un cadeau ordinaire — c'est la vie, un emploi pour une famille, et une partie de l'école qu'attendent 120 enfants.`
    : lang === "ar"
    ? `<strong>${senderName}</strong> فكّر فيك وأهداك شيئاً فريداً: <strong>شجرة حقيقية في غواتيمالا</strong>. إنها ليست هدية عادية — إنها حياة، ووظيفة لعائلة، وجزء من المدرسة التي ينتظرها 120 طفلاً.`
    : `<strong>${senderName}</strong> ha pensado en ti y te ha regalado algo único: <strong>un árbol real en Guatemala</strong>. No es un regalo cualquiera — es vida, es empleo para una familia, y es parte de una escuela que 120 niños esperan.`;
  const codeLabel = lang === "en" ? "Your gift code" : lang === "de" ? "Dein Geschenkcode" : lang === "fr" ? "Votre code cadeau" : lang === "ar" ? "رمز هديتك" : "Tu código de regalo";
  const activateBtnText = lang === "en" ? "🌿 Activate my tree" : lang === "de" ? "🌿 Meinen Baum aktivieren" : lang === "fr" ? "🌿 Activer mon arbre" : lang === "ar" ? "🌿 فعّل شجرتي" : "🌿 Activar mi árbol";
  const orVisit = lang === "en" ? "Or visit:" : lang === "de" ? "Oder besuche:" : lang === "fr" ? "Ou rendez-vous sur :" : lang === "ar" ? ":أو زر" : "O visita:";
  const quetzitoText = lang === "en"
    ? `<strong>Hi! I'm Quetzito 🦜</strong> and I'll look after your tree in Guatemala. Once you activate it, I'll send you photos, GPS coordinates and news about its growth. Get ready for green magic!`
    : lang === "de"
    ? `<strong>Hallo! Ich bin Quetzito 🦜</strong> und ich werde deinen Baum in Guatemala hüten. Sobald du ihn aktivierst, schicke ich dir Fotos, GPS-Koordinaten und Neuigkeiten über sein Wachstum. Mach dich bereit für grüne Magie!`
    : lang === "fr"
    ? `<strong>Bonjour ! Je suis Quetzito 🦜</strong> et je veillerai sur votre arbre au Guatemala. Une fois activé, je vous enverrai des photos, des coordonnées GPS et des nouvelles de sa croissance. Préparez-vous à la magie verte !`
    : lang === "ar"
    ? `<strong>!مرحباً! أنا كويتزيتو 🦜</strong> وسأرعى شجرتك في غواتيمالا. بمجرد تفعيلها، سأرسل لك صوراً وإحداثيات GPS وأخباراً عن نموها. استعد للسحر الأخضر!`
    : `<strong>¡Hola! Soy Quetzito 🦜</strong> y voy a cuidar tu árbol en Guatemala. Cuando lo actives, te enviaré fotos, coordenadas GPS y noticias de su crecimiento. ¡Prepárate para la magia verde!`;
  const impactTree = lang === "en" ? "Your tree" : lang === "de" ? "Dein Baum" : lang === "fr" ? "Ton arbre" : lang === "ar" ? "شجرتك" : "Tu árbol";
  const impactLocation = lang === "en" ? "in Guatemala" : lang === "de" ? "in Guatemala" : lang === "fr" ? "au Guatemala" : lang === "ar" ? "في غواتيمالا" : "en Guatemala";
  const impactFamily = lang === "en" ? "1 family" : lang === "de" ? "1 Familie" : lang === "fr" ? "1 famille" : lang === "ar" ? "عائلة 1" : "1 familia";
  const impactEmployed = lang === "en" ? "employed" : lang === "de" ? "beschäftigt" : lang === "fr" ? "employée" : lang === "ar" ? "موظفة" : "empleada";
  const impactSchool = lang === "en" ? "for the school" : lang === "de" ? "für die Schule" : lang === "fr" ? "pour l'école" : lang === "ar" ? "للمدرسة" : "para la escuela";

  // Discount section
  const discountTitle = lang === "en" ? "💚 Love your tree? Adopt your own!" : lang === "de" ? "💚 Gefällt dir dein Baum? Adoptiere deinen eigenen!" : lang === "fr" ? "💚 Vous aimez votre arbre ? Adoptez le vôtre !" : lang === "ar" ? "💚 أعجبتك شجرتك؟ تبنَّ شجرتك الخاصة!" : "💚 ¿Te gustó tu árbol? ¡Adopta el tuyo!";
  const discountText = lang === "en" ? "As a special gift recipient, you get <strong>15% off</strong> your first monthly plan." : lang === "de" ? "Als besonderer Geschenkempfänger erhältst du <strong>15% Rabatt</strong> auf deinen ersten Monatsplan." : lang === "fr" ? "En tant que destinataire d'un cadeau spécial, vous bénéficiez de <strong>15% de réduction</strong> sur votre premier plan mensuel." : lang === "ar" ? "بصفتك متلقي هدية مميزة، تحصل على <strong>خصم 15%</strong> على خطتك الشهرية الأولى." : "Como destinatario de un regalo especial, tienes <strong>15% de descuento</strong> en tu primer plan mensual.";
  const discountBtn = lang === "en" ? "🌳 Adopt with 15% off" : lang === "de" ? "🌳 Mit 15% Rabatt adoptieren" : lang === "fr" ? "🌳 Adopter avec 15% de réduction" : lang === "ar" ? "🌳 تبنَّ بخصم 15%" : "🌳 Adoptar con 15% de descuento";

  // Share section
  const shareLabel = lang === "en" ? "Share your gift with the world:" : lang === "de" ? "Teile dein Geschenk mit der Welt:" : lang === "fr" ? "Partagez votre cadeau avec le monde :" : lang === "ar" ? ":شارك هديتك مع العالم" : "Comparte tu regalo con el mundo:";
  const waTextRecipient = encodeURIComponent(
    lang === "en" ? "I just received a tree in Guatemala as a gift from Quetz.org 🌳🎁 Every tree creates a job and helps build a school for 120 children! https://quetz.org"
    : lang === "de" ? "Ich habe gerade einen Baum in Guatemala als Geschenk von Quetz.org erhalten 🌳🎁 Jeder Baum schafft einen Arbeitsplatz und hilft beim Bau einer Schule für 120 Kinder! https://quetz.org"
    : lang === "fr" ? "Je viens de recevoir un arbre au Guatemala en cadeau via Quetz.org 🌳🎁 Chaque arbre crée un emploi et aide à construire une école pour 120 enfants ! https://quetz.org"
    : lang === "ar" ? "لقد تلقيت للتو شجرة في غواتيمالا كهدية من Quetz.org 🌳🎁 كل شجرة توفر وظيفة وتساعد في بناء مدرسة لـ 120 طفلاً! https://quetz.org"
    : "Me acaban de regalar un árbol en Guatemala con Quetz.org 🌳🎁 ¡Cada árbol crea un empleo y ayuda a construir una escuela! https://quetz.org"
  );
  const emailSubjectRecipient = encodeURIComponent(lang === "en" ? "I received a tree gift! 🌳" : lang === "de" ? "Ich habe ein Baum-Geschenk erhalten! 🌳" : lang === "fr" ? "J'ai reçu un cadeau arbre ! 🌳" : lang === "ar" ? "تلقيت هدية شجرة! 🌳" : "¡Me regalaron un árbol! 🌳");
  const emailBodyRecipient = encodeURIComponent(lang === "en" ? "Hi! I just received a real tree in Guatemala as a gift with Quetz.org. It's amazing — every tree creates jobs and helps build a school. https://quetz.org" : lang === "de" ? "Hallo! Ich habe gerade einen echten Baum in Guatemala als Geschenk mit Quetz.org erhalten. Es ist toll — jeder Baum schafft Arbeitsplätze und hilft beim Schulbau. https://quetz.org" : lang === "fr" ? "Salut ! Je viens de recevoir un vrai arbre au Guatemala en cadeau avec Quetz.org. C'est incroyable — chaque arbre crée des emplois et aide à construire une école. https://quetz.org" : lang === "ar" ? "مرحباً! لقد تلقيت للتو شجرة حقيقية في غواتيمالا كهدية مع Quetz.org. إنه رائع — كل شجرة توفر وظائف وتساعد في بناء مدرسة. https://quetz.org" : "¡Hola! Me acaban de regalar un árbol real en Guatemala con Quetz.org. Es increíble — cada árbol crea empleos y ayuda a construir una escuela. https://quetz.org");
  const waLinkLabel = "WhatsApp";
  const emailLinkLabel = lang === "en" ? "Email" : lang === "de" ? "E-Mail" : lang === "fr" ? "E-mail" : lang === "ar" ? "بريد إلكتروني" : "Email";
  const footerLove = lang === "en" ? "With love from Guatemala 🇬🇹" : lang === "de" ? "Mit Liebe aus Guatemala 🇬🇹" : lang === "fr" ? "Avec amour depuis le Guatemala 🇬🇹" : lang === "ar" ? "🇬🇹 بمحبة من غواتيمالا" : "Con amor desde Guatemala 🇬🇹";
  const unsubNote = lang === "en" ? "You received this email because someone special gifted you a tree with Quetz.org." : lang === "de" ? "Du hast diese E-Mail erhalten, weil dir jemand Besonderes einen Baum mit Quetz.org geschenkt hat." : lang === "fr" ? "Vous avez reçu cet e-mail car quelqu'un de spécial vous a offert un arbre avec Quetz.org." : lang === "ar" ? "تلقيت هذا البريد الإلكتروني لأن شخصاً مميزاً أهداك شجرة مع Quetz.org." : "Has recibido este email porque alguien especial te regaló un árbol con Quetz.org.";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🎁 ${headerSub}</title>
</head>
<body style="margin:0;padding:0;background-color:#fdf2f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf2f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(139,90,143,0.15);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(160deg,#6b21a8 0%,#a855f7 50%,#ec4899 100%);padding:48px 32px 40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">${emoji}</div>
              <div style="font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-1px;margin-bottom:8px;">QUETZ.ORG</div>
              <div style="font-size:14px;color:#e9d5ff;letter-spacing:2px;text-transform:uppercase;">${headerSub}</div>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding:40px 32px 24px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:22px;font-weight:800;color:#1f2937;margin:0 0 16px;">${heroTitle}</p>
              <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px;">${heroCopy}</p>
              ${message ? `<div style="background:linear-gradient(135deg,#fdf2f8,#fce7f3);border-left:4px solid #ec4899;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:15px;line-height:1.7;color:#831843;font-style:italic;">❝ ${message} ❞</p>
                <p style="margin:8px 0 0;font-size:13px;color:#9d174d;font-weight:600;">— ${senderName}</p>
              </div>` : ""}
            </td>
          </tr>

          <!-- QUETZITO -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="background:linear-gradient(135deg,#1B4332 0%,#2D6A4F 60%,#52B788 100%);border-radius:12px;padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:96px;vertical-align:top;${isRtl ? "padding-left:16px;" : "padding-right:16px;"}">
                      <img src="https://www.quetz.org/mascot/quetzito-aventurero.png" alt="Quetzito" width="80"
                           style="width:80px;height:auto;border-radius:50%;border:3px solid #52B788;display:block;" />
                    </td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#ffffff;">${quetzitoText}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- GIFT CODE BOX -->
          <tr>
            <td style="padding:0 32px 28px;text-align:center;">
              <div style="background:#f9fafb;border:2px dashed #a855f7;border-radius:16px;padding:28px 24px;">
                <p style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">${codeLabel}</p>
                <div style="font-size:32px;font-weight:900;color:#6b21a8;letter-spacing:6px;font-family:'Courier New',monospace;background:#ede9fe;border-radius:8px;padding:12px 20px;display:inline-block;">${code}</div>
                <p style="font-size:13px;color:#6b7280;margin:12px 0 0;">Plan: <strong style="color:#1f2937;">${planName}</strong></p>
              </div>
            </td>
          </tr>

          <!-- IMPACT -->
          <tr>
            <td style="padding:0 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="text-align:center;padding:0 6px;">
                    <div style="background:linear-gradient(135deg,#2D6A4F,#52B788);border-radius:12px;padding:20px 8px;box-shadow:0 4px 12px rgba(45,106,79,0.25);">
                      <div style="font-size:28px;margin-bottom:4px;">🌳</div>
                      <div style="font-size:15px;font-weight:800;color:#ffffff;margin-bottom:2px;">${impactTree}</div>
                      <div style="font-size:12px;color:#B7E4C7;">${impactLocation}</div>
                    </div>
                  </td>
                  <td width="33%" style="text-align:center;padding:0 6px;">
                    <div style="background:linear-gradient(135deg,#2D6A4F,#52B788);border-radius:12px;padding:20px 8px;box-shadow:0 4px 12px rgba(45,106,79,0.25);">
                      <div style="font-size:28px;margin-bottom:4px;">👨‍👩‍👧</div>
                      <div style="font-size:15px;font-weight:800;color:#ffffff;margin-bottom:2px;">${impactFamily}</div>
                      <div style="font-size:12px;color:#B7E4C7;">${impactEmployed}</div>
                    </div>
                  </td>
                  <td width="33%" style="text-align:center;padding:0 6px;">
                    <div style="background:linear-gradient(135deg,#2D6A4F,#52B788);border-radius:12px;padding:20px 8px;box-shadow:0 4px 12px rgba(45,106,79,0.25);">
                      <div style="font-size:28px;margin-bottom:4px;">🏫</div>
                      <div style="font-size:15px;font-weight:800;color:#ffffff;margin-bottom:2px;">30%</div>
                      <div style="font-size:12px;color:#B7E4C7;">${impactSchool}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA ACTIVATE -->
          <tr>
            <td style="padding:0 32px 28px;text-align:center;">
              <a href="${activationUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#6b21a8 0%,#a855f7 50%,#ec4899 100%);color:#ffffff;text-decoration:none;font-size:18px;font-weight:800;padding:18px 48px;border-radius:50px;letter-spacing:0.5px;box-shadow:0 6px 20px rgba(168,85,247,0.4);">
                ${activateBtnText}
              </a>
              <p style="font-size:12px;color:#9ca3af;margin:12px 0 0;">${orVisit} <a href="${activationUrl}" style="color:#a855f7;">${activationUrl}</a></p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="padding:0 32px;"><div style="border-top:2px solid #f3e8ff;"></div></td></tr>

          <!-- DISCOUNT SECTION -->
          <tr>
            <td style="padding:28px 32px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:17px;font-weight:800;color:#1f2937;margin:0 0 8px;">${discountTitle}</p>
              <p style="font-size:14px;line-height:1.7;color:#374151;margin:0 0 20px;">${discountText}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="${isRtl ? "right" : "left"}">
                    <a href="https://quetz.org/?promo=GIFT15"
                       style="display:inline-block;background:linear-gradient(135deg,#E9C46A,#f4a261);color:#081C15;text-decoration:none;font-size:15px;font-weight:700;padding:13px 32px;border-radius:50px;box-shadow:0 4px 14px rgba(233,196,106,0.4);">
                      ${discountBtn}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="padding:0 32px;"><div style="border-top:2px solid #f3e8ff;"></div></td></tr>

          <!-- SHARE SECTION -->
          <tr>
            <td style="padding:24px 32px 32px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:13px;color:#6b7280;margin:0 0 12px;font-weight:600;">${shareLabel}</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="${isRtl ? "padding-left:12px;" : "padding-right:12px;"}">
                    <a href="https://wa.me/?text=${waTextRecipient}"
                       style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 18px;border-radius:20px;">
                      📱 ${waLinkLabel}
                    </a>
                  </td>
                  <td>
                    <a href="mailto:?subject=${emailSubjectRecipient}&body=${emailBodyRecipient}"
                       style="display:inline-block;background:#2D6A4F;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 18px;border-radius:20px;">
                      ✉️ ${emailLinkLabel}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:linear-gradient(135deg,#081C15,#1B4332);padding:28px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#B7E4C7;">${footerLove}</p>
              <p style="margin:0 0 12px;font-size:13px;color:#52B788;">
                <a href="https://quetz.org" style="color:#52B788;text-decoration:none;">quetz.org</a>
                &nbsp;&bull;&nbsp;
                <a href="mailto:hola@quetz.org" style="color:#52B788;text-decoration:none;">hola@quetz.org</a>
              </p>
              <p style="margin:0;font-size:11px;color:#6b7280;">${unsubNote}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildGiftConfirmationEmail(
  buyerName: string,
  recipientName: string,
  recipientEmail: string,
  code: string,
  planName: string,
  amount: number,
  currency: string,
  language: string | undefined
): string {
  const lang = language === "en" ? "en" : language === "de" ? "de" : language === "fr" ? "fr" : language === "ar" ? "ar" : "es";
  const isRtl = lang === "ar";
  const activationUrl = `https://quetz.org/regalo/${code}`;

  const headerSub = lang === "en" ? "Your gift has been sent 🎁" : lang === "de" ? "Dein Geschenk wurde gesendet 🎁" : lang === "fr" ? "Votre cadeau a été envoyé 🎁" : lang === "ar" ? "🎁 تم إرسال هديتك" : "Tu regalo ha sido enviado 🎁";
  const thankYou = lang === "en" ? `Thank you, ${buyerName || "friend"}! 💚` : lang === "de" ? `Danke, ${buyerName || "Freund"}! 💚` : lang === "fr" ? `Merci, ${buyerName || "ami(e)"} ! 💚` : lang === "ar" ? `!${buyerName || "صديقي"} ،شكراً 💚` : `¡Gracias, ${buyerName || "amigo/a"}! 💚`;
  const confirmText = lang === "en"
    ? `Your gift has been sent to <strong>${recipientEmail}</strong>. <strong>${recipientName}</strong> will receive an email with their code to activate the tree and join the Quetz family.`
    : lang === "de"
    ? `Dein Geschenk wurde an <strong>${recipientEmail}</strong> gesendet. <strong>${recipientName}</strong> erhält eine E-Mail mit dem Code, um den Baum zu aktivieren und der Quetz-Familie beizutreten.`
    : lang === "fr"
    ? `Votre cadeau a été envoyé à <strong>${recipientEmail}</strong>. <strong>${recipientName}</strong> recevra un e-mail avec son code pour activer l'arbre et rejoindre la famille Quetz.`
    : lang === "ar"
    ? `تم إرسال هديتك إلى <strong>${recipientEmail}</strong>. سيتلقى <strong>${recipientName}</strong> بريداً إلكترونياً برمزه لتفعيل الشجرة والانضمام إلى عائلة Quetz.`
    : `Tu regalo ha sido enviado a <strong>${recipientEmail}</strong>. <strong>${recipientName}</strong> recibirá un email con su código para activar el árbol y unirse a la familia Quetz.`;
  const labelRecipient = lang === "en" ? "Recipient" : lang === "de" ? "Empfänger" : lang === "fr" ? "Destinataire" : lang === "ar" ? "المستلم" : "Destinatario";
  const labelPlan = lang === "en" ? "Plan gifted" : lang === "de" ? "Geschenkter Plan" : lang === "fr" ? "Plan offert" : lang === "ar" ? "الخطة المهداة" : "Plan regalado";
  const labelAmount = lang === "en" ? "Amount paid" : lang === "de" ? "Bezahlter Betrag" : lang === "fr" ? "Montant payé" : lang === "ar" ? "المبلغ المدفوع" : "Monto pagado";
  const labelCode = lang === "en" ? "Activation code" : lang === "de" ? "Aktivierungscode" : lang === "fr" ? "Code d'activation" : lang === "ar" ? "رمز التفعيل" : "Código de activación";
  const manualLink = lang === "en" ? "If you need to share the activation link manually:" : lang === "de" ? "Falls du den Aktivierungslink manuell teilen möchtest:" : lang === "fr" ? "Si vous devez partager le lien d'activation manuellement :" : lang === "ar" ? ":إذا كنت بحاجة لمشاركة رابط التفعيل يدوياً" : "Si necesitas compartir el enlace de activación manualmente:";
  const viewBtn = lang === "en" ? "🌿 View activation page" : lang === "de" ? "🌿 Aktivierungsseite ansehen" : lang === "fr" ? "🌿 Voir la page d'activation" : lang === "ar" ? "🌿 عرض صفحة التفعيل" : "🌿 Ver página de activación";

  // Referral section
  const referralTitle = lang === "en" ? "🎁 Want to make someone else happy?" : lang === "de" ? "🎁 Möchtest du noch jemandem eine Freude machen?" : lang === "fr" ? "🎁 Vous voulez rendre quelqu'un d'autre heureux ?" : lang === "ar" ? "🎁 هل تريد أن تُسعد شخصاً آخر؟" : "🎁 ¿Quieres hacer feliz a alguien más?";
  const referralText = lang === "en" ? "A tree is the most original and meaningful gift. Do it again!" : lang === "de" ? "Ein Baum ist das originellste und bedeutungsvollste Geschenk. Mach es nochmal!" : lang === "fr" ? "Un arbre est le cadeau le plus original et le plus significatif. Recommencez !" : lang === "ar" ? "الشجرة هي أكثر الهدايا أصالةً ومعنىً. افعلها مرة أخرى!" : "Regalar un árbol es el regalo más original y significativo. ¡Hazlo de nuevo!";
  const referralBtn = lang === "en" ? "🎁 Gift another tree" : lang === "de" ? "🎁 Noch einen Baum verschenken" : lang === "fr" ? "🎁 Offrir un autre arbre" : lang === "ar" ? "🎁 أهدِ شجرة أخرى" : "🎁 Regalar otro árbol";

  // Share section
  const shareLabel = lang === "en" ? "Share your good deed:" : lang === "de" ? "Teile deine gute Tat:" : lang === "fr" ? "Partagez votre bonne action :" : lang === "ar" ? ":شارك فعلك الطيب" : "Comparte tu impacto:";
  const waTextBuyer = encodeURIComponent(
    lang === "en" ? "I just gifted a tree in Guatemala with Quetz.org 🌳🎁 The perfect gift that creates jobs and helps 120 children! https://quetz.org/regalar"
    : lang === "de" ? "Ich habe gerade einen Baum in Guatemala mit Quetz.org verschenkt 🌳🎁 Das perfekte Geschenk, das Arbeitsplätze schafft und 120 Kindern hilft! https://quetz.org/regalar"
    : lang === "fr" ? "Je viens d'offrir un arbre au Guatemala avec Quetz.org 🌳🎁 Le cadeau parfait qui crée des emplois et aide 120 enfants ! https://quetz.org/regalar"
    : lang === "ar" ? "لقد أهديت للتو شجرة في غواتيمالا مع Quetz.org 🌳🎁 الهدية المثالية التي توفر وظائف وتساعد 120 طفلاً! https://quetz.org/regalar"
    : "Acabo de regalar un árbol en Guatemala con Quetz.org 🌳🎁 ¡El regalo perfecto que crea empleo y ayuda a 120 niños! https://quetz.org/regalar"
  );
  const emailSubjectBuyer = encodeURIComponent(lang === "en" ? "I gifted a tree with Quetz.org 🌳" : lang === "de" ? "Ich habe einen Baum mit Quetz.org verschenkt 🌳" : lang === "fr" ? "J'ai offert un arbre avec Quetz.org 🌳" : lang === "ar" ? "أهديت شجرة مع Quetz.org 🌳" : "Acabo de regalar un árbol con Quetz.org 🌳");
  const emailBodyBuyer = encodeURIComponent(lang === "en" ? "Hi! I just gifted a real tree in Guatemala with Quetz.org. It's an amazing gift — every tree creates a job for a local family and helps build a school for 120 children. https://quetz.org/regalar" : lang === "de" ? "Hallo! Ich habe gerade einen echten Baum in Guatemala mit Quetz.org verschenkt. Es ist ein tolles Geschenk — jeder Baum schafft einen Arbeitsplatz für eine lokale Familie und hilft beim Bau einer Schule für 120 Kinder. https://quetz.org/regalar" : lang === "fr" ? "Salut ! Je viens d'offrir un vrai arbre au Guatemala avec Quetz.org. C'est un cadeau incroyable — chaque arbre crée un emploi pour une famille locale et aide à construire une école pour 120 enfants. https://quetz.org/regalar" : lang === "ar" ? "مرحباً! لقد أهديت للتو شجرة حقيقية في غواتيمالا مع Quetz.org. إنها هدية رائعة — كل شجرة توفر وظيفة لعائلة محلية وتساعد في بناء مدرسة لـ 120 طفلاً. https://quetz.org/regalar" : "¡Hola! Acabo de regalar un árbol real en Guatemala con Quetz.org. Es un regalo increíble — cada árbol crea un empleo para una familia local y ayuda a construir una escuela para 120 niños. https://quetz.org/regalar");
  const emailLinkLabel = lang === "en" ? "Email" : lang === "de" ? "E-Mail" : lang === "fr" ? "E-mail" : lang === "ar" ? "بريد إلكتروني" : "Email";
  const footerLove = lang === "en" ? "With love from Guatemala 🇬🇹" : lang === "de" ? "Mit Liebe aus Guatemala 🇬🇹" : lang === "fr" ? "Avec amour depuis le Guatemala 🇬🇹" : lang === "ar" ? "🇬🇹 بمحبة من غواتيمالا" : "Con amor desde Guatemala 🇬🇹";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headerSub}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(8,28,21,0.18);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(160deg,#081C15 0%,#1B4332 50%,#52B788 100%);padding:48px 32px 40px;text-align:center;">
              <div style="font-size:42px;font-weight:900;color:#ffffff;letter-spacing:-1px;margin-bottom:8px;">QUETZ.ORG</div>
              <div style="font-size:14px;color:#B7E4C7;letter-spacing:3px;text-transform:uppercase;">${headerSub}</div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 32px 28px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:22px;font-weight:800;color:#081C15;margin:0 0 16px;">${thankYou}</p>
              <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px;">${confirmText}</p>

              <div style="background:#f8fffe;border:1.5px solid #B7E4C7;border-radius:12px;padding:24px;margin-bottom:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">${labelRecipient}</td></tr>
                  <tr><td style="font-size:16px;font-weight:700;color:#081C15;padding-bottom:16px;">${recipientName} &lt;${recipientEmail}&gt;</td></tr>
                  <tr><td style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">${labelPlan}</td></tr>
                  <tr><td style="font-size:16px;font-weight:700;color:#2D6A4F;padding-bottom:16px;">${planName}</td></tr>
                  <tr><td style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">${labelAmount}</td></tr>
                  <tr><td style="font-size:16px;font-weight:700;color:#2D6A4F;padding-bottom:16px;">${amount.toFixed(2)} ${currency.toUpperCase()}</td></tr>
                  <tr><td style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">${labelCode}</td></tr>
                  <tr><td style="font-size:24px;font-weight:900;color:#6b21a8;letter-spacing:4px;font-family:'Courier New',monospace;">${code}</td></tr>
                </table>
              </div>

              <p style="font-size:14px;color:#6b7280;margin:0 0 16px;">${manualLink}</p>
              <a href="${activationUrl}" style="display:inline-block;background:linear-gradient(135deg,#081C15,#2D6A4F,#52B788);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:50px;box-shadow:0 4px 14px rgba(8,28,21,0.3);">
                ${viewBtn}
              </a>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="padding:0 32px;"><div style="border-top:2px solid #d8f3dc;"></div></td></tr>

          <!-- REFERRAL SECTION -->
          <tr>
            <td style="padding:28px 32px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:17px;font-weight:800;color:#081C15;margin:0 0 8px;">${referralTitle}</p>
              <p style="font-size:14px;line-height:1.7;color:#374151;margin:0 0 20px;">${referralText}</p>
              <a href="https://quetz.org/regalar"
                 style="display:inline-block;background:linear-gradient(135deg,#E9C46A,#f4a261);color:#081C15;text-decoration:none;font-size:15px;font-weight:700;padding:13px 32px;border-radius:50px;box-shadow:0 4px 14px rgba(233,196,106,0.4);">
                ${referralBtn}
              </a>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="padding:0 32px;"><div style="border-top:2px solid #d8f3dc;"></div></td></tr>

          <!-- SHARE SECTION -->
          <tr>
            <td style="padding:24px 32px 32px;text-align:${isRtl ? "right" : "left"};">
              <p style="font-size:13px;color:#6b7280;margin:0 0 12px;font-weight:600;">${shareLabel}</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="${isRtl ? "padding-left:12px;" : "padding-right:12px;"}">
                    <a href="https://wa.me/?text=${waTextBuyer}"
                       style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 18px;border-radius:20px;">
                      📱 WhatsApp
                    </a>
                  </td>
                  <td>
                    <a href="mailto:?subject=${emailSubjectBuyer}&body=${emailBodyBuyer}"
                       style="display:inline-block;background:#2D6A4F;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 18px;border-radius:20px;">
                      ✉️ ${emailLinkLabel}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:linear-gradient(135deg,#081C15,#1B4332);padding:28px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#B7E4C7;">${footerLove}</p>
              <p style="margin:0;font-size:13px;color:#52B788;">
                <a href="https://quetz.org" style="color:#52B788;text-decoration:none;">quetz.org</a>
                &nbsp;&bull;&nbsp;
                <a href="mailto:hola@quetz.org" style="color:#52B788;text-decoration:none;">hola@quetz.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildFirmengeschenkEmail(
  companyName: string,
  treeCount: number,
  activationUrl: string,
  amount: number
): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Ihr Firmengeschenk-Paket</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:580px;">
        <tr><td style="background:#1B4332;padding:32px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:bold;color:#52B788;letter-spacing:0.05em;">quetz.org</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="font-size:24px;color:#1B4332;margin:0 0 16px;">Sehr geehrtes Team von ${companyName},</h1>
          <p style="color:#374151;line-height:1.7;margin:0 0 16px;">
            vielen Dank für Ihren Erwerb eines Firmengeschenk-Pakets mit <strong>${treeCount} Bäumen</strong> (${amount.toFixed(2)} EUR).
          </p>
          <p style="color:#374151;line-height:1.7;margin:0 0 16px;">
            Im nächsten Schritt erstellen Sie die personalisierten Adoptionszertifikate für Ihre Mitarbeiterinnen und Mitarbeiter. Klicken Sie dazu auf den folgenden Button:
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="background:#1B4332;border-radius:6px;padding:16px 32px;">
              <a href="${activationUrl}" style="color:#ffffff;font-weight:bold;text-decoration:none;font-size:16px;">Zertifikate jetzt erstellen</a>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAF7;border:1px solid #D1FAE5;border-radius:6px;padding:16px;margin:0 0 24px;">
            <tr>
              <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">Paket</td>
              <td style="font-size:13px;color:#111827;">${treeCount} Bäume</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">Betrag</td>
              <td style="font-size:13px;color:#111827;">${amount.toFixed(2)} EUR</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">Link gültig bis</td>
              <td style="font-size:13px;color:#111827;">30 Tage</td>
            </tr>
          </table>
          <p style="color:#374151;line-height:1.7;margin:0 0 8px;font-size:13px;">
            Falls der Button nicht funktioniert, kopieren Sie folgenden Link in Ihren Browser:
          </p>
          <p style="font-size:12px;color:#6b7280;word-break:break-all;margin:0 0 24px;">${activationUrl}</p>
          <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
            Mit freundlichen Grüßen,<br>
            Daniel Garrido<br>
            Gründer &amp; CEO, quetz.org<br>
            Düsseldorf-Unterbach, NRW<br>
            <a href="mailto:hola@quetz.org" style="color:#1B4332;">hola@quetz.org</a>
          </p>
        </td></tr>
        <tr><td style="background:#1B4332;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#52B788;">quetz.org &middot; Düsseldorf &middot; Nachhaltige Baumpflanzungen in Zacapa, Guatemala</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  console.log("[webhook] POST received");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  console.log("[webhook] body length:", body.length, "sig present:", !!sig);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[webhook] Signature verification FAILED:", err.message);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  console.log("[webhook] Event verified:", event.type, "id:", event.id);

  // ── invoice.payment_succeeded — subscription renewals ────────────────────
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const billingReason = invoice.billing_reason;

    console.log("[webhook] Invoice billing_reason:", billingReason, "subscription:", invoice.subscription);

    // subscription_create is already handled by checkout.session.completed — skip to avoid double email
    if (billingReason === "subscription_create") {
      console.log("[webhook] Skipping invoice.payment_succeeded with billing_reason=subscription_create (handled by checkout event)");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Resolve customer email
    let invoiceEmail = invoice.customer_email ?? "";
    let invoiceName = invoice.customer_name ?? "";
    if (!invoiceEmail && invoice.customer) {
      try {
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        invoiceEmail = customer.email ?? "";
        invoiceName = customer.name ?? "";
        console.log("[webhook] Customer resolved from Stripe API:", invoiceEmail);
      } catch (custErr: any) {
        console.error("[webhook] Failed to retrieve customer:", custErr.message);
      }
    }

    const invoiceAmount = invoice.amount_paid / 100;
    const invoiceCurrency = invoice.currency ?? "eur";
    const stripeSubscriptionId = typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

    console.log("[webhook] Invoice payment:", { email: invoiceEmail, amount: invoiceAmount, stripeSubscriptionId });

    // Look up subscription in our DB to get planName and language
    let invoicePlanName = "Tree Adoption";
    let invoiceLanguage: string | undefined = undefined;
    if (stripeSubscriptionId) {
      const sub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
      if (sub) {
        invoicePlanName = sub.planName;
        console.log("[webhook] Found subscription in DB:", sub.id, "plan:", sub.planName);
      } else {
        console.warn("[webhook] No subscription found in DB for stripeSubscriptionId:", stripeSubscriptionId);
      }
    }

    console.log("[webhook] RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

    if (invoiceEmail) {
      try {
        console.log("[webhook] Sending welcome email (invoice) to:", invoiceEmail);
        const invoiceEmailHtml = await renderWelcomeEmail({
          customerName: invoiceName,
          language: invoiceLanguage,
          planName: invoicePlanName,
          amount: invoiceAmount,
          currency: invoiceCurrency,
        });
        await sendEmail(
          invoiceEmail,
          getWelcomeSubject(invoiceLanguage),
          invoiceEmailHtml
        );
        console.log("[webhook] Welcome email sent successfully (invoice) to:", invoiceEmail);

        await sendEmail(
          "dgarrido@quetz.org",
          `[Quetz] Subscription payment — ${invoiceEmail}`,
          `
            <h2>Invoice Payment Succeeded</h2>
            <table style="font-family:monospace;border-collapse:collapse;">
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Email</td><td>${invoiceEmail}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Amount</td><td>${invoiceAmount.toFixed(2)} ${invoiceCurrency.toUpperCase()}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Plan</td><td>${invoicePlanName}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Billing Reason</td><td>${billingReason}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Subscription ID</td><td>${stripeSubscriptionId ?? "—"}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Invoice ID</td><td>${invoice.id}</td></tr>
            </table>
          `
        );
        console.log("[webhook] Team notification sent (invoice)");

        console.log("[webhook] Sending Telegram (invoice)...");
        await sendTelegramNotification(invoiceName, invoiceEmail, invoicePlanName, invoiceAmount, invoiceCurrency);
        console.log("[webhook] Telegram sent (invoice)");
      } catch (mailErr: any) {
        console.error("[webhook] EMAIL ERROR (invoice):", mailErr.message, mailErr.stack);
      }
    } else {
      console.warn("[webhook] No email found on invoice — skipping email send");
    }

    // Create adoption record for this invoice payment
    console.log("[webhook] Creating adoption record (invoice)...");
    try {
      if (invoiceEmail) {
        let user = await prisma.user.findUnique({ where: { email: invoiceEmail } });
        if (!user) {
          user = await prisma.user.create({ data: { email: invoiceEmail, name: invoiceName || null } });
          console.log("[webhook] New user created (invoice):", user.id);
        } else {
          console.log("[webhook] Existing user found (invoice):", user.id);
        }

        const fallbackTree = await prisma.tree.findFirst({ where: { active: true } });
        await prisma.adoption.create({
          data: {
            userId: user.id,
            treeId: fallbackTree?.id ?? null,
            quantity: 1,
            amount: invoiceAmount,
            currency: invoiceCurrency.toUpperCase(),
            status: "active",
          },
        });
        console.log("[webhook] Adoption created (invoice) for user:", user.id);
      }
    } catch (dbErr: any) {
      console.error("[webhook] DB ERROR (invoice):", dbErr.message, dbErr.stack);
    }

    console.log("[webhook] Done (invoice) — returning 200");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (event.type !== "checkout.session.completed") {
    console.log("[webhook] Ignoring event type:", event.type);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const customerEmail = session.customer_email ?? session.customer_details?.email ?? "";
  const customerName = session.customer_details?.name ?? "";
  const metadata = session.metadata ?? {};

  console.log("[webhook] Session:", {
    email: customerEmail,
    name: customerName,
    metadata,
    mode: session.mode,
    isGift: metadata.isGift,
    sessionId: session.id,
  });

  const amount = session.amount_total != null ? session.amount_total / 100 : 0;
  const currency = session.currency ?? "eur";
  const language = metadata.language as string | undefined;
  const planName = metadata.planName as string | undefined ?? "";
  const isGift = metadata.isGift === "true";

  console.log("[webhook] RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

  console.log("[webhook] RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

  if (isGift) {
    // ── GIFT PURCHASE FLOW ─────────────────────────────────────────────────
    const recipientEmail = metadata.recipientEmail ?? "";
    const recipientName = metadata.recipientName ?? "Amigo/a";
    const occasion = metadata.occasion ?? "otro";
    const message = metadata.message ?? "";
    const senderEmail = metadata.senderEmail ?? customerEmail;

    try {
      // 1) Generate code and create Gift record
      const code = await uniqueGiftCode();
      console.log("[webhook] Gift code generated:", code);

      await prisma.gift.create({
        data: {
          code,
          planId: planName.toLowerCase().replace(/\s+/g, "_") || "custom",
          planName: planName || "Tree Adoption",
          treesPerMonth: 1,
          durationMonths: 12,
          amountEur: amount,
          senderEmail,
          recipientName,
          recipientEmail,
          occasion,
          message: message || null,
          stripeSessionId: session.id,
          status: "paid",
        },
      });
      console.log("[webhook] Gift record created in DB");

      // 2) Send gift email to RECIPIENT
      if (recipientEmail) {
        console.log("[webhook] Sending gift email to recipient:", recipientEmail);
        await sendEmail(
          recipientEmail,
          `🎁 ¡Alguien te ha regalado un árbol! | Someone gifted you a tree!`,
          buildGiftRecipientEmail(
            recipientName,
            customerName || senderEmail,
            message,
            code,
            planName || "Tree Adoption",
            occasion,
            language
          )
        );
        console.log("[webhook] Gift email sent to recipient");
      }

      // 3) Send confirmation email to BUYER
      if (customerEmail) {
        console.log("[webhook] Sending gift confirmation to buyer:", customerEmail);
        await sendEmail(
          customerEmail,
          `🎁 Tu regalo ha sido enviado — código ${code}`,
          buildGiftConfirmationEmail(
            customerName,
            recipientName,
            recipientEmail,
            code,
            planName || "Tree Adoption",
            amount,
            currency,
            language
          )
        );
        console.log("[webhook] Gift confirmation sent to buyer");
      }

      // 4) Update gift status to 'sent'
      await prisma.gift.update({
        where: { code },
        data: { status: "sent", sentAt: new Date() },
      });

      console.log(`[webhook] Gift ${code} sent to ${recipientEmail}, confirmed to ${customerEmail}`);

      // 5) Telegram notification
      console.log("[webhook] Sending Telegram...");
      await sendTelegramNotification(
        `🎁 GIFT → ${recipientName}`,
        customerEmail,
        planName || "Tree Gift",
        amount,
        currency
      );
      console.log("[webhook] Telegram sent");
    } catch (giftErr: any) {
      console.error("[webhook] GIFT ERROR:", giftErr.message, giftErr.stack);
    }
  } else if (metadata.type === "b2b") {
    // ── B2B PURCHASE FLOW ──────────────────────────────────────────────────
    // Three independent try-catch blocks: DB write, email, Telegram.
    // A failure in DB write must NOT block email or Telegram.
    const b2bPlanId = metadata.plan ?? "";
    const b2bInterval = metadata.interval ?? "month";
    const b2bTrees = parseInt(metadata.treesPerMonth || "2", 10);

    // Capture company name from custom_fields (preferred) or customer name
    const empresa: string =
      session.custom_fields?.find((f) => f.key === "unternehmensname")?.text?.value ||
      session.customer_details?.name ||
      "Ihr Unternehmen";

    // MRR from plan config (immune to coupon discounts on amount_total)
    const b2bPlanConfig = B2B_PLANS[b2bPlanId as B2bPlanId];
    const b2bMrr = b2bPlanConfig
      ? b2bInterval === "year"
        ? Math.round((b2bPlanConfig.priceYearEur ?? 0) / 12)
        : (b2bPlanConfig.priceEur ?? 0)
      : amount; // fallback to Stripe amount if plan unknown

    // 1) DB write — non-fatal: email and Telegram proceed even if this fails
    try {
      let user = await prisma.user.findUnique({ where: { email: customerEmail } });
      if (!user) {
        user = await prisma.user.create({ data: { email: customerEmail, name: customerName || null } });
        console.log("[webhook] B2B db: new user created:", user.id);
      }
      if (session.mode === "subscription" && session.subscription) {
        const stripeSubId = String(session.subscription);
        const existingSub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: stripeSubId } });
        if (!existingSub) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: b2bPlanId,
              planName: b2bPlanId,
              treesPerMonth: b2bTrees,
              priceEurMonth: amount,
              stripeSubscriptionId: stripeSubId,
              status: "active",
              b2b: true,
              billingInterval: b2bInterval,
            },
          });
          console.log("[webhook] B2B db: subscription created:", stripeSubId);
        } else {
          console.log("[webhook] B2B db: idempotent — subscription exists:", stripeSubId);
        }
      }
    } catch (b2bDbErr: any) {
      console.error("[webhook] B2B db ERROR (non-fatal):", b2bDbErr.message);
      // intentionally continues to email + Telegram
    }

    // 2) Welcome email — independent try-catch
    if (customerEmail) {
      try {
        const planLabel = b2bPlanId.replace(/^b2b/, "");
        const b2bWelcomeHtml = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /><title>Willkommen bei Quetz</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr><td style="background:#081C15;padding:32px 40px;text-align:center;">
          <span style="font-size:24px;font-weight:bold;color:#52B788;font-family:Montserrat,Arial,sans-serif;">quetz.org</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="font-size:24px;color:#1B4332;margin:0 0 16px;">Willkommen bei Quetz, ${empresa}!</h1>
          <p style="color:#374151;line-height:1.6;margin:0 0 16px;">
            Ihr <strong>${planLabel}-Abo</strong> ist aktiv. Ab sofort pflanzen wir Bäume in Zacapa, Guatemala — in Ihrem Unternehmensnamen.
          </p>
          <p style="color:#374151;line-height:1.6;margin:0 0 16px;">
            Jeder Baum ist GPS-verifiziert und über Ihr Firmen-Dashboard in Echtzeit verfolgbar. Die Daten sind CSRD-konform und direkt exportierbar.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr>
              <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px;">Plan</td>
              <td style="font-size:14px;color:#111827;">${planLabel}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px;">Abrechnung</td>
              <td style="font-size:14px;color:#111827;">${b2bInterval === "year" ? "Jährlich" : "Monatlich"}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px;">Bäume/Monat</td>
              <td style="font-size:14px;color:#111827;">${b2bTrees}</td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="background:#52B788;border-radius:6px;padding:14px 28px;">
              <a href="https://quetz.org/mi-bosque" style="color:#ffffff;font-weight:bold;text-decoration:none;font-size:15px;">Zum Firmen-Dashboard</a>
            </td></tr>
          </table>
          <p style="color:#374151;line-height:1.6;margin:0 0 8px;">
            Bei Fragen stehen wir Ihnen gerne zur Verfügung: <a href="mailto:hola@quetz.org" style="color:#52B788;">hola@quetz.org</a>
          </p>
          <p style="color:#374151;line-height:1.6;margin:0;">
            Mit freundlichen Grüßen,<br />
            <strong>Daniel Garrido</strong><br />
            Gründer &amp; CEO | quetz.org<br />
            Düsseldorf-Unterbach NRW
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">quetz.org | Düsseldorf-Unterbach NRW | <a href="https://quetz.org/transparencia" style="color:#9ca3af;">Transparenzseite</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
        await sendEmail(
          customerEmail,
          `Willkommen bei Quetz, ${empresa}`,
          b2bWelcomeHtml
        );
        console.log("[webhook] B2B email: welcome sent to:", customerEmail, "empresa:", empresa);
      } catch (b2bEmailErr: any) {
        console.error("[webhook] B2B email ERROR:", b2bEmailErr.message);
      }
    }

    // 3) Telegram — independent try-catch
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (token && chatId) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            parse_mode: "HTML",
            text: `🎉 <b>Neue B2B-Verkauf!</b>\n\n🏢 <b>Unternehmen:</b> ${empresa}\n📧 <b>Email:</b> ${customerEmail}\n📋 <b>Plan:</b> ${b2bPlanId}\n🔄 <b>Interval:</b> ${b2bInterval}\n💰 <b>MRR:</b> €${b2bMrr}`,
          }),
        });
        console.log("[webhook] B2B telegram: sent — empresa:", empresa, "plan:", b2bPlanId, "mrr:", b2bMrr);
      } else {
        console.log("[webhook] B2B telegram: skipped (no token/chatId)");
      }
    } catch (b2bTgErr: any) {
      console.error("[webhook] B2B telegram ERROR:", b2bTgErr.message);
    }
  } else if (metadata.type === "firmengeschenk") {
    // ── FIRMENGESCHENK FLOW ────────────────────────────────────────────────
    const fgPlanId = metadata.package ?? "";      // Stripe sends "package", not "plan"
    const treeCount = parseInt(metadata.tree_count || "10", 10); // Stripe sends "tree_count", not "treeCount"

    const empresa: string =
      session.custom_fields?.find((f) => f.key === "unternehmensname")?.text?.value ||
      session.customer_details?.name ||
      customerName ||
      "Ihr Unternehmen";

    // 1) DB write
    let activationToken: string | null = null;
    try {
      const { randomUUID } = await import("crypto");
      activationToken = randomUUID();
      const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await prisma.giftOrder.create({
        data: {
          stripeSessionId: session.id,
          companyName: empresa,
          companyEmail: customerEmail,
          treeCount,
          amountEur: amount,
          activationToken,
          tokenExpiresAt,
          status: "pending",
        },
      });
      console.log("[webhook] FG: GiftOrder created, token:", activationToken);
    } catch (fgDbErr: any) {
      console.error("[webhook] FG db ERROR:", fgDbErr.message);
    }

    // 2) Email to company with activation link
    if (customerEmail && activationToken) {
      try {
        const activationUrl = `https://quetz.org/gift-activation/${activationToken}`;
        const fgEmailHtml = buildFirmengeschenkEmail(empresa, treeCount, activationUrl, amount);
        await sendEmail(
          customerEmail,
          `Ihr Firmengeschenk-Paket ist bereit | quetz.org`,
          fgEmailHtml
        );
        console.log("[webhook] FG email sent to:", customerEmail);
      } catch (fgMailErr: any) {
        console.error("[webhook] FG email ERROR:", fgMailErr.message);
      }
    }

    // 3) Telegram
    try {
      const tgToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (tgToken && chatId) {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            parse_mode: "HTML",
            text: `🌳 <b>Firmengeschenk verkauft!</b>\n\n🏢 <b>Unternehmen:</b> ${empresa}\n📧 <b>Email:</b> ${customerEmail}\n🌲 <b>Bäume:</b> ${treeCount}\n💰 <b>Betrag:</b> €${amount.toFixed(2)}`,
          }),
        });
      }
    } catch (fgTgErr: any) {
      console.error("[webhook] FG telegram ERROR:", fgTgErr.message);
    }
  } else {
    // ── REGULAR PURCHASE FLOW ──────────────────────────────────────────────
    // Step 1: Create DB record first (so we can pass tree/adoption data to email)
    let createdAdoptionId: string | null = null;
    let resolvedTree: { id: string; nameEs: string; nameDe: string | null; nameEn: string | null; nameFr: string | null; species: string; latitude: number | null; longitude: number | null; plotArea: string | null; image: string } | null = null;
    let resolvedFarmer: { name: string; photoUrl: string | null } | null = null;

    console.log("[webhook] Creating adoption/subscription record...");
    try {
      if (customerEmail) {
        let user = await prisma.user.findUnique({ where: { email: customerEmail } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: customerEmail,
              name: customerName || null,
            },
          });
          console.log("[webhook] New user created:", user.id);
        } else {
          console.log("[webhook] Existing user found:", user.id);
        }

        const treeId = metadata.treeId;
        const planId = metadata.planId || metadata.treeId;
        const qty = parseInt(metadata.quantity || "1", 10);

        if (session.mode === "subscription" && session.subscription) {
          const stripeSubId = String(session.subscription);
          console.log("[webhook] Subscription path — stripeSubId:", stripeSubId, "planId:", planId);

          const existingSub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: stripeSubId },
          });

          if (existingSub) {
            console.log("[webhook] Idempotent: subscription already exists for", stripeSubId, "— skipping create");
          } else {
            const parsedTrees = parseInt(metadata.treesPerMonth || "1", 10);
            await prisma.subscription.create({
              data: {
                userId: user.id,
                planId: planId || "cafe",
                planName: planName || "Plan",
                treesPerMonth: Number.isFinite(parsedTrees) ? parsedTrees : 1,
                priceEurMonth: amount,
                stripeSubscriptionId: stripeSubId,
                status: "active",
              },
            });
            console.log("[webhook] Subscription record created:", stripeSubId);
          }

          // Resolve tree for email enrichment (no GPS CTA for subscriptions)
          if (planId) {
            resolvedTree = await prisma.tree.findUnique({ where: { species: planId } }) ?? null;
          }
          if (!resolvedTree) {
            resolvedTree = await prisma.tree.findFirst({ where: { active: true } }) ?? null;
          }
        } else {
          // One-time adoption — 1 Adoption record per line item
          // Load all trees once for description-based matching
          const allTrees = await prisma.tree.findMany({
            select: { id: true, species: true, nameEs: true, nameDe: true, nameEn: true },
          });

          function resolveTreeFromDescription(description: string): string | null {
            const desc = description.toLowerCase();
            for (const t of allTrees) {
              if (desc.includes(t.species.toLowerCase())) return t.id;
            }
            for (const t of allTrees) {
              const names = [t.nameEs, t.nameDe, t.nameEn].filter(Boolean) as string[];
              if (names.some((n) => desc.includes(n.toLowerCase()))) return t.id;
            }
            return null;
          }

          async function resolveTreeIdFallback(pid?: string, sessionId?: string, email?: string): Promise<string | null> {
            if (pid) {
              const t = await prisma.tree.findUnique({ where: { species: pid } });
              if (t) return t.id;
              console.error("[webhook] TREE_RESOLVE_FAILED", JSON.stringify({
                pid,
                sessionId,
                emailHint: email ? email.slice(0, 4) + "***" : null,
              }));
            }
            const fallback = await prisma.tree.findFirst({ where: { active: true } });
            if (!pid) return fallback?.id ?? null;
            console.warn("[webhook] Using active-tree fallback for pid:", pid);
            return fallback?.id ?? null;
          }

          // Idempotency check: already processed if bare ID or first-item suffix exists
          const existingCheck = await prisma.adoption.findFirst({
            where: { stripeSessionId: { in: [session.id, `${session.id}_0`] } },
          });

          if (existingCheck) {
            console.log("[webhook] Idempotent: adoption already exists for session", session.id, "— skipping create");
            createdAdoptionId = existingCheck.id;
            if (existingCheck.treeId) {
              resolvedTree = await prisma.tree.findUnique({ where: { id: existingCheck.treeId } }) ?? null;
            }
          } else {
            // Fetch line items
            let lineItems: import("stripe").Stripe.LineItem[] = [];
            try {
              const li = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
              lineItems = li.data;
            } catch (liErr: any) {
              console.warn("[webhook] listLineItems failed:", liErr.message, "— falling back to metadata");
            }

            if (lineItems.length === 0) {
              // Fallback: single synthetic line item from session metadata
              const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
              lineItems = [{
                id: "fallback",
                object: "item" as const,
                amount_total: session.amount_total ?? 0,
                currency: session.currency ?? "eur",
                description: metadata.planName || planName,
                quantity: safeQty,
              } as unknown as import("stripe").Stripe.LineItem];
            }

            console.log("[webhook] Processing", lineItems.length, "line item(s) for session", session.id);

            for (let i = 0; i < lineItems.length; i++) {
              const item = lineItems[i];
              const itemStripeId = `${session.id}_${i}`;
              const itemDescription = item.description ?? planName;
              const itemQty = item.quantity ?? 1;
              const itemAmount = item.amount_total != null ? item.amount_total / 100 : amount / lineItems.length;

              let itemTreeId = resolveTreeFromDescription(itemDescription);
              if (!itemTreeId) itemTreeId = await resolveTreeIdFallback(planId, session.id, customerEmail);

              console.log("[webhook] Line item", i, "— desc:", itemDescription, "treeId:", itemTreeId, "qty:", itemQty, "amount:", itemAmount);

              const adoption = await prisma.adoption.create({
                data: {
                  userId: user.id,
                  treeId: itemTreeId,
                  quantity: itemQty,
                  amount: itemAmount,
                  currency: currency.toUpperCase(),
                  status: "active",
                  stripeSessionId: itemStripeId,
                },
              });

              console.log("[webhook] Adoption created:", adoption.id, "stripeSessionId:", itemStripeId);

              // Use first item for email context
              if (i === 0) {
                createdAdoptionId = adoption.id;
                if (itemTreeId) {
                  resolvedTree = await prisma.tree.findUnique({ where: { id: itemTreeId } }) ?? null;
                }
                if (adoption.farmerId) {
                  const farmer = await prisma.farmer.findUnique({ where: { id: adoption.farmerId } });
                  if (farmer) resolvedFarmer = { name: farmer.name, photoUrl: farmer.photoUrl ?? null };
                }
              }
            }
          }
        }
      } else {
        console.warn("[webhook] No customerEmail — skipping DB record creation");
      }
    } catch (dbErr: any) {
      console.error("[webhook] DB ERROR", JSON.stringify({
        path: session.mode === "subscription" ? "subscription" : "adoption",
        sessionId: session.id,
        mode: session.mode,
        emailHint: customerEmail ? customerEmail.slice(0, 4) + "***" : null,
        metadata,
        prismaCode: dbErr.code ?? null,
        message: dbErr.message ?? null,
      }));
    }

    // Step 2: Send email WITH tree/adoption data
    if (customerEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://quetz.org";
        const micrositeUrl = createdAdoptionId ? `${baseUrl}/baum/${createdAdoptionId}` : undefined;

        console.log("[webhook] Rendering cinematic welcome email for:", customerEmail);
        const welcomeHtml = await renderWelcomeEmail({
          customerName,
          language,
          planName,
          amount,
          currency,
          tree: resolvedTree ?? undefined,
          adoption: createdAdoptionId
            ? {
                id: createdAdoptionId,
                farmer: resolvedFarmer ?? undefined,
              }
            : undefined,
          micrositeUrl,
          baseUrl,
        });

        console.log("[webhook] Sending welcome email to:", customerEmail);
        await sendEmail(customerEmail, getWelcomeSubject(language), welcomeHtml);
        console.log("[webhook] Welcome email sent successfully to:", customerEmail);

        // Notification email to team
        console.log("[webhook] Sending team notification email...");
        await sendEmail(
          "dgarrido@quetz.org",
          `[Quetz] New tree adoption — ${customerEmail}`,
          `
            <h2>New Checkout Completed</h2>
            <table style="font-family:monospace;border-collapse:collapse;">
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Session ID</td><td>${session.id}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Adoption ID</td><td>${createdAdoptionId ?? "subscription"}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Customer Email</td><td>${customerEmail}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Customer Name</td><td>${customerName}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Tree</td><td>${resolvedTree ? `${resolvedTree.nameEs} (${resolvedTree.species})` : "—"}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Microsite</td><td>${micrositeUrl ?? "—"}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Amount Total</td><td>${session.amount_total != null ? (session.amount_total / 100).toFixed(2) : "—"} ${session.currency?.toUpperCase() ?? ""}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Metadata</td><td><pre>${JSON.stringify(metadata, null, 2)}</pre></td></tr>
            </table>
          `
        );
        console.log("[webhook] Team notification sent");

        console.log("[webhook] Sending Telegram...");
        await sendTelegramNotification(customerName, customerEmail, planName, amount, currency);
        console.log("[webhook] Telegram sent");
      } catch (mailErr: any) {
        console.error("[webhook] EMAIL ERROR:", mailErr.message, mailErr.stack);
      }
    } else {
      console.warn("[webhook] No customerEmail in session — skipping email send");
    }
  }

  console.log("[webhook] Done — returning 200");
  return NextResponse.json({ received: true }, { status: 200 });
}
