import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Menu from '@/components/shared/header/menu'
import { AdminNav } from './admin-nav'
import { getSetting } from '@/lib/actions/setting.actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = await getSetting()
  return (
    <>
      <div className='flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950'>
        {/* Premium Header */}
        <header className='sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20'>
          <div className='flex h-16 items-center px-4 lg:px-6'>
            {/* Logo Section */}
            <Link href='/' className='group flex items-center gap-3'>
              <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 p-2 shadow-lg transition-transform duration-200 group-hover:scale-105'>
                <Image
                  src={site.logo}
                  width={32}
                  height={32}
                  alt={`${site.name} logo`}
                  className='relative z-10'
                />
                <div className='absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
              </div>
              <div className='hidden sm:block'>
                <h1 className='text-lg font-bold text-slate-900 dark:text-white'>
                  Admin Dashboard
                </h1>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  {site.name} Management
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <AdminNav className='mx-8 hidden lg:flex' />

            {/* Header Actions */}
            <div className='ml-auto flex items-center space-x-4'>
              <Menu forAdmin />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className='lg:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50'>
            <div className='px-4 py-2 overflow-x-auto'>
              <AdminNav className='flex lg:hidden' />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className='flex-1 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'>
          {children}
        </main>
      </div>
    </>
  )
}
