import { Cart, OrderItem } from '@/types'

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
 * Client-side cart validation (without database checks)
 */
export function validateCartClientSide(cart: Cart): CartValidationResult {
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

    // Check stock availability based on item data
    const colorObj = item.colors?.find((c) => c.color === item.color)
    if (colorObj) {
      const sizeObj = colorObj.sizes?.find((s) => s.size === item.size)
      if (sizeObj && sizeObj.countInStock < item.quantity) {
        itemErrors.push(
          `Insufficient stock for ${item.name}. Available: ${sizeObj.countInStock}, Requested: ${item.quantity}`
        )
        invalidItems.push(item)
        continue
      }
    }

    // If we reach here, the item is valid
    validItems.push(item)
    errors.push(...itemErrors)
  }

  return {
    isValid: errors.length === 0 && validItems.length > 0,
    errors,
    validItems,
    invalidItems,
  }
}

/**
 * Check if cart has any items with zero or invalid quantities
 */
export function hasInvalidQuantities(items: OrderItem[]): boolean {
  return items.some(
    (item) =>
      !item.quantity ||
      item.quantity <= 0 ||
      !Number.isInteger(item.quantity) ||
      Number.isNaN(item.quantity)
  )
}

/**
 * Get all items with invalid quantities
 */
export function getInvalidQuantityItems(items: OrderItem[]): OrderItem[] {
  return items.filter(
    (item) =>
      !item.quantity ||
      item.quantity <= 0 ||
      !Number.isInteger(item.quantity) ||
      Number.isNaN(item.quantity)
  )
}

/**
 * Check if cart is ready for checkout (has valid items and no invalid quantities)
 */
export function isCartReadyForCheckout(cart: Cart): boolean {
  if (!cart.items || cart.items.length === 0) return false
  return !hasInvalidQuantities(cart.items)
}
