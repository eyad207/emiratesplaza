'use client'
import { redirect, useSearchParams, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useSettingStore from '@/hooks/use-setting-store'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { IUserSignIn } from '@/types'
import { signInWithCredentials } from '@/lib/actions/user.actions'

import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignInSchema } from '@/lib/validator'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { useTranslations } from 'next-intl'

export default function CredentialsSignInForm() {
  const {
    setting: { site },
  } = useSettingStore()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  const router = useRouter()
  const t = useTranslations('SignIn')

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: IUserSignIn) => {
    try {
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      redirect(callbackUrl)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
      toast({
        title: t('Error'),
        description: t('InvalidEmailOrPassword'),
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
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

          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Password')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('EnterPassword')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button type='submit'>{t('SignIn')}</Button>
          </div>
          <div className='text-sm'>
            <span className='mr-1'>{t('ForgotPassword')}</span>
            <button
              type='button'
              onClick={() => router.push('/forgot-password')}
              className='text-blue-600 hover:underline'
            >
              {t('ResetItHere')}
            </button>
          </div>
          <div className='text-sm'>
            {t('BySigningIn', { siteName: site.name })}{' '}
            <button
              type='button'
              onClick={() => router.push('/page/conditions-of-use')}
              className='text-blue-600 hover:underline'
            >
              {t('ConditionsOfUse')}
            </button>{' '}
            {t('and')}{' '}
            <button
              type='button'
              onClick={() => router.push('/page/privacy-policy')}
              className='text-blue-600 hover:underline'
            >
              {t('PrivacyNotice')}
            </button>
          </div>
        </div>
      </form>
    </Form>
  )
}
