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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='header-button h-[41px]'>
        <div className='flex items-center gap-1'>
          <span className='text-xl'>
            {locales.find((l) => l.code === locale)?.icon} {/* Display flag */}
          </span>
          <span className='hidden sm:inline'>
            {' '}
            {/* Ensure locale code is visible on PC */}
            {locale.toUpperCase().slice(0, 2)}
          </span>
          <ChevronDownIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale}>
          {locales.map((c, index) => (
            <DropdownMenuRadioItem key={`${c.code}-${index}`} value={c.code}>
              <Link
                className='w-full flex items-center gap-1'
                href={pathname}
                locale={c.code}
              >
                <span className='text-lg'>{c.icon}</span> {c.name}{' '}
                {/* Display flag and name */}
              </Link>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
