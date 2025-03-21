import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { IProduct } from '@/lib/db/models/product.model'

import Rating from './rating'
import { formatNumber, generateId, round2, cn } from '@/lib/utils'
import ProductPrice from './product-price'
import ImageHover from './image-hover'
import AddToCart from './add-to-cart'

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
  className,
  hideAddToCartButton = false, // New prop to conditionally hide add to cart button
  hideBrandOnMobile = false, // New prop to conditionally hide brand name on mobile
  isInInfiniteList = false, // New prop to conditionally style for infinite list
}: {
  product: IProduct
  hideDetails?: boolean
  hideBorder?: boolean
  hideAddToCart?: boolean
  className?: string
  hideAddToCartButton?: boolean // New prop to conditionally hide add to cart button
  hideBrandOnMobile?: boolean // New prop to conditionally hide brand name on mobile
  isInInfiniteList?: boolean // New prop to conditionally style for infinite list
}) => {
  const ProductImage = () => (
    <Link
      href={`/product/${product.slug}`}
      className='overflow-hidden rounded-lg block'
    >
      <div
        className={cn(
          'relative transform transition-transform duration-700 ease-out hover:scale-105',
          {
            'h-40': isInInfiniteList,
            'h-52': !isInInfiniteList,
          }
        )}
      >
        {product.images.length > 1 ? (
          <ImageHover
            src={product.images[0]}
            hoverSrc={product.images[1]}
            alt={product.name}
          />
        ) : (
          <div
            className={cn('relative', {
              'h-40': isInInfiniteList,
              'h-52': !isInInfiniteList,
            })}
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes='80vw'
              className='object-contain drop-shadow-md'
            />
          </div>
        )}
      </div>
    </Link>
  )

  const ProductDetails = () => (
    <div className='flex-1 space-y-2 flex flex-col'>
      <p
        className={cn('font-bold text-foreground dark:text-foreground/90', {
          'hidden sm:block': hideBrandOnMobile,
        })}
      >
        {product.brand}
      </p>
      <Link
        href={`/product/${product.slug}`}
        className='overflow-hidden text-ellipsis font-medium hover:text-primary transition-colors duration-300 dark:text-foreground/80 dark:hover:text-primary'
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {product.name}
      </Link>
      <div className='flex gap-2 justify-center hidden sm:flex'>
        <Rating rating={product.avgRating} />
        <span className='font-medium'>
          ({formatNumber(product.numReviews)})
        </span>
      </div>

      <div className='mt-auto pt-2'>
        <ProductPrice
          isDeal={product.tags.includes('todays-deal')}
          price={product.price}
          listPrice={product.listPrice}
          forListing
        />
      </div>
    </div>
  )

  const AddButton = () => (
    <div className='w-full text-center transform transition-all duration-300 hover:scale-105 pb-1'>
      <AddToCart
        minimal
        item={{
          clientId: generateId(),
          product: product._id,
          size: product.colors[0]?.sizes[0]?.size,
          color: product.colors[0]?.color,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: round2(product.price),
          quantity: 1,
          image: product.images[0],
          colors: product.colors,
        }}
        selectedSize={product.colors[0]?.sizes[0]?.size}
      />
    </div>
  )

  return hideBorder ? (
    <div
      className={cn('flex flex-col group card-professional h-full', className, {
        'hover:bg-gray-100 dark:hover:bg-gray-800': isInInfiniteList,
        'hover:border-primary': isInInfiniteList,
      })}
    >
      <ProductImage />
      {!hideDetails && (
        <>
          <div className='p-3 flex-1 text-center'>
            <ProductDetails />
          </div>
          {!hideAddToCart && !hideAddToCartButton && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <Card
      className={cn(
        'flex flex-col group card-professional h-full border-2 border-border/50 hover:border-primary/40 dark:bg-zinc-900 dark:hover:bg-zinc-900 dark:border-zinc-700 dark:hover:border-primary/60 overflow-hidden',
        className,
        {
          'hover:bg-gray-100 dark:hover:bg-gray-800': isInInfiniteList,
          'hover:border-primary': isInInfiniteList,
        }
      )}
    >
      <CardHeader className='p-3 flex-shrink-0'>
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className='p-3 flex-1 text-center overflow-y-auto'>
            <ProductDetails />
          </CardContent>
          <CardFooter className='p-3 pt-2 pb-3 flex-shrink-0 mt-auto border-t border-border/10 dark:border-zinc-800'>
            {!hideAddToCart && !hideAddToCartButton && <AddButton />}
          </CardFooter>
        </>
      )}
    </Card>
  )
}

export default ProductCard
