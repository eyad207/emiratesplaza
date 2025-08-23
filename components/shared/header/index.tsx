import Link from 'next/link'
import Menu from './menu'
import HeaderWrapper from './header-wrapper'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVerticalIcon } from 'lucide-react'

export default async function Header() {
  return (
    <HeaderWrapper>
      <header className='bg-header text-white w-full'>
        {/* Main header row */}
        <div className='w-full px-3 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-2 sm:py-3'>
            {/* Left: Logo */}
            <div className='flex items-center shrink-0'>
              <Link
                href='/'
                className='flex items-center gap-2 rounded-md hover:bg-white/10 transition-all duration-200 px-1.5 py-1'
              >
                <span className='hidden xs:inline font-bold text-lg xs:text-xl'>
                  EmiratesPlaza
                </span>
              </Link>
            </div>

            {/* Center: Search */}
            <div className='flex-1 px-2 max-w-xl mx-auto'></div>

            {/* Desktop Menu */}
            <div className='flex-shrink-0 hidden nav:flex'>
              <Menu />
            </div>

            {/* Mobile Menu */}
            <div className='nav:hidden flex items-center'>
              <Menu />
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className='w-full bg-header-darker border-t border-white/10'>
          <div className='flex items-center justify-between py-2 px-3 sm:px-6 lg:px-8 max-w-[2000px] mx-auto'>
            {/* Sidebar */}
            <div className='flex-shrink-0'></div>

            {/* Desktop Nav Links */}
            <div className='hidden nav:flex items-center flex-wrap gap-x-6 overflow-hidden px-4'>
              <Link
                href='/page/customer-service'
                className='text-sm font-medium whitespace-nowrap py-2 border-b-2 border-transparent hover:border-primary hover:text-primary transition-all duration-200'
              >
                {'Header.Customer Service'}
              </Link>
              <Link
                href='/page/about-us'
                className='text-sm font-medium whitespace-nowrap py-2 border-b-2 border-transparent hover:border-primary hover:text-primary transition-all duration-200'
              >
                {'Header.About Us'}
              </Link>
              <Link
                href='/page/contact-us'
                className='text-sm font-medium whitespace-nowrap py-2 border-b-2 border-transparent hover:border-primary hover:text-primary transition-all duration-200'
              >
                {'Header.Contact Us'}
              </Link>
            </div>

            {/* Mobile Dropdown */}
            <div className='nav:hidden flex items-center'>
              <DropdownMenu>
                <DropdownMenuTrigger className='rounded-md hover:bg-white/10 transition-colors p-1.5'>
                  <EllipsisVerticalIcon className='h-5 w-5' />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='min-w-[200px] z-50 rounded-md'
                >
                  <DropdownMenuItem
                    asChild
                    className='cursor-pointer focus:bg-primary/10'
                  >
                    <Link
                      href='/page/customer-service'
                      className='w-full py-1.5'
                    >
                      {'Header.Customer Service'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className='cursor-pointer focus:bg-primary/10'
                  >
                    <Link href='/page/about-us' className='w-full py-1.5'>
                      {'Header.About Us'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className='cursor-pointer focus:bg-primary/10'
                  >
                    <Link href='/page/contact-us' className='w-full py-1.5'>
                      {'Header.Contact Us'}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </HeaderWrapper>
  )
}
