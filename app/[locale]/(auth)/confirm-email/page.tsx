'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  verifyCodeAndRegisterUser,
  sendVerificationCode,
} from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''
  const name = searchParams?.get('name') || ''
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      const res = await verifyCodeAndRegisterUser(email, name)
      if (!res.success) {
        toast({
          title: 'Error',
          description: res.error,
          variant: 'destructive',
        })
        return
      }
      router.push(callbackUrl)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to verify code',
        variant: 'destructive',
      })
    }
  }

  const handleResendCode = async () => {
    try {
      const res = await sendVerificationCode(email, name)
      if (!res.success) {
        toast({
          title: 'Error',
          description: res.error,
          variant: 'destructive',
        })
        return
      }
      setCountdown(60) // Set countdown to 60 seconds
      toast({
        title: 'Success',
        description: 'Verification code resent successfully',
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to resend verification code',
        variant: 'destructive',
      })
    }
  }

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className='flex flex-col items-center bg-zinc-900 rounded-2xl'>
      <div className='w-full max-w-md p-8 bg- rounded-2xl shadow-md'>
        <h1 className='text-3xl font-bold mb-6 text-center'>
          Confirm Your Email
        </h1>
        <p className='mb-4 text-center'>
          A verification code has been sent to{' '}
          <span className='font-semibold'>{email}</span>. Please enter the code
          below to complete your registration.
        </p>
        <Input
          type='text'
          placeholder='Enter verification code'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className='mb-4'
        />
        <Button onClick={handleSubmit} className='w-full'>
          Verify Code
        </Button>
        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-600'>
            Didn&apos;t receive the code?{' '}
            <button
              className='text-blue-600 hover:underline'
              onClick={handleResendCode}
              disabled={countdown > 0}
            >
              Resend Code {countdown > 0 && `(${countdown}s)`}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
