'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IOrder } from '@/lib/db/models/order.model'
import { cn, formatDateTime } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import ProductPrice from '../product/product-price'
import ActionButton from '../action-button'
import {
  deliverOrder,
  shipOrder,
  updateOrderToPaid,
} from '@/lib/actions/order.actions'
import { useTranslations } from 'next-intl'

export default function OrderDetailsForm({
  order,
  isAdmin,
}: {
  order: IOrder
  isAdmin: boolean
}) {
  const t = useTranslations()
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered: initialIsDelivered,
    deliveredAt,
    expectedDeliveryDate,
  } = order

  const [isPending, startTransition] = useTransition()
  const [isDelivered, setIsDelivered] = useState(initialIsDelivered)
  const [isShipped, setIsShipped] = useState(order.isShipped || false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDeliveryStatusChange = async () => {
    startTransition(async () => {
      const res = await deliverOrder(order._id)
      if (res.success) {
        setIsDelivered(!isDelivered)
        toast({
          description: res.message,
        })
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      }
    })
  }

  const handleShippingStatusChange = async () => {
    startTransition(async () => {
      const res = await shipOrder(order._id)
      if (res.success) {
        setIsShipped(!isShipped)
        toast({
          description: res.message,
        })
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      }
    })
  }

  return (
    <div className='grid md:grid-cols-3 md:gap-5'>
      <div className='overflow-x-auto md:col-span-2 space-y-4'>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('Orders.ShippingAddress')}</h2>
            <p className='pb-4 font-bold'>{t('Orders.ReceiptSent')}</p>
            <p>
              {shippingAddress.fullName} {shippingAddress.phone}
            </p>
            <p>
              {shippingAddress.street}, {shippingAddress.city},{' '}
              {shippingAddress.province}, {shippingAddress.postalCode},{' '}
              {shippingAddress.country}{' '}
            </p>
            {isShipped ? (
              <Badge>{t('Orders.Shipped')}</Badge>
            ) : (
              <div>
                <Badge variant='destructive'>{t('Orders.NotShipped')}</Badge>
              </div>
            )}
            {isDelivered ? (
              <Badge>
                {t('Orders.DeliveredAt', {
                  date: formatDateTime(deliveredAt!).dateTime,
                })}
              </Badge>
            ) : (
              <div>
                <Badge variant='destructive'>{t('Orders.NotDelivered')}</Badge>
                <div>
                  {t('Orders.ExpectedDeliveryAt', {
                    date: formatDateTime(expectedDeliveryDate!).dateTime,
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('Orders.PaymentMethod')}</h2>
            <p>{paymentMethod}</p>
            {isPaid ? (
              <Badge>
                {t('Orders.PaidAt', {
                  date: formatDateTime(paidAt!).dateTime,
                })}
              </Badge>
            ) : (
              <Badge variant='destructive'>{t('Orders.NotPaid')}</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('Orders.OrderItems')}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Orders.Item')}</TableHead>
                  <TableHead>{t('Orders.Quantity')}</TableHead>
                  <TableHead>{t('Orders.Price')}</TableHead>
                  <TableHead>{t('Orders.Color')}</TableHead>
                  <TableHead>{t('Orders.Size')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        ></Image>
                        <span className='px-2'>{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.quantity}</span>
                    </TableCell>
                    <TableCell className='text-right'>${item.price}</TableCell>
                    <TableCell>
                      <span className='px-2'>
                        {item.color || t('Orders.None')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>
                        {item.size || t('Orders.None')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className='p-4 space-y-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('Orders.OrderSummary')}</h2>
            <div className='flex justify-between'>
              <div>{t('Orders.Items')}</div>
              <div>
                <ProductPrice price={itemsPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>{t('Orders.Tax')}</div>
              <div>
                <ProductPrice price={taxPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>{t('Orders.Shipping')}</div>
              <div>
                <ProductPrice price={shippingPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>{t('Orders.Total')}</div>
              <div>
                <ProductPrice price={totalPrice} plain />
              </div>
            </div>
            {!isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (
              <Link
                className={cn(buttonVariants(), 'w-full')}
                href={`/checkout/${order._id}`}
              >
                {t('Orders.PayOrder')}
              </Link>
            )}
            {isAdmin && !isPaid && paymentMethod === 'Cash On Delivery' && (
              <ActionButton
                caption={t('Orders.MarkAsPaid')}
                action={() => updateOrderToPaid(order._id)}
              />
            )}
            {isAdmin && isPaid && (
              <Button
                className='mr-4'
                onClick={handleShippingStatusChange}
                disabled={isPending}
                variant={isShipped ? 'outline' : 'default'}
              >
                {isShipped
                  ? t('Orders.UnmarkAsShipped')
                  : t('Orders.MarkAsShipped')}
              </Button>
            )}
            {isAdmin && isPaid && (
              <Button
                onClick={handleDeliveryStatusChange}
                disabled={isPending}
                variant={isDelivered ? 'outline' : 'default'}
              >
                {isDelivered
                  ? t('Orders.UnmarkAsDelivered')
                  : t('Orders.MarkAsDelivered')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
