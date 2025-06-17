'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getAllProducts } from '@/lib/actions/product.actions'
import ProductCard from '@/components/shared/product/product-card'
import { IProduct } from '@/lib/db/models/product.model'

const InfiniteProductList = () => {
  const [allProducts, setAllProducts] = useState<IProduct[]>([])
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isPending, setIsPending] = useState<boolean>(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isPending) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isPending, hasMore]
  )

  useEffect(() => {
    const fetchProducts = async () => {
      setIsPending(true)
      const response = await getAllProducts({
        query: '',
        category: '',
        tag: '',
        page,
      })
      const newProducts = response.products
      setAllProducts((prevProducts) => [...prevProducts, ...newProducts])
      if (newProducts.length === 0) {
        setHasMore(false)
      }
      setIsPending(false)
    }
    fetchProducts()
  }, [page])

  return (
    <div
      className='grid gap-3 sm:gap-4 lg:gap-6 
                    grid-cols-2 
                    sm:grid-cols-4 
                    md:grid-cols-4 
                    lg:grid-cols-4 
                    xl:grid-cols-4
                    2xl:grid-cols-4'
    >
      {allProducts.map((product, index) => (
        <div
          key={`${product._id}-${index}`} // Ensure unique keys
          ref={index === allProducts.length - 1 ? lastProductElementRef : null}
          className='transition-all duration-300 hover:shadow-lg' // Removed hover:scale-105 to prevent overlap
        >
          {' '}
          <ProductCard
            product={product}
            hideAddToCartButton={false}
            hideBrandOnMobile={false} // Show brand on mobile for better context
            isInInfiniteList={true}
            className='h-full w-full max-w-sm mx-auto' // Responsive sizing
          />
        </div>
      ))}{' '}
      {isPending && (
        <div role='status' className='col-span-full flex justify-center py-8'>
          <svg
            aria-hidden='true'
            className='inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
            viewBox='0 0 100 101'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
              fill='currentColor'
            />
            <path
              d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
              fill='currentFill'
            />
          </svg>
          <span className='sr-only'>Loading...</span>
        </div>
      )}
    </div>
  )
}

export default InfiniteProductList
