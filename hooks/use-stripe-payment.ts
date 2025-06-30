'use client'

import { useState, useEffect, useCallback } from 'react'
import { createStripePaymentIntent } from '@/lib/actions/order.actions'
import { useToast } from '@/hooks/use-toast'

export default function useStripePayment(orderId: string) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const createPaymentIntent = useCallback(async () => {
    if (loading || clientSecret) return

    setLoading(true)
    setError(null)

    try {
      console.log('Creating Stripe payment intent for order:', orderId)
      const result = await createStripePaymentIntent(orderId)

      console.log('Stripe payment intent result:', {
        success: result.success,
        message: result.message,
        hasData: !!result.data,
      })

      if (result.success && result.data) {
        setClientSecret(result.data.clientSecret)
        setConvertedPrice(result.data.convertedPrice)
      } else {
        const errorMessage = result.message || 'Failed to create payment intent'
        console.error('Stripe payment intent failed:', errorMessage)
        setError(errorMessage)
        toast({
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('Stripe payment intent error:', err)
      setError(errorMessage)
      toast({
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [orderId, loading, clientSecret, toast])

  useEffect(() => {
    if (orderId) {
      createPaymentIntent()
    }
  }, [orderId, createPaymentIntent])

  return {
    clientSecret,
    convertedPrice,
    loading,
    error,
    createPaymentIntent,
  }
}
