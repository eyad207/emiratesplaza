import { getSetting } from '@/lib/actions/setting.actions'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = await getSetting()
  return (
    <div className='min-h-screen flex flex-col relative overflow-hidden'>
      {/* Animated Background */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23e2e8f0" fill-opacity="0.3"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] dark:bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23374151" fill-opacity="0.4"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]'></div>

        {/* Floating Elements */}
        <div className='absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob'></div>
        <div className='absolute top-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000'></div>
        <div className='absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000'></div>
      </div>

      {/* Content Container */}
      <div className='relative z-10 flex flex-col items-center min-h-screen highlight-link'>
        {/* Header with Logo */}
        <header className='mt-12 mb-8'>
          <Link href='/' className='group'>
            <div className='relative p-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl'>
              <Image
                src={site.logo}
                alt='logo'
                width={80}
                height={80}
                priority
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
                className='drop-shadow-lg'
              />
            </div>
          </Link>
        </header>

        {/* Main Content Area */}
        <main className='w-full max-w-md px-6 mb-8'>
          <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 transition-all duration-300 hover:shadow-3xl'>
            {children}
          </div>
        </main>

        {/* Spacer to push footer down */}
        <div className='flex-1'></div>

        {/* Footer */}
        <footer className='w-full bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 mt-auto'>
          <div className='max-w-6xl mx-auto px-6 py-12'>
            {/* Links Section */}
            <div className='flex flex-wrap justify-center gap-8 mb-8'>
              <Link
                href='/page/conditions-of-use'
                className='text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:underline decoration-2 underline-offset-4'
              >
                Conditions of Use
              </Link>
              <Link
                href='/page/privacy-policy'
                className='text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:underline decoration-2 underline-offset-4'
              >
                Privacy Notice
              </Link>
              <Link
                href='/page/help'
                className='text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:underline decoration-2 underline-offset-4'
              >
                Help
              </Link>
            </div>

            {/* Copyright */}
            <div className='text-center'>
              <p className='text-gray-400 text-sm'>{site.copyright}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
