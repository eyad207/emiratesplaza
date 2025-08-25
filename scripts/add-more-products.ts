import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import Tag from '@/lib/db/models/tag.model'
import { IProductInput } from '@/types'
import { toSlug } from '@/lib/utils'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(cwd())

// Additional products for the remaining images
const additionalProducts: IProductInput[] = [
  {
    name: 'Executive Formal Shirt - Premium Cotton',
    slug: toSlug('Executive Formal Shirt Premium Cotton'),
    category: 'Shirts',
    images: ['/img/p31-1.jpg', '/img/p31-2.jpg'],
    tags: ['featured', 'best-seller'],
    isPublished: true,
    price: 45.99,
    brand: 'ExecutiveWear',
    avgRating: 4.8,
    numReviews: 33,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 1 },
      { rating: 4, count: 7 },
      { rating: 5, count: 24 },
    ],
    numSales: 67,
    description:
      'Premium cotton formal shirt perfect for business meetings and formal occasions. Wrinkle-free technology and comfortable fit.',
    colors: [
      {
        color: 'White',
        sizes: [
          { size: 'S', countInStock: 6 },
          { size: 'M', countInStock: 8 },
          { size: 'L', countInStock: 7 },
          { size: 'XL', countInStock: 5 },
          { size: 'XXL', countInStock: 3 },
        ],
      },
      {
        color: 'Light Blue',
        sizes: [
          { size: 'S', countInStock: 4 },
          { size: 'M', countInStock: 6 },
          { size: 'L', countInStock: 5 },
          { size: 'XL', countInStock: 3 },
          { size: 'XXL', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Casual Weekend Shirt - Relaxed Fit',
    slug: toSlug('Casual Weekend Shirt Relaxed Fit'),
    category: 'Shirts',
    images: ['/img/p32-1.jpg', '/img/p32-2.jpg'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 32.99,
    brand: 'WeekendStyle',
    avgRating: 4.4,
    numReviews: 21,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 3 },
      { rating: 4, count: 8 },
      { rating: 5, count: 9 },
    ],
    numSales: 38,
    description:
      'Comfortable casual shirt for weekend activities. Made from soft cotton blend with relaxed fit design.',
    colors: [
      {
        color: 'Khaki',
        sizes: [
          { size: 'S', countInStock: 4 },
          { size: 'M', countInStock: 6 },
          { size: 'L', countInStock: 5 },
          { size: 'XL', countInStock: 3 },
        ],
      },
      {
        color: 'Olive',
        sizes: [
          { size: 'S', countInStock: 3 },
          { size: 'M', countInStock: 4 },
          { size: 'L', countInStock: 3 },
          { size: 'XL', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Designer Print Shirt - Limited Edition',
    slug: toSlug('Designer Print Shirt Limited Edition'),
    category: 'Shirts',
    images: ['/img/p33-1.jpg', '/img/p33-2.jpg'],
    tags: ['featured', 'todays-deal'],
    isPublished: true,
    price: 52.99,
    brand: 'DesignerHub',
    avgRating: 4.6,
    numReviews: 28,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 9 },
      { rating: 5, count: 16 },
    ],
    numSales: 42,
    description:
      'Exclusive designer print shirt with unique patterns. Limited edition collection for fashion-forward individuals.',
    colors: [
      {
        color: 'Multi-Color',
        sizes: [
          { size: 'S', countInStock: 3 },
          { size: 'M', countInStock: 5 },
          { size: 'L', countInStock: 4 },
          { size: 'XL', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Summer Linen Shirt - Breathable Comfort',
    slug: toSlug('Summer Linen Shirt Breathable Comfort'),
    category: 'Shirts',
    images: ['/img/p34-1.jpg', '/img/p34-2.jpg'],
    tags: ['new-arrival', 'best-seller'],
    isPublished: true,
    price: 38.99,
    brand: 'LinenLux',
    avgRating: 4.7,
    numReviews: 35,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 8 },
      { rating: 5, count: 24 },
    ],
    numSales: 58,
    description:
      'Lightweight linen shirt perfect for summer weather. Breathable fabric that keeps you cool and comfortable all day.',
    colors: [
      {
        color: 'Cream',
        sizes: [
          { size: 'S', countInStock: 5 },
          { size: 'M', countInStock: 7 },
          { size: 'L', countInStock: 6 },
          { size: 'XL', countInStock: 4 },
        ],
      },
      {
        color: 'Sky Blue',
        sizes: [
          { size: 'S', countInStock: 3 },
          { size: 'M', countInStock: 5 },
          { size: 'L', countInStock: 4 },
          { size: 'XL', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Classic Denim Shirt - Vintage Style',
    slug: toSlug('Classic Denim Shirt Vintage Style'),
    category: 'Shirts',
    images: ['/img/p35-1.jpg', '/img/p35-2.jpg'],
    tags: ['featured'],
    isPublished: true,
    price: 41.99,
    brand: 'VintageStyle',
    avgRating: 4.5,
    numReviews: 24,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 9 },
      { rating: 5, count: 12 },
    ],
    numSales: 33,
    description:
      'Classic denim shirt with vintage styling. Durable construction and timeless design that never goes out of style.',
    colors: [
      {
        color: 'Light Denim',
        sizes: [
          { size: 'S', countInStock: 4 },
          { size: 'M', countInStock: 6 },
          { size: 'L', countInStock: 5 },
          { size: 'XL', countInStock: 3 },
        ],
      },
      {
        color: 'Dark Denim',
        sizes: [
          { size: 'S', countInStock: 3 },
          { size: 'M', countInStock: 4 },
          { size: 'L', countInStock: 3 },
          { size: 'XL', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Flannel Plaid Shirt - Cozy Comfort',
    slug: toSlug('Flannel Plaid Shirt Cozy Comfort'),
    category: 'Shirts',
    images: ['/img/p36-1.jpg', '/img/p36-2.jpg'],
    tags: ['new-arrival', 'todays-deal'],
    isPublished: true,
    price: 35.99,
    brand: 'CozyWear',
    avgRating: 4.6,
    numReviews: 29,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 8 },
      { rating: 5, count: 18 },
    ],
    numSales: 47,
    description:
      'Soft flannel shirt with classic plaid pattern. Perfect for cooler weather and casual occasions.',
    colors: [
      {
        color: 'Red Plaid',
        sizes: [
          { size: 'S', countInStock: 4 },
          { size: 'M', countInStock: 6 },
          { size: 'L', countInStock: 5 },
          { size: 'XL', countInStock: 3 },
        ],
      },
      {
        color: 'Blue Plaid',
        sizes: [
          { size: 'S', countInStock: 3 },
          { size: 'M', countInStock: 5 },
          { size: 'L', countInStock: 4 },
          { size: 'XL', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  // Adding some products for the 4x series images
  {
    name: 'Modern Fit Chino Pants - Smart Casual',
    slug: toSlug('Modern Fit Chino Pants Smart Casual'),
    category: 'Pants',
    images: ['/img/p41-1.jpg', '/img/p41-2.jpg'],
    tags: ['best-seller', 'featured'],
    isPublished: true,
    price: 49.99,
    brand: 'ModernFit',
    avgRating: 4.8,
    numReviews: 41,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 1 },
      { rating: 4, count: 8 },
      { rating: 5, count: 31 },
    ],
    numSales: 76,
    description:
      'Versatile chino pants with modern fit. Perfect for both casual and business casual occasions.',
    colors: [
      {
        color: 'Navy',
        sizes: [
          { size: '30', countInStock: 6 },
          { size: '32', countInStock: 8 },
          { size: '34', countInStock: 7 },
          { size: '36', countInStock: 5 },
          { size: '38', countInStock: 3 },
        ],
      },
      {
        color: 'Khaki',
        sizes: [
          { size: '30', countInStock: 4 },
          { size: '32', countInStock: 6 },
          { size: '34', countInStock: 5 },
          { size: '36', countInStock: 3 },
          { size: '38', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Comfort Stretch Jeans - Slim Fit',
    slug: toSlug('Comfort Stretch Jeans Slim Fit'),
    category: 'Jeans',
    images: ['/img/p42-1.jpg', '/img/p42-2.jpg'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 69.99,
    brand: 'ComfortDenim',
    avgRating: 4.6,
    numReviews: 37,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 3 },
      { rating: 4, count: 10 },
      { rating: 5, count: 23 },
    ],
    numSales: 54,
    description:
      'Comfortable stretch jeans with slim fit design. Flexible fabric that moves with you while maintaining shape.',
    colors: [
      {
        color: 'Dark Blue',
        sizes: [
          { size: '30', countInStock: 5 },
          { size: '32', countInStock: 7 },
          { size: '34', countInStock: 6 },
          { size: '36', countInStock: 4 },
        ],
      },
      {
        color: 'Black',
        sizes: [
          { size: '30', countInStock: 3 },
          { size: '32', countInStock: 5 },
          { size: '34', countInStock: 4 },
          { size: '36', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Cargo Pants - Utility Style',
    slug: toSlug('Cargo Pants Utility Style'),
    category: 'Pants',
    images: ['/img/p43-1.jpg', '/img/p43-2.jpg'],
    tags: ['todays-deal'],
    isPublished: true,
    price: 44.99,
    brand: 'UtilityWear',
    avgRating: 4.3,
    numReviews: 26,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 1 },
      { rating: 3, count: 3 },
      { rating: 4, count: 9 },
      { rating: 5, count: 12 },
    ],
    numSales: 39,
    description:
      'Functional cargo pants with multiple pockets. Durable fabric perfect for outdoor activities and casual wear.',
    colors: [
      {
        color: 'Olive',
        sizes: [
          { size: '30', countInStock: 4 },
          { size: '32', countInStock: 6 },
          { size: '34', countInStock: 5 },
          { size: '36', countInStock: 3 },
        ],
      },
      {
        color: 'Black',
        sizes: [
          { size: '30', countInStock: 3 },
          { size: '32', countInStock: 4 },
          { size: '34', countInStock: 3 },
          { size: '36', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Athletic Joggers - Sports Collection',
    slug: toSlug('Athletic Joggers Sports Collection'),
    category: 'Pants',
    images: ['/img/p44-1.jpg', '/img/p44-2.jpg'],
    tags: ['new-arrival', 'best-seller'],
    isPublished: true,
    price: 39.99,
    brand: 'SportActive',
    avgRating: 4.7,
    numReviews: 44,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 11 },
      { rating: 5, count: 30 },
    ],
    numSales: 72,
    description:
      'Comfortable athletic joggers for sports and casual wear. Moisture-wicking fabric with adjustable waistband.',
    colors: [
      {
        color: 'Gray',
        sizes: [
          { size: 'S', countInStock: 6 },
          { size: 'M', countInStock: 8 },
          { size: 'L', countInStock: 7 },
          { size: 'XL', countInStock: 5 },
        ],
      },
      {
        color: 'Navy',
        sizes: [
          { size: 'S', countInStock: 4 },
          { size: 'M', countInStock: 6 },
          { size: 'L', countInStock: 5 },
          { size: 'XL', countInStock: 3 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Formal Dress Pants - Business Professional',
    slug: toSlug('Formal Dress Pants Business Professional'),
    category: 'Pants',
    images: ['/img/p45-1.jpg', '/img/p45-2.jpg'],
    tags: ['featured'],
    isPublished: true,
    price: 59.99,
    brand: 'BusinessPro',
    avgRating: 4.5,
    numReviews: 22,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 8 },
      { rating: 5, count: 11 },
    ],
    numSales: 31,
    description:
      'Professional dress pants for business occasions. Wrinkle-resistant fabric with tailored fit.',
    colors: [
      {
        color: 'Charcoal',
        sizes: [
          { size: '30', countInStock: 4 },
          { size: '32', countInStock: 6 },
          { size: '34', countInStock: 5 },
          { size: '36', countInStock: 3 },
          { size: '38', countInStock: 2 },
        ],
      },
      {
        color: 'Navy',
        sizes: [
          { size: '30', countInStock: 3 },
          { size: '32', countInStock: 4 },
          { size: '34', countInStock: 3 },
          { size: '36', countInStock: 2 },
          { size: '38', countInStock: 1 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Weekend Shorts - Casual Comfort',
    slug: toSlug('Weekend Shorts Casual Comfort'),
    category: 'Shorts',
    images: ['/img/p46-1.jpg', '/img/p46-2.jpg'],
    tags: ['todays-deal', 'new-arrival'],
    isPublished: true,
    price: 24.99,
    brand: 'WeekendStyle',
    avgRating: 4.4,
    numReviews: 32,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 1 },
      { rating: 3, count: 3 },
      { rating: 4, count: 11 },
      { rating: 5, count: 16 },
    ],
    numSales: 48,
    description:
      'Comfortable casual shorts perfect for weekend activities. Lightweight fabric with convenient pockets.',
    colors: [
      {
        color: 'Khaki',
        sizes: [
          { size: 'S', countInStock: 5 },
          { size: 'M', countInStock: 7 },
          { size: 'L', countInStock: 6 },
          { size: 'XL', countInStock: 4 },
        ],
      },
      {
        color: 'Navy',
        sizes: [
          { size: 'S', countInStock: 3 },
          { size: 'M', countInStock: 5 },
          { size: 'L', countInStock: 4 },
          { size: 'XL', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },
]

async function addMoreProducts() {
  try {
    console.log('Connecting to database...')
    await connectToDatabase(process.env.MONGODB_URI)

    // Get existing tags
    const existingTags = await Tag.find({})
    const tagMap = new Map(
      existingTags.map((tag) => [tag.name, String(tag._id)])
    )

    // Convert tag names to tag IDs for new products
    const productsWithTagIds = additionalProducts.map((product) => ({
      ...product,
      tags: product.tags.map((tagName) => tagMap.get(tagName) || tagName),
    }))

    console.log('Adding more products to database...')
    const createdProducts = await Product.insertMany(productsWithTagIds)

    console.log(
      `Successfully added ${createdProducts.length} additional products:`
    )
    createdProducts.forEach((product) => {
      console.log(`- ${product.name} (${product.category})`)
    })

    console.log('Additional products added successfully!')
  } catch (error) {
    console.error('Error adding additional products:', error)
  } finally {
    process.exit()
  }
}

// Run the script
addMoreProducts()
