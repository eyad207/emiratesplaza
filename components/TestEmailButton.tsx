'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { checkEmailRegistered } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

const TestEmailButton = ({ email }: { email: string }) => {
  const [currentEmail, setCurrentEmail] = useState(email)
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const router = useRouter()

  useEffect(() => {
    setCurrentEmail(email)
  }, [email])

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    setTimeout(() => setGeneratedCode(''), 15 * 60 * 1000) // Code expires in 15 minutes
    return code
  }

  const getUserFirstName = async (email: string): Promise<string> => {
    try {
      const response = await fetch('/api/getUserFirstName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user first name')
      }

      const data = await response.json()
      return data.firstName
    } catch (error) {
      console.error('Failed to fetch user first name:', error)
      return 'User'
    }
  }

  const sendVerificationCode = async (
    email: string,
    code: string,
    firstName: string
  ) => {
    try {
      const response = await fetch('/api/sendVerificationCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, firstName }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again later.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async () => {
    if (!currentEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      })
      return
    }

    const isRegistered = await checkEmailRegistered(currentEmail)
    if (!isRegistered) {
      toast({
        title: 'Error',
        description: 'Email is not registered',
        variant: 'destructive',
      })
      return
    }

    const code = generateCode()
    const firstName = await getUserFirstName(currentEmail) // Get the user's first name
    await sendVerificationCode(currentEmail, code, firstName)

    setCodeSent(true)
    toast({
      title: 'Success',
      description: 'Email sent successfully',
      variant: 'default',
    })
  }

  const handleCodeSubmit = () => {
    if (code === generatedCode) {
      router.push(`/reset-password?email=${currentEmail}`)
    } else {
      toast({
        title: 'Error',
        description: 'The code you entered is incorrect',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <Button onClick={handleSubmit}>Send Code</Button>
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
            name='code'
            type='text'
            placeholder='Enter code'
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={handleCodeSubmit} className='mt-2'>
            Submit Code
          </Button>
        </div>
      )}
    </div>
  )
}

export default TestEmailButton
