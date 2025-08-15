'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createOrder } from '@/lib/actions/order.actions'
import {
  calculateFutureDate,
  formatDateTime,
  timeUntilMidnight,
} from '@/lib/utils'
import { ShippingAddressSchema } from '@/lib/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { TrashIcon } from 'lucide-react'
import CheckoutFooter from './checkout-footer'
import { ShippingAddress } from '@/types'
import useIsMounted from '@/hooks/use-is-mounted'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import ProductPrice from '@/components/shared/product/product-price'
import { useTranslations } from 'next-intl'
import {
  validateCartClientSide,
  getInvalidQuantityItems,
} from '@/lib/cart-validation-client'

const shippingAddressDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        fullName: 'Basir',
        street: '1911, 65 Sherbrooke Est',
        city: 'Montreal',
        province: 'Quebec',
        phone: '4181234567',
        postalCode: 'H2X 1C4',
        country: 'Canada',
      }
    : {
        fullName: '',
        street: '',
        city: '',
        province: '',
        phone: '',
        postalCode: '',
        country: '',
      }

const CheckoutForm = () => {
  const t = useTranslations('Checkout')
  const tCart = useTranslations('Cart')
  const { toast } = useToast()
  const router = useRouter()
  const {
    setting: { defaultPaymentMethod, availableDeliveryDates },
  } = useSettingStore()

  const {
    cart: {
      items,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      shippingAddress,
      deliveryDateIndex,
      paymentMethod = defaultPaymentMethod,
    },
    setShippingAddress,
    setPaymentMethod,
    updateItem,
    removeItem,
    setDeliveryDateIndex,
    refreshCartStock,
  } = useCartStore()
  const isMounted = useIsMounted()
  const [isCartRefreshing, setIsCartRefreshing] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  })
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = (values) => {
    setShippingAddress(values)
    setIsAddressSelected(true)
  }

  useEffect(() => {
    if (!isMounted || !shippingAddress) return
    shippingAddressForm.setValue('fullName', shippingAddress.fullName)
    shippingAddressForm.setValue('street', shippingAddress.street)
    shippingAddressForm.setValue('city', shippingAddress.city)
    shippingAddressForm.setValue('country', shippingAddress.country)
    shippingAddressForm.setValue('postalCode', shippingAddress.postalCode)
    shippingAddressForm.setValue('province', shippingAddress.province)
    shippingAddressForm.setValue('phone', shippingAddress.phone)
  }, [items, isMounted, router, shippingAddress, shippingAddressForm])

  useEffect(() => {
    const refreshStock = async () => {
      setIsCartRefreshing(true)
      try {
        await refreshCartStock()
      } catch (error) {
        console.warn('Failed to refresh cart stock:', error)
      } finally {
        setIsCartRefreshing(false)
        setHasInitialized(true)
      }
    }

    if (isMounted) {
      refreshStock()
    }
  }, [refreshCartStock, isMounted])

  // Important validation - check for critical cart issues
  const validateCartForCheckout = () => {
    const validationErrors = []

    // Check if cart is empty
    if (items.length === 0) {
      validationErrors.push(tCart('Your cart is empty'))
    }

    // Check for invalid quantities
    const invalidQuantityItems = getInvalidQuantityItems(items)
    if (invalidQuantityItems.length > 0) {
      validationErrors.push(tCart('Some items have invalid quantities'))
    }

    // Check for out of stock items
    const outOfStockItems = items.filter((item) => {
      const colorVariant = item.colors?.find((c) => c.color === item.color)
      const sizeVariant = colorVariant?.sizes?.find((s) => s.size === item.size)
      return !sizeVariant || sizeVariant.countInStock < item.quantity
    })

    if (outOfStockItems.length > 0) {
      validationErrors.push(
        t('Some items are no longer available in the requested quantity')
      )
    }

    // Check for price inconsistencies
    if (totalPrice <= 0) {
      validationErrors.push(t('Invalid order total'))
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    }
  }

  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false)
  const [isItemsSelected, setIsItemsSelected] = useState<boolean>(false)
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false)

  const handlePlaceOrder = async () => {
    // Important validation - check cart before placing order
    const cartValidation = validateCartForCheckout()

    if (!cartValidation.isValid) {
      toast({
        description: cartValidation.errors.join('; '),
        variant: 'destructive',
      })
      return
    }

    // Additional comprehensive cart validation
    const detailedCartValidation = validateCartClientSide({
      items,
      itemsPrice,
      totalPrice,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
    })

    if (!detailedCartValidation.isValid) {
      toast({
        description: detailedCartValidation.errors.join('; '),
        variant: 'destructive',
      })
      return
    }

    // Check required fields
    if (!shippingAddress) {
      toast({
        description: t('Shipping address is required'),
        variant: 'destructive',
      })
      return
    }

    if (!paymentMethod) {
      toast({
        description: t('Payment method is required'),
        variant: 'destructive',
      })
      return
    }

    if (deliveryDateIndex === undefined) {
      toast({
        description: t('Delivery date is required'),
        variant: 'destructive',
      })
      return
    }

    const res = await createOrder({
      items,
      shippingAddress,
      expectedDeliveryDate: calculateFutureDate(
        availableDeliveryDates[deliveryDateIndex!].daysToDeliver
      ),
      deliveryDateIndex,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    })
    if (!res.success) {
      toast({
        description: res.message,
        variant: 'destructive',
      })
    } else {
      toast({
        description: res.message,
        variant: 'default',
      })

      // For Cash On Delivery, redirect to order confirmation instead of payment
      if (paymentMethod === 'Cash On Delivery') {
        router.push(`/account/orders/${res.data?.orderId}`)
      } else {
        router.push(`/checkout/${res.data?.orderId}`)
      }
    }
  }
  const handleSelectPaymentMethod = async () => {
    // Validate cart before proceeding to payment
    const cartValidation = validateCartForCheckout()

    if (!cartValidation.isValid) {
      toast({
        description: cartValidation.errors.join('; '),
        variant: 'destructive',
      })
      return
    }

    // Just set the payment method as selected
    setIsAddressSelected(true)
    setIsItemsSelected(true)
    setIsPaymentMethodSelected(true)
  }
  const handleSelectItemsAndShipping = () => {
    // Validate cart before proceeding to next step
    const cartValidation = validateCartForCheckout()

    if (!cartValidation.isValid) {
      toast({
        description: cartValidation.errors.join('; '),
        variant: 'destructive',
      })
      return
    }

    setIsAddressSelected(true)
    setIsItemsSelected(true)
  }
  const handleSelectShippingAddress = () => {
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)()
  }
  const CheckoutSummary = () => (
    <div className='bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:bg-gray-800/70 dark:border-gray-700/50 shadow-sm overflow-hidden'>
      <div className='p-6'>
        {!isAddressSelected && (
          <div className='border-b border-gray-200/50 dark:border-gray-700/50 pb-6 mb-6'>
            <Button
              className='w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold py-3 transition-all duration-200 shadow-md hover:shadow-lg'
              onClick={handleSelectShippingAddress}
            >
              {t('shipToThisAddress')}
            </Button>
            <p className='text-xs text-center text-muted-foreground mt-3 font-medium'>
              {t('chooseShippingAddressFirst')}
            </p>
          </div>
        )}
        {isAddressSelected && !isItemsSelected && (
          <div className='border-b border-gray-200/50 dark:border-gray-700/50 pb-6 mb-6'>
            <Button
              className='w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold py-3 transition-all duration-200 shadow-md hover:shadow-lg'
              onClick={handleSelectItemsAndShipping}
              disabled={items.some((it) => it.quantity === 0)}
            >
              {t('continueToItems')}
            </Button>
            <p className='text-xs text-center text-muted-foreground mt-3 font-medium'>
              {t('reviewItemsAndShipping')}
            </p>
          </div>
        )}
        {isItemsSelected && !isPaymentMethodSelected && (
          <div className='border-b border-gray-200/50 dark:border-gray-700/50 pb-6 mb-6'>
            <Button
              className='w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold py-3 transition-all duration-200 shadow-md hover:shadow-lg'
              onClick={handleSelectPaymentMethod}
              disabled={items.some((it) => it.quantity === 0)}
            >
              {t('continueToPayment')}
            </Button>
            <p className='text-xs text-center text-muted-foreground mt-3 font-medium'>
              {t('choosePaymentMethodToContinue')}
            </p>
          </div>
        )}
        {isPaymentMethodSelected && isAddressSelected && isItemsSelected && (
          <div className='border-b border-gray-200/50 dark:border-gray-700/50 pb-6 mb-6'>
            <Button
              onClick={handlePlaceOrder}
              className='w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 transition-all duration-200 shadow-md hover:shadow-lg text-lg'
              disabled={items.some((it) => it.quantity === 0)}
            >
              🛒 {t('placeYourOrder')}
            </Button>
          </div>
        )}

        {/* Order Summary */}
        <div className='space-y-4'>
          <div className='text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200/50 dark:border-gray-700/50 pb-3'>
            {t('orderSummary')}
          </div>
          <div className='space-y-3'>
            <div className='flex justify-between items-center py-2'>
              <span className='text-muted-foreground'>{t('items')}:</span>
              <span className='font-semibold'>
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className='flex justify-between items-center py-2'>
              <span className='text-muted-foreground'>
                {t('shippingHandling')}:
              </span>
              <span className='font-semibold'>
                {shippingPrice === undefined ? (
                  <span className='text-muted-foreground'>--</span>
                ) : shippingPrice === 0 ? (
                  <span className='text-green-600 dark:text-green-400 font-semibold'>
                    {t('free')}
                  </span>
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between items-center py-2'>
              <span className='text-muted-foreground'>{t('tax')}:</span>
              <span className='font-semibold'>
                {taxPrice === undefined ? (
                  <span className='text-muted-foreground'>--</span>
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className='border-t border-gray-200/50 dark:border-gray-700/50 pt-4 mt-4'>
              <div className='flex justify-between items-center'>
                <span className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                  {t('orderTotal')}:
                </span>
                <span className='text-xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent'>
                  <ProductPrice price={totalPrice} plain />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className='bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-700/50 min-h-screen'>
      {!isMounted || isCartRefreshing || !hasInitialized ? (
        <div className='flex justify-center items-center py-16'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-3 border-primary mx-auto mb-4'></div>
            <p className='text-lg text-muted-foreground font-medium'>
              {t('Loading checkout')}
            </p>
          </div>
        </div>
      ) : (
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Main Checkout Content */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Progress Indicator */}
              <div className='bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:bg-gray-800/70 dark:border-gray-700/50 p-6 shadow-sm'>
                <div className='flex items-center space-x-4'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      isAddressSelected
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`flex-1 h-1 rounded transition-all ${
                      isItemsSelected
                        ? 'bg-green-500'
                        : isAddressSelected
                          ? 'bg-primary'
                          : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      isItemsSelected
                        ? 'bg-green-500 text-white'
                        : isAddressSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    2
                  </div>
                  <div
                    className={`flex-1 h-1 rounded transition-all ${
                      isPaymentMethodSelected
                        ? 'bg-green-500'
                        : isItemsSelected
                          ? 'bg-primary'
                          : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      isPaymentMethodSelected
                        ? 'bg-green-500 text-white'
                        : isItemsSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    3
                  </div>
                </div>
                <div className='flex justify-between mt-3 text-sm font-medium'>
                  <span
                    className={
                      isAddressSelected
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-primary'
                    }
                  >
                    Shipping Address
                  </span>
                  <span
                    className={
                      isItemsSelected
                        ? 'text-green-600 dark:text-green-400'
                        : isAddressSelected
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    }
                  >
                    Review Items
                  </span>
                  <span
                    className={
                      isPaymentMethodSelected
                        ? 'text-green-600 dark:text-green-400'
                        : isItemsSelected
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    }
                  >
                    Payment
                  </span>
                </div>
              </div>
              {/* Shipping Address Section */}
              <div className='bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:bg-gray-800/70 dark:border-gray-700/50 shadow-sm overflow-hidden'>
                {isAddressSelected && shippingAddress ? (
                  <div className='p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 rounded-full bg-green-500 flex items-center justify-center'>
                          <span className='text-white font-semibold text-sm'>
                            ✓
                          </span>
                        </div>
                        <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                          {t('shippingAddress')}
                        </h2>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        className='rounded-lg'
                        onClick={() => {
                          setIsAddressSelected(false)
                          setIsItemsSelected(false)
                          setIsPaymentMethodSelected(false)
                        }}
                      >
                        {t('change')}
                      </Button>
                    </div>
                    <div className='bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4'>
                      <div className='text-gray-900 dark:text-gray-100'>
                        <p className='font-semibold'>
                          {shippingAddress.fullName}
                        </p>
                        <p className='text-muted-foreground'>
                          {shippingAddress.street}
                        </p>
                        <p className='text-muted-foreground'>
                          {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}`}
                        </p>
                        <p className='text-muted-foreground'>
                          {shippingAddress.country}
                        </p>
                        <p className='text-muted-foreground'>
                          {shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='p-6'>
                    <div className='flex items-center space-x-3 mb-6'>
                      <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center'>
                        <span className='text-primary-foreground font-semibold text-sm'>
                          1
                        </span>
                      </div>
                      <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                        {t('enterShippingAddress')}
                      </h2>
                    </div>
                    <Form {...shippingAddressForm}>
                      <form
                        method='post'
                        onSubmit={shippingAddressForm.handleSubmit(
                          onSubmitShippingAddress
                        )}
                        className='space-y-6'
                      >
                        <div className='bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4'>
                          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
                            {t('yourAddress')}
                          </h3>

                          <div className='flex flex-col gap-5 md:flex-row'>
                            <FormField
                              control={shippingAddressForm.control}
                              name='fullName'
                              render={({ field }) => (
                                <FormItem className='w-full'>
                                  <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                                    {t('fullName')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('enterFullName')}
                                      className='rounded-xl border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <FormField
                              control={shippingAddressForm.control}
                              name='street'
                              render={({ field }) => (
                                <FormItem className='w-full'>
                                  <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                                    {t('address')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('enterAddress')}
                                      className='rounded-xl border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className='flex flex-col gap-5 md:flex-row'>
                            <FormField
                              control={shippingAddressForm.control}
                              name='city'
                              render={({ field }) => (
                                <FormItem className='w-full'>
                                  <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                                    {t('city')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('enterCity')}
                                      className='rounded-xl border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={shippingAddressForm.control}
                              name='province'
                              render={({ field }) => (
                                <FormItem className='w-full'>
                                  <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                                    {t('province')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('enterProvince')}
                                      className='rounded-xl border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={shippingAddressForm.control}
                              name='country'
                              render={({ field }) => (
                                <FormItem className='w-full'>
                                  <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                                    {t('country')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('enterCountry')}
                                      className='rounded-xl border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className='flex flex-col gap-5 md:flex-row'>
                            <FormField
                              control={shippingAddressForm.control}
                              name='postalCode'
                              render={({ field }) => (
                                <FormItem className='w-full'>
                                  <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                                    {t('postalCode')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('enterPostalCode')}
                                      className='rounded-xl border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={shippingAddressForm.control}
                              name='phone'
                              render={({ field }) => (
                                <FormItem className='w-full'>
                                  <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                                    {t('phoneNumber')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('enterPhoneNumber')}
                                      className='rounded-xl border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className='pt-6'>
                          <Button
                            type='submit'
                            className='w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold py-3 transition-all duration-200 shadow-md hover:shadow-lg'
                          >
                            {t('shipToThisAddress')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
            </div>
            {/* items and delivery date */}
            <div className='border-y'>
              {isItemsSelected && deliveryDateIndex != undefined ? (
                <div className='grid  grid-cols-1 md:grid-cols-12  my-3 pb-3'>
                  <div className='flex text-lg font-bold  col-span-5'>
                    <span className='w-8'>2 </span>
                    <span>{t('itemsAndShipping')}</span>
                  </div>
                  <div className='col-span-5'>
                    <p>
                      {t('deliveryDate')}:{' '}
                      {
                        formatDateTime(
                          calculateFutureDate(
                            availableDeliveryDates[deliveryDateIndex]
                              .daysToDeliver
                          )
                        ).dateOnly
                      }
                    </p>
                    {/* Product List */}
                    <div className='space-y-3 mb-4'>
                      {items.map((item, index) => (
                        <div
                          key={`${item.slug}-${index}`}
                          className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
                        >
                          {/* Product Image */}
                          <div className='flex-shrink-0'>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={48}
                              height={48}
                              className='rounded-md object-cover border border-gray-200 dark:border-gray-600'
                            />
                          </div>

                          {/* Product Details */}
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <h6 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                                  {item.name}
                                </h6>
                                <div className='flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1'>
                                  <span>Qty: {item.quantity}</span>
                                  {item.color && (
                                    <span className='flex items-center'>
                                      <span
                                        className='w-2 h-2 rounded-full border border-gray-300 mr-1'
                                        style={{
                                          backgroundColor:
                                            item.color.toLowerCase(),
                                        }}
                                      />
                                      {item.color}
                                    </span>
                                  )}
                                  {item.size && <span>Size: {item.size}</span>}
                                </div>
                              </div>
                              <div className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                                <ProductPrice price={item.price} plain />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='col-span-2'>
                    <Button
                      variant={'outline'}
                      onClick={() => {
                        setIsItemsSelected(false)
                        setIsPaymentMethodSelected(false)
                      }}
                    >
                      {t('change')}
                    </Button>
                  </div>
                </div>
              ) : isAddressSelected ? (
                <>
                  <div className='flex text-primary  text-lg font-bold my-2'>
                    <span className='w-8'>2 </span>
                    <span>{t('reviewItemsAndShipping')}</span>
                  </div>
                  <Card className='md:ml-8'>
                    <CardContent className='p-4'>
                      <p className='mb-2'>
                        <span className='text-lg font-bold text-green-700'>
                          {t('arriving')}{' '}
                          {
                            formatDateTime(
                              calculateFutureDate(
                                availableDeliveryDates[deliveryDateIndex!]
                                  .daysToDeliver
                              )
                            ).dateOnly
                          }
                        </span>{' '}
                        {t('orderInNext', {
                          hours: timeUntilMidnight().hours,
                          minutes: timeUntilMidnight().minutes,
                        })}
                      </p>
                      <div className='grid md:grid-cols-2 gap-6'>
                        <div>
                          {items.map((item, index) => (
                            <div
                              key={`${item.slug}-${index}`}
                              className='flex gap-4 py-2'
                            >
                              <div className='relative w-16 h-16'>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes='20vw'
                                  style={{
                                    objectFit: 'contain',
                                  }}
                                />
                              </div>

                              <div className='flex-1'>
                                <p className='font-semibold'>
                                  {item.name}, {item.color}, {item.size}
                                </p>
                                <p className='font-bold'>
                                  <ProductPrice price={item.price} plain />
                                </p>

                                <div className='flex items-center gap-2 mt-2'>
                                  <Select
                                    value={item.quantity.toString()}
                                    onValueChange={(value) => {
                                      const newQuantity = Number(value)
                                      if (newQuantity === 0) {
                                        removeItem(item) // Remove the item if quantity is 0
                                      } else {
                                        updateItem(item, newQuantity)
                                      }
                                    }}
                                  >
                                    <SelectTrigger className='w-24'>
                                      <SelectValue>
                                        {t('qty', { quantity: item.quantity })}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent position='popper'>
                                      {Array.from({
                                        length:
                                          item.colors
                                            .find((c) => c.color === item.color)
                                            ?.sizes.find(
                                              (s) => s.size === item.size
                                            )?.countInStock || 0,
                                      }).map((_, i) => (
                                        <SelectItem
                                          key={i + 1}
                                          value={`${i + 1}`}
                                        >
                                          {i + 1}
                                        </SelectItem>
                                      ))}
                                      <SelectItem value='0'>
                                        {t('delete')}
                                      </SelectItem>{' '}
                                      {/* Add an option to remove */}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
                                    onClick={() => removeItem(item)}
                                    title={'0'}
                                  >
                                    <TrashIcon className='w-4 h-4' />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className=' font-bold'>
                            <p className='mb-2'>{t('chooseShippingSpeed')}:</p>

                            <ul>
                              <RadioGroup
                                value={
                                  availableDeliveryDates[deliveryDateIndex!]
                                    .name
                                }
                                onValueChange={(value) =>
                                  setDeliveryDateIndex(
                                    availableDeliveryDates.findIndex(
                                      (address) => address.name === value
                                    )!
                                  )
                                }
                              >
                                {availableDeliveryDates.map((dd) => (
                                  <div key={dd.name} className='flex'>
                                    <RadioGroupItem
                                      value={dd.name}
                                      id={`address-${dd.name}`}
                                    />
                                    <Label
                                      className='pl-2 space-y-2 cursor-pointer'
                                      htmlFor={`address-${dd.name}`}
                                    >
                                      <div className='text-green-700 font-semibold'>
                                        {
                                          formatDateTime(
                                            calculateFutureDate(
                                              dd.daysToDeliver
                                            )
                                          ).dateOnly
                                        }
                                      </div>
                                      <div>
                                        {(dd.freeShippingMinPrice > 0 &&
                                        itemsPrice >= dd.freeShippingMinPrice
                                          ? 0
                                          : dd.shippingPrice) === 0 ? (
                                          t('freeShipping')
                                        ) : (
                                          <ProductPrice
                                            price={dd.shippingPrice}
                                            plain
                                          />
                                        )}
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className='p-4'>
                      <Button
                        onClick={handleSelectItemsAndShipping}
                        className='rounded-full font-bold'
                        disabled={items.some((it) => it.quantity === 0)}
                      >
                        {t('continueToItems')}
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              ) : (
                <div className='flex text-muted-foreground text-lg font-bold my-4 py-3'>
                  <span className='w-8'>2 </span>
                  <span>{t('itemsAndShipping')}</span>
                </div>
              )}
            </div>
            {/* payment method */}
            <div>
              {isPaymentMethodSelected && paymentMethod ? (
                <div className='grid  grid-cols-1 md:grid-cols-12  my-3 pb-3'>
                  <div className='flex text-lg font-bold  col-span-5'>
                    <span className='w-8'>3 </span>
                    <span>{t('paymentMethod')}</span>
                  </div>
                  <div className='col-span-5 '>
                    <p>{paymentMethod}</p>
                  </div>
                  <div className='col-span-2'>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setIsPaymentMethodSelected(false)
                      }}
                    >
                      {t('change')}
                    </Button>
                  </div>
                </div>
              ) : isItemsSelected ? (
                <>
                  <div className='flex text-primary text-lg font-bold my-2'>
                    <span className='w-8'>3 </span>
                    <span>{t('choosePaymentMethod')}</span>
                  </div>
                  <Card className='md:ml-8 my-4'>
                    <CardContent className='p-4'>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value)}
                      >
                        <div className='flex items-center py-1'>
                          <RadioGroupItem
                            value='Pay Here'
                            id='payment-pay-here'
                          />
                          <Label
                            className='font-bold pl-2 cursor-pointer'
                            htmlFor='payment-pay-here'
                          >
                            {t('payHere')}
                          </Label>
                        </div>
                        <div className='flex items-center py-1'>
                          <RadioGroupItem
                            value='Cash On Delivery'
                            id='payment-cash-delivery'
                          />
                          <Label
                            className='font-bold pl-2 cursor-pointer'
                            htmlFor='payment-cash-delivery'
                          >
                            {t('payInStoreCash')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                    <CardFooter className='p-4'>
                      <Button
                        onClick={handleSelectPaymentMethod}
                        className='rounded-full font-bold'
                      >
                        {t('useThisPaymentMethod')}
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              ) : (
                <div className='flex text-muted-foreground text-lg font-bold my-4 py-3'>
                  <span className='w-8'>3 </span>
                  <span>{t('choosePaymentMethod')}</span>
                </div>
              )}
            </div>
            {isPaymentMethodSelected &&
              isAddressSelected &&
              isItemsSelected && (
                <div className='mt-6'>
                  <div className='block md:hidden'>
                    <CheckoutSummary />
                  </div>

                  <Card className='hidden md:block '>
                    <CardContent className='p-4 flex flex-col md:flex-row justify-between items-center gap-3'>
                      <Button
                        onClick={handlePlaceOrder}
                        className='rounded-full'
                        disabled={items.some((it) => it.quantity === 0)}
                      >
                        {t('placeYourOrder')}
                      </Button>
                      <div className='flex-1'>
                        <p className='font-bold text-lg'>
                          {t('orderTotal')}:{' '}
                          <ProductPrice price={totalPrice} plain />
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            <CheckoutFooter />
          </div>

          {/* Sidebar - Order Summary */}
          <div className='lg:col-span-1'>
            <div className='sticky top-8'>
              <CheckoutSummary />
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
export default CheckoutForm
