'use client'

import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IProduct } from '@/lib/db/models/product.model'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import ProductCard from './product-card'

export default function ProductSlider({
  title,
  products,
  href,
  linkText,
  hideDetails = false,
}: {
  title?: string
  products: IProduct[]
  href?: string
  linkText?: string
  hideDetails?: boolean
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: true,
    },
    [Autoplay({ delay: 10000, stopOnInteraction: false })]
  )

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className='my-8 dark:bg-zinc-900/50'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>{title}</h2>
        {href && (
          <Link
            href={href}
            className='flex items-center text-sm text-primary hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-primary hover:underline'
          >
            {linkText || 'View All'}
            <ChevronRightIcon className='ml-1 h-4 w-4' />
          </Link>
        )}
      </div>

      <div className='relative px-6'>
        <div className='overflow-hidden' ref={emblaRef}>
          <div className='flex gap-4 pl-4 pr-20'>
            {products.map((product) => (
              <div
                key={product._id.toString()}
                className='w-[280px] sm:w-[320px] md:w-[350px] flex-shrink-0 flex-grow-0 h-[500px]'
                style={{
                  minWidth: '280px',
                  maxWidth: '350px',
                  overflow: 'hidden',
                }}
              >
                <ProductCard
                  product={product}
                  hideDetails={hideDetails}
                  hideBorder={false}
                  className='h-full flex flex-col'
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          variant='outline'
          size='icon'
          className='absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700'
          onClick={scrollPrev}
        >
          <ChevronLeftIcon className='h-4 w-4' />
        </Button>

        <Button
          variant='outline'
          size='icon'
          className='absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700'
          onClick={scrollNext}
        >
          <ChevronRightIcon className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
