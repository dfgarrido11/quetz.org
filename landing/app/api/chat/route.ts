export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

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

const ERROR_MSG = '⚠️ Quetzito ist gerade müde, bitte versuche es in einem Moment nochmal.';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function logHealthError(message: string, metadata: Record<string, unknown>) {
  try {
    await prisma.systemHealthLog.create({
      data: {
        checkType: 'diagnosis',
        status: 'fail',
        errorMessage: message,
        metadata,
      },
    });
  } catch {
    // fire-and-forget — never block the response
  }
}

export async function POST(request: Request) {
  const startMs = Date.now();

  try {
    const { messages, language, mascot } = await request.json();

    const systemWithContext = `${SYSTEM_PROMPT}\n\nMASCOTA ACTIVA: ${mascot === 'quetzita' ? 'Quetzita (temas de escuela y niños)' : 'Quetzito (temas de árboles y donaciones)'}\nIDIOMA DETECTADO: ${language}`;

    const stream = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      temperature: 0.7,
      system: systemWithContext,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    let inputTokens = 0;
    let outputTokens = 0;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
            if (event.type === 'message_start') {
              inputTokens = event.message.usage.input_tokens;
            }
            if (event.type === 'message_delta') {
              outputTokens = event.usage.output_tokens;
            }
          }
          const latencyMs = Date.now() - startMs;
          console.info(
            `[chat] anthropic_ok latency_ms=${latencyMs} input_tokens=${inputTokens} output_tokens=${outputTokens}`
          );
        } catch (streamErr: unknown) {
          const msg = streamErr instanceof Error ? streamErr.message : String(streamErr);
          console.error(`[chat] anthropic_stream_error message=${msg}`);
          void logHealthError(msg, { phase: 'stream', latencyMs: Date.now() - startMs });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: unknown) {
    const latencyMs = Date.now() - startMs;

    let status = 0;
    let message = 'unknown';

    if (error instanceof Anthropic.APIError) {
      status = error.status;
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error(`[chat] anthropic_error status=${status} message=${message} latency_ms=${latencyMs}`);
    void logHealthError(message, { status, latencyMs });

    return NextResponse.json({ error: ERROR_MSG }, { status: 500 });
  }
}
