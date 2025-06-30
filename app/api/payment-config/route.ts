import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = {
      stripe: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        secretKeyPrefix:
          process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'missing',
        publishableKeyPrefix:
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) ||
          'missing',
      },
      paypal: {
        hasClientId: !!process.env.PAYPAL_CLIENT_ID,
        hasSecret: !!process.env.PAYPAL_APP_SECRET,
      },
    }

    return NextResponse.json(config)
  } catch {
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    )
  }
}
