import { NextRequest, NextResponse } from 'next/server'

const GELATO_API_KEY = process.env.GELATO_API_KEY || ''

export interface GelatoOrderItem {
  productUid: string
  quantity: number
  variantOptions?: { name: string; value: string }[]
  printAreas?: {
    front?: { imageUrl: string }
    back?: { imageUrl: string }
  }
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  postCode: string
  country: string
  email: string
  phone?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderItems, shippingAddress, stripePaymentIntentId, orderRef } = body

    if (!orderItems?.length || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const gelatoOrder = {
      orderType: 'order',
      orderReferenceId: orderRef || `quetz-${Date.now()}`,
      customerReferenceId: stripePaymentIntentId || `quetz-${Date.now()}`,
      currency: 'EUR',
      items: orderItems.map((item: GelatoOrderItem) => ({
        itemReferenceId: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        productUid: item.productUid,
        quantity: item.quantity,
        variantOptions: item.variantOptions || [],
        printAreas: item.printAreas || {},
      })),
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        postCode: shippingAddress.postCode,
        country: shippingAddress.country,
        email: shippingAddress.email,
        phone: shippingAddress.phone || '',
      },
    }

    const gelatoRes = await fetch('https://order.gelatoapis.com/v4/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': GELATO_API_KEY,
      },
      body: JSON.stringify(gelatoOrder),
    })

    if (!gelatoRes.ok) {
      const error = await gelatoRes.text()
      console.error('Gelato order error:', error)
      return NextResponse.json(
        { error: 'Failed to create Gelato order', details: error },
        { status: 502 }
      )
    }

    const result = await gelatoRes.json()
    return NextResponse.json({ success: true, gelatoOrderId: result.id, order: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
