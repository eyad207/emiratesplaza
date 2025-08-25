import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { IProduct } from '@/lib/db/models/product.model'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(cwd())

async function showProducts() {
  try {
    console.log('Connecting to database...')
    await connectToDatabase(process.env.MONGODB_URI)

    console.log('Fetching all products...')
    const products = await Product.find({}).sort({ createdAt: -1 })

    console.log(`\n📦 Total Products in Database: ${products.length}\n`)

    // Group products by category
    const productsByCategory = products.reduce(
      (acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = []
        }
        acc[product.category].push(product)
        return acc
      },
      {} as Record<string, IProduct[]>
    )

    // Display products by category
    Object.entries(productsByCategory).forEach(
      ([category, categoryProducts]) => {
        console.log(
          `\n🏷️  ${category.toUpperCase()} (${categoryProducts.length} products):`
        )
        console.log('─'.repeat(50))

        categoryProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`)
          console.log(`   💰 Price: $${product.price}`)
          console.log(`   🏪 Brand: ${product.brand}`)
          console.log(
            `   ⭐ Rating: ${product.avgRating}/5 (${product.numReviews} reviews)`
          )
          console.log(`   📦 Sales: ${product.numSales}`)
          console.log(`   🖼️  Images: ${product.images.length}`)
          console.log(
            `   🎨 Colors: ${product.colors.map((c) => c.color).join(', ')}`
          )
          console.log(
            `   📏 Available Sizes: ${[...new Set(product.colors.flatMap((c) => c.sizes.map((s) => s.size)))].join(', ')}`
          )
          console.log(`   ✅ Published: ${product.isPublished ? 'Yes' : 'No'}`)
          console.log('')
        })
      }
    )

    // Summary statistics
    console.log('\n📊 SUMMARY STATISTICS:')
    console.log('═'.repeat(50))
    console.log(`📦 Total Products: ${products.length}`)
    console.log(`🏷️  Categories: ${Object.keys(productsByCategory).length}`)
    console.log(
      `💰 Price Range: $${Math.min(...products.map((p) => p.price))} - $${Math.max(...products.map((p) => p.price))}`
    )
    console.log(
      `⭐ Average Rating: ${(products.reduce((sum, p) => sum + p.avgRating, 0) / products.length).toFixed(2)}/5`
    )
    console.log(
      `📦 Total Sales: ${products.reduce((sum, p) => sum + p.numSales, 0)}`
    )
    console.log(
      `📝 Total Reviews: ${products.reduce((sum, p) => sum + p.numReviews, 0)}`
    )
    console.log(
      `✅ Published Products: ${products.filter((p) => p.isPublished).length}`
    )

    console.log('\n🏷️  PRODUCTS BY CATEGORY:')
    Object.entries(productsByCategory).forEach(
      ([category, categoryProducts]) => {
        console.log(`   ${category}: ${categoryProducts.length} products`)
      }
    )
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    process.exit()
  }
}

// Run the script
showProducts()
