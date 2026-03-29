import { NextRequest, NextResponse } from 'next/server'

const GELATO_API_KEY = process.env.GELATO_API_KEY || ''

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  productUid: string
  quantity: number
  fileUrl: string    // front image (Quetzito mascot)
  backFileUrl: string // back image (QR code)
}

interface ShippingAddress {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  postCode: string
  state?: string
  country: string // ISO 2-letter
  email: string
  phone?: string
}

// ─── POST: Create a Gelato order (called after Stripe payment succeeds) ──────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderItems, shippingAddress, orderRef, orderType, treesTotal } = body as {
      orderItems: OrderItem[]
      shippingAddress: ShippingAddress
      orderRef?: string
      orderType?: 'draft' | 'order'
      treesTotal?: number
    }

    if (!orderItems?.length || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: orderItems and shippingAddress are required' },
        { status: 400 }
      )
    }

    if (!GELATO_API_KEY) {
      return NextResponse.json(
        { error: 'Gelato API key not configured' },
        { status: 500 }
      )
    }

    // Build Gelato order payload
    const gelatoOrder = {
      orderType: orderType || 'draft', // default to draft for safety
      orderReferenceId: orderRef || `quetz-shop-${Date.now()}`,
      customerReferenceId: `quetz-customer-${Date.now()}`,
      currency: 'EUR',
      items: orderItems.map((item, idx) => ({
        itemReferenceId: `item-${idx}-${Date.now()}`,
        productUid: item.productUid,
        quantity: item.quantity,
        files: [
          {
            type: 'default',
            url: item.fileUrl,
          },
          ...(item.backFileUrl
            ? [
                {
                  type: 'back',
                  url: item.backFileUrl,
                },
              ]
            : []),
        ],
      })),
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        postCode: shippingAddress.postCode,
        state: shippingAddress.state || '',
        country: shippingAddress.country,
        email: shippingAddress.email,
        phone: shippingAddress.phone || '',
      },
    }

    console.log('[Gelato] Creating order:', JSON.stringify({
      ...gelatoOrder,
      treesTotal,
    }, null, 2))

    const gelatoRes = await fetch('https://order.gelatoapis.com/v4/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': GELATO_API_KEY,
      },
      body: JSON.stringify(gelatoOrder),
    })

    const responseText = await gelatoRes.text()

    if (!gelatoRes.ok) {
      console.error('[Gelato] Order error:', gelatoRes.status, responseText)
      return NextResponse.json(
        {
          error: 'Failed to create Gelato order',
          status: gelatoRes.status,
          details: responseText,
        },
        { status: 502 }
      )
    }

    const result = JSON.parse(responseText)
    console.log('[Gelato] Order created successfully:', result.id, '| Trees:', treesTotal)

    return NextResponse.json({
      success: true,
      gelatoOrderId: result.id,
      treesAdopted: treesTotal || 0,
      order: result,
    })
  } catch (error: any) {
    console.error('[Gelato] Order exception:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
