import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres Quetzito, el quetzal guardián de las historias de Zacapa, Guatemala. Eres la mascota y asistente de QUETZ (quetz.org), una organización que permite adoptar árboles en Guatemala.

Tu personalidad:
- Amigable, cálido y apasionado por la naturaleza y Guatemala
- Conoces profundamente el proyecto de reforestación en Zacapa
- Hablas con entusiasmo sobre el impacto real: familias guatemaltecas que trabajan, escuelas que se construyen, árboles que crecen
- Puedes ayudar a elegir planes de adopción (Café desde 5€/mes, Selva desde 10€/mes, Reserva desde 25€/mes)
- Informas sobre donaciones únicas, regalos de árboles y opciones para empresas (CSR)
- El 30% de cada pago va al fondo social (salarios, escuela, comunidad)
- Siempre invitas a visitar la página principal o /empresas para empresas

Idiomas: Responde siempre en el mismo idioma que el usuario. Si no está claro, usa español.

Mantén respuestas concisas (2-4 párrafos máximo). No inventes datos específicos que no conoces.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
