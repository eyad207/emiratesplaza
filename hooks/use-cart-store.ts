import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Cart, OrderItem, ShippingAddress } from '@/types'
import { calcDeliveryDateAndPrice } from '@/lib/actions/order.actions'

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: undefined,
  shippingPrice: undefined,
  totalPrice: 0,
  paymentMethod: undefined,
  shippingAddress: undefined,
  deliveryDateIndex: undefined,
}

interface CartState {
  cart: Cart
  addItem: (
    item: OrderItem,
    quantity: number
  ) => Promise<{ success: boolean; message?: string; clientId?: string }>
  updateItem: (item: OrderItem, quantity: number) => Promise<void>
  removeItem: (item: OrderItem) => void
  clearCart: () => void
  setShippingAddress: (shippingAddress: ShippingAddress) => Promise<void>
  setPaymentMethod: (paymentMethod: string) => void
  setDeliveryDateIndex: (index: number) => Promise<void>
  refreshCartStock: () => Promise<void>
  refreshCartPrices: () => Promise<{
    hasChanges: boolean
    priceChanges: Array<{
      item: OrderItem
      oldPrice: number
      newPrice: number
      priceChange: number
      changeType: 'increase' | 'decrease'
    }>
  }>
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState,

      addItem: async (item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart
        const existItem = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )

        // Check stock availability
        const colorObj = item.colors.find((c) => c.color === item.color)
        const sizeObj = colorObj?.sizes.find((s) => s.size === item.size)

        if (!sizeObj) {
          return { success: false, message: 'Size not available' }
        }

        if (existItem) {
          // Check if adding to existing item would exceed stock
          if (sizeObj.countInStock < quantity + existItem.quantity) {
            return {
              success: false,
              message: 'You cant add it to cart, change color or size',
            }
          }
        } else {
          // Check if new item quantity exceeds stock
          if (sizeObj.countInStock < quantity) {
            return {
              success: false,
              message: 'You cant add it to cart, change color or size',
            }
          }
        }

        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product &&
              x.color === item.color &&
              x.size === item.size
                ? { ...existItem, quantity: existItem.quantity + quantity }
                : x
            )
          : [...items, { ...item, quantity }]

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        })

        const foundItem = updatedCartItems.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )

        if (!foundItem) {
          return { success: false, message: 'Item not found in cart' }
        }

        return { success: true, clientId: foundItem.clientId }
      },
      updateItem: async (item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart
        const exist = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )
        if (!exist) return

        let updatedCartItems
        if (quantity === 0) {
          // Remove the item if quantity is 0
          updatedCartItems = items.filter(
            (x) =>
              x.product !== item.product ||
              x.color !== item.color ||
              x.size !== item.size
          )
        } else {
          // Update the item quantity
          updatedCartItems = items.map((x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
              ? { ...exist, quantity: quantity }
              : x
          )
        }

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        })
      },
      removeItem: async (item: OrderItem) => {
        const { items, shippingAddress } = get().cart
        const updatedCartItems = items.filter(
          (x) =>
            x.product !== item.product ||
            x.color !== item.color ||
            x.size !== item.size
        )
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        })
      },
      setShippingAddress: async (shippingAddress: ShippingAddress) => {
        const { items } = get().cart
        set({
          cart: {
            ...get().cart,
            shippingAddress,
            ...(await calcDeliveryDateAndPrice({
              items,
              shippingAddress,
            })),
          },
        })
      },
      setPaymentMethod: (paymentMethod: string) => {
        set({
          cart: {
            ...get().cart,
            paymentMethod,
          },
        })
      },
      setDeliveryDateIndex: async (index: number) => {
        const { items, shippingAddress } = get().cart

        set({
          cart: {
            ...get().cart,
            ...(await calcDeliveryDateAndPrice({
              items,
              shippingAddress,
              deliveryDateIndex: index,
            })),
          },
        })
      },
      clearCart: () => {
        set({
          cart: {
            ...get().cart,
            items: [],
          },
        })
      },
      refreshCartStock: async () => {
        const { items } = get().cart
        const updatedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const response = await fetch(`/api/products/${item.product}`)
              if (!response.ok) {
                // If the product is not found, return null
                return null
              }
              const data = await response.json()
              const colorObj:
                | {
                    color: string
                    sizes: { size: string; countInStock: number }[]
                  }
                | undefined = data.colors.find(
                (c: { color: string }) => c.color === item.color
              )
              const sizeObj = colorObj?.sizes.find((s) => s.size === item.size)
              return {
                ...item,
                colors: data.colors,
                quantity: Math.min(item.quantity, sizeObj?.countInStock || 0),
              }
            } catch {
              // Handle fetch errors by returning null
              return null
            }
          })
        )

        // Filter out items that are null (deleted products)
        const filteredItems = updatedItems.filter((item) => item !== null)

        set({
          cart: {
            ...get().cart,
            items: filteredItems,
          },
        })
      },
      refreshCartPrices: async () => {
        const { items, shippingAddress } = get().cart
        const priceChanges: Array<{
          item: OrderItem
          oldPrice: number
          newPrice: number
          priceChange: number
          changeType: 'increase' | 'decrease'
        }> = []

        const updatedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const response = await fetch(`/api/products/${item.product}`)
              if (!response.ok) {
                // If the product is not found, keep original item
                return item
              }
              const data = await response.json()

              // Get current price from database
              const newPrice = data.price
              const oldPrice = item.price

              // Check if price has changed
              if (newPrice !== oldPrice) {
                const changeAmount = newPrice - oldPrice
                priceChanges.push({
                  item,
                  oldPrice,
                  newPrice,
                  priceChange: Math.abs(changeAmount),
                  changeType: changeAmount > 0 ? 'increase' : 'decrease',
                })
              }

              // Update stock information as well
              const colorObj = data.colors.find(
                (c: { color: string }) => c.color === item.color
              )
              const sizeObj = colorObj?.sizes.find(
                (s: { size: string; countInStock: number }) =>
                  s.size === item.size
              )

              return {
                ...item,
                price: newPrice, // Update to new price
                colors: data.colors,
                quantity: Math.min(item.quantity, sizeObj?.countInStock || 0),
              }
            } catch {
              // Handle fetch errors by keeping original item
              return item
            }
          })
        )

        // Update cart with new prices
        if (priceChanges.length > 0) {
          set({
            cart: {
              ...get().cart,
              items: updatedItems,
              ...(await calcDeliveryDateAndPrice({
                items: updatedItems,
                shippingAddress,
              })),
            },
          })
        }

        return {
          hasChanges: priceChanges.length > 0,
          priceChanges,
        }
      },
      init: () => set({ cart: initialState }),
    }),

    {
      name: 'cart-store',
    }
  )
)
export default useCartStore
