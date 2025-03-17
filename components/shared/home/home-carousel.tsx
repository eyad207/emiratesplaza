'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { ICarousel } from '@/types'

export function HomeCarousel({ items }: { items: ICarousel[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const t = useTranslations('Home')

  return (
    <Carousel
      dir='ltr'
      plugins={[plugin.current]}
      className='w-full mx-auto mb-3 sm:mb-4'
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.title}>
            <Link href={item.url}>
              <div className='flex aspect-[16/10] sm:aspect-[16/8] md:aspect-[16/6] items-center justify-center relative transition-transform duration-300 hover:scale-[1.02]'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover'
                  priority
                />
                <div className='absolute w-2/3 sm:w-1/2 md:w-2/5 lg:w-1/3 left-2 sm:left-6 md:left-10 top-1/2 transform -translate-y-1/2'>
                  <h2
                    className={cn(
                      'text-lg sm:text-2xl md:text-4xl lg:text-6xl font-bold mb-2 md:mb-4 text-primary drop-shadow-md'
                    )}
                  >
                    {t(`${item.title}`)}
                  </h2>
                  <Button size='sm' className='text-xs sm:text-sm md:text-base'>
                    {t(`${item.buttonCaption}`)}
                  </Button>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className='hidden sm:flex left-2 sm:left-4 md:left-12' />
      <CarouselNext className='hidden sm:flex right-2 sm:right-4 md:right-12' />
    </Carousel>
  )
}
