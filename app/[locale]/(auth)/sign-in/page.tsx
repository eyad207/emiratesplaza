import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import SeparatorWithOr from '@/components/shared/separator-or'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import CredentialsSignInForm from './credentials-signin-form'
import { GoogleSignInForm } from './google-signin-form'
import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default async function SignInPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl = '/' } = await searchParamsPromise

  const session = await auth()
  if (session) {
    redirect(callbackUrl)
  }

  const [t, { site }] = await Promise.all([
    getTranslations('SignIn'),
    getSetting(),
  ])

  return (
    <div className='w-full max-w-md mx-auto'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>{t('SignIn')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CredentialsSignInForm />
          <div className='my-6'>
            <SeparatorWithOr />
          </div>
          <GoogleSignInForm />
        </CardContent>
      </Card>

      <div className='my-6'>
        <SeparatorWithOr>
          {t('NewToSite', { siteName: site.name })}
        </SeparatorWithOr>
      </div>

      <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
        <Button className='w-full' variant='outline'>
          {t('CreateAccount', { siteName: site.name })}
        </Button>
      </Link>
    </div>
  )
}
