import { NextRequest, NextResponse } from 'next/server'
import { detectAndCorrectSpelling } from '@/lib/multilingual-search'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const locale = searchParams.get('locale') || 'en-US'

  if (!query) {
    return NextResponse.json(
      {
        error: 'Query parameter "q" is required',
      },
      { status: 400 }
    )
  }

  try {
    const result = await detectAndCorrectSpelling(
      query,
      locale as 'ar' | 'en-US' | 'nb-NO'
    )

    return NextResponse.json({
      input: query,
      locale,
      result,
    })
  } catch (error) {
    console.error('Spell correction error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process spell correction',
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const testCases = [
      { input: 'kso', expected: 'sko', language: 'nb-NO' },
      { input: 'احاذيي', expected: 'حذاء', language: 'ar' },
      { input: 'skjort', expected: 'skjorte', language: 'nb-NO' },
      { input: 'shos', expected: 'shoes', language: 'en-US' },
      { input: 'bkse', expected: 'bukse', language: 'nb-NO' },
      { input: 'قمص', expected: 'قميص', language: 'ar' },
    ]

    const results = []

    for (const testCase of testCases) {
      try {
        const result = await detectAndCorrectSpelling(
          testCase.input,
          testCase.language as 'ar' | 'en-US' | 'nb-NO'
        )

        results.push({
          ...testCase,
          result,
          status:
            result.isLikelyMisspelled &&
            result.correctedQuery === testCase.expected
              ? 'PASS'
              : 'FAIL',
        })
      } catch (error) {
        results.push({
          ...testCase,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'ERROR',
        })
      }
    }

    return NextResponse.json({
      message: 'Spell correction test completed',
      results,
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      {
        error: 'Failed to run test',
      },
      { status: 500 }
    )
  }
}
