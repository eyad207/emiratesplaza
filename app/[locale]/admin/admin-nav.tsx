'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  BarChart3,
  Package,
  Tag,
  Percent,
  ShoppingCart,
  Users,
  FileText,
  Settings,
} from 'lucide-react'

const links = [
  {
    title: 'Overview',
    href: '/admin/overview',
    icon: BarChart3,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Tags',
    href: '/admin/tags',
    icon: Tag,
  },
  {
    title: 'Discounts',
    href: '/admin/discounts',
    icon: Percent,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Pages',
    href: '/admin/web-pages',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminNav({ ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname() || ''
  const t = useTranslations('Admin') // Ensure 'Admin' is the base key

  return (
    <nav
      className={cn(
        'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm',
        props.className
      )}
      {...props}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-start gap-1 overflow-x-auto py-3 scrollbar-hide'>
          {links.map((item) => {
            const Icon = item.icon
            const isActive = pathname.includes(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  'hover:scale-[1.02] hover:shadow-sm',
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md shadow-orange-200/50 dark:shadow-orange-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-orange-500 dark:group-hover:text-orange-400'
                  )}
                />
                <span className='hidden sm:inline'>{t(item.title)}</span>
                {isActive && (
                  <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/20 to-yellow-500/20 animate-pulse' />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
