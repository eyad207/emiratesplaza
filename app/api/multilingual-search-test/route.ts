import { NextRequest, NextResponse } from 'next/server'
import {
  processMultilingualSearch,
  createMultilingualSearchFilter,
} from '@/lib/multilingual-search'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || 'all'
    const locale =
      (searchParams.get('locale') as 'ar' | 'en-US' | 'nb-NO') || 'en-US'

    console.log('🔍 Multilingual Search Test:', { query, category, locale })

    // Process multilingual search terms
    const searchTerms = await processMultilingualSearch({
      query,
      category,
      targetLanguage: locale,
    })

    // Create search filter
    const filter = createMultilingualSearchFilter(searchTerms)

    return NextResponse.json({
      success: true,
      input: { query, category, locale },
      searchTerms,
      mongoFilter: filter,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Multilingual search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
