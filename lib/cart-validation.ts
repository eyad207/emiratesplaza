'use server'

import { Cart, OrderItem } from '@/types'
import { connectToDatabase } from './db'
import Product from './db/models/product.model'

export interface CartValidationResult {
  isValid: boolean
  errors: string[]
  validItems: OrderItem[]
  invalidItems: OrderItem[]
}

export interface CartValidationError {
  itemId: string
  itemName: string
  error: string
}

/**
 * Comprehensive cart validation - checks quantities, stock availability, and item validity
 */
export async function validateCart(cart: Cart): Promise<CartValidationResult> {
  const errors: string[] = []
  const validItems: OrderItem[] = []
  const invalidItems: OrderItem[] = []

  // Basic cart validation
  if (!cart.items || cart.items.length === 0) {
    return {
      isValid: false,
      errors: ['Cart is empty'],
      validItems: [],
      invalidItems: [],
    }
  }

  // Connect to database to check stock
  await connectToDatabase()

  for (const item of cart.items) {
    const itemErrors: string[] = []

    // Check quantity validity
    if (
      typeof item.quantity !== 'number' ||
      item.quantity <= 0 ||
      Number.isNaN(item.quantity)
    ) {
      itemErrors.push(`Invalid quantity (${item.quantity}) for ${item.name}`)
      invalidItems.push(item)
      continue
    }

    // Check if item is an integer
    if (!Number.isInteger(item.quantity)) {
      itemErrors.push(`Quantity must be a whole number for ${item.name}`)
      invalidItems.push(item)
      continue
    }

    try {
      // Check product exists and is available
      const product = await Product.findById(item.product)
      if (!product) {
        itemErrors.push(`Product ${item.name} no longer exists`)
        invalidItems.push(item)
        continue
      }

      // Check color availability
      const colorObj = product.colors.find(
        (c: {
          color: string
          sizes: { size: string; countInStock: number }[]
        }) => c.color === item.color
      )
      if (!colorObj) {
        itemErrors.push(
          `Color ${item.color} is no longer available for ${item.name}`
        )
        invalidItems.push(item)
        continue
      }

      // Check size availability
      const sizeObj = colorObj.sizes.find(
        (s: { size: string; countInStock: number }) => s.size === item.size
      )
      if (!sizeObj) {
        itemErrors.push(
          `Size ${item.size} is no longer available for ${item.name}`
        )
        invalidItems.push(item)
        continue
      }

      // Check stock availability
      if (sizeObj.countInStock < item.quantity) {
        itemErrors.push(
          `Insufficient stock for ${item.name}. Available: ${sizeObj.countInStock}, Requested: ${item.quantity}`
        )
        invalidItems.push(item)
        continue
      }

      // If we reach here, the item is valid
      validItems.push(item)
    } catch (error) {
      itemErrors.push(`Failed to validate ${item.name}: ${error}`)
      invalidItems.push(item)
    }

    errors.push(...itemErrors)
  }

  return {
    isValid: errors.length === 0 && validItems.length > 0,
    errors,
    validItems,
    invalidItems,
  }
}
