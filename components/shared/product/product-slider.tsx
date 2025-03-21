'use client'

import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IProduct } from '@/lib/db/models/product.model'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false, // Disable dragFree to ensure one product scroll at a time
    slidesToScroll: 1, // Scroll 1 slide at a time
    breakpoints: {
      // Responsive breakpoints
      '(max-width: 1200px)': { slidesToScroll: 1 },
      '(max-width: 768px)': { slidesToScroll: 1 },
      '(max-width: 640px)': { slidesToScroll: 1 },
    },
  })

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className='sm:my-5 md:my-8 dark:bg-zinc-900/50'>
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

      <div className='relative px-2 sm:px-6 overflow-hidden'>
        <div className='overflow-hidden scrollbar-hide' ref={emblaRef}>
          <div className='flex gap-2 pl-1 pr-8'>
            {products.map((product) => (
              <div
                key={product._id.toString()}
                className='w-[75vw] max-w-[280px] sm:w-[45vw] md:w-[30vw] lg:w-[22vw] flex-shrink-0 px-1 sm:px-2'
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
