export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { html_content, pdf_options, css_stylesheet } = await request.json();

    const createResponse = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content,
        pdf_options: pdf_options ?? { format: 'A4', print_background: true },
        base_url: process.env.NEXTAUTH_URL ?? '',
        css_stylesheet,
      }),
    });

    if (!createResponse.ok) {
      return NextResponse.json({ success: false, error: 'Error creando PDF' }, { status: 500 });
    }

    const { request_id } = await createResponse.json();
    if (!request_id) {
      return NextResponse.json({ success: false, error: 'Sin ID de solicitud' }, { status: 500 });
    }

    let attempts = 0;
    while (attempts < 300) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, deployment_token: process.env.ABACUSAI_API_KEY }),
      });
      const statusResult = await statusResponse.json();
      const status = statusResult?.status ?? 'FAILED';
      const result = statusResult?.result ?? null;

      if (status === 'SUCCESS' && result?.result) {
        const pdfBuffer = Buffer.from(result.result, 'base64');
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="certificado-quetz.pdf"',
          },
        });
      } else if (status === 'FAILED') {
        return NextResponse.json({ success: false, error: result?.error ?? 'Fallo al generar PDF' }, { status: 500 });
      }
      attempts++;
    }
    return NextResponse.json({ success: false, error: 'Tiempo de espera agotado' }, { status: 500 });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
