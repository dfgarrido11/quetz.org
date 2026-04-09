import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let chatId: number | undefined
  try {
    const body = await req.json()
    const message = body?.message
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    chatId = message.chat.id
    const userText = message.text

    // Llamar a OpenRouter con Gemma 4
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://www.quetz.org',
        'X-Title': 'quetz.org - Quetzito',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content: `Eres Quetzito 🌱, el asistente amigable de quetz.org.
Ayudas con adopción de árboles nativos en Guatemala (Zacapa), planes de suscripción
(Plan Café €5/mes 1 árbol, Bosque Pequeño €12/mes 3 árboles, Bosque Grande €35/mes 10 árboles),
y el proyecto de la escuela de Jumuzna para 120 niños (meta €50,000).
Responde siempre en el idioma del usuario. Sé cálido, breve y motivador.
Web: https://www.quetz.org`
          },
          { role: 'user', content: userText }
        ],
        max_tokens: 500,
      }),
    })

    const aiData = await aiRes.json()
    const reply = aiData.choices?.[0]?.message?.content
      || `ERROR: ${JSON.stringify(aiData)}`

    // Enviar respuesta al usuario en Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `CATCH ERROR: ${err}` }),
    })
    return NextResponse.json({ ok: true })
  }
}
