import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl =
      process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate'

    // Test with a simple request
    const testText = 'Hello world'
    const requestBody = {
      q: testText,
      source: 'auto',
      target: 'ar',
      format: 'text',
    }

    console.log('Testing LibreTranslate with:', { apiUrl, requestBody })

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()

    console.log('Response status:', response.status)
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    )
    console.log('Response text:', responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      requestBody,
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
