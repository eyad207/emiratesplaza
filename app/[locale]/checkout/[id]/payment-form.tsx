'use client'

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  approvePayPalOrder,
  createPayPalOrder,
  createVippsOrder,
} from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.model'
import { formatDateTime } from '@/lib/utils'

import CheckoutFooter from '../checkout-footer'
import { redirect, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ProductPrice from '@/components/shared/product/product-price'
import StripeForm from './stripe-form'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import useStripePayment from '@/hooks/use-stripe-payment'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)
export default function OrderDetailsForm({
  order,
  paypalClientId,
}: {
  order: IOrder
  paypalClientId: string
  isAdmin: boolean
}) {
  const {
    setting: { currency },
  } = useSettingStore()
  const router = useRouter()
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order
  const { toast } = useToast()

  // Use the Stripe payment hook for client-side payment intent creation
  const {
    clientSecret: stripeClientSecret,
    convertedPrice,
    loading: stripeLoading,
  } = useStripePayment(order._id, currency)

  if (isPaid) {
    redirect(`/account/orders/${order._id}`)
  }
  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()
    let status = ''
    if (isPending) {
      status = 'Loading PayPal...'
    } else if (isRejected) {
      status = 'Error in loading PayPal.'
    }
    return status
  }
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order._id, currency)
    if (!res.success)
      return toast({
        description: res.message,
        variant: 'destructive',
      })
    return res.data
  }
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order._id, data)
    const { clearCart } = useCartStore.getState()
    if (res.success) {
      clearCart()
      toast({
        description: res.message,
        variant: res.success ? 'default' : 'destructive',
      })
      router.push(`/account/orders/${order._id}`)
    }
  }

  const handleCreateVippsOrder = async () => {
    const res = await createVippsOrder(order._id, order.totalPrice)
    if (!res.success)
      return toast({
        description: res.message,
        variant: 'destructive',
      })
    window.location.href = res.data.url // Redirect to Vipps payment page
  }

  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4'>
        <div>
          <div className='text-lg font-bold'>Order Summary</div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Items:</span>
              <span>
                {' '}
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping & Handling:</span>
              <span>
                {shippingPrice === undefined ? (
                  '--'
                ) : shippingPrice === 0 ? (
                  'FREE'
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span> Tax:</span>
              <span>
                {taxPrice === undefined ? (
                  '--'
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between  pt-1 font-bold text-lg'>
              <span> Order Total:</span>
              <span>
                {' '}
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>
            <ul>
              {items.map((item, index) => (
                <li key={`${item.slug}-${index}`}>
                  {item.name} x {item.quantity} = {item.price}
                </li>
              ))}
            </ul>{' '}
            {!isPaid && paymentMethod === 'PayPal' && (
              <div>
                <PayPalScriptProvider
                  options={{
                    clientId: paypalClientId,
                    currency: 'NOK',
                    intent: 'capture',
                    components: 'buttons',
                  }}
                >
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                    onError={() => {
                      toast({
                        description:
                          'PayPal payment failed. Please try again or use a different payment method.',
                        variant: 'destructive',
                      })
                    }}
                    onCancel={() => {
                      toast({
                        description: 'PayPal payment was cancelled.',
                        variant: 'default',
                      })
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}
            {!isPaid && paymentMethod === 'Stripe' && (
              <div>
                {stripeLoading ? (
                  <div className='text-center p-4'>Loading payment...</div>
                ) : stripeClientSecret ? (
                  <Elements
                    options={{
                      clientSecret: stripeClientSecret,
                    }}
                    stripe={stripePromise}
                  >
                    <StripeForm
                      priceInCents={Math.round(order.totalPrice * 100)}
                      orderId={order._id}
                      convertedPrice={convertedPrice || undefined}
                    />
                  </Elements>
                ) : (
                  <div className='text-center p-4 text-destructive'>
                    Failed to initialize payment. Please refresh and try again.
                  </div>
                )}
              </div>
            )}
            {!isPaid && paymentMethod === 'Vipps' && (
              <Button
                className='w-full rounded-full'
                onClick={handleCreateVippsOrder}
              >
                Pay with Vipps
              </Button>
            )}
            {!isPaid && paymentMethod === 'Cash On Delivery' && (
              <Button
                className='w-full rounded-full'
                onClick={() => router.push(`/account/orders/${order._id}`)}
              >
                View Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className='max-w-6xl mx-auto'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          {/* Shipping Address */}
          <div>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>Shipping Address</span>
              </div>
              <div className='col-span-2'>
                <p>
                  {shippingAddress.fullName} <br />
                  {shippingAddress.street} <br />
                  {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                </p>
              </div>
            </div>
          </div>

          {/* payment method */}
          <div className='border-y'>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>Payment Method</span>
              </div>
              <div className='col-span-2'>
                <p>{paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-3 my-3 pb-3'>
            <div className='flex text-lg font-bold'>
              <span>Items and shipping</span>
            </div>
            <div className='col-span-2'>
              <p>
                Delivery date:
                {formatDateTime(expectedDeliveryDate).dateOnly}
              </p>
              <ul>
                {items.map((item) => (
                  <li key={item.slug}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='block md:hidden'>
            <CheckoutSummary />
          </div>

          <CheckoutFooter />
        </div>
        <div className='hidden md:block'>
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}
