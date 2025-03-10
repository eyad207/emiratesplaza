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

export default function OrderDetailsForm({
  order,
  isAdmin,
}: {
  order: IOrder
  isAdmin: boolean
}) {
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
            <h2 className='text-xl pb-4'>Shipping Address</h2>
            <p className='pb-4 font-bold'>
              The recipt has been sent to your login email
            </p>
            <p>
              {shippingAddress.fullName} {shippingAddress.phone}
            </p>
            <p>
              {shippingAddress.street}, {shippingAddress.city},{' '}
              {shippingAddress.province}, {shippingAddress.postalCode},{' '}
              {shippingAddress.country}{' '}
            </p>
            {isShipped ? (
              <Badge>Shipped</Badge>
            ) : (
              <div>
                {' '}
                <Badge variant='destructive'>Not shipped</Badge>
              </div>
            )}
            {isDelivered ? (
              <Badge>
                Delivered at {formatDateTime(deliveredAt!).dateTime}
              </Badge>
            ) : (
              <div>
                {' '}
                <Badge variant='destructive'>Not delivered</Badge>
                <div>
                  Expected delivery at{' '}
                  {formatDateTime(expectedDeliveryDate!).dateTime}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>Payment Method</h2>
            <p>{paymentMethod}</p>
            {isPaid ? (
              <Badge>Paid at {formatDateTime(paidAt!).dateTime}</Badge>
            ) : (
              <Badge variant='destructive'>Not paid</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4   gap-4'>
            <h2 className='text-xl pb-4'>Order Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
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
                      <span className='px-2'>{item.color || 'None'}</span>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.size || 'None'}</span>
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
          <CardContent className='p-4  space-y-4 gap-4'>
            <h2 className='text-xl pb-4'>Order Summary</h2>
            <div className='flex justify-between'>
              <div>Items</div>
              <div>
                {' '}
                <ProductPrice price={itemsPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>Tax</div>
              <div>
                {' '}
                <ProductPrice price={taxPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>Shipping</div>
              <div>
                {' '}
                <ProductPrice price={shippingPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>Total</div>
              <div>
                {' '}
                <ProductPrice price={totalPrice} plain />
              </div>
            </div>

            {!isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (
              <Link
                className={cn(buttonVariants(), 'w-full')}
                href={`/checkout/${order._id}`}
              >
                Pay Order
              </Link>
            )}

            {isAdmin && !isPaid && paymentMethod === 'Cash On Delivery' && (
              <ActionButton
                caption='Mark as paid'
                action={() => updateOrderToPaid(order._id)}
              />
            )}
            {isAdmin && isPaid && (
              <Button
                className='mr-2'
                onClick={handleShippingStatusChange}
                disabled={isPending}
                variant={isShipped ? 'outline' : 'default'}
              >
                {isShipped ? 'Unmark as Shipped' : 'Mark as Shipped'}
              </Button>
            )}
            {isAdmin && isPaid && (
              <Button
                onClick={handleDeliveryStatusChange}
                disabled={isPending}
                variant={isDelivered ? 'outline' : 'default'}
              >
                {isDelivered ? 'Unmark as Delivered' : 'Mark as Delivered'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
