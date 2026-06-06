import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json()

    const appId = process.env.VALOR_APP_ID
    const appKey = process.env.VALOR_APP_KEY
    const epi = process.env.VALOR_EPI
    const isDemo = process.env.VALOR_DEMO_MODE === 'true'

    if (!appId || !appKey || !epi) {
      return NextResponse.json(
        { error: 'Payment configuration missing' },
        { status: 500 }
      )
    }

    // Valor Sale API endpoint
    const apiUrl = isDemo
      ? 'https://demo.valorpaytech.com/api/valor/sale'
      : 'https://securelink.valorpaytech.com:4430/?sale'

    const salePayload = {
      appid: appId,
      appkey: appKey,
      epi: epi,
      txn_type: 'sale',
      token: paymentData.token,
      amount: paymentData.amount,
      phone: paymentData.phone || '',
      email: paymentData.email || '',
      address1: paymentData.address1 || '',
      address2: paymentData.address2 || '',
      city: paymentData.city || '',
      state: paymentData.state || '',
      zip: paymentData.zip || '',
      billing_country: 'US',
      shipping_country: 'US',
      surchargeIndicator: '0',
      surchargeAmount: '0.00',
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(salePayload),
    })

    const data = await response.json()

    if (data.error_no === 'S00' || data.errorCode === '00') {
      return NextResponse.json({
        success: true,
        transactionId: data.txnid || data.rrn,
        authCode: data.auth_code,
        message: 'Payment successful',
        responseData: data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.mesg || data.error_code || 'Payment failed',
          errorCode: data.error_no || data.errorCode,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Valor payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

