'use client'

import useCartStore from '@/hooks/use-cart-store'
import { cn, formatPrice } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
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
import { ShoppingBag, TrashIcon, X } from 'lucide-react'
import useSettingStore from '@/hooks/use-setting-store'
import ProductPrice from './product/product-price'
import { useLocale, useTranslations } from 'next-intl'
import { getDirection } from '@/i18n-config'
import { useCartSidebarStore } from '@/hooks/use-cart-sidebar-store'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartSidebar() {
  const { isOpen, closeSidebar } = useCartSidebarStore()
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
    clearCart,
  } = useCartStore()
  const {
    setting: {
      common: { freeShippingMinPrice },
    },
  } = useSettingStore()

  const t = useTranslations()
  const locale = useLocale()
  const rtl = getDirection(locale) === 'rtl'

  if (items.length === 0) {
    return null
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
            className='fixed inset-0 bg-black/30 dark:bg-black/50 z-40 backdrop-blur-sm'
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: rtl ? -320 : 320 }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? -320 : 320 }}
            transition={{ type: 'spring', damping: 20 }}
            className={cn(
              'fixed top-0 bottom-0 z-50 w-full max-w-[320px] xs:max-w-[350px] bg-background shadow-xl',
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

              {/* Cart Items */}
              <ScrollArea className='flex-1 overflow-y-auto py-2'>
                <div className='flex flex-col divide-y divide-border/30'>
                  {items.map((item) => (
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
                                onValueChange={(value) =>
                                  updateItem(item, Number(value))
                                }
                              >
                                <SelectTrigger className='text-xs h-7 w-14 px-2'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({
                                    length: 10,
                                  }).map((_, i) => (
                                    <SelectItem
                                      value={(i + 1).toString()}
                                      key={i + 1}
                                    >
                                      {i + 1}
                                    </SelectItem>
                                  ))}
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
                  ))}
                </div>
              </ScrollArea>

              {/* Summary and Checkout */}
              <div className='p-4 bg-muted/30 border-t border-border/30'>
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

                {/* Buttons */}
                <div className='space-y-2'>
                  <Link
                    href='/checkout'
                    className={cn(buttonVariants({ size: 'sm' }), 'w-full')}
                    onClick={closeSidebar}
                  >
                    {t('Cart.Proceed to Checkout')}
                  </Link>
                  <Link
                    href='/cart'
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'w-full'
                    )}
                    onClick={closeSidebar}
                  >
                    {t('Cart.Go to Cart')}
                  </Link>
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
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
