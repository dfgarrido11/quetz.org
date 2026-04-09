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

    const apiKey = "***REMOVED***"

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.quetz.org',
        'X-Title': 'quetz.org - Quetzito',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content: 'Eres Quetzito, el asistente de quetz.org. Ayudas con adopción de árboles en Guatemala. Sé breve y amigable.'
          },
          { role: 'user', content: userText }
        ],
        max_tokens: 300,
      }),
    })

    const aiData = await aiRes.json()
    const reply = aiData.choices?.[0]?.message?.content
      || `ERROR: ${JSON.stringify(aiData)}`

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (chatId) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: `ERROR: ${err}` }),
      })
    }
    return NextResponse.json({ ok: true })
  }
}
