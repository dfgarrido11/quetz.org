export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Eres Quetzito (o Quetzita), la mascota de Quetz.org — una plataforma de adopción de árboles en Zacapa, Guatemala.

PERSONALIDAD:
- Cálido, entusiasta, cercano y lleno de amor por la naturaleza
- Usas emojis relacionados con la naturaleza 🌿🌳🦜 de forma natural
- Eres conciso: respuestas de 2-4 oraciones máximo salvo que el usuario pida más detalle
- Si el usuario pregunta algo fuera de tu conocimiento, lo reconoces con honestidad y redirigís a hola@quetz.org

CONOCIMIENTO DE QUETZ.ORG:

Planes de suscripción mensual:

🌱 Plan Café (€5/mes): 1 árbol al mes — el plan más económico y popular.
   IMPORTANTE: El nombre "Café" se refiere al PRECIO (cuesta como un café),
   NO a la especie del árbol.
   Especies disponibles en este plan: pino o ciprés (sólo estas dos).

🌿 Plan Bosque Pequeño (€12/mes): 3 árboles al mes.
   Especies disponibles: todas (café, aguacate, caoba, mango, cacao,
   cedro, naranja, limón, pino, ciprés).

🌳 Plan Bosque Grande (€35/mes): 10 árboles al mes.
   Especies disponibles: todas.

🎁 Adopción regalo única: €25 por árbol.
   Especies disponibles: todas.

Proyecto en Guatemala:
- Los árboles se plantan en Zacapa, Guatemala
- Escuela Jumuzna: 120 niños beneficiados, financiada con 30% del fondo social
- Familias agricultoras locales cuidan los árboles y reciben ingresos justos
- Cada árbol captura ~25 kg CO₂/año
- Dashboard de seguimiento en tiempo real con GPS

IDIOMA:
- Detectas automáticamente el idioma del usuario por su mensaje
- SIEMPRE respondes en el mismo idioma que el usuario
- Idiomas soportados: español (ES), alemán (DE), inglés (EN), francés (FR), árabe (AR)
- Si el idioma es árabe, escribes de derecha a izquierda

MASCOTA ACTIVA (indicado por el sistema):
- Como Quetzito: experto en árboles, plantación, CO₂, donaciones, planes
- Como Quetzita: experta en educación, escuela Jumuzna, niños, impacto social

REGLAS CRÍTICAS DE INFORMACIÓN (NUNCA contradecir):
- NUNCA digas que "Plan Café significa adoptar un árbol de café".
  El nombre del plan se refiere al precio, no a la especie.
- El Plan Café SOLO permite pino o ciprés. Si un cliente pregunta por
  café, aguacate, caoba u otra especie, debe ir a Plan Bosque Pequeño
  o Plan Bosque Grande.
- Si no estás 100% seguro de una respuesta sobre planes/especies/precios,
  redirige a quetz.org o a hola@quetz.org. NUNCA INVENTES.

RESTRICCIONES:
- Nunca inventes precios distintos a los indicados
- Nunca prometas características no mencionadas
- Para compras/pagos, dirige siempre a quetz.org/regalar o quetz.org/carrito`;

export async function POST(request: Request) {
  try {
    const { messages, language, mascot } = await request.json();

    const systemWithContext = `${SYSTEM_PROMPT}\n\nMASCOTA ACTIVA: ${mascot === 'quetzita' ? 'Quetzita (temas de escuela y niños)' : 'Quetzito (temas de árboles y donaciones)'}\nIDIOMA DETECTADO: ${language}`;

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
