'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

export default function DiscountsPage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [discount, setDiscount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [discountedPrices, setDiscountedPrices] = useState<
    Record<string, number>
  >({})

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

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const applyDiscount = async () => {
    if (selectedProducts.length === 0 || discount <= 0) {
      toast({
        title: 'Warning',
        description: 'Please select products and enter a valid discount.',
        variant: 'default',
      })
      return
    }

    setLoading(true)
    try {
      await applyDiscountToProducts({ productIds: selectedProducts, discount })
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

  return (
    <div className='p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6'>
        <h1 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100'>
          Manage Discounts
        </h1>

        {/* Search Section */}
        <div className='mb-4'>
          <Input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search products by name'
            className='w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
          />
        </div>

        {/* Products Table */}
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Original Price</TableHead>
                <TableHead>Price After Discount</TableHead>
                <TableHead>Discount Amount</TableHead>
                <TableHead>Discount Percentage</TableHead>
                <TableHead>Category</TableHead>
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
                      : undefined

                return (
                  <TableRow
                    key={product._id}
                    className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product._id)}
                        onCheckedChange={() =>
                          toggleProductSelection(product._id)
                        }
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {productDiscountedPrice !== undefined
                        ? `$${productDiscountedPrice.toFixed(2)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {productDiscountedPrice !== undefined
                        ? `$${(product.price - productDiscountedPrice).toFixed(
                            2
                          )}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {productDiscountedPrice !== undefined
                        ? `${(
                            ((product.price - productDiscountedPrice) /
                              product.price) *
                            100
                          ).toFixed(2)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                  </TableRow>
                )
              })}
              {products.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} className='text-center'>
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Discount Section */}
        <div className='mt-4 flex items-center gap-4'>
          <Input
            type='number'
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            placeholder='Enter discount percentage'
            className='w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
          />
          <Button
            onClick={applyDiscount}
            disabled={loading}
            className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Applying...' : 'Apply Discount'}
          </Button>
          <Button
            onClick={removeDiscount}
            disabled={loading}
            className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Removing...' : 'Remove Discount'}
          </Button>
        </div>
      </div>
    </div>
  )
}
