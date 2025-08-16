'use client'

import useCartStore from '@/hooks/use-cart-store'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/currency'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button, buttonVariants } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { ShoppingBag, TrashIcon, X, AlertTriangle } from 'lucide-react'
import useSettingStore from '@/hooks/use-setting-store'
import ProductPrice from './product/product-price'
import { useLocale, useTranslations } from 'next-intl'
import { getDirection } from '@/i18n-config'
import { useCartSidebarStore } from '@/hooks/use-cart-sidebar-store'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import type { OrderItem } from '@/types'

export default function CartSidebar() {
  const { isOpen, closeSidebar } = useCartSidebarStore()
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
    clearCart,
    refreshCartStock,
    refreshCartPrices,
  } = useCartStore()
  const {
    setting: {
      common: { freeShippingMinPrice },
    },
  } = useSettingStore()

  const t = useTranslations()
  const locale = useLocale()
  const rtl = getDirection(locale) === 'rtl'
  const router = useRouter()

  const [priceChangeInfo, setPriceChangeInfo] = useState<{
    hasChanges: boolean
    priceChanges: Array<{
      item: OrderItem
      oldPrice: number
      newPrice: number
      priceChange: number
      changeType: 'increase' | 'decrease'
    }>
  } | null>(null)

  const checkPricesAndStock = React.useCallback(async () => {
    try {
      // Check for price changes first
      const priceResult = await refreshCartPrices()

      if (priceResult.hasChanges) {
        setPriceChangeInfo(priceResult)

        // Show professional notification
        const totalIncreases = priceResult.priceChanges.filter(
          (c) => c.changeType === 'increase'
        ).length
        const totalDecreases = priceResult.priceChanges.filter(
          (c) => c.changeType === 'decrease'
        ).length

        if (totalIncreases > 0 && totalDecreases > 0) {
          toast({
            title: t('Cart.Price Changes Detected'),
            description: t(
              'Cart.Some items have price changes Please review below'
            ),
            variant: 'default',
          })
        } else if (totalIncreases > 0) {
          toast({
            title: t('Cart.Price Increases Detected'),
            description: t('Cart.Some items have increased in price'),
            variant: 'destructive',
          })
        } else {
          toast({
            title: t('Cart.Price Decreases Detected'),
            description: t(
              'Cart.Good news Some items have decreased in price'
            ),
            variant: 'default',
          })
        }
      }

      // Then refresh stock
      await refreshCartStock()
    } catch (error) {
      console.error('Failed to check prices and stock:', error)
      toast({
        title: t('Cart.Update Failed'),
        description: t(
          'Cart.Failed to check current prices Please try again'
        ),
        variant: 'destructive',
      })
    } finally {
    }
  }, [refreshCartPrices, refreshCartStock, t])

  const dismissPriceChanges = () => {
    setPriceChangeInfo(null)
    toast({
      title: t('Cart.Price Changes Accepted'),
      description: t('Cart.Your cart has been updated with current prices'),
      variant: 'default',
    })
  }

  useEffect(() => {
    if (isOpen) {
      checkPricesAndStock()
    }
  }, [isOpen, checkPricesAndStock])

  if (!isOpen) {
    return null // Sidebar is not open, so don't render it
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className='fixed inset-0 bg-black/30 dark:bg-black/50 z-[100] backdrop-blur-sm'
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: rtl ? -320 : 320 }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? -320 : 320 }}
            transition={{ type: 'spring', damping: 20 }}
            className={cn(
              'fixed top-0 bottom-0 z-[101] w-full max-w-[280px] xs:max-w-[320px] bg-background shadow-xl',
              rtl ? 'left-0' : 'right-0',
              'border-l border-border/30'
            )}
          >
            <div className='flex flex-col h-full'>
              {/* Header */}
              <div className='p-4 bg-header text-white flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <ShoppingBag className='h-5 w-5' />
                  <h2 className='font-semibold text-lg'>
                    {t('Cart.Shopping Cart')}
                  </h2>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-medium'>
                    {items.length}{' '}
                    {items.length === 1 ? t('Cart.item') : t('Cart.items')}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={closeSidebar}
                    className='h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Price Change Notification */}
              {priceChangeInfo?.hasChanges && (
                <div className='p-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800'>
                  <div className='flex items-start gap-2'>
                    <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-medium text-amber-800 dark:text-amber-200 mb-1'>
                        {t('Cart.Price Changes Detected')}
                      </h3>
                      <div className='space-y-1 mb-2'>
                        {priceChangeInfo.priceChanges.map((change, index) => (
                          <div
                            key={index}
                            className='text-xs text-amber-700 dark:text-amber-300'
                          >
                            <span className='font-medium'>
                              {change.item.name}
                            </span>
                            {' - '}
                            <span
                              className={cn(
                                'font-medium',
                                change.changeType === 'increase'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              )}
                            >
                              {change.changeType === 'increase' ? '+' : '-'}
                              {formatPrice(change.priceChange)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={dismissPriceChanges}
                        className='h-6 px-2 text-xs bg-white dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/70'
                      >
                        {t('Cart.Accept Changes')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <ScrollArea className='flex-1 overflow-y-auto py-2'>
                <div className='flex flex-col divide-y divide-border/30'>
                  {items.length === 0 ? (
                    <div className='p-4 text-center text-muted-foreground'>
                      {t('Cart.Your Shopping Cart is empty')}
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.clientId}
                        className='p-3 hover:bg-muted/20 transition-colors'
                      >
                        <div className='flex gap-3 items-center'>
                          <Link
                            href={`/product/${item.slug}`}
                            className='shrink-0'
                            onClick={closeSidebar}
                          >
                            <div className='relative h-16 w-16 rounded-md overflow-hidden border border-border/30'>
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes='64px'
                                className='object-contain'
                              />
                            </div>
                          </Link>
                          <div className='flex-1 min-w-0'>
                            <Link
                              href={`/product/${item.slug}`}
                              className='font-medium text-sm line-clamp-1 hover:text-primary transition-colors'
                              onClick={closeSidebar}
                            >
                              {item.name}
                            </Link>
                            <div className='text-muted-foreground text-xs mt-1'>
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
                            <div className='flex items-center justify-between mt-2'>
                              <div className='font-medium text-sm'>
                                <ProductPrice price={item.price} plain />
                              </div>
                              <div className='flex items-center gap-2'>
                                <Select
                                  value={item.quantity.toString()}
                                  onValueChange={(value) => {
                                    const newQuantity = Number(value)
                                    updateItem(item, newQuantity) // Automatically removes the item if quantity is 0
                                  }}
                                >
                                  <SelectTrigger className='text-xs h-7 w-14 px-2'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({
                                      length:
                                        item.colors
                                          .find((c) => c.color === item.color)
                                          ?.sizes.find(
                                            (s) => s.size === item.size
                                          )?.countInStock || 0,
                                    }).map((_, i) => (
                                      <SelectItem
                                        value={(i + 1).toString()}
                                        key={i + 1}
                                      >
                                        {i + 1}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value='0'>Remove</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-7 w-7 p-0 text-muted-foreground hover:text-destructive'
                                  onClick={() => removeItem(item)}
                                >
                                  <TrashIcon className='w-4 h-4' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Summary and Checkout */}
              <div className='p-4 bg-muted/30 border-t border-border/30'>
                {items.length > 0 && (
                  <>
                    {/* Free shipping message */}
                    {itemsPrice < freeShippingMinPrice ? (
                      <div className='text-sm mb-3 p-2 bg-primary/10 rounded-md'>
                        {t('Cart.Add')}{' '}
                        <span className='text-primary font-medium'>
                          {formatPrice(freeShippingMinPrice - itemsPrice)}
                        </span>{' '}
                        {t(
                          'Cart.of eligible items to your order to qualify for FREE Shipping'
                        )}
                      </div>
                    ) : (
                      <div className='text-sm mb-3 p-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md'>
                        {t('Cart.Your order qualifies for FREE Shipping')}
                      </div>
                    )}

                    {/* Subtotal */}
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-muted-foreground'>
                        {t('Cart.Subtotal')} ({items.length}{' '}
                        {items.length === 1 ? t('Cart.item') : t('Cart.items')})
                      </span>
                      <span className='font-bold text-lg'>
                        <ProductPrice price={itemsPrice} plain />
                      </span>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className='space-y-2'>
                  <Button
                    type='button'
                    onClick={() => {
                      closeSidebar()
                      router.push('/checkout')
                    }}
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'w-full',
                      items.length === 0 && 'opacity-50 pointer-events-none' // Disable if empty
                    )}
                    disabled={items.length === 0}
                  >
                    {t('Cart.Proceed to Checkout')}
                  </Button>
                  <Link
                    href='/cart'
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'w-full',
                      items.length === 0 && 'opacity-50 pointer-events-none' // Disable button if cart is empty
                    )}
                    onClick={closeSidebar}
                  >
                    {t('Cart.Go to Cart')}
                  </Link>
                  {items.length > 0 && (
                    <Button
                      variant='destructive'
                      className='w-full'
                      onClick={() => {
                        clearCart()
                        closeSidebar()
                      }}
                    >
                      {t('Cart.Empty Cart')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
