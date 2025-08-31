'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getAllProductsForAdmin,
  applyDiscountToProducts,
  removeDiscountFromProducts,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { round2 } from '@/lib/utils'
import { formatPrice, currencyManager } from '@/lib/currency'
import useSettingStore from '@/hooks/use-setting-store'
import {
  Percent,
  Search,
  Filter,
  Tag,
  Package,
  Trash2,
  Save,
  DollarSign,
  Target,
  TrendingDown,
  ShoppingCart,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export default function DiscountsPage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [discount, setDiscount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [discountedPrices, setDiscountedPrices] = useState<
    Record<string, number>
  >({})
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<{ name: string; _id: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const { getCurrency, setting } = useSettingStore()
  const currency = getCurrency()

  // Initialize currency manager
  React.useEffect(() => {
    if (
      setting?.availableCurrencies &&
      setting.availableCurrencies.length > 0
    ) {
      currencyManager.init(setting.availableCurrencies, currency.code)
    }
  }, [setting?.availableCurrencies, currency.code])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const response = await getAllProductsForAdmin({ query: searchQuery })
        setProducts(response.products)
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchQuery])

  // Fetch categories and tags
  useEffect(() => {
    async function fetchCategoriesAndTags() {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
        ])
        const categoriesData = await categoriesResponse.json()
        const tagsData = await tagsResponse.json()

        if (categoriesData.success) setCategories(categoriesData.categories)
        if (tagsData.success) setTags(tagsData.tags)
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to fetch categories or tags',
          variant: 'destructive',
        })
      }
    }
    fetchCategoriesAndTags()
  }, [])

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const applyDiscount = async () => {
    if (
      discount <= 0 ||
      (!selectedProducts.length && !selectedCategory && !selectedTag)
    ) {
      toast({
        title: 'Warning',
        description:
          'Please select products, a category, or a tag and enter a valid discount.',
        variant: 'default',
      })
      return
    }

    setLoading(true)
    try {
      if (!selectedProducts.length) {
        toast({
          title: 'Warning',
          description: 'Please select products to apply the discount.',
          variant: 'default',
        })
        setLoading(false)
        return
      }

      await applyDiscountToProducts({
        productIds: selectedProducts,
        discount,
      })
      toast({
        title: 'Success',
        description: 'Discount applied successfully!',
        variant: 'default',
      })

      // Update discounted prices locally
      const updatedPrices = { ...discountedPrices }
      selectedProducts.forEach((productId) => {
        const product = products.find((p) => p._id === productId)
        if (product) {
          updatedPrices[productId] =
            product.price - (product.price * discount) / 100
        }
      })
      setDiscountedPrices(updatedPrices)

      setSelectedProducts([])
      setSelectedCategory(null)
      setSelectedTag(null)
      setDiscount(0)

      // Refresh products to reflect updated discounts
      const response = await getAllProductsForAdmin({ query: searchQuery })
      setProducts(response.products)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to apply discount',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const applyDiscountToCategory = async () => {
    if (!selectedCategory || discount <= 0) {
      toast({
        title: 'Warning',
        description: 'Please select a category and enter a valid discount.',
        variant: 'default',
      })
      return
    }
    setLoading(true)
    try {
      await applyDiscountToProducts({
        discount,
        category: selectedCategory,
      })
      toast({
        title: 'Success',
        description: 'Discount applied to category successfully!',
        variant: 'default',
      })
      setSelectedProducts([])
      setSelectedCategory(null)
      setDiscount(0)
      const response = await getAllProductsForAdmin({ query: searchQuery })
      setProducts(response.products)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to apply discount to category',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const applyDiscountToTag = async () => {
    if (!selectedTag || discount <= 0) {
      toast({
        title: 'Warning',
        description: 'Please select a tag and enter a valid discount.',
        variant: 'default',
      })
      return
    }
    setLoading(true)
    try {
      await applyDiscountToProducts({
        discount,
        tagId: selectedTag,
      })
      toast({
        title: 'Success',
        description: 'Discount applied to tag successfully!',
        variant: 'default',
      })
      setSelectedProducts([])
      setSelectedTag(null)
      setDiscount(0)
      const response = await getAllProductsForAdmin({ query: searchQuery })
      setProducts(response.products)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to apply discount to tag',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const removeDiscount = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select products to remove the discount.',
        variant: 'default',
      })
      return
    }

    setLoading(true)
    try {
      await removeDiscountFromProducts({ productIds: selectedProducts })
      toast({
        title: 'Success',
        description: 'Discount removed successfully!',
        variant: 'default',
      })

      // Remove discounts locally
      const updatedDiscounts = { ...discountedPrices }
      selectedProducts.forEach((productId) => {
        delete updatedDiscounts[productId]
      })
      setDiscountedPrices(updatedDiscounts)

      setSelectedProducts([])

      // Refresh products to reflect updated discounts
      const response = await getAllProductsForAdmin({ query: searchQuery })
      setProducts(response.products)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove discount',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const removeDiscountFromCategory = async () => {
    if (!selectedCategory) {
      toast({
        title: 'Warning',
        description: 'Please select a category to remove the discount.',
        variant: 'default',
      })
      return
    }
    setLoading(true)
    try {
      // Get all products in the selected category
      const response = await getAllProductsForAdmin({
        query: '',
        sort: 'latest',
        page: 1,
        limit: 1000,
      })
      const categoryProducts = response.products.filter(
        (product) => product.category === selectedCategory
      )
      const productIds = categoryProducts.map((p) => p._id)
      if (productIds.length === 0) {
        toast({
          title: 'Info',
          description: 'No products found in this category.',
          variant: 'default',
        })
        setLoading(false)
        return
      }
      await removeDiscountFromProducts({ productIds })
      toast({
        title: 'Success',
        description: 'Discount removed from category successfully!',
        variant: 'default',
      })
      setSelectedProducts([])
      setSelectedCategory(null)
      setDiscount(0)
      const refreshed = await getAllProductsForAdmin({ query: searchQuery })
      setProducts(refreshed.products)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove discount from category',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const removeDiscountFromTag = async () => {
    if (!selectedTag) {
      toast({
        title: 'Warning',
        description: 'Please select a tag to remove the discount.',
        variant: 'default',
      })
      return
    }
    setLoading(true)
    try {
      // Get all products with the selected tag
      const response = await getAllProductsForAdmin({
        query: '',
        sort: 'latest',
        page: 1,
        limit: 1000,
      })
      const tagProducts = response.products.filter(
        (product) =>
          Array.isArray(product.tags) &&
          product.tags.some((tag: string | { _id: string }) =>
            typeof tag === 'string'
              ? tag === selectedTag
              : tag?._id === selectedTag
          )
      )
      const productIds = tagProducts.map((p) => p._id)
      if (productIds.length === 0) {
        toast({
          title: 'Info',
          description: 'No products found with this tag.',
          variant: 'default',
        })
        setLoading(false)
        return
      }
      await removeDiscountFromProducts({ productIds })
      toast({
        title: 'Success',
        description: 'Discount removed from tag successfully!',
        variant: 'default',
      })
      setSelectedProducts([])
      setSelectedTag(null)
      setDiscount(0)
      const refreshed = await getAllProductsForAdmin({ query: searchQuery })
      setProducts(refreshed.products)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove discount from tag',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
      {/* Premium Background Elements */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-teal-100/20 dark:from-emerald-900/10 dark:to-teal-900/10' />

      <div className='relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl'>
        {/* Enhanced Header */}
        <div className='mb-8'>
          <div className='flex items-start gap-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-md opacity-30' />
              <div className='relative p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl'>
                <Percent className='h-8 w-8 text-white' />
              </div>
            </div>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'>
                Discount Management
              </h1>
              <p className='text-lg text-slate-600 dark:text-slate-400 mt-2'>
                Apply and manage discounts across your product catalog
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide'>
                    Total Products
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {products.length}
                  </p>
                </div>
                <div className='p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg'>
                  <Package className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-green-500/10 dark:shadow-green-900/20 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide'>
                    On Sale
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {
                      products.filter((p) => p.discountedPrice || p.discount)
                        .length
                    }
                  </p>
                </div>
                <div className='p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg'>
                  <TrendingDown className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10 dark:shadow-purple-900/20 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide'>
                    Selected
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {selectedProducts.length}
                  </p>
                </div>
                <div className='p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg'>
                  <Target className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-orange-500/10 dark:shadow-orange-900/20 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide'>
                    Categories
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {categories.length}
                  </p>
                </div>
                <div className='p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg'>
                  <Filter className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discount Controls */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 mb-8'>
          <div className='absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50' />
          <CardHeader className='relative pb-6'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg'>
                <DollarSign className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  Discount Configuration
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  Set discount percentage and search products
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative space-y-6'>
            {/* Discount Input and Search */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div>
                <label className='block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3'>
                  Discount Percentage
                </label>
                <div className='relative'>
                  <Percent className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400' />
                  <Input
                    type='number'
                    placeholder='Enter discount %'
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className='pl-12 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:shadow-md transition-all'
                  />
                </div>
              </div>
              <div>
                <label className='block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3'>
                  Search Products
                </label>
                <div className='relative'>
                  <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400' />
                  <Input
                    type='text'
                    placeholder='Search by product name...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-12 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:shadow-md transition-all'
                  />
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div>
                <label className='block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3'>
                  Select Category
                </label>
                <div className='relative'>
                  <Filter className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10' />
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className='w-full pl-12 pr-10 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 appearance-none shadow-sm focus:shadow-md focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium'
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
              <div>
                <label className='block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3'>
                  Select Tag
                </label>
                <div className='relative'>
                  <Tag className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10' />
                  <select
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className='w-full pl-12 pr-10 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 appearance-none shadow-sm focus:shadow-md focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium'
                  >
                    <option value=''>All Tags</option>
                    {tags.map((tag) => (
                      <option key={tag._id} value={tag._id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Products Table */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 mb-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50' />
          <CardHeader className='relative pb-6'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg'>
                <ShoppingCart className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  Product Pricing Overview
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  Review and select products for discount application
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-700/80'>
                    <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                      <div className='flex items-center gap-2'>Select</div>
                    </TableHead>
                    <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                      <div className='flex items-center gap-2'>
                        <Package className='h-4 w-4' />
                        Product Name
                      </div>
                    </TableHead>
                    <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                      <div className='flex items-center gap-2'>
                        <DollarSign className='h-4 w-4' />
                        Original Price
                      </div>
                    </TableHead>
                    <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                      <div className='flex items-center gap-2'>
                        <TrendingDown className='h-4 w-4' />
                        Sale Price
                      </div>
                    </TableHead>
                    <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                      <div className='flex items-center gap-2'>
                        <Percent className='h-4 w-4' />
                        Discount %
                      </div>
                    </TableHead>
                    <TableHead className='px-6 py-5 font-bold text-slate-800 dark:text-slate-200'>
                      <div className='flex items-center gap-2'>
                        <Filter className='h-4 w-4' />
                        Category
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    // Calculate discounted price:
                    const productDiscountedPrice =
                      discountedPrices[product._id] !== undefined
                        ? discountedPrices[product._id]
                        : product.discount
                          ? round2(product.price * (1 - product.discount / 100))
                          : product.discountedPrice

                    const discountPercentage = productDiscountedPrice
                      ? ((product.price - productDiscountedPrice) /
                          product.price) *
                        100
                      : 0

                    return (
                      <TableRow
                        key={product._id}
                        className='group border-b border-slate-200/60 dark:border-slate-700/60 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-white dark:hover:from-slate-700/50 dark:hover:to-slate-800/50 transition-all duration-200'
                      >
                        <TableCell className='px-6 py-6'>
                          <div className='flex items-center justify-center'>
                            <Checkbox
                              checked={selectedProducts.includes(product._id)}
                              onCheckedChange={() =>
                                toggleProductSelection(product._id)
                              }
                              className='w-5 h-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500'
                            />
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center'>
                              <Package className='h-5 w-5 text-slate-600 dark:text-slate-400' />
                            </div>
                            <div>
                              <div className='font-semibold text-slate-900 dark:text-slate-100'>
                                {product.name}
                              </div>
                              <div className='text-sm text-slate-500 dark:text-slate-400'>
                                ID: {product._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          <div className='font-bold text-lg text-slate-900 dark:text-slate-100'>
                            {formatPrice(product.price)}
                          </div>
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          {productDiscountedPrice ? (
                            <div className='flex items-center gap-2'>
                              <div className='font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg'>
                                {formatPrice(productDiscountedPrice)}
                              </div>
                              <CheckCircle className='h-4 w-4 text-green-500' />
                            </div>
                          ) : (
                            <div className='flex items-center gap-2 text-slate-500 dark:text-slate-400'>
                              <span>No discount</span>
                              <XCircle className='h-4 w-4' />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          {productDiscountedPrice ? (
                            <Badge className='bg-gradient-to-r from-red-50 to-orange-50 text-red-700 dark:from-red-900/20 dark:to-orange-900/20 dark:text-red-400 border-red-200 dark:border-red-800 font-bold'>
                              -{discountPercentage.toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge
                              variant='secondary'
                              className='text-slate-500'
                            >
                              0%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='px-6 py-6'>
                          <Badge className='bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'>
                            {product.category}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {products.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center py-12'>
                        <div className='flex flex-col items-center gap-4'>
                          <Package className='h-16 w-16 text-slate-300 dark:text-slate-600' />
                          <div>
                            <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                              No products found
                            </h3>
                            <p className='text-slate-500 dark:text-slate-400'>
                              Try adjusting your search criteria
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Discount Section */}
        <div className='mt-4 flex flex-col sm:flex-row items-center gap-4'>
          <div className='w-full sm:w-1/3'>
            <Input
              type='number'
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder='Enter discount percentage'
              className='w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
            />
          </div>
          <div className='w-full sm:w-1/3'>
            {/* Dropdown for selecting category */}
            <label className='block text-gray-700 dark:text-gray-300 mb-2'>
              Select Category
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
            >
              <option value='' disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className='w-full sm:w-1/3'>
            {/* Dropdown for selecting tag */}
            <label className='block text-gray-700 dark:text-gray-300 mb-2'>
              Select Tag
            </label>
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value)}
              className='w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
            >
              <option value='' disabled>
                Select a tag
              </option>
              {tags.map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Premium Action Panel */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 mt-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20' />
          <CardContent className='relative p-8'>
            <div className='text-center mb-8'>
              <div className='flex justify-center mb-4'>
                <div className='p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl'>
                  <Target className='h-8 w-8 text-white' />
                </div>
              </div>
              <h3 className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
                Discount Actions
              </h3>
              <p className='text-slate-600 dark:text-slate-400 max-w-2xl mx-auto'>
                Apply or remove discounts with precision control across
                products, categories, and tags
              </p>
            </div>

            {/* Apply Discount Actions */}
            <div className='mb-8'>
              <h4 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2'>
                <Save className='h-5 w-5 text-emerald-500' />
                Apply Discounts
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Button
                  onClick={applyDiscount}
                  disabled={
                    loading || discount <= 0 || selectedProducts.length === 0
                  }
                  className='group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 py-6 text-base font-semibold rounded-xl'
                >
                  <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                  <div className='relative flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='h-5 w-5' />
                      {loading ? 'Applying...' : 'Apply to Selected'}
                    </div>
                    <Badge className='bg-white/20 text-white border-0'>
                      {selectedProducts.length} products
                    </Badge>
                  </div>
                </Button>

                <Button
                  onClick={applyDiscountToCategory}
                  disabled={loading || discount <= 0 || !selectedCategory}
                  className='group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 py-6 text-base font-semibold rounded-xl'
                >
                  <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                  <div className='relative flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <Filter className='h-5 w-5' />
                      {loading ? 'Applying...' : 'Apply to Category'}
                    </div>
                    <Badge className='bg-white/20 text-white border-0 text-xs truncate max-w-[120px]'>
                      {selectedCategory || 'Select category'}
                    </Badge>
                  </div>
                </Button>

                <Button
                  onClick={applyDiscountToTag}
                  disabled={loading || discount <= 0 || !selectedTag}
                  className='group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 py-6 text-base font-semibold rounded-xl'
                >
                  <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                  <div className='relative flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <Tag className='h-5 w-5' />
                      {loading ? 'Applying...' : 'Apply to Tag'}
                    </div>
                    <Badge className='bg-white/20 text-white border-0 text-xs truncate max-w-[120px]'>
                      {selectedTag
                        ? tags.find((t) => t._id === selectedTag)?.name
                        : 'Select tag'}
                    </Badge>
                  </div>
                </Button>
              </div>
            </div>

            {/* Remove Discount Actions */}
            <div className='mb-8'>
              <h4 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2'>
                <Trash2 className='h-5 w-5 text-red-500' />
                Remove Discounts
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Button
                  onClick={removeDiscount}
                  disabled={loading || selectedProducts.length === 0}
                  className='group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 py-6 text-base font-semibold rounded-xl'
                >
                  <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                  <div className='relative flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <XCircle className='h-5 w-5' />
                      {loading ? 'Removing...' : 'Remove from Selected'}
                    </div>
                    <Badge className='bg-white/20 text-white border-0'>
                      {selectedProducts.length} products
                    </Badge>
                  </div>
                </Button>

                <Button
                  onClick={removeDiscountFromCategory}
                  disabled={loading || !selectedCategory}
                  className='group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 py-6 text-base font-semibold rounded-xl'
                >
                  <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                  <div className='relative flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <Filter className='h-5 w-5' />
                      {loading ? 'Removing...' : 'Remove from Category'}
                    </div>
                    <Badge className='bg-white/20 text-white border-0 text-xs truncate max-w-[120px]'>
                      {selectedCategory || 'Select category'}
                    </Badge>
                  </div>
                </Button>

                <Button
                  onClick={removeDiscountFromTag}
                  disabled={loading || !selectedTag}
                  className='group relative overflow-hidden bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 py-6 text-base font-semibold rounded-xl'
                >
                  <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                  <div className='relative flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <Tag className='h-5 w-5' />
                      {loading ? 'Removing...' : 'Remove from Tag'}
                    </div>
                    <Badge className='bg-white/20 text-white border-0 text-xs truncate max-w-[120px]'>
                      {selectedTag
                        ? tags.find((t) => t._id === selectedTag)?.name
                        : 'Select tag'}
                    </Badge>
                  </div>
                </Button>
              </div>
            </div>

            {loading && (
              <div className='mt-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-800/30 rounded-xl'>
                <div className='flex items-center gap-3 text-amber-700 dark:text-amber-400'>
                  <div className='w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin' />
                  <span className='font-medium'>
                    Processing discount operation...
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
