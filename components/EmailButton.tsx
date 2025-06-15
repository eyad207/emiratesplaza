'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

const EmailButton = ({ email }: { email: string }) => {
  const [currentEmail, setCurrentEmail] = useState(email)
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    setCurrentEmail(email)
  }, [email])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const sendResetPasswordToken = async (email: string) => {
    try {
      const response = await fetch('/api/sendResetPasswordToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to send reset password token')
      }
    } catch (error) {
      console.error('Failed to send reset password token:', error)
      throw error // Propagate the error
    }
  }

  const showToast = (
    title: string,
    description: string,
    variant: 'default' | 'destructive'
  ) => {
    toast({ title, description, variant })
  }

  const handleSubmit = async () => {
    if (!currentEmail) {
      showToast('Error', 'Please enter an email address', 'destructive')
      return
    }

    if (!isValidEmail(currentEmail)) {
      showToast('Error', 'Please enter a valid email address', 'destructive')
      return
    }

    try {
      await sendResetPasswordToken(currentEmail)
      showToast(
        'Success',
        'If the email is registered, a reset link has been sent.',
        'default'
      )
      setCodeSent(true)
      setCountdown(60)
    } catch {
      showToast(
        'Error',
        'Failed to send reset password token. Please try again later.',
        'destructive'
      )
    }
  }

  return (
    <div>
      <div className='flex items-center'>
        <Button
          onClick={handleSubmit}
          disabled={countdown > 0}
          className={countdown > 0 ? 'opacity-50' : ''}
        >
          Send Reset Link
        </Button>
        {countdown > 0 && (
          <span className='ml-2 text-sm text-gray-600'>
            Resend in {countdown} seconds
          </span>
        )}
      </div>
      {codeSent && (
        <div className='mt-4 text-sm text-gray-600'>
          If the email is registered, a reset password link has been sent.
          Please check your inbox.
        </div>
      )}
    </div>
  )
}

export default EmailButton
