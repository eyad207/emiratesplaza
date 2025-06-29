'use client'

import { useState, useEffect, useCallback } from 'react'
import { createStripePaymentIntent } from '@/lib/actions/order.actions'
import { useToast } from '@/hooks/use-toast'

export default function useStripePayment(orderId: string, currency: string) {
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
      const result = await createStripePaymentIntent(orderId, currency)

      if (result.success && result.data) {
        setClientSecret(result.data.clientSecret)
        setConvertedPrice(result.data.convertedPrice)
      } else {
        const errorMessage = result.message || 'Failed to create payment intent'
        setError(errorMessage)
        toast({
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch {
      const errorMessage = 'An unexpected error occurred'
      setError(errorMessage)
      toast({
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [orderId, currency, loading, clientSecret, toast])

  useEffect(() => {
    if (orderId && currency) {
      createPaymentIntent()
    }
  }, [orderId, currency, createPaymentIntent])

  return {
    clientSecret,
    convertedPrice,
    loading,
    error,
    createPaymentIntent,
  }
}
