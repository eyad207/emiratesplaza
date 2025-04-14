import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'

import Pagination from '@/components/shared/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getMyOrders } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.model'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatId } from '@/lib/utils'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const orders = await getMyOrders({
    page,
  })
  const t = await getTranslations('Orders') // Updated namespace for translations
  const PAGE_TITLE = t('Your Orders') // Use translation for "Your Orders"

  // Function to get status badge style
  const getStatusBadge = (
    isPaid: boolean,
    isDelivered: boolean,
    isShipped: boolean
  ) => {
    if (isDelivered) {
      return {
        text: t('Delivered'), // Use translation for "Delivered"
        variant:
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      }
    }
    if (isShipped) {
      return {
        text: 'Shipped',
        variant:
          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      }
    }
    if (isPaid) {
      return {
        text: t('Processing'), // Use translation for "Processing"
        variant:
          'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      }
    }
    return {
      text: 'Pending',
      variant:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    }
  }

  return (
    <div>
      {/* Breadcrumb navigation */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
        <Link
          href='/account'
          className='hover:text-foreground transition-colors'
        >
          {t('Header.Your Account')}
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='font-medium text-foreground'>{PAGE_TITLE}</span>
      </div>

      <h1 className='text-2xl sm:text-3xl font-bold mb-6'>{PAGE_TITLE}</h1>

      {orders.data.length === 0 ? (
        <Card className='p-8 text-center'>
          <div className='mb-4 text-muted-foreground'>
            You have no orders yet.
          </div>
          <Link href='/search' className={buttonVariants()}>
            Start Shopping
          </Link>
        </Card>
      ) : (
        <>
          {/* Desktop table view */}
          <div className='hidden md:block overflow-hidden rounded-lg border shadow-sm'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead className='w-[120px]'>{t('Order ID')}</TableHead>
                  <TableHead>{t('Date')}</TableHead>
                  <TableHead>{t('Total')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead className='text-right'>{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.map((order: IOrder) => (
                  <TableRow key={order._id} className='hover:bg-muted/40'>
                    <TableCell className='font-medium'>
                      #{formatId(order._id)}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(order.createdAt!).dateOnly}
                    </TableCell>
                    <TableCell className='font-medium'>
                      <ProductPrice price={order.totalPrice} plain />
                    </TableCell>
                    <TableCell>
                      {/* Dynamic status badge */}
                      <Badge
                        className={
                          getStatusBadge(
                            order.isPaid,
                            order.isDelivered,
                            order.isShipped || false
                          ).variant
                        }
                      >
                        {
                          getStatusBadge(
                            order.isPaid,
                            order.isDelivered,
                            order.isShipped || false
                          ).text
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Link
                        href={`/account/orders/${order._id}`}
                        className={cn(
                          buttonVariants({ size: 'sm', variant: 'outline' }),
                          'font-medium'
                        )}
                      >
                        {t('Error.View Details')}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card view - improved design */}
          <div className='md:hidden space-y-4'>
            {orders.data.map((order: IOrder) => (
              <Card
                key={order._id}
                className='overflow-hidden border border-border/40 hover:border-primary/30 transition-colors'
              >
                {/* Order header with status */}
                <div className='p-4 bg-muted/30 border-b'>
                  <div className='flex items-center justify-between mb-2'>
                    <Badge
                      className={
                        getStatusBadge(
                          order.isPaid,
                          order.isDelivered,
                          order.isShipped || false
                        ).variant
                      }
                    >
                      {
                        getStatusBadge(
                          order.isPaid,
                          order.isDelivered,
                          order.isShipped || false
                        ).text
                      }
                    </Badge>
                    <span className='text-sm font-medium'>
                      {formatDateTime(order.createdAt!).dateOnly}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-base font-semibold'>
                      Order #{formatId(order._id)}
                    </h3>
                    <div className='text-right'>
                      <span className='block text-xs text-muted-foreground mb-1'>
                        Total Amount
                      </span>
                      <span className='font-bold text-base'>
                        <ProductPrice price={order.totalPrice} plain />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order content */}
                <div className='p-4 border-b'>
                  {/* Order items preview */}
                  <div className='mb-3'>
                    <h4 className='text-xs font-medium text-muted-foreground mb-2'>
                      ITEMS
                    </h4>
                    <div className='space-y-3'>
                      {/* Show first item with image */}
                      {order.items.length > 0 && (
                        <div className='flex items-center gap-3'>
                          <div className='relative w-12 h-12 flex-shrink-0 border rounded-md overflow-hidden bg-background'>
                            <Image
                              src={order.items[0].image}
                              fill
                              sizes='48px'
                              alt={order.items[0].name}
                              className='object-contain'
                            />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {order.items[0].name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              Qty: {order.items[0].quantity}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Item count indicator */}
                      {order.items.length > 1 && (
                        <p className='text-xs text-muted-foreground'>
                          + {order.items.length - 1} more{' '}
                          {order.items.length - 1 === 1 ? 'item' : 'items'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment info */}
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-1.5 text-xs'>
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          order.isPaid ? 'bg-green-500' : 'bg-amber-500'
                        )}
                      ></span>
                      <span>{order.isPaid ? 'Paid' : 'Payment pending'}</span>
                    </div>

                    <div className='text-xs'>
                      Expected delivery:{' '}
                      {formatDateTime(order.expectedDeliveryDate!).dateOnly}
                    </div>
                  </div>
                </div>

                {/* Order actions */}
                <div className='p-4 bg-background flex items-center justify-between'>
                  <div className='text-xs text-muted-foreground'>
                    {order.isPaid
                      ? `Paid on ${formatDateTime(order.paidAt!).dateOnly}`
                      : 'Awaiting payment'}
                  </div>
                  <Link
                    href={`/account/orders/${order._id}`}
                    className={cn(
                      buttonVariants({ size: 'sm', variant: 'default' }),
                      'gap-1'
                    )}
                  >
                    View Details
                    <ChevronRight className='h-3 w-3' />
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {orders.totalPages > 1 && (
            <div className='mt-6'>
              <Pagination page={page} totalPages={orders.totalPages} />
            </div>
          )}
        </>
      )}

      {/* Browsing History */}
      <div className='mt-16'>
        <h2 className='text-xl font-bold mb-4'>{t('Recommended for You')}</h2>
        <BrowsingHistoryList />
      </div>
    </div>
  )
}
