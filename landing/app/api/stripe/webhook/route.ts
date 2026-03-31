export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_email ?? session.customer_details?.email ?? "";
    const customerName = session.customer_details?.name ?? "";
    const metadata = session.metadata ?? {};

    console.log("checkout.session.completed:", {
      email: customerEmail,
      name: customerName,
      metadata,
      sessionId: session.id,
    });

    if (customerEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.zoho.eu",
          port: 587,
          secure: false,
          auth: {
            user: "hola@quetz.org",
            pass: process.env.ZOHO_SMTP_PASSWORD,
          },
        });

        const language = metadata.language as string | undefined;
        const planName = metadata.planName as string | undefined ?? "";
        const amount = session.amount_total != null ? session.amount_total / 100 : 0;
        const currency = session.currency ?? "eur";

        // Welcome email to customer
        await transporter.sendMail({
          from: "Quetz.org 🌳 <hola@quetz.org>",
          to: customerEmail,
          subject: getSubjectLine(language),
          html: buildWelcomeEmail(customerName, language, planName, amount, currency),
        });

        // Notification email to team
        await transporter.sendMail({
          from: "Quetz.org 🌳 <hola@quetz.org>",
          to: "dgarrido@quetz.org",
          subject: `[Quetz] New tree adoption — ${customerEmail}`,
          html: `
            <h2>New Checkout Completed</h2>
            <table style="font-family:monospace;border-collapse:collapse;">
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Session ID</td><td>${session.id}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Customer Email</td><td>${customerEmail}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Customer Name</td><td>${customerName}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Amount Total</td><td>${session.amount_total != null ? (session.amount_total / 100).toFixed(2) : "—"} ${session.currency?.toUpperCase() ?? ""}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Metadata</td><td><pre>${JSON.stringify(metadata, null, 2)}</pre></td></tr>
            </table>
          `,
        });

        console.log("Welcome emails sent to:", customerEmail);
        await sendTelegramNotification(customerName, customerEmail, planName, amount, currency);
      } catch (mailErr) {
        console.error("Failed to send welcome email:", mailErr);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
