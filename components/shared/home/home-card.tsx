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
          className='rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col border-0'
        >
          <CardContent className='p-6 flex-1'>
            <h3 className='text-lg font-semibold mb-5 border-b pb-2'>
              {card.title}
            </h3>
            <div className='grid grid-cols-2 gap-5'>
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn('flex flex-col group', item.className)}
                >
                  <div className='bg-secondary/30 rounded-md p-3 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:translate-y-[-3px]'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      className='aspect-square object-contain max-w-full h-auto mx-auto group-hover:scale-105 transition-transform'
                      height={100}
                      width={100}
                    />
                  </div>
                  <p className='text-center text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis'>
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
                className='text-sm font-medium text-primary hover:underline flex items-center'
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
                  className='ml-1 h-4 w-4'
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
