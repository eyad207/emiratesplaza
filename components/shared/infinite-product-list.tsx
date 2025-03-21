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
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {allProducts.map((product, index) => (
        <div
          key={product._id}
          ref={index === allProducts.length - 1 ? lastProductElementRef : null}
          className='transition-transform duration-300 hover:scale-105'
        >
          <ProductCard product={product} />
        </div>
      ))}
      {isPending && <p>Loading more products...</p>}
    </div>
  )
}

export default InfiniteProductList
