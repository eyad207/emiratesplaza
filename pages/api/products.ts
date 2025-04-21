import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase()

  if (req.method === 'GET') {
    const { query = '', page = '1', limit = '15', tag } = req.query
    const pageNumber = parseInt(page as string, 10) || 1
    const pageSize = parseInt(limit as string, 10) || 15

    const queryFilter = tag
      ? { tags: { $in: [tag] } }
      : query && query !== ''
        ? {
            name: {
              $regex: query,
              $options: 'i',
            },
          }
        : {}

    try {
      const products = await Product.find(queryFilter)
        .select('name _id')
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
