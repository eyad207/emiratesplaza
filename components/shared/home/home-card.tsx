import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
    className?: string
  }[]
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6'>
      {cards.map((card) => (
        <Card
          key={card.title}
          className='rounded-lg shadow-md hover:shadow-xl transition-all duration-500 flex flex-col border-2 border-border/30 hover:border-primary/40 dark:bg-card/95 dark:hover:bg-card'
        >
          <CardContent className='p-6 flex-1'>
            <h3 className='text-lg font-bold mb-5 border-b pb-3 text-foreground dark:text-foreground/90'>
              {card.title}
            </h3>
            <div className='grid grid-cols-2 gap-5'>
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn('flex flex-col group', item.className)}
                >
                  <div className='bg-secondary/40 dark:bg-secondary/10 rounded-lg p-3 flex items-center justify-center mb-2 overflow-hidden relative border border-border/50 hover:border-primary/50 transition-colors duration-300'>
                    <div className='absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                    <div className='transform transition-transform duration-500 ease-out group-hover:translate-y-[-5px] relative z-10'>
                      <Image
                        src={item.image}
                        alt={item.name}
                        className='aspect-square object-contain max-w-full h-auto mx-auto group-hover:scale-110 transition-transform duration-700 drop-shadow-sm'
                        height={100}
                        width={100}
                      />
                    </div>
                  </div>
                  <p className='text-center text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-primary transition-colors duration-300 dark:font-semibold'>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          {card.link && (
            <CardFooter className='border-t pt-3 pb-4 px-6'>
              <Link
                href={card.link.href}
                className='text-sm font-semibold text-primary hover:text-primary-foreground dark:text-primary-foreground/90 dark:hover:text-primary transition-colors duration-300 flex items-center group hover-arrow-animation'
              >
                {card.link.text}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='ml-1 h-4 w-4 transform transition-transform duration-300'
                >
                  <path d='m9 18 6-6-6-6' />
                </svg>
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
