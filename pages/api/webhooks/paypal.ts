import { NextApiRequest, NextApiResponse } from 'next'
import { paypal } from '@/lib/paypal'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID as string // Ensure this is a string
    if (!webhookId) {
      throw new Error('PAYPAL_WEBHOOK_ID is not defined in the environment variables')
    }

    const body = JSON.stringify(req.body)
    const signature = req.headers['paypal-transmission-sig'] as string
    const transmissionId = req.headers['paypal-transmission-id'] as string
    const timestamp = req.headers['paypal-transmission-time'] as string
    const certUrl = req.headers['paypal-cert-url'] as string
    const authAlgo = req.headers['paypal-auth-algo'] as string

    // Verify the webhook signature
    const isValid = await paypal.verifyWebhookSignature({
      webhookId,
      transmissionId,
      timestamp,
      certUrl,
      authAlgo,
      transmissionSig: signature,
      webhookEvent: body,
    })

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid webhook signature' })
    }

    // Process the webhook event
    const event = req.body
    console.log('Received PayPal webhook event:', event)

    // Handle specific event types (e.g., PAYMENT.CAPTURE.COMPLETED)
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      // Update order status in your database
      console.log('Payment completed for order:', event.resource)
    }

    res.status(200).json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Error processing PayPal webhook:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
