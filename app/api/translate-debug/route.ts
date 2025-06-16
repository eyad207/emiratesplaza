import { NextRequest, NextResponse } from 'next/server'
import { translationService } from '@/lib/translation-new'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Translation API Debug ===')

    // Parse request body
    const body = await request.json()
    const { text, targetLanguage } = body

    console.log('Request body:', { text, targetLanguage })

    // Validate input
    if (!text || typeof text !== 'string') {
      console.log('Invalid text parameter')
      return NextResponse.json(
        { success: false, error: 'Invalid text parameter' },
        { status: 400 }
      )
    }

    if (!targetLanguage || !['ar', 'en-US', 'nb-NO'].includes(targetLanguage)) {
      console.log('Invalid target language:', targetLanguage)
      return NextResponse.json(
        { success: false, error: 'Invalid target language' },
        { status: 400 }
      )
    }

    // Check text length
    if (text.length > 5000) {
      console.log('Text too long:', text.length)
      return NextResponse.json(
        { success: false, error: 'Text too long' },
        { status: 400 }
      )
    }

    console.log('Attempting translation...')

    // Perform translation
    const result = await translationService.translate(
      {
        text,
        targetLanguage,
      },
      'debug-client'
    )

    console.log('Translation result:', result)

    return NextResponse.json({
      success: true,
      translatedText: result.translatedText,
      detectedSourceLanguage: result.detectedSourceLanguage,
      confidence: result.confidence,
      debug: {
        originalText: text,
        targetLanguage,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Translation API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed',
        debug: {
          errorType:
            error instanceof Error ? error.constructor.name : 'Unknown',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }
}
