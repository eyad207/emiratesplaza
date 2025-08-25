import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import Tag from '@/lib/db/models/tag.model'
import { IProductInput } from '@/types'
import { toSlug } from '@/lib/utils'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(cwd())

// Products to add based on available images
const newProducts: IProductInput[] = [
  // Jeans Category
  {
    name: 'Premium Denim Jeans - Classic Fit',
    slug: toSlug('Premium Denim Jeans Classic Fit'),
    category: 'Jeans',
    images: ['/img/jeans.jpg'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 89.99,
    brand: 'DenimCraft',
    avgRating: 4.5,
    numReviews: 25,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 8 },
      { rating: 5, count: 11 },
    ],
    numSales: 45,
    description:
      'High-quality denim jeans with classic fit and comfortable wear. Made from premium cotton blend for durability and style.',
    colors: [
      {
        color: 'Blue',
        sizes: [
          { size: '30', countInStock: 5 },
          { size: '32', countInStock: 8 },
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

  // Shoes Category
  {
    name: 'Athletic Running Shoes - Performance Series',
    slug: toSlug('Athletic Running Shoes Performance Series'),
    category: 'Shoes',
    images: ['/img/shoes.jpg'],
    tags: ['best-seller', 'featured'],
    isPublished: true,
    price: 129.99,
    brand: 'SportMax',
    avgRating: 4.7,
    numReviews: 42,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 12 },
      { rating: 5, count: 26 },
    ],
    numSales: 78,
    description:
      'Professional athletic running shoes designed for performance and comfort. Features advanced cushioning technology and breathable mesh upper.',
    colors: [
      {
        color: 'White',
        sizes: [
          { size: '8', countInStock: 4 },
          { size: '9', countInStock: 6 },
          { size: '10', countInStock: 8 },
          { size: '11', countInStock: 5 },
          { size: '12', countInStock: 3 },
        ],
      },
      {
        color: 'Black',
        sizes: [
          { size: '8', countInStock: 3 },
          { size: '9', countInStock: 5 },
          { size: '10', countInStock: 6 },
          { size: '11', countInStock: 4 },
          { size: '12', countInStock: 2 },
        ],
      },
    ],
    reviews: [],
  },

  // Wrist Watches Category
  {
    name: 'Luxury Stainless Steel Watch - Executive Collection',
    slug: toSlug('Luxury Stainless Steel Watch Executive Collection'),
    category: 'Watches',
    images: ['/img/wrist-watches.jpg'],
    tags: ['featured', 'todays-deal'],
    isPublished: true,
    price: 299.99,
    brand: 'TimeKeeper',
    avgRating: 4.8,
    numReviews: 18,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 1 },
      { rating: 4, count: 3 },
      { rating: 5, count: 14 },
    ],
    numSales: 32,
    description:
      'Elegant stainless steel watch with precision movement. Perfect for business and formal occasions. Water resistant up to 100m.',
    colors: [
      {
        color: 'Silver',
        sizes: [{ size: 'One Size', countInStock: 8 }],
      },
      {
        color: 'Gold',
        sizes: [{ size: 'One Size', countInStock: 5 }],
      },
    ],
    reviews: [],
  },

  // Additional T-Shirt Products using numbered images
  {
    name: 'Cotton Blend Casual T-Shirt - Summer Collection',
    slug: toSlug('Cotton Blend Casual T-Shirt Summer Collection'),
    category: 'T-Shirts',
    images: ['/img/p21-1.jpg', '/img/p21-2.jpg'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 19.99,
    brand: 'CasualWear',
    avgRating: 4.3,
    numReviews: 15,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 6 },
      { rating: 5, count: 6 },
    ],
    numSales: 28,
    description:
      'Comfortable cotton blend t-shirt perfect for everyday wear. Soft fabric with excellent breathability.',
    colors: [
      {
        color: 'Blue',
        sizes: [
          { size: 'S', countInStock: 4 },
          { size: 'M', countInStock: 6 },
          { size: 'L', countInStock: 5 },
          { size: 'XL', countInStock: 3 },
        ],
      },
      {
        color: 'White',
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
    name: 'Premium Graphic T-Shirt - Designer Series',
    slug: toSlug('Premium Graphic T-Shirt Designer Series'),
    category: 'T-Shirts',
    images: ['/img/p22-1.jpg', '/img/p22-2.jpg'],
    tags: ['featured'],
    isPublished: true,
    price: 24.99,
    brand: 'DesignCraft',
    avgRating: 4.6,
    numReviews: 22,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 1 },
      { rating: 4, count: 7 },
      { rating: 5, count: 13 },
    ],
    numSales: 41,
    description:
      'Stylish graphic t-shirt with unique design. Made from high-quality cotton for comfort and durability.',
    colors: [
      {
        color: 'Black',
        sizes: [
          { size: 'S', countInStock: 5 },
          { size: 'M', countInStock: 7 },
          { size: 'L', countInStock: 6 },
          { size: 'XL', countInStock: 4 },
        ],
      },
      {
        color: 'Gray',
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
    name: 'Vintage Style T-Shirt - Retro Collection',
    slug: toSlug('Vintage Style T-Shirt Retro Collection'),
    category: 'T-Shirts',
    images: ['/img/p23-1.jpg', '/img/p23-2.jpg'],
    tags: ['best-seller'],
    isPublished: true,
    price: 22.5,
    brand: 'RetroStyle',
    avgRating: 4.4,
    numReviews: 19,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 3 },
      { rating: 4, count: 8 },
      { rating: 5, count: 8 },
    ],
    numSales: 35,
    description:
      'Vintage-inspired t-shirt with retro design elements. Comfortable fit with classic styling.',
    colors: [
      {
        color: 'Navy',
        sizes: [
          { size: 'S', countInStock: 4 },
          { size: 'M', countInStock: 6 },
          { size: 'L', countInStock: 5 },
          { size: 'XL', countInStock: 3 },
        ],
      },
      {
        color: 'Maroon',
        sizes: [
          { size: 'S', countInStock: 2 },
          { size: 'M', countInStock: 4 },
          { size: 'L', countInStock: 3 },
          { size: 'XL', countInStock: 1 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Sports Performance T-Shirt - Active Wear',
    slug: toSlug('Sports Performance T-Shirt Active Wear'),
    category: 'T-Shirts',
    images: ['/img/p24-1.jpg', '/img/p24-2.jpg'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 29.99,
    brand: 'ActiveFit',
    avgRating: 4.7,
    numReviews: 31,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 8 },
      { rating: 5, count: 20 },
    ],
    numSales: 52,
    description:
      'High-performance athletic t-shirt with moisture-wicking technology. Perfect for workouts and sports activities.',
    colors: [
      {
        color: 'Red',
        sizes: [
          { size: 'S', countInStock: 6 },
          { size: 'M', countInStock: 8 },
          { size: 'L', countInStock: 7 },
          { size: 'XL', countInStock: 5 },
        ],
      },
      {
        color: 'Blue',
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
    name: 'Casual Button-Up Shirt - Business Casual',
    slug: toSlug('Casual Button-Up Shirt Business Casual'),
    category: 'Shirts',
    images: ['/img/p25-1.jpg', '/img/p25-2.jpg'],
    tags: ['todays-deal'],
    isPublished: true,
    price: 39.99,
    brand: 'BusinessWear',
    avgRating: 4.5,
    numReviews: 16,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 1 },
      { rating: 4, count: 6 },
      { rating: 5, count: 8 },
    ],
    numSales: 23,
    description:
      'Versatile button-up shirt perfect for business casual settings. Wrinkle-resistant fabric with comfortable fit.',
    colors: [
      {
        color: 'White',
        sizes: [
          { size: 'S', countInStock: 3 },
          { size: 'M', countInStock: 5 },
          { size: 'L', countInStock: 4 },
          { size: 'XL', countInStock: 2 },
        ],
      },
      {
        color: 'Light Blue',
        sizes: [
          { size: 'S', countInStock: 2 },
          { size: 'M', countInStock: 4 },
          { size: 'L', countInStock: 3 },
          { size: 'XL', countInStock: 1 },
        ],
      },
    ],
    reviews: [],
  },

  {
    name: 'Polo Shirt - Classic Fit',
    slug: toSlug('Polo Shirt Classic Fit'),
    category: 'Shirts',
    images: ['/img/p26-1.jpg', '/img/p26-2.jpg'],
    tags: ['best-seller'],
    isPublished: true,
    price: 34.99,
    brand: 'PoloClassic',
    avgRating: 4.6,
    numReviews: 27,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 2 },
      { rating: 4, count: 9 },
      { rating: 5, count: 15 },
    ],
    numSales: 46,
    description:
      'Classic polo shirt with timeless design. Made from premium cotton pique for comfort and style.',
    colors: [
      {
        color: 'Navy',
        sizes: [
          { size: 'S', countInStock: 5 },
          { size: 'M', countInStock: 7 },
          { size: 'L', countInStock: 6 },
          { size: 'XL', countInStock: 4 },
        ],
      },
      {
        color: 'Green',
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

async function addProducts() {
  try {
    console.log('Connecting to database...')
    await connectToDatabase(process.env.MONGODB_URI)

    // Ensure tags exist
    console.log('Ensuring tags exist...')
    const requiredTags = [
      { name: 'new-arrival', _id: '1' },
      { name: 'featured', _id: '2' },
      { name: 'best-seller', _id: '3' },
      { name: 'todays-deal', _id: '4' },
    ]

    for (const tagData of requiredTags) {
      const existingTag = await Tag.findOne({ name: tagData.name })
      if (!existingTag) {
        console.log(`Creating tag: ${tagData.name}`)
        await Tag.create({ name: tagData.name })
      }
    }

    // Get existing tags
    const existingTags = await Tag.find({})
    const tagMap = new Map(
      existingTags.map((tag) => [tag.name, String(tag._id)])
    )

    // Convert tag names to tag IDs for new products
    const productsWithTagIds = newProducts.map((product) => ({
      ...product,
      tags: product.tags.map((tagName) => tagMap.get(tagName) || tagName),
    }))

    console.log('Adding new products to database...')
    const createdProducts = await Product.insertMany(productsWithTagIds)

    console.log(`Successfully added ${createdProducts.length} products:`)
    createdProducts.forEach((product) => {
      console.log(`- ${product.name} (${product.category})`)
    })

    console.log('Products added successfully!')
  } catch (error) {
    console.error('Error adding products:', error)
  } finally {
    process.exit()
  }
}

// Run the script
addProducts()
