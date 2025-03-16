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
}: {
  product: IProduct
  hideDetails?: boolean
  hideBorder?: boolean
  hideAddToCart?: boolean
  className?: string
}) => {
  const ProductImage = () => (
    <Link
      href={`/product/${product.slug}`}
      className='overflow-hidden rounded-lg block'
    >
      <div className='relative h-52 transform transition-transform duration-700 ease-out hover:scale-105'>
        {product.images.length > 1 ? (
          <ImageHover
            src={product.images[0]}
            hoverSrc={product.images[1]}
            alt={product.name}
          />
        ) : (
          <div className='relative h-52'>
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
      <p className='font-bold text-foreground dark:text-foreground/90'>
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
      <div className='flex gap-2 justify-center'>
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
    <div className='w-full text-center transform transition-all duration-300 hover:scale-105'>
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
      className={cn('flex flex-col group card-professional h-full', className)}
    >
      <ProductImage />
      {!hideDetails && (
        <>
          <div className='p-3 flex-1 text-center'>
            <ProductDetails />
          </div>
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <Card
      className={cn(
        'flex flex-col group card-professional h-full border-2 border-border/50 hover:border-primary/40 dark:bg-zinc-900 dark:hover:bg-zinc-900 dark:border-zinc-700 dark:hover:border-primary/60',
        className
      )}
    >
      <CardHeader className='p-3 flex-shrink-0'>
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className='p-3 flex-1 text-center'>
            <ProductDetails />
          </CardContent>
          <CardFooter className='p-3 flex-shrink-0 mt-auto'>
            {!hideAddToCart && <AddButton />}
          </CardFooter>
        </>
      )}
    </Card>
  )
}

export default ProductCard
