/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import { useToast } from '@/hooks/use-toast'
import { OrderItem } from '@/types'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddToCart({
  item,
  minimal = false,
  selectedSize,
}: {
  item: OrderItem
  minimal?: boolean
  selectedSize?: string
}) {
  const router = useRouter()
  const { toast } = useToast()

  const { addItem } = useCartStore()

  const [quantity, setQuantity] = useState(1)

  const t = useTranslations()

  const getCountInStockForSelectedSize = () => {
    const colorObj = item.colors.find((c) => c.color === item.color)
    const sizeObj = colorObj?.sizes.find((s) => s.size === selectedSize)
    return sizeObj ? sizeObj.countInStock : 0
  }

  const handleAddToCart = () => {
    const countInStock = getCountInStockForSelectedSize()
    if (countInStock === 0) {
      toast({
        variant: 'destructive',
        description: t('Product.You cant add it to cart, change color or size'),
      })
      return
    }

    if (quantity > countInStock) {
      toast({
        variant: 'destructive',
        description: t('Product.Only X left in stock - order soon', {
          count: countInStock,
        }),
      })
      return
    }

    try {
      addItem(item, quantity)
      toast({
        description: t('Product.Added to Cart'),
        action: (
          <Button
            className='dark:border dark:border-border/70 dark:hover:border-primary/70'
            onClick={() => {
              router.push('/cart')
            }}
          >
            {t('Product.Go to Cart')}
          </Button>
        ),
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.message,
      })
    }
  }

  return minimal ? (
    <Button
      className='rounded-full w-auto font-semibold shadow-sm hover:shadow-md transition-all border-2 border-primary/80 dark:border-primary/60 dark:hover:border-primary'
      onClick={handleAddToCart}
    >
      {t('Product.Add to Cart')}
    </Button>
  ) : (
    <div className='w-full space-y-2'>
      <Select
        value={quantity.toString()}
        onValueChange={(i) => setQuantity(Number(i))}
      >
        <SelectTrigger className=''>
          <SelectValue>
            {t('Product.Quantity')}: {quantity}
          </SelectValue>
        </SelectTrigger>
        <SelectContent position='popper'>
          {Array.from({ length: getCountInStockForSelectedSize() }).map(
            (_, i) => (
              <SelectItem key={i + 1} value={`${i + 1}`}>
                {i + 1}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>

      <Button
        className='rounded-full w-full'
        type='button'
        onClick={handleAddToCart}
      >
        {t('Product.Add to Cart')}
      </Button>
      <Button
        variant='secondary'
        onClick={() => {
          const countInStock = getCountInStockForSelectedSize()
          if (countInStock === 0) {
            toast({
              variant: 'destructive',
              description: t(
                'Product.You cant add it to cart, change color or size'
              ),
            })
            return
          }

          if (quantity > countInStock) {
            toast({
              variant: 'destructive',
              description: t('Product.Only X left in stock - order soon', {
                count: countInStock,
              }),
            })
            return
          }

          try {
            addItem(item, quantity)
            router.push(`/checkout`)
          } catch (error: any) {
            toast({
              variant: 'destructive',
              description: error.message,
            })
          }
        }}
        className='w-full rounded-full '
      >
        {t('Product.Buy Now')}
      </Button>
    </div>
  )
}
