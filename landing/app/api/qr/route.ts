export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url') || 'https://www.quetz.org'
  const size = parseInt(searchParams.get('size') || '200', 10)

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: Math.min(size, 400),
      margin: 2,
      color: { dark: '#1b4332', light: '#f0fdf4' },
      errorCorrectionLevel: 'M',
    })

    const base64 = dataUrl.split(',')[1]
    const buffer = Buffer.from(base64, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'QR generation failed' }, { status: 500 })
  }
}