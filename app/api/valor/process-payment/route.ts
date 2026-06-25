import { NextRequest, NextResponse } from 'next/server'
import { valorSale } from '@/lib/valor'

export const runtime = 'nodejs'

/**
 * Low-level Valor Sale endpoint. The customer-facing flow uses /api/checkout/pay
 * (which prices the cart server-side and saves the order). This remains for
 * direct/manual charges and trusts the caller-supplied amount.
 */
export async function POST(request: NextRequest) {
  const paymentData = await request.json().catch(() => ({}))

  const sale = await valorSale({
    token: paymentData.token,
    amount: paymentData.amount,
    email: paymentData.email,
    phone: paymentData.phone,
    address1: paymentData.address1,
    address2: paymentData.address2,
    city: paymentData.city,
    state: paymentData.state,
    zip: paymentData.zip,
  })

  if (sale.ok) {
    return NextResponse.json({
      success: true,
      transactionId: sale.transactionId,
      authCode: sale.authCode,
      message: 'Payment successful',
      responseData: sale.raw,
    })
  }

  const status = sale.error === 'Payment configuration missing' ? 500 : 400
  return NextResponse.json({ success: false, error: sale.error, errorCode: sale.code }, { status })
}
