import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { Card, CardContent } from '@/components/ui/card'
import {
  PackageCheckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  HeartIcon,
  MapPinIcon,
  SettingsIcon,
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { auth } from '@/auth'

const PAGE_TITLE = 'Your Account'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default async function AccountPage() {
  const session = await auth()
  const userName = session?.user?.name || 'there'

  const accountCards = [
    {
      title: 'Orders',
      description: 'Track, return, or buy things again',
      icon: <PackageCheckIcon className='w-8 h-8 text-primary' />,
      href: '/account/orders',
    },
    {
      title: 'Login & security',
      description: 'Edit login, name, and mobile number',
      icon: <ShieldCheckIcon className='w-8 h-8 text-primary' />,
      href: '/account/manage',
    },
    {
      title: 'Payment options',
      description: 'Manage payment methods and settings',
      icon: <CreditCardIcon className='w-8 h-8 text-primary' />,
      href: '/account/payments',
    },
    {
      title: 'Addresses',
      description: 'Edit addresses for orders and gifts',
      icon: <MapPinIcon className='w-8 h-8 text-primary' />,
      href: '/account/addresses',
    },
    {
      title: 'Wish Lists',
      description: 'Track your favorite products',
      icon: <HeartIcon className='w-8 h-8 text-primary' />,
      href: '/account/wishlist',
    },
    {
      title: 'Account Settings',
      description: 'Manage preferences and notifications',
      icon: <SettingsIcon className='w-8 h-8 text-primary' />,
      href: '/account/settings',
    },
  ]

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
          Hello, {userName}
        </h1>
        <p className='text-muted-foreground'>
          Welcome to your account dashboard
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6'>
        {accountCards.map((card, index) => (
          <Link href={card.href} key={index} className='block h-full'>
            <Card className='h-full hover:shadow-md transition-all duration-300 hover:border-primary/50 bg-card'>
              <CardContent className='p-5 md:p-6 flex gap-4 h-full'>
                <div className='shrink-0'>{card.icon}</div>
                <div className='space-y-1.5'>
                  <h2 className='text-lg font-semibold'>{card.title}</h2>
                  <p className='text-sm text-muted-foreground'>
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className='space-y-4'>
        <div>
          <h2 className='text-xl font-bold'>Recent Orders</h2>
          <p className='text-muted-foreground text-sm'>
            Quick access to your latest purchases
          </p>
        </div>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center py-6'>
              <p>You have no recent orders</p>
              <Link
                href='/search'
                className='text-primary hover:underline mt-2 block'
              >
                Continue shopping
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className='my-8' />

      <div>
        <BrowsingHistoryList />
      </div>
    </div>
  )
}
