import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'

import {
  getProductsForCard,
  getProductsByTag,
  getCategoriesWithImages,
} from '@/lib/actions/product.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('Home')
  const { carousels } = await getSetting()
  const todaysDeals = await getProductsByTag({ tag: 'todays-deal' })
  const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })

  // Use the new function to get categories with their images
  const categoriesWithImages = await getCategoriesWithImages(4)

  const newArrivals = await getProductsForCard({
    tag: 'new-arrival',
  })
  const featureds = await getProductsForCard({
    tag: 'featured',
  })
  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
  })
  const cards = [
    {
      title: t('Categories to explore'),
      link: {
        text: t('See More'),
        href: '/search',
      },
      items: categoriesWithImages.map((category) => ({
        name: category.name,
        image: category.image,
        href: `/search?category=${category.name}`,
        className: 'transition-transform duration-300 hover:scale-105',
      })),
    },
    {
      title: t('Explore New Arrivals'),
      items: newArrivals.map((item) => ({
        ...item,
        className: 'transition-transform duration-300 hover:scale-105', // Add hover animation
      })),
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Discover Best Sellers'),
      items: bestSellers.map((item) => ({
        ...item,
        className: 'transition-transform duration-300 hover:scale-105', // Add hover animation
      })),
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Featured Products'),
      items: featureds.map((item) => ({
        ...item,
        className: 'transition-transform duration-300 hover:scale-105', // Add hover animation
      })),
      link: {
        text: t('Shop Now'),
        href: '/search?tag=new-arrival',
      },
    },
  ]

  return (
    <div className='pb-4 sm:pb-6'>
      <HomeCarousel items={carousels} />
      <div className='px-2 sm:px-3 md:p-4 space-y-3 md:space-y-4 bg-border'>
        <div className='pt-3 sm:pt-4'>
          <HomeCard cards={cards} />
        </div>
        <Card className='w-full'>
          <CardContent className='p-2 sm:p-3 md:p-4 items-center gap-3'>
            <ProductSlider title={t("Today's Deals")} products={todaysDeals} />
          </CardContent>
        </Card>
        <Card className='w-full'>
          <CardContent className='p-2 sm:p-3 md:p-4 items-center gap-3'>
            <ProductSlider
              title={t('Best Selling Products')}
              products={bestSellingProducts}
            />
          </CardContent>
        </Card>
      </div>

      <div className='px-2 sm:px-3 md:p-4 mt-3 sm:mt-4 bg-border'>
        <BrowsingHistoryList />
      </div>
    </div>
  )
}
