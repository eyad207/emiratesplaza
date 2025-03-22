'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { UserEmailSchema } from '@/lib/validator'
import { sendResetPasswordEmail } from '@/lib/actions/user.actions'
import { useRouter } from 'next/navigation'
import EmailButton from '@/components/EmailButton'
////////

export default function ForgotPasswordPage() {
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(UserEmailSchema),
    defaultValues: { email: '' },
  })

  const { control, handleSubmit, watch } = form
  const email = watch('email')

  const onSubmit = async (data: { email: string }) => {
    try {
      const res = await sendResetPasswordEmail(data.email)
      if (!res.success) {
        toast({
          title: 'Error',
          description: res.message,
          variant: 'destructive',
        })
        return
      }
      toast({
        title: 'Success',
        description: 'Password reset email sent successfully',
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h1 className='text-2xl font-bold bg-orange-400 py-2 text-center rounded-xl mb-5'>
            Forgot Password
          </h1>
        </div>
        <div className='space-y-6'>
          <FormField
            control={control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='Enter email address' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <EmailButton email={email} />
          </div>
          <div></div>
          <div className='text-sm'>
            <button
              type='button'
              onClick={() => router.push('/sign-in')}
              className='text-blue-600 hover:underline'
            >
              Sign-in?
            </button>
          </div>
        </div>
      </form>
    </Form>
  )
}
