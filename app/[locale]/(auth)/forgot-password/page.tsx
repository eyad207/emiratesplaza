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
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const t = useTranslations('ForgotPassword')

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
          title: t('Error'),
          description: res.message,
          variant: 'destructive',
        })
        return
      }
      toast({
        title: t('Success'),
        description: t('PasswordResetEmailSent'),
        variant: 'default',
      })
    } catch {
      toast({
        title: t('Error'),
        description: t('FailedToSendEmail'),
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h1 className='text-2xl font-bold bg-orange-400 py-2 text-center rounded-xl mb-5'>
            {t('ForgotPassword')}
          </h1>
        </div>
        <div className='space-y-6'>
          <FormField
            control={control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('EnterEmail')} {...field} />
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
              {t('SignIn')}
            </button>
          </div>
        </div>
      </form>
    </Form>
  )
}
