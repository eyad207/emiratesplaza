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
import { Separator } from '@/components/ui/separator'
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
                <FormLabel>{t('Name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('EnterName')} {...field} />
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
          <FormField
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('ConfirmPassword')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('EnterConfirmPassword')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button type='submit'>{t('SignUp')}</Button>
          </div>
          <div className='text-sm'>
            {t('ByCreatingAccount', { siteName: site.name })}{' '}
            <Link href='/page/conditions-of-use'>{t('ConditionsOfUse')}</Link>{' '}
            {t('and')}{' '}
            <Link href='/page/privacy-policy'>{t('PrivacyNotice')}</Link>.
          </div>
          <Separator className='mb-4' />
          <div className='text-sm'>
            {t('AlreadyHaveAccount')}{' '}
            <Link className='link' href={`/sign-in?callbackUrl=${callbackUrl}`}>
              {t('SignIn')}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}
