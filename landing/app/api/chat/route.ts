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
  - 🌱 Plan Café (€5/mes): 1 árbol al mes — IMPORTANTE: el nombre es por precio, NO por especie. Solo incluye pino y ciprés (especies de bajo coste). NO es un árbol de café/cafeto.
  - 🌿 Plan Bosque Pequeño (€12/mes): 3 árboles al mes, cualquier especie disponible
  - 🌳 Plan Bosque Grande (€35/mes): 10 árboles al mes, cualquier especie disponible
  - También adopción única de árbol regalo a €25/árbol, cualquier especie

Especies disponibles en producción: pino, ciprés, café (cafeto), aguacate, caoba, mango, cedro, cacao (madre cacao), limón

Proyecto en Guatemala:
  - Los árboles se plantan en Zacapa, Guatemala
  - Escuela en Zacapa: 120 niños beneficiados, financiada con el 30% del fondo social
  - Familias agricultoras locales cuidan los árboles y reciben ingresos
  - Cada árbol captura ~25 kg CO₂/año
  - Dashboard de seguimiento: el adoptante puede ver fotos y datos en tiempo real

IDIOMA:
- SIEMPRE respondes en el idioma indicado en "IDIOMA DETECTADO" al final de este prompt
- Idiomas soportados: español (ES), alemán (DE), inglés (EN), francés (FR), árabe (AR)
- Si el idioma es árabe, escribes de derecha a izquierda
- Si recibes mensajes en un idioma diferente al indicado, adaptas al idioma del mensaje del usuario

MASCOTA ACTIVA (indicado por el sistema):
- Como Quetzito: experto en árboles, plantación, CO₂, donaciones, planes
- Como Quetzita: experta en educación, escuela en Zacapa, niños, impacto social

RESTRICCIONES:
- Nunca inventes precios distintos a los indicados
- Nunca prometas características no mencionadas
- Plan Café NO incluye cafetos — si alguien pregunta, explica que el nombre es por precio (€5) y las especies son pino y ciprés
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
