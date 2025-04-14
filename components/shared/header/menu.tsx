import { Menu as MenuIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import CartButton from './cart-button'
import UserButton from './user-button'
import ThemeSwitcher from './theme-switcher'
import LanguageSwitcher from './language-switcher'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const Menu = ({ forAdmin = false }: { forAdmin?: boolean }) => {
  const t = useTranslations()
  return (
    <div className='flex items-center'>
      {/* Desktop menu - visible above 1000px */}
      <nav className='hidden nav:flex items-center gap-3 lg:gap-4'>
        <div className='flex items-center gap-2'>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        <div className='flex items-center'>
          <UserButton />
          {!forAdmin && <CartButton />}
        </div>
      </nav>

      {/* Mobile menu - visible below 1000px */}
      <nav className='nav:hidden'>
        <Sheet>
          <SheetTrigger className='header-button !p-1.5 rounded-md hover:bg-white/10 transition-colors'>
            <MenuIcon className='h-5 w-5' />
          </SheetTrigger>

          <SheetContent
            className='bg-header text-white flex flex-col py-6'
            side='right'
          >
            <SheetHeader className='w-full text-left'>
              <SheetTitle className='text-white text-xl'>
                {t('Header.Menu')}
              </SheetTitle>
            </SheetHeader>

            <div className='mt-6 flex flex-col gap-5 flex-1'>
              {/* User Account Section */}
              <div className='space-y-4'>
                <div className='space-y-3'>
                  <UserButton />
                  {!forAdmin && <CartButton />}
                </div>
              </div>

              {/* Preferences Section */}
              <div className='space-y-4 pt-4 border-t border-white/10'>
                <h3 className='text-sm font-semibold uppercase tracking-wider text-white/70'>
                  {t('Header.Preferences')}
                </h3>
                <div className='space-y-3'>
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Help & Support */}
              <div className='space-y-4 pt-4 border-t border-white/10 mt-auto'>
                <h3 className='text-sm font-semibold uppercase tracking-wider text-white/70'>
                  {t('Header.Help & Support')}
                </h3>
                <div className='space-y-2'>
                  <SheetClose asChild>
                    <Link
                      href='/page/customer-service'
                      className='flex py-2 text-sm hover:text-primary transition-colors'
                    >
                      {t('Header.Customer Service')}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href='/page/about'
                      className='flex py-2 text-sm hover:text-primary transition-colors'
                    >
                      {t('Header.About Us')}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href='/page/contact'
                      className='flex py-2 text-sm hover:text-primary transition-colors'
                    >
                      {t('Header.Contact Us')}
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}

export default Menu
