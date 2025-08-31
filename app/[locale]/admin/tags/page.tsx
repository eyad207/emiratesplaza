'use client'
import React, { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tag,
  Plus,
  Search,
  Package,
  Trash2,
  Save,
  X,
  Hash,
  Filter,
} from 'lucide-react'

export default function TagsPage() {
  const [tags, setTags] = useState<{ name: string; _id: string }[]>([])
  const [products, setProducts] = useState<{ name: string; _id: string }[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    async function fetchTags() {
      setLoading(true)
      try {
        const response = await fetch('/api/tags')
        const data = await response.json()
        if (data.success && Array.isArray(data.tags)) {
          setTags(data.tags)
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch tags',
            variant: 'destructive',
          })
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Error fetching tags',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchTags()
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/products?query=${searchQuery}&page=${page}&limit=15`
        )
        const data = await response.json()
        if (data.success && Array.isArray(data.products)) {
          setProducts((prev) =>
            page === 1 ? data.products : [...prev, ...data.products]
          )
          setTotalProducts(data.totalProducts)

          // Pre-select products if a tag is selected
          if (selectedTag) {
            const tagResponse = await fetch(`/api/products?tag=${selectedTag}`)
            const tagData = await tagResponse.json()
            if (tagData.success && Array.isArray(tagData.products)) {
              const productIdsInTag: string[] = tagData.products.map(
                (p: { _id: string }) => p._id
              )
              setSelectedProducts(productIdsInTag)
            }
          }
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch products',
            variant: 'destructive',
          })
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Error fetching products',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchQuery, page, selectedTag])

  const handleTagSelection = (tagId: string) => {
    setSelectedTag(tagId)
    setPage(1) // Reset to the first page when a tag is selected
  }

  const addTag = async () => {
    if (newTag.trim()) {
      setLoading(true)
      try {
        const response = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newTag }),
        })
        const data = await response.json()
        if (data.success) {
          setTags((prev) => [...prev, { name: newTag, _id: data._id }])
          setNewTag('')
          toast({
            title: 'Success',
            description: 'Tag added successfully',
            variant: 'default',
          })
        } else {
          toast({
            title: 'Error',
            description: data.message,
            variant: 'destructive',
          })
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Error adding tag',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const deleteTag = async (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setLoading(true)
      try {
        const response = await fetch(`/api/tags?id=${tagId}`, {
          method: 'DELETE',
        })
        const data = await response.json()
        if (data.success) {
          setTags((prev) => prev.filter((t) => t._id !== tagId))
          toast({
            title: 'Success',
            description: 'Tag deleted successfully',
            variant: 'default',
          })
        } else {
          toast({
            title: 'Error',
            description: data.message,
            variant: 'destructive',
          })
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Error deleting tag',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const assignProductsToTag = async () => {
    if (!selectedTag || selectedProducts.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select a tag and at least one product.',
        variant: 'default',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tags/assign-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagId: selectedTag,
          productIds: selectedProducts,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to assign products to tag')
      }

      const data = await response.json()
      toast({ title: 'Success', description: data.message, variant: 'default' })
      setSelectedProducts([])
      setSelectedTag(null)
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: 'An error occurred',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const removeProductsFromTag = async () => {
    if (!selectedTag || selectedProducts.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select a tag and at least one product.',
        variant: 'default',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tags/remove-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagId: selectedTag,
          productIds: selectedProducts,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Failed to remove products from tag'
        )
      }

      const data = await response.json()
      toast({ title: 'Success', description: data.message, variant: 'default' })
      setSelectedProducts([])
      setSelectedTag(null)
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: 'An error occurred',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <div className='relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
      {/* Premium Background Elements */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-blue-100/20 dark:from-purple-900/10 dark:to-blue-900/10' />

      <div className='relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl'>
        {/* Enhanced Header */}
        <div className='mb-8'>
          <div className='flex items-start gap-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur-md opacity-30' />
              <div className='relative p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-xl'>
                <Tag className='h-8 w-8 text-white' />
              </div>
            </div>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'>
                Tag Management
              </h1>
              <p className='text-lg text-slate-600 dark:text-slate-400 mt-2'>
                Organize products with tags and manage tag assignments
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent' />
            <CardContent className='relative p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide'>
                    Total Tags
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {tags.length}
                  </p>
                </div>
                <div className='p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg'>
                  <Hash className='h-6 w-6 text-white' />
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
                    Total Products
                  </p>
                  <p className='text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2'>
                    {totalProducts}
                  </p>
                </div>
                <div className='p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg'>
                  <Package className='h-6 w-6 text-white' />
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
                  <Filter className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Tag Section */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 mb-8'>
          <div className='absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50' />
          <CardHeader className='relative pb-6'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg'>
                <Plus className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  Create New Tag
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  Add a new tag to organize your products
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <Input
                  type='text'
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder='Enter tag name...'
                  className='h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:shadow-md transition-all'
                />
              </div>
              <Button
                onClick={addTag}
                disabled={loading || !newTag.trim()}
                className='bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 rounded-xl font-semibold h-12'
              >
                <Plus className='h-5 w-5 mr-2' />
                {loading ? 'Adding...' : 'Add Tag'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags List */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 mb-8'>
          <div className='absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50' />
          <CardHeader className='relative pb-6'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg'>
                <Hash className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  Existing Tags
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  Click on a tag to select it for product assignment
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative'>
            {tags.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {tags.map((tag) => (
                  <div
                    key={tag._id}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedTag === tag._id
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md'
                    }`}
                    onClick={() => handleTagSelection(tag._id)}
                  >
                    <div className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <Tag
                            className={`h-5 w-5 ${
                              selectedTag === tag._id
                                ? 'text-orange-600'
                                : 'text-slate-500'
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              selectedTag === tag._id
                                ? 'text-orange-900 dark:text-orange-200'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {tag.name}
                          </span>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTag(tag._id)
                          }}
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Trash2 className='h-4 w-4 text-red-500' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <Tag className='h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                  No tags yet
                </h3>
                <p className='text-slate-500 dark:text-slate-400'>
                  Create your first tag to get started organizing products
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Assignment Section */}
        <Card className='relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50'>
          <div className='absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50' />
          <CardHeader className='relative pb-6'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl shadow-lg'>
                <Package className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                  Product Assignment
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  Search and assign products to the selected tag
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative space-y-6'>
            {/* Search Input */}
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400' />
              <Input
                type='text'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder='Search products by name...'
                className='pl-12 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:shadow-md transition-all'
              />
            </div>

            {/* Selected Tag Info */}
            {selectedTag && (
              <div className='bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4'>
                <div className='flex items-center gap-2'>
                  <Tag className='h-5 w-5 text-orange-600' />
                  <span className='font-semibold text-orange-900 dark:text-orange-200'>
                    Working with tag:{' '}
                    {tags.find((t) => t._id === selectedTag)?.name}
                  </span>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {products.length > 0 && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className={`group flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedProducts.includes(product._id)
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-green-300 dark:hover:border-green-600'
                      }`}
                    >
                      <input
                        type='checkbox'
                        id={product._id}
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className='w-5 h-5 text-green-500 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-green-500/20'
                      />
                      <label
                        htmlFor={product._id}
                        className='flex-1 cursor-pointer font-medium text-slate-900 dark:text-slate-100 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors'
                      >
                        {product.name}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {products.length < totalProducts && (
                  <div className='text-center'>
                    <Button
                      onClick={() => setPage((prev) => prev + 1)}
                      variant='outline'
                      className='border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 px-8 py-3 rounded-xl'
                    >
                      Show More Products
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700'>
              <Button
                onClick={assignProductsToTag}
                disabled={
                  loading || !selectedTag || selectedProducts.length === 0
                }
                className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 rounded-xl font-semibold'
              >
                <Save className='h-5 w-5 mr-2' />
                {loading ? 'Assigning...' : 'Assign to Tag'}
              </Button>
              <Button
                onClick={removeProductsFromTag}
                disabled={
                  loading || !selectedTag || selectedProducts.length === 0
                }
                variant='destructive'
                className='bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 rounded-xl font-semibold'
              >
                <X className='h-5 w-5 mr-2' />
                {loading ? 'Removing...' : 'Remove from Tag'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading Overlay */}
        {loading && (
          <div className='fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl'>
              <div className='flex items-center gap-3'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500' />
                <span className='font-medium text-slate-900 dark:text-slate-100'>
                  Loading....
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
