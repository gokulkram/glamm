import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()

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

    // Valor GetClientToken API endpoint
    const apiUrl = isDemo
      ? 'https://demo.valorpaytech.com/api/valor/getClientToken'
      : 'https://securelink.valorpaytech.com:4430/?getClientToken'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appid: appId,
        appkey: appKey,
        epi: epi,
        txn_type: 'sale',
        amount: amount || '1.00',
      }),
    })

    const data = await response.json()

    if (data.error_no === 'S00' && data.clientToken) {
      return NextResponse.json({
        success: true,
        clientToken: data.clientToken,
        validity: data.validity,
        epi: epi,
        isDemo: isDemo,
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to generate client token', 
          details: data.error_code || data.error_no 
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Valor token error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to payment processor' },
      { status: 500 }
    )
  }
}

