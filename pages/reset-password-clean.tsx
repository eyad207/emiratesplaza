'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

const ResetPassword = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast({
          title: 'Error',
          description: 'No reset token found in URL',
          variant: 'destructive',
        })
        router.push('/sign-in')
        return
      }

      try {
        const response = await fetch('/api/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          toast({
            title: 'Error',
            description: errorData.error || 'Invalid or expired reset token',
            variant: 'destructive',
          })
          router.push('/sign-in')
          return
        }

        setIsValidToken(true)
      } catch (error) {
        console.error('Token verification failed:', error)
        toast({
          title: 'Error',
          description: 'Failed to verify reset token',
          variant: 'destructive',
        })
        router.push('/sign-in')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token, router])

  const handlePasswordReset = async () => {
    setIsSubmitting(true)
    try {
      if (!token) {
        toast({
          title: 'Error',
          description:
            'Reset token is missing. Please use the link from your email.',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      if (!newPassword || newPassword.trim().length === 0) {
        toast({
          title: 'Error',
          description: 'Please enter a new password',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      if (newPassword.length < 6) {
        toast({
          title: 'Error',
          description: 'Password must be at least 6 characters long',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset password')
      }

      toast({
        title: 'Success',
        description: 'Password reset successfully',
        variant: 'default',
      })
      router.push('/sign-in')
    } catch (error) {
      toast({
        title: 'Error',
        description:
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : 'An error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='max-w-md mx-auto mt-10'>
      <h1 className='text-xl font-bold mb-4'>Reset Password</h1>

      {isVerifying ? (
        <div className='text-center'>
          <p>Verifying reset token...</p>
        </div>
      ) : isValidToken ? (
        <>
          <Input
            type='password'
            placeholder='Enter new password (min 6 characters)'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className='mb-4'
          />
          <Button
            onClick={handlePasswordReset}
            disabled={isSubmitting || !newPassword || newPassword.length < 6}
            className='w-full'
          >
            {isSubmitting ? 'Submitting...' : 'Reset Password'}
          </Button>
        </>
      ) : null}
    </div>
  )
}

export default ResetPassword
