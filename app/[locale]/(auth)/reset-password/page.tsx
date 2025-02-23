'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import { ResetPasswordSchema } from '@/lib/validator'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams ? searchParams.get('email') : null

  const form = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: {
    password: string
    confirmPassword: string
  }) => {
    try {
      console.log('Form data:', data) // Debugging line
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: data.password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API response error:', errorText) // Debugging line
        throw new Error(errorText)
      }

      const result = await response.json()
      console.log('API response:', result) // Debugging line

      toast({
        title: 'Success',
        description: 'Password reset successfully',
        variant: 'default',
      })
      router.push('/sign-in')
    } catch (error) {
      console.error('Error:', error) // Debugging line
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h1 className='text-2xl font-bold bg-orange-400 py-2 text-center rounded-xl mb-5'>
            Reset Password
          </h1>
        </div>
        <div className='space-y-6'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter new password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Confirm new password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full'>
            Reset Password
          </Button>
        </div>
      </form>
    </Form>
  )
}
