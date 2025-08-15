'use client'
import { useSearchParams, useRouter } from 'next/navigation'
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
import { IUserSignUp } from '@/types'
import { sendVerificationCode } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignUpSchema } from '@/lib/validator'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const signUpDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        name: 'john doe',
        email: 'john@me.com',
        password: '123456',
        confirmPassword: '123456',
      }
    : {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      }

export default function SignUpForm() {
  const {
    setting: { site },
  } = useSettingStore()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  const router = useRouter()
  const t = useTranslations('SignUp')

  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: IUserSignUp) => {
    try {
      const res = await sendVerificationCode(data.email, data.name)
      if (!res.success) {
        toast({
          title: t('Error'),
          description: res.error,
          variant: 'destructive',
        })
        return
      }
      router.push(
        `/confirm-email?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(data.name)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
      )
    } catch {
      toast({
        title: t('Error'),
        description: t('FailedToSendVerificationCode'),
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
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {t('Name')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('EnterName')}
                    {...field}
                    className='h-12 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    className='h-12 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200'
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
                    className='h-12 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {t('ConfirmPassword')}
                </FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('EnterConfirmPassword')}
                    {...field}
                    className='h-12 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='space-y-4'>
            <Button
              type='submit'
              className='w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'
            >
              {t('SignUp')}
            </Button>

            <div className='text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed'>
              {t('ByCreatingAccount', { siteName: site.name })}{' '}
              <Link
                href='/page/conditions-of-use'
                className='text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:underline transition-colors duration-200'
              >
                {t('ConditionsOfUse')}
              </Link>{' '}
              {t('and')}{' '}
              <Link
                href='/page/privacy-policy'
                className='text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:underline transition-colors duration-200'
              >
                {t('PrivacyNotice')}
              </Link>
              .
            </div>
          </div>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-gray-200 dark:border-gray-700' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'>
                Already have an account?
              </span>
            </div>
          </div>

          <div className='text-center'>
            <Link
              className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200'
              href={`/sign-in?callbackUrl=${callbackUrl}`}
            >
              {t('SignIn')}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}
