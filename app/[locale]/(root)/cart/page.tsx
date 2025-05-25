'use client'

import EmptyCart from '@/components/shared/cart/empty-cart'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import { TrashIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect } from 'react'

export default function Cart() {
  const {
    cart: { items, itemsPrice, taxPrice, shippingPrice, totalPrice },
    removeItem,
    updateItem,
    refreshCartStock,
  } = useCartStore()

  const {
    setting: { availableCurrencies, currency },
  } = useSettingStore()

  const t = useTranslations()

  useEffect(() => {
    refreshCartStock()
  }, [refreshCartStock])

  if (items.length === 0) {
    return <EmptyCart />
  }

  const selectedCurrency = availableCurrencies.find((c) => c.code === currency)
  const convertRate = selectedCurrency?.convertRate || 1
  const formatCurrency = (price: number) =>
    `${(price * convertRate).toFixed(2)} ${selectedCurrency?.symbol || '$'}`

  return (
    <div className='container py-6 md:py-8 lg:py-10'>
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
          {t('Cart.Shopping Cart')}
        </h1>
        <p className='text-muted-foreground'>
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Cart Items */}
        <div className='lg:col-span-2'>
          <Card className='shadow-sm'>
            <CardHeader className='py-4 px-6 border-b'>
              <CardTitle className='text-lg'>{t('Cart.Items')}</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[100px]'></TableHead>
                      <TableHead>{t('Cart.Product')}</TableHead>
                      <TableHead className='text-right'>
                        {t('Cart.Price')}
                      </TableHead>
                      <TableHead>{t('Cart.Quantity')}</TableHead>
                      <TableHead className='text-right'>
                        {t('Cart.Total')}
                      </TableHead>
                      <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.clientId}
                        className='hover:bg-muted/30 transition-colors'
                      >
                        <TableCell className='p-2'>
                          <Link
                            href={`/product/${item.slug}`}
                            className='block w-[80px] h-[80px] relative overflow-hidden rounded-md border'
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes='80px'
                              className='object-contain'
                            />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/product/${item.slug}`}
                            className='font-medium hover:text-primary transition-colors hover:underline'
                          >
                            {item.name}
                          </Link>
                          <div className='text-sm text-muted-foreground mt-1'>
                            {item.color && (
                              <span className='mr-2'>
                                {t('Cart.Color')}: {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span>
                                {t('Cart.Size')}: {item.size}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.quantity.toString()}
                            onValueChange={(value) => {
                              updateItem(item, Number(value))
                            }}
                          >
                            <SelectTrigger className='w-20'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({
                                length:
                                  item.colors
                                    .find((c) => c.color === item.color)
                                    ?.sizes.find((s) => s.size === item.size)
                                    ?.countInStock || 0,
                              }).map((_, i) => (
                                <SelectItem
                                  key={i + 1}
                                  value={(i + 1).toString()}
                                >
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => removeItem(item)}
                            className='text-muted-foreground hover:text-destructive transition-colors'
                            aria-label='Remove item'
                          >
                            <TrashIcon className='w-4 h-4' />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className='shadow-sm sticky top-24'>
            <CardHeader className='py-4 px-6 border-b'>
              <CardTitle className='text-lg'>
                {t('Cart.Order Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6 space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    {t('Cart.Subtotal')} ({items.length}{' '}
                    {items.length === 1 ? t('Cart.item') : t('Cart.items')})
                  </span>
                  <span>{formatCurrency(itemsPrice)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    {t('Cart.Shipping')}
                  </span>
                  <span>{formatCurrency(shippingPrice ?? 0)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t('Cart.Tax')}</span>
                  <span>{formatCurrency(taxPrice ?? 0)}</span>
                </div>
              </div>

              <Separator />

              <div className='flex justify-between text-lg font-bold'>
                <span>{t('Cart.Total')}</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              <div className='pt-4'>
                <Link
                  href='/checkout'
                  className={buttonVariants({ size: 'lg' }) + ' w-full'}
                >
                  {t('Cart.Checkout')}
                </Link>
              </div>

              <div className='pt-2 text-center'>
                <Link href='/' className='text-primary text-sm hover:underline'>
                  {t('Cart.Continue shopping')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
