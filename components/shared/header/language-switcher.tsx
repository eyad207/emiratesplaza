'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { i18n } from '@/i18n-config'
import { ChevronDownIcon } from 'lucide-react'

export default function LanguageSwitcher() {
  const { locales } = i18n
  const locale = useLocale()
  const pathname = usePathname()

  const currentLocale = locales.find((l) => l.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='header-button h-[41px]'>
        <div className='flex items-center gap-2'>
          <span className='text-xl'>{currentLocale?.icon}</span>
          <span className='hidden sm:inline font-medium'>
            {currentLocale?.name}
          </span>
          <span className='sm:hidden font-medium'>
            {locale.toUpperCase().slice(0, 2)}
          </span>
          <ChevronDownIcon className='h-4 w-4' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale}>
          {locales.map((c, index) => (
            <DropdownMenuRadioItem key={`${c.code}-${index}`} value={c.code}>
              <Link
                className='w-full flex items-center gap-3'
                href={pathname}
                locale={c.code}
              >
                <span className='text-lg'>{c.icon}</span>
                <span className='flex-1'>{c.name}</span>
                <span className='text-xs text-muted-foreground'>
                  {c.code.toUpperCase()}
                </span>
              </Link>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
