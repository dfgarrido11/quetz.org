export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Instagram Auto-Post Endpoint
// Called by Railway Cron Job: Mon / Wed / Fri / Sun at 09:00 CET/CEST
// Railway cron expression (UTC):  0 7 * * 1,3,5,0   (UTC+2 in summer, UTC+1 in winter)
// Secure with CRON_SECRET env var
// ─────────────────────────────────────────────────────────────────────────────

const CRON_SECRET = process.env.CRON_SECRET || 'quetz-cron-secret-2024';
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || '';
const IG_USER_ID = process.env.INSTAGRAM_USER_ID || '';

// ─── Content bank (German, rotating by day-of-year) ──────────────────────────
// Each post: caption + image_url (hosted on quetz.org or CDN)
// Images should be public URLs, min 1080x1080 px, JPG/PNG

const POSTS = [
  // Week 1
  {
    caption: `🌳 Ein Baum. Eine Familie. Eine Zukunft.

Mit der Adoption eines Tropenbaums in Zacapa, Guatemala, sicherst du einer Bauernfamilie ein stabiles Einkommen – und hilfst uns, eine Schule für 120 Kinder zu bauen.

Dein Beitrag wächst buchstäblich. 🌱

👉 Jetzt adoptieren: quetz.org

#Quetz #Baumpatenschaft #Nachhaltigkeit #Guatemala #Aufforstung #SozialesUnternehmen #Klimaschutz #Tropenwald`,
    image_url: 'https://quetz.org/og-image.jpg',
  },
  {
    caption: `🌿 Wusstest du? Jeder Tropenbau absorbiert bis zu 22 kg CO₂ pro Jahr.

Bei Quetz adoptierst du echte Mangobäume in Zacapa, Guatemala – mit GPS-Koordinaten, digitalem Zertifikat und direktem Impact für lokale Familien.

Transparenz ist unser Versprechen. 💚

👉 quetz.org

#CO2Kompensation #Baumpatenschaft #Quetz #Nachhaltigkeit #Guatemala #Klimaschutz #Aufforstung #GreenBusiness`,
    image_url: 'https://quetz.org/og-image.jpg',
  },
  {
    caption: `📚 30% jeder Baumadoption fließt direkt in den Bau einer Schule für 120 Kinder in Zacapa.

Dein Baum pflanzt nicht nur Wurzeln in der Erde – er pflanzt Bildung in die Zukunft.

Das ist Quetz. 🌳

👉 quetz.org/transparencia

#Bildung #Guatemala #Quetz #Nachhaltigkeit #SozialesUnternehmen #Schule #Aufforstung #Impact`,
    image_url: 'https://quetz.org/og-image.jpg',
  },
  {
    caption: `🎁 Das perfekte Geschenk für Menschen, die alles haben.

Schenke einen Baum – mit persönlichem Zertifikat, GPS-Koordinaten und der Geschichte einer Bauernfamilie in Guatemala.

Einmalig. Bedeutsam. Unvergesslich. 🌿

👉 quetz.org/regalar

#Geschenkidee #Baumpatenschaft #Quetz #Nachhaltigkeit #Guatemala #Weihnachten #Geburtstag #GreenGift`,
    image_url: 'https://quetz.org/og-image.jpg',
  },
  {
    caption: `🏢 Nachhaltigkeit ist kein Trend – es ist Verantwortung.

Mit Quetz Corporate adoptieren Unternehmen Tropenbäume für ihre Teams, Kunden oder als CSR-Maßnahme. Inklusive CO₂-Bericht und Zertifikaten für jeden Mitarbeiter.

Jetzt Angebot anfragen: quetz.org/empresas

#CSR #Nachhaltigkeit #Quetz #CorporateSocial #Klimaschutz #Guatemala #Aufforstung #GreenBusiness #Mittelstand`,
    image_url: 'https://quetz.org/og-image.jpg',
  },
  {
    caption: `🌍 Kleine Handlungen. Große Wirkung.

In Zacapa, Guatemala, wächst dein Baum – und mit ihm das Einkommen einer Bauernfamilie und die Hoffnung auf eine Schule für 120 Kinder.

Quetz macht Impact sichtbar. 💚

👉 quetz.org

#Quetz #Baumpatenschaft #Guatemala #Nachhaltigkeit #Aufforstung #SozialesUnternehmen #Klimaschutz #Impact`,
    image_url: 'https://quetz.org/og-image.jpg',
  },
  {
    caption: `🌱 Monat für Monat. Baum für Baum.

Mit einem Quetz-Abo adoptierst du jeden Monat neue Bäume – und baust dir deinen eigenen digitalen Wald auf. Verfolge dein Wachstum in Echtzeit.

Ab €9/Monat. 🌳

👉 quetz.org

#Abo #Baumpatenschaft #Quetz #Nachhaltigkeit #Guatemala #Aufforstung #Klimaschutz #DigitalerWald`,
    image_url: 'https://quetz.org/og-image.jpg',
  },
  {
    caption: `💚 Transparenz ist unser Kern.

Bei Quetz siehst du genau, wie dein Geld verwendet wird: 40% an die Bauernfamilien, 30% für die Schule, 30% für den Betrieb.

Kein Greenwashing. Nur echte Wirkung. 🌿

👉 quetz.org/transparencia

#Transparenz #Quetz #Nachhaltigkeit #Guatemala #SozialesUnternehmen #Aufforstung #Impact #Klimaschutz`,
    image_url: 'https://quetz.org/og-image.jpg',
  },
];

// ─── Rotate post by day-of-year ───────────────────────────────────────────────
function getTodaysPost() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return POSTS[dayOfYear % POSTS.length];
}

// ─── Instagram Graph API helpers ──────────────────────────────────────────────
async function createMediaContainer(imageUrl: string, caption: string): Promise<string> {
  const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`;
  const params = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: IG_ACCESS_TOKEN,
  });

  const res = await fetch(`${url}?${params}`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(`Media container error: ${JSON.stringify(data.error || data)}`);
  }

  return data.id as string;
}

async function publishMediaContainer(containerId: string): Promise<string> {
  const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`;
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: IG_ACCESS_TOKEN,
  });

  const res = await fetch(`${url}?${params}`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(`Publish error: ${JSON.stringify(data.error || data)}`);
  }

  return data.id as string;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // 1. Verify secret
    const body = await request.json().catch(() => ({}));
    const secret = body?.secret || request.headers.get('x-cron-secret');

    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check required env vars
    if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
      return NextResponse.json(
        { error: 'Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID env vars' },
        { status: 500 }
      );
    }

    // 3. Get today's post
    const post = getTodaysPost();

    // 4. Create media container
    const containerId = await createMediaContainer(post.image_url, post.caption);

    // 5. Wait 5 seconds (Instagram recommendation)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 6. Publish
    const postId = await publishMediaContainer(containerId);

    console.log(`[Instagram] Published post ${postId} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      postId,
      caption: post.caption.substring(0, 80) + '...',
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Instagram] Post failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── GET: health check / manual trigger info ──────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/instagram/post',
    description: 'POST with { secret } to publish today\'s Instagram post',
    postsAvailable: POSTS.length,
    nextPost: getTodaysPost().caption.substring(0, 100) + '...',
  });
}
