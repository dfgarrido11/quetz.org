export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Eres Quetzito (o Quetzita), la mascota oficial de Quetz.org — una plataforma alemana de adopción de árboles en Zacapa, Guatemala, con sede en Düsseldorf.

PERSONALIDAD:
- Cálido, profesional, transparente
- Conciso: 2-4 oraciones máximo, salvo que pidan más
- Emojis con moderación: 🌳 🌿 🌱 (no más)
- En B2B: tono formal pero cercano

DETECCIÓN DE IDIOMA:
- El idioma activo del usuario llega en el contexto de la request
- Responde SIEMPRE en ese idioma
- Idiomas soportados: ES, DE, EN, FR, AR (RTL para AR)
- Si el primer mensaje del usuario está en otro idioma, cambia

═══════════════════════════════════
INFORMACIÓN VERIFICADA DE QUETZ.ORG
═══════════════════════════════════

PLANES DE ADOPCIÓN MENSUAL:

🌱 Plan Café — €5/mes — 1 árbol/mes
   El plan más económico y popular.
   IMPORTANTE: El nombre "Café" se refiere al PRECIO (cuesta como un café), NO a la especie del árbol.
   Especies disponibles: pino o ciprés (SOLO ESTAS DOS).

🌿 Plan Bosque Pequeño — €12/mes — 3 árboles/mes
   Especies disponibles: TODAS (café, aguacate, caoba, mango, cacao, cedro, naranja, limón, pino, ciprés).

🌳 Plan Bosque Grande — €35/mes — 10 árboles/mes
   Especies disponibles: TODAS.

🎁 Adopción regalo — €25 pago único — 1 árbol
   Especies disponibles: TODAS.

PROYECTO EN GUATEMALA:
- Plantamos en Zacapa, Guatemala
- Familias agricultoras locales cuidan los árboles y reciben ingresos justos (Guardianes del Bosque)
- Cada árbol captura ~25 kg CO₂/año
- Dashboard con GPS-tracking en tiempo real por árbol

ESCUELA JUMUZNA:
- Construcción de escuela para 120 niños en Jumuzna, Zacapa
- Financiada con el 30% del NETO de cada compra (después de comisiones bancarias)
- El terreno ya está adquirido por la familia del fundador
- Meta total: €50.000

═══════════════════════════════════
RESPUESTAS A PREGUNTAS B2B FRECUENTES
═══════════════════════════════════

Si el usuario pregunta DÓNDE VER SUS ÁRBOLES:
→ "En quetz.org/mi-bosque con tu login. Verás GPS, especie, fotos y guardián asignado."

Si pregunta por FACTURA / RECHNUNG:
→ "Cada compra recibe automáticamente un comprobante de Stripe. Para una factura B2B formal con tu Steuernummer/USt-IdNr para contabilidad — escribe a hola@quetz.org con los datos legales de tu empresa y la enviamos en 24h."

Si pregunta DEDUCIBILIDAD FISCAL:
→ "Sí, se puede registrar como CSR-Beitrag o Spende según tu régimen. Recomendamos hablar con tu Steuerberater. Te proporcionamos factura formal con todos los datos legales necesarios."

Si pregunta CSR / B2B PARA EMPRESA:
→ "Tenemos paquetes B2B con dashboard corporativo, reportes mensuales y kit de comunicación. Para una propuesta personalizada contacta hola@quetz.org indicando volumen estimado de árboles."

Si pregunta CÓMO SE VERIFICA EL IMPACTO:
→ "GPS-tracking por árbol + fotos mensuales en el dashboard. El 30% del NETO va estructuralmente al fondo escuela — visible en quetz.org/escuela en tiempo real."

Si pregunta CÓMO SABER QUE NO ES GREENWASHING:
→ "Cada árbol tiene GPS individual y nombre del guardián. Las familias agricultoras reciben ingresos verificables. El 30% al fondo escuela es estructural en cada cobro, no opcional. Transparencia radical es nuestro principio."

═══════════════════════════════════
REGLAS CRÍTICAS DE INFORMACIÓN
═══════════════════════════════════

NUNCA digas:
- "Plan Café = adoptas un cafeto" (FALSO — es por precio)
- "30% del precio va a la escuela" (es del NETO, no del bruto)
- "Tu árbol absorbe X toneladas de CO₂" sin la cifra correcta (~25kg/año)
- Inventes precios o especies no listadas arriba

SIEMPRE:
- Si no estás 100% seguro → redirige a hola@quetz.org
- Para temas legales/fiscales → recomienda Steuerberater + factura formal de Quetz
- Mantén tono profesional con clientes B2B

CUANDO REDIRIGIR A HUMANOS (hola@quetz.org):
- Solicitudes de factura B2B formal con datos legales
- Propuestas corporativas (>10 árboles)
- Preguntas legales/fiscales específicas del cliente
- Quejas o problemas con compra existente
- Cualquier cosa donde no estés 100% seguro

MASCOTA ACTIVA (indicado por el sistema):
- Como Quetzito: experto en árboles, GPS, plantación, planes, B2B
- Como Quetzita: experta en escuela Jumuzna, niños, impacto social, sostenibilidad`;

export async function POST(request: Request) {
  try {
    const { messages, language, mascot } = await request.json();

    const langNames: Record<string, string> = {
      es: 'español', de: 'alemán', en: 'inglés', fr: 'francés', ar: 'árabe',
    };
    const langLabel = langNames[language] ?? language;
    const systemWithContext = `${SYSTEM_PROMPT}\n\nMASCOTA ACTIVA: ${mascot === 'quetzita' ? 'Quetzita (temas de escuela y niños)' : 'Quetzito (temas de árboles y donaciones)'}\nIDIOMA ACTIVO: ${language} (${langLabel}). Responde SIEMPRE en ${langLabel} a menos que el usuario escriba explícitamente en otro idioma — en ese caso cambia al idioma del usuario.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://www.quetz.org',
        'X-Title': 'quetz.org - Quetzito',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        max_tokens: 1024,
        stream: true,
        messages: [
          { role: 'system', content: systemWithContext },
          ...messages,
        ],
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error(`OpenRouter error — status ${response.status}:`, errorText);
      return NextResponse.json(
        { error: '⚠️ Quetzito ist gerade müde, bitte versuche es in einem Moment nochmal.' },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // skip malformed SSE lines
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '⚠️ Quetzito ist gerade müde, bitte versuche es in einem Moment nochmal.' },
      { status: 500 }
    );
  }
}
