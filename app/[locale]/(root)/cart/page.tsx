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
import { formatPrice } from '@/lib/currency'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  isCartReadyForCheckout,
  hasInvalidQuantities,
  getInvalidQuantityItems,
} from '@/lib/cart-validation-client'

export default function Cart() {
  const {
    cart: { items, itemsPrice, taxPrice, shippingPrice, totalPrice },
    removeItem,
    updateItem,
    refreshCartStock,
  } = useCartStore()

  const t = useTranslations()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Validate cart state
  const cartIsReady = isCartReadyForCheckout({
    items,
    itemsPrice,
    totalPrice,
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
  })
  const invalidQuantityItems = getInvalidQuantityItems(items)
  const hasInvalidItems = hasInvalidQuantities(items)

  useEffect(() => {
    refreshCartStock()
  }, [refreshCartStock])

  // Handle error messages from checkout redirect
  useEffect(() => {
    const error = searchParams?.get('error')
    if (error) {
      let errorMessage = ''

      switch (error) {
        case 'empty-cart':
          errorMessage = t('Cart.Your cart is empty')
          break
        case 'invalid-quantities':
          errorMessage = t('Cart.Please fix invalid quantities before checkout')
          break
        case 'invalid-cart':
          errorMessage = t(
            'Cart.Invalid cart data Please refresh and try again'
          )
          break
        default:
          errorMessage = t(
            'Cart.Unable to proceed to checkout Please check your cart'
          )
      }

      if (errorMessage) {
        toast({
          description: errorMessage,
          variant: 'destructive',
        })

        // Clean up the URL by removing the error parameter
        const newSearchParams = new URLSearchParams(
          searchParams ? searchParams.toString() : ''
        )
        newSearchParams.delete('error')
        const newUrl = `/cart${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`
        router.replace(newUrl)
      }
    }
  }, [searchParams, toast, t, router])

  // Handle checkout button click with validation
  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (!cartIsReady || hasInvalidItems) {
      e.preventDefault()

      if (invalidQuantityItems.length > 0) {
        toast({
          description: t('Cart.Please fix invalid quantities before checkout'),
          variant: 'destructive',
        })
      }
      return
    }
  }

  if (items.length === 0) {
    return <EmptyCart />
  }

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
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.quantity.toString()}
                            onValueChange={(value) => {
                              const newQuantity = Number(value)
                              updateItem(item, newQuantity) // Automatically removes the item if quantity is 0
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
                              <SelectItem value='0'>Remove</SelectItem>{' '}
                              {/* Option to remove */}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatPrice(item.price * item.quantity)}
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
                  <span>{formatPrice(itemsPrice)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    {t('Cart.Shipping')}
                  </span>
                  <span>{formatPrice(shippingPrice ?? 0)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t('Cart.Tax')}</span>
                  <span>{formatPrice(taxPrice ?? 0)}</span>
                </div>
              </div>

              <Separator />

              <div className='flex justify-between text-lg font-bold'>
                <span>{t('Cart.Total')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <div className='pt-4'>
                {/* Show validation warning if cart has issues */}
                {(hasInvalidItems || invalidQuantityItems.length > 0) && (
                  <div className='mb-3 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md text-sm'>
                    <div className='font-medium mb-1'>
                      {t('Cart.Cart Issues')}
                    </div>
                    {invalidQuantityItems.map((item) => (
                      <div key={`${item.slug}-validation`} className='text-xs'>
                        • {item.name}: {t('Cart.Invalid quantity')} (
                        {item.quantity})
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href='/checkout'
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'w-full',
                    (!cartIsReady || hasInvalidItems) &&
                      'opacity-50 pointer-events-none'
                  )}
                  onClick={handleCheckoutClick}
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
