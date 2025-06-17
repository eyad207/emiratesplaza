import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import {
  processMultilingualSearch,
  createMultilingualSearchFilter,
  detectQueryLanguage,
} from '@/lib/multilingual-search'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('=== API CALLED ===')
  console.log('Method:', req.method)
  console.log('Query params:', req.query)
  console.log('==================')

  await connectToDatabase()

  if (req.method === 'GET') {
    const { query = '', page = '1', limit = '15', tag } = req.query
    const pageNumber = parseInt(page as string, 10) || 1
    const pageSize = parseInt(limit as string, 10) || 15

    console.log('Raw query param:', query)
    console.log('Query type:', typeof query)
    console.log('Query truthy?', !!query)
    console.log('Query not empty?', query !== '')

    let queryFilter: Record<string, unknown> = {}

    if (tag) {
      console.log('Tag search:', tag)
      queryFilter = { tags: { $in: [tag] } }
    } else if (query && query !== '') {
      console.log('=== MULTILINGUAL SEARCH DEBUG ===')
      console.log('Search query:', query)

      try {
        // Detect the language of the query
        const detectedLanguage = await detectQueryLanguage(query as string)
        console.log('Detected language:', detectedLanguage) // Process the search terms for multilingual search
        const searchTerms = await processMultilingualSearch({
          query: query as string,
          category: '', // No specific category filter for general search
          targetLanguage: detectedLanguage as 'ar' | 'en-US' | 'nb-NO',
          sourceLanguage: detectedLanguage,
        })

        console.log('Processed search terms:', searchTerms)

        // Create the MongoDB filter for multilingual search
        const multilingualFilter =
          await createMultilingualSearchFilter(searchTerms)
        console.log(
          'Multilingual filter:',
          JSON.stringify(multilingualFilter, null, 2)
        )

        queryFilter = multilingualFilter
      } catch (error) {
        console.error(
          'Error in multilingual search, falling back to simple search:',
          error
        )
        // Fallback to simple search if multilingual search fails
        const searchTerm = (query as string).trim()
        console.log('Fallback search term:', searchTerm)
        queryFilter = {
          name: { $regex: searchTerm, $options: 'i' },
        }
      }

      console.log('Final query filter:', JSON.stringify(queryFilter, null, 2))
      console.log('=== END MULTILINGUAL SEARCH DEBUG ===')
    } else {
      console.log('No search - returning all products')
    }

    try {
      const products = await Product.find(queryFilter)
        .select('name description category tags _id')
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()

      const totalProducts = await Product.countDocuments(queryFilter)

      return res.status(200).json({
        success: true,
        products,
        totalProducts,
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      return res.status(500).json({
        success: false,
        message: 'Error fetching products',
      })
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}
