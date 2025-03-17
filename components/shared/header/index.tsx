import Image from 'next/image'
import Link from 'next/link'
import { getAllCategories } from '@/lib/actions/product.actions'
import Menu from './menu'
import Search from './search'
import data from '@/lib/data'
import Sidebar from './sidebar'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVerticalIcon } from 'lucide-react'

export default async function Header() {
  const categories = await getAllCategories()
  const { site } = await getSetting()
  const t = await getTranslations()
  return (
    <header className='bg-header text-white shadow-md w-full'>
      <div className='w-full px-3 sm:px-6 lg:px-8'>
        {/* Main header row */}
        <div className='flex items-center justify-between py-3'>
          <div className='flex items-center'>
            {/* Logo and site name */}
            <Link
              href='/'
              className='flex items-center header-button font-bold text-lg xs:text-xl sm:text-2xl transition-colors duration-200'
            >
              <Image
                src={site.logo}
                width={36}
                height={36}
                alt={`${site.name} logo`}
                className='mr-2'
                priority
              />
              <span className='hidden xs:inline'>{site.name}</span>
            </Link>
          </div>

          {/* Search bar - visible on larger screens */}
          <div className='hidden nav:block flex-1 max-w-2xl mx-6'>
            <Search />
          </div>

          {/* Menu with user controls */}
          <Menu />
        </div>

        {/* Mobile/tablet search - hidden on larger screens */}
        <div className='nav:hidden block py-2'>
          <Search />
        </div>

        {/* Navigation bar */}
        <div className='flex items-center justify-between py-2 bg-header-darker border-t border-white/10'>
          {/* Sidebar trigger (categories) */}
          <div className='flex-shrink-0'>
            <Sidebar categories={categories} />
          </div>

          {/* Desktop nav links */}
          <div className='hidden nav:flex items-center flex-wrap gap-x-6 overflow-hidden px-4'>
            {data.headerMenus.map((menu) => (
              <Link
                href={menu.href}
                key={menu.href}
                className='text-sm font-medium whitespace-nowrap py-2 border-b-2 border-transparent hover:border-primary hover:text-primary transition-all duration-200'
              >
                {t('Header.' + menu.name)}
              </Link>
            ))}
          </div>

          {/* Mobile/tablet menu dropdown */}
          <div className='nav:hidden flex items-center'>
            <DropdownMenu>
              <DropdownMenuTrigger className='header-button !p-1.5 rounded-md'>
                <EllipsisVerticalIcon className='h-5 w-5' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-[180px] z-50'>
                {data.headerMenus.map((menu) => (
                  <DropdownMenuItem
                    key={menu.href}
                    asChild
                    className='cursor-pointer'
                  >
                    <Link href={menu.href} className='w-full'>
                      {t('Header.' + menu.name)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
