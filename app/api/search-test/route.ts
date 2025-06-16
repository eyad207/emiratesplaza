import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/actions/product.actions'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || 'all'
    const category = searchParams.get('category') || 'all'
    const locale =
      (searchParams.get('locale') as 'ar' | 'en-US' | 'nb-NO') || 'en-US'

    console.log('🚀 Full Search Test:', { query, category, locale })

    // Test the actual search functionality
    const results = await getAllProducts({
      query,
      category,
      tag: 'all',
      page: 1,
      sort: 'best-selling',
      locale,
    })

    return NextResponse.json({
      success: true,
      input: { query, category, locale },
      results: {
        totalProducts: results.totalProducts,
        products: results.products.map((p) => ({
          id: p._id,
          name: p.name,
          category: p.category,
          brand: p.brand,
          description: p.description?.substring(0, 100) + '...',
        })),
        searchTerms: (results as unknown as { searchTerms?: unknown })
          .searchTerms,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Full search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
