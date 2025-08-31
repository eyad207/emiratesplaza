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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  deleteProduct,
  deleteProducts,
  getAllProductsForAdmin,
  getAllCategories,
  updateStockForProducts,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { formatPrice } from '@/lib/currency'

import React, { useEffect, useState, useTransition } from 'react'
import BulkDeleteDialog from '@/components/shared/bulk-delete-dialog'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Package,
  Edit3,
  Eye,
  ArrowUpDown,
  CheckSquare,
  Square,
  RefreshCw,
  Package2,
} from 'lucide-react'

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
    <div className='relative min-h-screen'>
      {/* Premium Container */}
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl'>
        {/* Premium Header Section */}
        <div className='mb-8 sm:mb-12'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
            <div className='flex items-start gap-4'>
              <div className='relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl blur-md opacity-30' />
                <div className='relative p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-xl'>
                  <Package2 className='h-7 w-7 sm:h-8 sm:w-8 text-white' />
                </div>
              </div>
              <div>
                <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-tight'>
                  Product Management
                </h1>
                <p className='text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl'>
                  Comprehensive inventory control with advanced analytics and
                  bulk operations
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='flex items-center gap-3'>
              <Button
                asChild
                className='bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3'
              >
                <Link href='/admin/products/create'>
                  <Plus className='h-4 w-4 mr-2' />
                  <span className='hidden sm:inline'>Create Product</span>
                  <span className='sm:hidden'>Create</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Stats Dashboard */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 sm:mb-12'>
          <Card className='group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-900/30 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide'>
                    Total Products
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {data?.totalProducts || 0}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                    Active inventory items
                  </p>
                </div>
                <div className='relative'>
                  <div className='absolute inset-0 bg-blue-500 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity' />
                  <div className='relative p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg'>
                    <Package className='h-6 w-6 text-white' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl shadow-green-500/10 dark:shadow-green-900/20 hover:shadow-2xl hover:shadow-green-500/20 dark:hover:shadow-green-900/30 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide'>
                    Categories
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {categories.length}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                    Product classifications
                  </p>
                </div>
                <div className='relative'>
                  <div className='absolute inset-0 bg-green-500 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity' />
                  <div className='relative p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg'>
                    <Filter className='h-6 w-6 text-white' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10 dark:shadow-purple-900/20 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-900/30 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide'>
                    Selected Items
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {selectedProducts.length}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                    Items for bulk action
                  </p>
                </div>
                <div className='relative'>
                  <div className='absolute inset-0 bg-purple-500 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity' />
                  <div className='relative p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg'>
                    <CheckSquare className='h-6 w-6 text-white' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl shadow-orange-500/10 dark:shadow-orange-900/20 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-900/30 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide'>
                    Low Stock
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {data?.products.filter((p) => getTotalCountInStock(p) < 10)
                      .length || 0}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                    Needs attention
                  </p>
                </div>
                <div className='relative'>
                  <div className='absolute inset-0 bg-orange-500 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity' />
                  <div className='relative p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg'>
                    <Package2 className='h-6 w-6 text-white' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Controls Section */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 mb-8'>
          <div className='absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50' />
          <CardContent className='relative p-6 sm:p-8'>
            <div className='flex flex-col space-y-6'>
              {/* Search and Filter Row */}
              <div className='flex flex-col lg:flex-row gap-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400' />
                  <Input
                    className='pl-12 pr-4 py-3 bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:shadow-md focus:ring-2 focus:ring-orange-500/20 transition-all text-base'
                    type='text'
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder='Search products by name, category, or description...'
                  />
                </div>
                <div className='relative'>
                  <Filter className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10' />
                  <select
                    className='w-full lg:w-64 pl-12 pr-10 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 appearance-none shadow-sm focus:shadow-md focus:ring-2 focus:ring-orange-500/20 transition-all text-base font-medium'
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
                </div>
              </div>

              {/* Bulk Actions Row */}
              <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='flex items-center gap-3 bg-slate-100/80 dark:bg-slate-700/80 rounded-xl p-3'>
                    <Input
                      type='number'
                      min='1'
                      value={bulkQuantity}
                      onChange={(e) =>
                        setBulkQuantity(parseInt(e.target.value, 10))
                      }
                      placeholder='Qty'
                      className='w-20 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-lg text-center font-semibold'
                    />
                    <Button
                      size='sm'
                      onClick={handleUpdateQuantities}
                      disabled={selectedProducts.length === 0}
                      className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200'
                    >
                      <RefreshCw className='h-4 w-4 mr-2' />
                      Update Stock
                    </Button>
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleToggleAll}
                    className='border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-600 px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200'
                  >
                    {isAllChecked ? (
                      <CheckSquare className='h-4 w-4 mr-2 text-orange-500' />
                    ) : (
                      <Square className='h-4 w-4 mr-2' />
                    )}
                    {isAllChecked ? 'Uncheck All' : 'Check All'}
                  </Button>

                  <div className='flex items-center gap-2'>
                    <BulkDeleteDialog
                      ids={selectedProducts}
                      action={deleteProducts}
                      callbackAction={() => {
                        fetchProducts(inputValue, page, selectedCategory)
                        setSelectedProducts([])
                        setIsAllChecked(false)
                      }}
                    />
                  </div>
                </div>

                <Button
                  asChild
                  className='bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 rounded-lg font-semibold'
                >
                  <Link href='/admin/products/create'>
                    <Plus className='h-5 w-5 mr-2' />
                    Add Product
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Premium Products Table */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50'>
          <div className='absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50' />
          <CardContent className='relative p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-700/80'>
                    <TableHead className='w-12 px-4 sm:px-6 py-5'>
                      <div className='flex items-center'>
                        {isAllChecked ? (
                          <CheckSquare className='h-5 w-5 text-orange-500' />
                        ) : (
                          <Square className='h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors' />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('_id')}
                      className='cursor-pointer px-4 sm:px-6 py-5 font-bold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 hidden sm:table-cell'
                    >
                      <div className='flex items-center gap-2'>
                        <span className='tracking-wide'>ID</span>
                        <ArrowUpDown className='h-4 w-4 opacity-60' />
                        {sortField === '_id' && (
                          <span className='text-orange-500 text-lg font-bold'>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('name')}
                      className='cursor-pointer px-4 sm:px-6 py-5 font-bold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200'
                    >
                      <div className='flex items-center gap-2'>
                        <span className='tracking-wide'>Product</span>
                        <ArrowUpDown className='h-4 w-4 opacity-60' />
                        {sortField === 'name' && (
                          <span className='text-orange-500 text-lg font-bold'>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('price')}
                      className='cursor-pointer px-4 sm:px-6 py-5 font-bold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200'
                    >
                      <div className='flex items-center gap-2'>
                        <span className='tracking-wide'>Price</span>
                        <ArrowUpDown className='h-4 w-4 opacity-60' />
                        {sortField === 'price' && (
                          <span className='text-orange-500 text-lg font-bold'>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('category')}
                      className='cursor-pointer px-4 sm:px-6 py-5 font-bold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 hidden md:table-cell'
                    >
                      <div className='flex items-center gap-2'>
                        <span className='tracking-wide'>Category</span>
                        <ArrowUpDown className='h-4 w-4 opacity-60' />
                        {sortField === 'category' && (
                          <span className='text-orange-500 text-lg font-bold'>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('stock')}
                      className='cursor-pointer px-4 sm:px-6 py-5 font-bold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 hidden lg:table-cell'
                    >
                      <div className='flex items-center gap-2'>
                        <span className='tracking-wide'>Stock</span>
                        <ArrowUpDown className='h-4 w-4 opacity-60' />
                        {sortField === 'stock' && (
                          <span className='text-orange-500 text-lg font-bold'>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort('updatedAt')}
                      className='cursor-pointer px-3 sm:px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors hidden xl:table-cell'
                    >
                      <div className='flex items-center gap-2'>
                        <span className='hidden xl:inline'>Last Updated</span>
                        <span className='xl:hidden'>Updated</span>
                        <ArrowUpDown className='h-3 w-3' />
                        {sortField === 'updatedAt' && (
                          <span className='text-primary'>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className='px-3 sm:px-6 py-4 font-semibold text-slate-700 dark:text-slate-300'>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.products.map((product: IProduct, index) => (
                    <TableRow
                      key={product._id}
                      className={`
                        border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors
                        ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'}
                      `}
                    >
                      <TableCell className='px-3 sm:px-6 py-4'>
                        <input
                          type='checkbox'
                          checked={selectedProducts.includes(product._id)}
                          onChange={(e) =>
                            handleCheckboxChange(product._id, e.target.checked)
                          }
                          className='w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary'
                        />
                      </TableCell>
                      <TableCell className='px-3 sm:px-6 py-4 hidden sm:table-cell'>
                        <div className='font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400'>
                          {formatId(product._id)}
                        </div>
                      </TableCell>
                      <TableCell className='px-3 sm:px-6 py-4'>
                        <Link
                          href={`/admin/products/${product._id}`}
                          className='flex items-center gap-2 sm:gap-3 group'
                        >
                          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors'>
                            <Package className='h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate'>
                              {product.name}
                            </div>
                            <div className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate'>
                              {product.slug}
                            </div>
                            {/* Show additional info on mobile */}
                            <div className='sm:hidden mt-1 space-y-1'>
                              <div className='text-xs text-slate-600 dark:text-slate-400'>
                                ID: {formatId(product._id)}
                              </div>
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant='secondary'
                                  className='bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0 text-xs'
                                >
                                  {product.category}
                                </Badge>
                                <div className='text-xs text-slate-600 dark:text-slate-400'>
                                  Stock: {getTotalCountInStock(product)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className='px-3 sm:px-6 py-4'>
                        <div>
                          <div className='font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100'>
                            {formatPrice(product.price)}
                          </div>
                          {product.discountedPrice && (
                            <div className='text-xs sm:text-sm text-green-600 dark:text-green-400'>
                              Sale: {formatPrice(product.discountedPrice)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='px-3 sm:px-6 py-4 hidden md:table-cell'>
                        <Badge
                          variant='secondary'
                          className='bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0'
                        >
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className='px-3 sm:px-6 py-4 hidden lg:table-cell'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${
                              getTotalCountInStock(product) > 10
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : getTotalCountInStock(product) > 0
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }
                          `}
                          >
                            {getTotalCountInStock(product)} units
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='px-3 sm:px-6 py-4 hidden xl:table-cell'>
                        <div className='text-sm text-slate-600 dark:text-slate-400'>
                          {formatDateTime(product.updatedAt).dateTime}
                        </div>
                      </TableCell>
                      <TableCell className='px-3 sm:px-6 py-4'>
                        <div className='flex items-center gap-1 sm:gap-2'>
                          <Button
                            asChild
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          >
                            <Link href={`/admin/products/${product._id}`}>
                              <Edit3 className='h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400' />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20'
                          >
                            <Link
                              target='_blank'
                              href={`/product/${product.slug}`}
                            >
                              <Eye className='h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400' />
                            </Link>
                          </Button>
                          <DeleteDialog
                            id={product._id}
                            action={deleteProduct}
                            callbackAction={() =>
                              fetchProducts(inputValue, page, selectedCategory)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {/* Premium Pagination */}
        {(data?.totalPages ?? 0) > 1 && (
          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 mt-8'>
            <div className='absolute inset-0 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50' />
            <CardContent className='relative p-6'>
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div className='text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-700/80 px-4 py-2 rounded-lg'>
                  Showing{' '}
                  <span className='text-orange-600 dark:text-orange-400 font-bold'>
                    {data?.from}
                  </span>{' '}
                  to{' '}
                  <span className='text-orange-600 dark:text-orange-400 font-bold'>
                    {data?.to}
                  </span>{' '}
                  of{' '}
                  <span className='text-orange-600 dark:text-orange-400 font-bold'>
                    {data?.totalProducts}
                  </span>{' '}
                  products
                </div>

                <div className='flex items-center gap-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange('prev')}
                    disabled={Number(page) <= 1}
                    className='border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50'
                  >
                    <ChevronLeft className='w-4 h-4 mr-1' />
                    Previous
                  </Button>

                  <div className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg shadow-md'>
                    <span className='text-sm'>
                      Page {page} of {data?.totalPages}
                    </span>
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange('next')}
                    disabled={Number(page) >= (data?.totalPages ?? 0)}
                    className='border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50'
                  >
                    Next
                    <ChevronRight className='w-4 h-4 ml-1' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Empty State */}
        {data?.products.length === 0 && (
          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50'>
            <div className='absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/50 to-slate-100/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50' />
            <CardContent className='relative p-12 text-center'>
              <div className='flex flex-col items-center gap-6'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full blur-xl opacity-20' />
                  <div className='relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full shadow-xl'>
                    <Package className='h-12 w-12 text-slate-400 dark:text-slate-500' />
                  </div>
                </div>
                <div className='space-y-4'>
                  <h3 className='text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'>
                    No products found
                  </h3>
                  <p className='text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed'>
                    {inputValue || selectedCategory
                      ? "Try adjusting your search criteria or filters to find what you're looking for."
                      : 'Ready to start building your inventory? Create your first product to get started.'}
                  </p>
                  {!inputValue && !selectedCategory && (
                    <Button
                      asChild
                      className='bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 rounded-lg font-semibold text-base'
                    >
                      <Link href='/admin/products/create'>
                        <Plus className='h-5 w-5 mr-2' />
                        Create Your First Product
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ProductList
