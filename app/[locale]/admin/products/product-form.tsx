'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createProduct, updateProduct } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { UploadButton } from '@/lib/uploadthing'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'
import { IProductInput } from '@/types'

const productDefaultValues: IProductInput = {
  name: '',
  slug: '',
  category: '',
  images: [],
  brand: '',
  description: '',
  price: 0,
  numReviews: 0,
  avgRating: 0,
  numSales: 0,
  isPublished: false,
  tags: [],
  colors: [],
  ratingDistribution: [],
  reviews: [],
}

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update'
  product?: IProduct
  productId?: string
}) => {
  const router = useRouter()
  const [availableTags, setAvailableTags] = useState<
    { name: string; _id: string }[]
  >([])

  useEffect(() => {
    async function fetchTags() {
      const response = await fetch('/api/tags')
      const data = await response.json()
      if (data.success) setAvailableTags(data.tags)
    }
    fetchTags()
  }, [])

  const form = useForm<IProductInput>({
    resolver:
      type === 'Update'
        ? zodResolver(ProductUpdateSchema)
        : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  })

  const { toast } = useToast()
  async function onSubmit(values: IProductInput) {
    if (type === 'Create') {
      const res = await createProduct(values)
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        router.push(`/admin/products`)
      }
    }
    if (type === 'Update') {
      if (!productId) {
        router.push(`/admin/products`)
        return
      }
      const res = await updateProduct({ ...values, _id: productId })
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        router.push(`/admin/products`)
      }
    }
  }

  const images = form.watch('images')

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control: form.control,
    name: 'colors',
  })

  return (
    <Form {...form}>
      <form
        method='post'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-10 max-w-4xl mx-auto'
      >
        {/* General Info */}
        <div className='space-y-5'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
            General Information
          </h2>
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter product name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='Enter product slug'
                        className='pl-8'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => {
                          form.setValue('slug', toSlug(form.getValues('name')))
                        }}
                        className='absolute right-2 mt-2 bg-slate-500 hover:bg-slate-600 text-white rounded-md p-1'
                      >
                        Generate
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter category' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter product brand' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Net Price (in $)</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product price' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Images */}
        <div className='space-y-5'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
            Images
          </h2>
          <FormField
            control={form.control}
            name='images'
            render={() => (
              <FormItem className='w-full'>
                <FormDescription>
                  First image is the main product image.
                </FormDescription>
                <Card>
                  <CardContent className='space-y-4 mt-2'>
                    <div className='flex flex-wrap gap-4'>
                      {images.map((image: string, index: number) => (
                        <div key={index} className='relative w-24 h-24'>
                          <Image
                            src={image}
                            alt='product image'
                            fill
                            className={`rounded border object-cover ${
                              index === 0 ? 'border-2 border-primary' : ''
                            }`}
                          />
                          {index === 0 && (
                            <span className='absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded'>
                              Main
                            </span>
                          )}
                          <button
                            type='button'
                            onClick={() => {
                              const updatedImages = images.filter(
                                (_, i) => i !== index
                              )
                              form.setValue('images', updatedImages)
                            }}
                            className='absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center'
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <UploadButton
                      endpoint='imageUploader'
                      onClientUploadComplete={(res: { url: string }[]) => {
                        const newImages =
                          images.length === 0
                            ? [res[0].url]
                            : [...images, res[0].url]
                        form.setValue('images', newImages)
                      }}
                      onUploadError={(error: Error) => {
                        toast({
                          variant: 'destructive',
                          description: `ERROR! ${error.message}`,
                        })
                      }}
                    />
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Colors and Sizes */}
        <div className='space-y-5'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
            Colors and Sizes
          </h2>
          {colorFields.map((colorField, colorIndex) => (
            <div
              key={colorField.id}
              className='border p-4 rounded space-y-4 bg-muted/10'
            >
              <div className='flex items-center gap-4'>
                <FormField
                  control={form.control}
                  name={`colors.${colorIndex}.color`}
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter color' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant='destructive'
                  onClick={() => removeColor(colorIndex)}
                >
                  Remove Color
                </Button>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {(form.watch(`colors.${colorIndex}.sizes`) || []).map(
                  (size, sizeIndex) => (
                    <div
                      key={sizeIndex}
                      className='border p-3 rounded bg-white dark:bg-zinc-800 space-y-2'
                    >
                      <FormField
                        control={form.control}
                        name={`colors.${colorIndex}.sizes.${sizeIndex}.size`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                              <Input placeholder='Enter size' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`colors.${colorIndex}.sizes.${sizeIndex}.countInStock`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Count In Stock</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='Enter count in stock'
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10)
                                  if (value >= 0) {
                                    field.onChange(value)
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                          const currentSizes = [
                            ...(form.getValues(`colors.${colorIndex}.sizes`) ||
                              []),
                          ]
                          currentSizes.splice(sizeIndex, 1)
                          form.setValue(
                            `colors.${colorIndex}.sizes`,
                            currentSizes
                          )
                        }}
                      >
                        Remove Size
                      </Button>
                    </div>
                  )
                )}
              </div>

              <Button
                type='button'
                onClick={() => {
                  const currentSizes = [
                    ...(form.getValues(`colors.${colorIndex}.sizes`) || []),
                  ]
                  currentSizes.push({ size: '', countInStock: 0 })
                  form.setValue(`colors.${colorIndex}.sizes`, currentSizes)
                }}
              >
                Add Size
              </Button>
            </div>
          ))}
          <Button
            type='button'
            onClick={() =>
              appendColor({ color: '', sizes: [{ size: '', countInStock: 0 }] })
            }
          >
            Add Color
          </Button>
        </div>

        {/* Tags */}
        <div className='space-y-5'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
            Tags
          </h2>
          <FormField
            control={form.control}
            name='tags'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='flex flex-wrap gap-3'>
                    {availableTags.map((tag) => (
                      <label
                        key={tag._id}
                        className='flex items-center space-x-2 bg-muted/20 px-2 py-1 rounded'
                      >
                        <Checkbox
                          checked={field.value.includes(tag._id)}
                          onCheckedChange={(checked) => {
                            const newTags = checked
                              ? [...field.value, tag._id]
                              : field.value.filter((t) => t !== tag._id)
                            field.onChange(newTags)
                          }}
                        />
                        <span>{tag.name}</span>
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <div className='space-y-5'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
            Description
          </h2>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Textarea
                    placeholder='Enter product description'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Publish Toggle */}
        <div className='space-y-5'>
          <FormField
            control={form.control}
            name='isPublished'
            render={({ field }) => (
              <FormItem className='flex items-center space-x-3'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Is Published?</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Submit */}
        <div>
          <Button
            type='submit'
            size='lg'
            disabled={form.formState.isSubmitting}
            className='w-full text-lg font-bold'
          >
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ProductForm
