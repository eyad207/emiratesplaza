import Link from 'next/link'

import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  getAllProducts,
  getAllCategoriesWithTranslation,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import { getFilterUrl } from '@/lib/utils'
import Rating from '@/components/shared/product/rating'
import CollapsibleOnMobile from '@/components/shared/collapsible-on-mobile'
import { getTranslations } from 'next-intl/server'
import { detectAndCorrectSpelling } from '@/lib/multilingual-search'
import { SearchIcon, FilterIcon, SortAscIcon, X } from 'lucide-react'

const sortOrders = [
  { value: 'price-low-to-high', name: 'Price: Low to high' },
  { value: 'price-high-to-low', name: 'Price: High to low' },
  { value: 'newest-arrivals', name: 'Newest arrivals' },
  { value: 'avg-customer-review', name: 'Avg. customer review' },
  { value: 'best-selling', name: 'Best selling' },
]

const prices = [
  {
    name: 'Kr 10 to Kr 200',
    value: '1-20',
  },
  {
    name: 'Kr 210 to Kr 500',
    value: '21-50',
  },
  {
    name: 'Kr 510 to Kr 10000',
    value: '51-1000',
  },
]

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    sort: string
    page: string
  }>
}) {
  const searchParams = await props.searchParams
  const t = await getTranslations()
  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
  } = searchParams

  if (
    (q !== 'all' && q !== '') ||
    category !== 'all' ||
    tag !== 'all' ||
    rating !== 'all' ||
    price !== 'all'
  ) {
    return {
      title: `${t('Search.Search')} ${q !== 'all' ? q : ''}
          ${category !== 'all' ? ` : ${t('Search.Category')} ${category}` : ''}
          ${tag !== 'all' ? ` : ${t('Search.Tag')} ${tag}` : ''}
          ${price !== 'all' ? ` : ${t('Search.Price')} ${price}` : ''}
          ${rating !== 'all' ? ` : ${t('Search.Rating')} ${rating}` : ''}`,
    }
  } else {
    return {
      title: t('Search.Search Products'),
    }
  }
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    sort: string
    page: string
  }>
  params: Promise<{ locale: string }>
}) {
  const searchParams = await props.searchParams
  const params = await props.params
  const locale = params.locale as 'ar' | 'en-US' | 'nb-NO'

  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
    sort = 'best-selling',
    page = '1',
  } = searchParams
  const searchParamsObj = { q, category, tag, price, rating, sort, page }
  // Get translated categories for the current locale
  const translatedCategories = await getAllCategoriesWithTranslation(locale)

  // Get spell check for the current query
  const spellCheckResult =
    q && q !== 'all' ? await detectAndCorrectSpelling(q, locale) : null

  // Get products with multilingual search
  const data = await getAllProducts({
    category,
    tag,
    query: q,
    price,
    rating,
    page: Number(page),
    sort,
    locale, // Pass locale for multilingual search
  })
  const t = await getTranslations()

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-zinc-900'>
      {/* Spell Check Suggestion */}
      {spellCheckResult?.isLikelyMisspelled &&
        spellCheckResult.correctedQuery && (
          <div className='bg-white dark:bg-zinc-800 border-b shadow-sm'>
            <div className='container mx-auto px-4 py-3'>
              <div className='max-w-4xl mx-auto'>
                <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    {t('Search.Did you mean')}:{' '}
                    <Button
                      variant='link'
                      className='p-0 h-auto text-blue-600 dark:text-blue-400 font-semibold'
                      asChild
                    >
                      <Link
                        href={`/search?q=${encodeURIComponent(spellCheckResult.correctedQuery)}`}
                      >
                        {spellCheckResult.correctedQuery}
                      </Link>
                    </Button>
                    ?
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}{' '}
      {/* Results and Filters Section */}
      <div className='container mx-auto px-4 py-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Results Header */}
          <Card className='mb-6'>
            <CardContent className='p-4'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {data.totalProducts === 0
                      ? t('Search.No')
                      : `${data.from}-${data.to} ${t('Search.of')} ${data.totalProducts}`}{' '}
                    {t('Search.results')}
                  </span>

                  {/* Active Filters */}
                  <div className='flex flex-wrap gap-2'>
                    {q !== 'all' && q !== '' && (
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {t('Search.Query')}: &quot;{q}&quot;
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-4 w-4 p-0'
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              params: { ...searchParamsObj, q: 'all' },
                            })}
                          >
                            <X className='h-3 w-3' />
                          </Link>
                        </Button>
                      </Badge>
                    )}
                    {category !== 'all' && category !== '' && (
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {t('Search.Category')}: {category}
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-4 w-4 p-0'
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              category: 'all',
                              params: searchParamsObj,
                            })}
                          >
                            <X className='h-3 w-3' />
                          </Link>
                        </Button>
                      </Badge>
                    )}
                    {price !== 'all' && (
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {t('Search.Price')}: {price}
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-4 w-4 p-0'
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              price: 'all',
                              params: searchParamsObj,
                            })}
                          >
                            <X className='h-3 w-3' />
                          </Link>
                        </Button>
                      </Badge>
                    )}
                    {rating !== 'all' && (
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {t('Search.Rating')}: {rating}+ stars
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-4 w-4 p-0'
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              rating: 'all',
                              params: searchParamsObj,
                            })}
                          >
                            <X className='h-3 w-3' />
                          </Link>
                        </Button>
                      </Badge>
                    )}
                  </div>

                  {/* Clear all filters */}
                  {((q !== 'all' && q !== '') ||
                    (category !== 'all' && category !== '') ||
                    price !== 'all' ||
                    rating !== 'all') && (
                    <Button variant='outline' size='sm' asChild>
                      <Link href='/search'>{t('Search.Clear All')}</Link>
                    </Button>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <SortAscIcon className='h-4 w-4 text-gray-400' />
                  <ProductSortSelector
                    sortOrders={sortOrders}
                    sort={sort}
                    params={searchParamsObj}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className='grid lg:grid-cols-5 gap-6'>
            {/* Filters Sidebar */}{' '}
            <div className='lg:col-span-1'>
              <CollapsibleOnMobile title={t('Search.Filters')}>
                <Card>
                  <CardContent className='p-4 space-y-6'>
                    {/* Filters Header */}
                    <div className='flex items-center gap-2 mb-4'>
                      <FilterIcon className='h-4 w-4' />
                      <span className='font-semibold'>
                        {t('Search.Filters')}
                      </span>
                    </div>
                    {/* Department Filter */}
                    <div>
                      <h3 className='font-semibold text-gray-900 dark:text-white mb-3'>
                        {t('Search.Department')}
                      </h3>
                      <div className='space-y-2'>
                        <Link
                          className={`block text-sm hover:text-blue-600 transition-colors ${
                            ('all' === category || '' === category) &&
                            'text-blue-600 font-medium'
                          }`}
                          href={getFilterUrl({
                            category: 'all',
                            params: searchParamsObj,
                          })}
                        >
                          {t('Search.All')}
                        </Link>
                        {translatedCategories.map((categoryItem) => (
                          <Link
                            key={categoryItem.original}
                            className={`block text-sm hover:text-blue-600 transition-colors ${
                              categoryItem.original === category &&
                              'text-blue-600 font-medium'
                            }`}
                            href={getFilterUrl({
                              category: categoryItem.original,
                              params: searchParamsObj,
                            })}
                          >
                            {categoryItem.translated}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Price Filter */}
                    <div>
                      <h3 className='font-semibold text-gray-900 dark:text-white mb-3'>
                        {t('Search.Price')}
                      </h3>
                      <div className='space-y-2'>
                        <Link
                          className={`block text-sm hover:text-blue-600 transition-colors ${
                            'all' === price && 'text-blue-600 font-medium'
                          }`}
                          href={getFilterUrl({
                            price: 'all',
                            params: searchParamsObj,
                          })}
                        >
                          {t('Search.All')}
                        </Link>
                        {prices.map((p) => (
                          <Link
                            key={p.value}
                            className={`block text-sm hover:text-blue-600 transition-colors ${
                              p.value === price && 'text-blue-600 font-medium'
                            }`}
                            href={getFilterUrl({
                              price: p.value,
                              params: searchParamsObj,
                            })}
                          >
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Rating Filter */}
                    <div>
                      <h3 className='font-semibold text-gray-900 dark:text-white mb-3'>
                        {t('Search.Customer Review')}
                      </h3>
                      <div className='space-y-2'>
                        <Link
                          className={`block text-sm hover:text-blue-600 transition-colors ${
                            'all' === rating && 'text-blue-600 font-medium'
                          }`}
                          href={getFilterUrl({
                            rating: 'all',
                            params: searchParamsObj,
                          })}
                        >
                          {t('Search.All')}
                        </Link>
                        <Link
                          className={`flex items-center gap-2 text-sm hover:text-blue-600 transition-colors ${
                            '4' === rating && 'text-blue-600 font-medium'
                          }`}
                          href={getFilterUrl({
                            rating: '4',
                            params: searchParamsObj,
                          })}
                        >
                          <Rating size={4} rating={4} />
                          <span>{t('Search.& Up')}</span>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleOnMobile>
            </div>
            {/* Products Grid */}
            <div className='lg:col-span-4'>
              {data.products.length === 0 ? (
                <Card>
                  <CardContent className='p-8 text-center'>
                    <div className='text-gray-500 dark:text-gray-400'>
                      <SearchIcon className='h-12 w-12 mx-auto mb-4 opacity-50' />
                      <h3 className='text-lg font-semibold mb-2'>
                        {t('Search.No products found')}
                      </h3>
                      <p className='text-sm'>
                        {t('Search.Try adjusting your search terms or filters')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {data.products.map((product: IProduct) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {data.totalPages > 1 && (
                    <div className='mt-8 flex justify-center'>
                      <Pagination page={page} totalPages={data.totalPages} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
