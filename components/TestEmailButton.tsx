'use client'
import React, { useEffect, useState } from 'react'
import { EmailTemplate } from '../email-templates/test-email'
import { sendEmail } from '@/lib/actions/emails/sendEmail'
import { Button } from '@/components/ui/button'
import { checkEmailRegistered } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'

const TestEmailButton = ({ email }: { email: string }) => {
  const [currentEmail, setCurrentEmail] = useState(email)
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')

  useEffect(() => {
    setCurrentEmail(email)
  }, [email])

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

    sendEmail({
      from: 'Admin <eyadlaza@bruerforalle.no>',
      to: [currentEmail],
      subject: 'Test Email',
      react: EmailTemplate({ firstName: 'Eyad' }) as React.ReactElement,
    })

    setCodeSent(true)
    toast({
      title: 'Success',
      description: 'Email sent successfully',
      variant: 'default',
    })
  }

  const handleCodeSubmit = () => {
    // Handle code submission logic here
    toast({
      title: 'Success',
      description: `Code ${code} submitted successfully`,
      variant: 'default',
    })
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
