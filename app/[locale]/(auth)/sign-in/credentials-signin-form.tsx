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
                <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {t('Email')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('EnterEmail')}
                    {...field}
                    className='h-12 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  />
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
                <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {t('Password')}
                </FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('EnterPassword')}
                    {...field}
                    className='h-12 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='space-y-4'>
            <Button
              type='submit'
              className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'
            >
              {t('SignIn')}
            </Button>

            <div className='text-center'>
              <span className='text-sm text-gray-600 dark:text-gray-400 mr-1'>
                {t('ForgotPassword')}
              </span>
              <button
                type='button'
                onClick={() => router.push('/forgot-password')}
                className='text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200'
              >
                {t('ResetItHere')}
              </button>
            </div>

            <div className='text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed'>
              {t('BySigningIn', { siteName: site.name })}{' '}
              <button
                type='button'
                onClick={() => router.push('/page/conditions-of-use')}
                className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200'
              >
                {t('ConditionsOfUse')}
              </button>{' '}
              {t('and')}{' '}
              <button
                type='button'
                onClick={() => router.push('/page/privacy-policy')}
                className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200'
              >
                {t('PrivacyNotice')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
