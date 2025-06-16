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
  const token = searchParams ? searchParams.get('token') : null

  const form = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: {
    password: string
    confirmPassword: string
  }) => {
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: data.password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const result = await response.json()
      toast({
        title: 'Success',
        description: result.message,
        variant: 'default',
      })
      router.push('/sign-in')
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='flex flex-col items-center justify-center w-auto bg-gray-100 dark:bg-gray-900'>
      <div className='w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded shadow-md'>
        <h1 className='text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100'>
          Reset Password
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='space-y-6'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel className='text-gray-700 dark:text-gray-300'>
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Enter new password'
                        {...field}
                        className='dark:bg-gray-700 dark:text-gray-100'
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
                    <FormLabel className='text-gray-700 dark:text-gray-300'>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Confirm new password'
                        {...field}
                        className='dark:bg-gray-700 dark:text-gray-100'
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
      </div>
    </div>
  )
}
