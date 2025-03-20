import { auth } from '@/auth'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOut } from '@/lib/actions/user.actions'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function UserButton() {
  const t = await getTranslations()
  const session = await auth()
  return (
    <div className='flex gap-2 items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger className='header-button hidden nav:flex' asChild>
          <div className='flex items-center'>
            <div className='flex flex-col text-xs text-left'>
              <span>
                {t('Header.Hello')},{' '}
                {session ? session.user.name : t('Header.sign in')}
              </span>
              <span className='font-bold'>{t('Header.Account & Orders')}</span>
            </div>
            <ChevronDownIcon className='transition-transform duration-200' />
          </div>
        </DropdownMenuTrigger>
        {session ? (
          <DropdownMenuContent
            className='w-56 bg-white text-black shadow-lg rounded-md animate-fadeIn'
            align='end'
            forceMount
          >
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {session.user.name}
                </p>
                <p className='text-xs leading-none text-muted-foreground'>
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <Link className='w-full' href='/account'>
                <DropdownMenuItem className='hover:bg-primary/10 transition-colors'>
                  {t('Header.Your account')}
                </DropdownMenuItem>
              </Link>
              <Link className='w-full' href='/account/orders'>
                <DropdownMenuItem className='hover:bg-primary/10 transition-colors'>
                  {t('Header.Your orders')}
                </DropdownMenuItem>
              </Link>

              {session.user.role === 'Admin' && (
                <Link className='w-full' href='/admin/overview'>
                  <DropdownMenuItem className='hover:bg-primary/10 transition-colors'>
                    {t('Header.Admin')}
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <DropdownMenuItem className='p-0 mb-1'>
              <form action={SignOut} className='w-full'>
                <Button
                  className='w-full py-4 px-2 h-4 justify-start'
                  variant='ghost'
                >
                  {t('Header.Sign out')}
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent
            className='w-56 bg-white text-black shadow-lg rounded-md animate-fadeIn'
            align='end'
            forceMount
          >
            <DropdownMenuGroup>
              <DropdownMenuItem className='hover:bg-primary/10 transition-colors'>
                <Link
                  className={cn(buttonVariants(), 'w-full')}
                  href='/sign-in'
                >
                  {t('Header.Sign in')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className='font-normal'>
                {t('Header.New Customer')}?{' '}
                <Link href='/sign-up'>{t('Header.Sign up')}</Link>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {/* Mobile Links */}
      <div className='nav:hidden flex flex-col text-xs space-y-2 mt-4'>
        <h3 className='text-sm font-semibold uppercase tracking-wider text-white/70'>
          {t('Header.Your Account')}
        </h3>
        <Link
          href='/account'
          className='py-2 px-4 bg-white/10 rounded-md hover:bg-primary/10 transition-colors'
        >
          {t('Header.Your account')}
        </Link>
        <Link
          href='/account/orders'
          className='py-2 px-4 bg-white/10 rounded-md hover:bg-primary/10 transition-colors'
        >
          {t('Header.Your orders')}
        </Link>
        {session?.user.role === 'Admin' && (
          <Link
            href='/admin/overview'
            className='py-2 px-4 bg-white/10 rounded-md hover:bg-primary/10 transition-colors'
          >
            {t('Header.Admin')}
          </Link>
        )}
        {session ? (
          <form action={SignOut} className='w-full'>
            <Button
              className='w-full py-2 px-4 bg-white/10 rounded-md hover:bg-primary/10 transition-colors'
              variant='ghost'
            >
              {t('Header.Sign out')}
            </Button>
          </form>
        ) : (
          <Link
            href='/sign-in'
            className='py-2 px-4 bg-white/10 rounded-md hover:bg-primary/10 transition-colors'
          >
            {t('Header.Sign in')}
          </Link>
        )}
      </div>
    </div>
  )
}
