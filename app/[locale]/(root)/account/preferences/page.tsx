import { Metadata } from 'next'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getTranslations } from 'next-intl/server'

import CurrencySwitcher from '@/components/shared/header/currency-switcher'
import LanguageSwitcher from '@/components/shared/header/language-switcher'
import ThemeSwitcher from '@/components/shared/header/theme-switcher'
import { Currency, Languages, Moon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Preferences',
}

export default async function PreferencesPage() {
  const t = await getTranslations()

  return (
    <div className='mb-24'>
      <div className='flex gap-2 text-sm text-muted-foreground'>
        <Link href='/account' className='hover:text-foreground'>
          {t('Account.Your Account')}
        </Link>
        <span>›</span>
        <span className='font-medium'>
          {t('Account.Preferences') || 'Preferences'}
        </span>
      </div>

      <header className='mt-4 mb-6'>
        <h1 className='text-3xl font-extrabold'>
          {t('Account.Preferences') || 'Preferences'}
        </h1>
        <p className='text-muted-foreground mt-2 max-w-2xl'>
          {t('Account.ManagePreferences') ||
            'Manage your language, currency and color theme preferences'}
        </p>
      </header>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card className='hover:shadow-lg transition'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <Currency className='w-6 h-6 text-primary' />
              <div>
                <CardTitle>{t('Account.Currency') || 'Currency'}</CardTitle>
                <CardDescription className='text-sm'>
                  {t('Account.CurrencyDescription') ||
                    'Choose your preferred display currency.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CurrencySwitcher />
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <Languages className='w-6 h-6 text-primary' />
              <div>
                <CardTitle>{t('Account.Language') || 'Language'}</CardTitle>
                <CardDescription className='text-sm'>
                  {t('Account.LanguageDescription') ||
                    'Select your preferred language for the interface.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <Moon className='w-6 h-6 text-primary' />
              <div>
                <CardTitle>{t('Account.Theme') || 'Theme'}</CardTitle>
                <CardDescription className='text-sm'>
                  {t('Account.ThemeDescription') ||
                    'Switch between light/dark and pick a color accent.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ThemeSwitcher />
          </CardContent>
        </Card>
      </div>

      <Separator className='my-8' />
    </div>
  )
}
