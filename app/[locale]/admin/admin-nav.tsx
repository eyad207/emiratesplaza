'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const links = [
  {
    title: 'Overview',
    href: '/admin/overview',
  },
  {
    title: 'Products',
    href: '/admin/products',
  },
  {
    title: 'Orders',
    href: '/admin/orders',
  },
  {
    title: 'Users',
    href: '/admin/users',
  },
  {
    title: 'Pages',
    href: '/admin/web-pages',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
  },
  {
    title: 'Tags',
    href: '/admin/tags',
  },
]

export function AdminNav({ ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname() || ''
  const t = useTranslations('Admin')
  return (
    <nav
      className={cn(
        'flex items-center justify-around flex-wrap gap-2 md:gap-4',
        props.className
      )}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'px-2.5 py-2 rounded-md text-xs font-medium transition-colors duration-200',
            pathname.includes(item.href)
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {t(item.title)}
        </Link>
      ))}
    </nav>
  )
}
