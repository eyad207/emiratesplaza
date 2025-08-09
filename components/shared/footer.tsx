'use client'
import { memo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { i18n } from '@/i18n-config'
import useSettingStore from '@/hooks/use-setting-store'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

// Lazy-load ChevronUp to reduce initial JS size
const ChevronUp = dynamic(
  () => import('lucide-react').then((m) => m.ChevronUp),
  { ssr: false }
)

function FooterComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const { locales } = i18n
  const locale = useLocale()
  const t = useTranslations()

  const handleLocaleChange = useCallback(
    (value: string) => {
      router.push(pathname, { locale: value })
    },
    [pathname, router]
  )

  const handleCurrencyChange = useCallback(
    (value: string) => {
      setCurrency(value)
      window.scrollTo({ top: 0 })
    },
    [setCurrency]
  )

  return (
    <footer className='bg-footer text-white underline-link mt-10'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='bg-footer-darker w-full rounded-none'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          {t('Footer.Back to top')}
        </Button>

        <div className='border-t border-footer-darker'>
          <div className='max-w-7xl mx-auto py-8 px-4 flex flex-col items-center space-y-4'>
            <div className='flex items-center space-x-4 flex-wrap md:flex-nowrap'>
              <Image
                src='/icons/logo.svg'
                alt={`${site.name} logo`}
                width={56}
                height={56}
                priority
              />

              {/* Locale Selector */}
              <Select value={locale} onValueChange={handleLocaleChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Language' />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((lang, index) => (
                    <SelectItem key={index} value={lang.code}>
                      <span className='text-lg'>{lang.icon}</span> {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Currency Selector */}
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Footer.Select a currency')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies
                    ?.filter((x) => x.code)
                    .map((c, index) => (
                      <SelectItem key={index} value={c.code}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className='p-4'>
        <div className='flex justify-center gap-3 text-sm'>
          <Link href='/page/conditions-of-use'>
            {t('Footer.Conditions of Use')}
          </Link>
          <Link href='/page/privacy-policy'>{t('Footer.Privacy Notice')}</Link>
          <Link href='/page/help'>{t('Footer.Help')}</Link>
        </div>
        <div className='flex justify-center text-sm'>© {site.copyright}</div>
        <div className='mt-8 flex justify-center text-sm text-gray-400'>
          {site.address} | {site.phone}
        </div>
      </div>
    </footer>
  )
}

export default memo(FooterComponent)
