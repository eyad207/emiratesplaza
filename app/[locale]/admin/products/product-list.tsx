/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Link from 'next/link'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteProduct,
  getAllProductsForAdmin,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'

import React, { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ProductListDataProps = {
  products: IProduct[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}

const getTotalCountInStock = (product: IProduct) => {
  return product.colors.reduce((total, color) => {
    return (
      total +
      color.sizes.reduce((sizeTotal, size) => sizeTotal + size.countInStock, 0)
    )
  }, 0)
}

const ProductList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProductListDataProps>()
  const [isPending, startTransition] = useTransition()

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    if (changeType === 'next') {
      setPage(newPage)
    } else {
      setPage(newPage)
    }
    startTransition(async () => {
      const data = await getAllProductsForAdmin({
        query: inputValue,
        page: newPage,
      })
      setData(data)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      clearTimeout((window as any).debounce)
      ;(window as any).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllProductsForAdmin({ query: value, page: 1 })
          setData(data)
        })
      }, 500)
    } else {
      startTransition(async () => {
        const data = await getAllProductsForAdmin({ query: '', page })
        setData(data)
      })
    }
  }
  useEffect(() => {
    startTransition(async () => {
      const data = await getAllProductsForAdmin({ query: '' })
      setData(data)
    })
  }, [])

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex flex-col md:flex-row items-center gap-2'>
          <h1 className='font-bold text-lg'>Products</h1>
          <Input
            className='w-full md:w-auto'
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Filter name...'
          />
          {isPending ? (
            <p>Loading...</p>
          ) : (
            <p>
              {data?.totalProducts === 0
                ? 'No'
                : `${data?.from}-${data?.to} of ${data?.totalProducts}`}
              {' results'}
            </p>
          )}
        </div>
        <Button asChild variant='default'>
          <Link href='/admin/products/create'>Create Product</Link>
        </Button>
      </div>
      <div className='overflow-x-auto'>
        <Table className='min-w-full'>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className='text-right'>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.products.map((product: IProduct) => (
              <TableRow key={product._id}>
                <TableCell>{formatId(product._id)}</TableCell>
                <TableCell>
                  <Link href={`/admin/products/${product._id}`}>
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell className='text-right'>${product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{getTotalCountInStock(product)}</TableCell>
                <TableCell>{product.avgRating}</TableCell>
                <TableCell>{product.isPublished ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {formatDateTime(product.updatedAt).dateTime}
                </TableCell>
                <TableCell className='flex gap-1'>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/admin/products/${product._id}`}>Edit</Link>
                  </Button>
                  <Button asChild variant='outline' size='sm'>
                    <Link target='_blank' href={`/product/${product.slug}`}>
                      View
                    </Link>
                  </Button>
                  <DeleteDialog
                    id={product._id}
                    action={deleteProduct}
                    callbackAction={() => {
                      startTransition(async () => {
                        const data = await getAllProductsForAdmin({
                          query: inputValue,
                        })
                        setData(data)
                      })
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(data?.totalPages ?? 0) > 1 && (
        <div className='flex items-center justify-between gap-2'>
          <Button
            variant='outline'
            onClick={() => handlePageChange('prev')}
            disabled={Number(page) <= 1}
            className='w-24'
          >
            <ChevronLeft /> Previous
          </Button>
          <span>
            Page {page} of {data?.totalPages}
          </span>
          <Button
            variant='outline'
            onClick={() => handlePageChange('next')}
            disabled={Number(page) >= (data?.totalPages ?? 0)}
            className='w-24'
          >
            Next <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProductList
