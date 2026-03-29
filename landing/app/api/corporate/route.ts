import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyName, country, contactName, email, phone, employees, message } = body

    if (!companyName || !contactName || !email) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Save to Prisma CorporateLead model
    const lead = await prisma.corporateLead.create({
      data: {
        companyName,
        country: country || '',
        contactName,
        contactEmail: email,
        contactPhone: phone || null,
        employeeCount: employees ? String(employees) : null,
        message: message || null,
        status: 'new',
      },
    })

    // Also insert into raw csr_leads table (ensure it exists)
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS csr_leads (
          id SERIAL PRIMARY KEY,
          company_name VARCHAR(255),
          contact_name VARCHAR(255),
          contact_email VARCHAR(255),
          employees INTEGER,
          country VARCHAR(100),
          message TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
      await prisma.$executeRaw`
        INSERT INTO csr_leads (company_name, contact_name, contact_email, employees, country, message)
        VALUES (${companyName}, ${contactName}, ${email}, ${employees ? parseInt(employees) : null}, ${country || ''}, ${message || ''})
      `
    } catch (rawErr) {
      // Non-fatal: CorporateLead already saved
      console.error('csr_leads insert error (non-fatal):', rawErr)
    }

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error: any) {
    console.error('Corporate lead error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
