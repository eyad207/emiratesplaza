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
  getAllCategories,
  updateStockForProducts,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import useSettingStore from '@/hooks/use-setting-store' // Import the setting store

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
  const [, startTransition] = useTransition()
  const [sortField, setSortField] = useState<string>('') // Field to sort by
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc') // Sort order
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkQuantity, setBulkQuantity] = useState<number>(1)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false) // State to track "Check/Uncheck All"

  const {
    setting: { currency, availableCurrencies },
  } = useSettingStore()
  const formatPrice = (price: number) => {
    const selectedCurrency = availableCurrencies.find(
      (c) => c.code === currency
    )
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: selectedCurrency?.code || 'NOK',
    }).format(price)
  }

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    setPage(newPage)
    fetchProducts(inputValue, newPage, selectedCategory)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    fetchProducts(value, 1, selectedCategory)
  }

  const handleSort = (field: string) => {
    const newSortOrder =
      sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortOrder(newSortOrder)
    fetchProducts(
      inputValue,
      page,
      selectedCategory,
      `${field}-${newSortOrder}`
    )
  }

  const handleCheckboxChange = (productId: string, isChecked: boolean) => {
    setSelectedProducts((prev) =>
      isChecked ? [...prev, productId] : prev.filter((id) => id !== productId)
    )
  }

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category)
    startTransition(async () => {
      const data = await getAllProductsForAdmin({
        query: inputValue,
        page: 1,
        category,
      })
      setData(data)

      // Automatically select all products in the selected category
      const productIds = data.products.map((product) => product._id)
      setSelectedProducts(productIds)
    })
  }

  const handleUpdateQuantities = async () => {
    if (selectedProducts.length === 0) return
    await updateStockForProducts({
      productIds: selectedProducts,
      quantity: bulkQuantity,
    })
    fetchProducts(inputValue, page, selectedCategory)
    setSelectedProducts([]) // Clear selection after update
    setBulkQuantity(1) // Reset bulk quantity
  }

  const handleToggleAll = () => {
    if (isAllChecked) {
      setSelectedProducts([]) // Uncheck all
    } else {
      const allProductIds = data?.products.map((product) => product._id) || []
      setSelectedProducts(allProductIds) // Check all
    }
    setIsAllChecked(!isAllChecked) // Toggle the state
  }

  const fetchProducts = async (
    query: string,
    page: number,
    category: string,
    sort?: string
  ) => {
    startTransition(async () => {
      const data = await getAllProductsForAdmin({
        query,
        page,
        sort,
        category,
      })
      setData(data)
    })
  }

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllProductsForAdmin({ query: '' })
      setData(data)
      const categories = await getAllCategories()
      setCategories(categories)
    })
  }, [])

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex flex-col md:flex-row items-center gap-2'>
          <h1 className='font-bold text-2xl'>Products</h1>
          <Input
            className='w-full md:w-auto'
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Search products...'
          />
          <select
            className='w-full md:w-auto border rounded-md px-2 py-1'
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value=''>All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className='flex items-center gap-4'>
            <Input
              type='number'
              min='1'
              value={bulkQuantity}
              onChange={(e) => setBulkQuantity(parseInt(e.target.value, 10))}
              placeholder='Enter quantity'
            />
            <Button
              variant='default'
              onClick={handleUpdateQuantities}
              disabled={selectedProducts.length === 0}
            >
              Update Quantities
            </Button>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <Button variant='outline' onClick={handleToggleAll}>
            {isAllChecked ? 'Uncheck All' : 'Check All'}
          </Button>
          <Button asChild variant='default'>
            <Link href='/admin/products/create'>Create Product</Link>
          </Button>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <Table className='min-w-full'>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead
                onClick={() => handleSort('_id')}
                className='cursor-pointer'
              >
                Id {sortField === '_id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('name')}
                className='cursor-pointer'
              >
                Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('price')}
                className='cursor-pointer text-right'
              >
                Price{' '}
                {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('category')}
                className='cursor-pointer'
              >
                Category{' '}
                {sortField === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('stock')}
                className='cursor-pointer'
              >
                Stock{' '}
                {sortField === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                onClick={() => handleSort('updatedAt')}
                className='cursor-pointer'
              >
                Last Update{' '}
                {sortField === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.products.map((product: IProduct) => (
              <TableRow key={product._id}>
                <TableCell>
                  <input
                    type='checkbox'
                    checked={selectedProducts.includes(product._id)}
                    onChange={(e) =>
                      handleCheckboxChange(product._id, e.target.checked)
                    }
                  />
                </TableCell>
                <TableCell>{formatId(product._id)}</TableCell>
                <TableCell>
                  <Link href={`/admin/products/${product._id}`}>
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell className='text-right'>
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{getTotalCountInStock(product)}</TableCell>
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
                    callbackAction={() =>
                      fetchProducts(inputValue, page, selectedCategory)
                    }
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
