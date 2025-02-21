'use client'
import React, { useEffect, useState } from 'react'
import { sendEmail } from '@/lib/actions/emails/sendEmail'
import { Button } from '@/components/ui/button'
import { checkEmailRegistered } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { EmailTemplate } from '@/email-templates/test-email'

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

    await sendEmail({
      from: 'EmiratesPlaza <eyadlaza@bruerforalle.no>',
      to: [currentEmail],
      subject: 'Your Verification Code',
      react: <EmailTemplate firstName='Eyad' code={code} />,
    })

    setCodeSent(true)
    toast({
      title: 'Success',
      description: 'Email sent successfully',
      variant: 'default',
    })
  }

  const handleCodeSubmit = () => {
    if (code === generatedCode) {
      router.push('/reset-password')
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
