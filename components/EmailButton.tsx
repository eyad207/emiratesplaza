'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { checkEmailRegistered } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

const EmailButton = ({ email }: { email: string }) => {
  const [currentEmail, setCurrentEmail] = useState(email)
  const [codeSent, setCodeSent] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generatedCodeRef = useRef('')
  const codeExpiryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    setCurrentEmail(email)
  }, [email])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const generateCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    generatedCodeRef.current = newCode

    if (codeExpiryTimeoutRef.current) {
      clearTimeout(codeExpiryTimeoutRef.current)
    }

    codeExpiryTimeoutRef.current = setTimeout(
      () => {
        generatedCodeRef.current = ''
      },
      15 * 60 * 1000
    ) // 15 minutes
  }

  const getUserFirstName = async (email: string): Promise<string> => {
    try {
      const res = await fetch('/api/getUserFirstName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error('Could not fetch first name')

      const { firstName } = await res.json()
      return firstName || 'User'
    } catch (err) {
      console.error(err)
      return 'User'
    }
  }

  const sendVerificationCode = async (
    email: string,
    code: string,
    firstName: string
  ) => {
    try {
      const res = await fetch('/api/sendVerificationCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, firstName }),
      })

      if (!res.ok) throw new Error('Failed to send code')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Could not send the verification email.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async () => {
    if (!currentEmail) {
      toast({
        title: 'Missing Email',
        description: 'Please provide an email address.',
        variant: 'destructive',
      })
      return
    }

    const isRegistered = await checkEmailRegistered(currentEmail)
    if (!isRegistered) {
      toast({
        title: 'Not Registered',
        description: 'This email is not registered.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Sending Code',
      description: 'Please wait while we send the code.',
    })

    const [firstName] = await Promise.all([getUserFirstName(currentEmail)])
    generateCode()
    setCodeSent(true) // Vis input med en gang!
    await sendVerificationCode(
      currentEmail,
      generatedCodeRef.current,
      firstName
    )

    toast({
      title: 'Success',
      description: 'Verification code sent!',
    })
    setCountdown(60)
  }

  const handleCodeSubmit = async () => {
    setIsSubmitting(true)

    if (codeInput === generatedCodeRef.current) {
      try {
        const res = await fetch('/api/createResetToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentEmail }),
        })

        if (!res.ok) throw new Error('Failed to get token')

        const { token } = await res.json()
        router.push(`/reset-password?token=${token}`)
      } catch (err) {
        console.error(err)
        toast({
          title: 'Error',
          description: 'Something went wrong while creating reset token.',
          variant: 'destructive',
        })
      }
    } else {
      toast({
        title: 'Invalid Code',
        description: 'The code you entered is incorrect.',
        variant: 'destructive',
      })
    }

    setIsSubmitting(false)
  }

  return (
    <div>
      <div className='flex items-center'>
        <Button
          onClick={handleSubmit}
          disabled={countdown > 0}
          className={countdown > 0 ? 'opacity-50' : ''}
        >
          Send Code
        </Button>
        {countdown > 0 && (
          <span className='ml-2 text-sm text-gray-600'>
            Resend in {countdown}s
          </span>
        )}
      </div>

      {codeSent && (
        <div className='mt-4'>
          <label
            htmlFor='code'
            className='block text-sm font-medium text-gray-700'
          >
            Code
          </label>
          <Input
            id='code'
            type='text'
            placeholder='Enter code'
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <Button
            onClick={handleCodeSubmit}
            className='mt-2'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Code'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmailButton
