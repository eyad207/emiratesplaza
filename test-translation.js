#!/usr/bin/env node

/**
 * Test script for the free translation service
 * Run with: node test-translation.js
 */

async function testTranslation() {
  const { translationService } = await import('./lib/translation-new.js')

  console.log('🧪 Testing Free Translation Service...\n')

  const testTexts = [
    'Hello World',
    'This is a great product',
    'Welcome to our store',
  ]

  const targetLanguages = ['ar', 'nb-NO']

  for (const text of testTexts) {
    console.log(`📝 Original: "${text}"`)

    for (const lang of targetLanguages) {
      try {
        const result = await translationService.translate(
          {
            text,
            targetLanguage: lang,
          },
          'test-client'
        )

        console.log(
          `   ${lang}: "${result.translatedText}" (confidence: ${result.confidence})`
        )
      } catch (error) {
        console.log(`   ${lang}: ❌ Error - ${error.message}`)
      }
    }
    console.log('')
  }

  console.log('✅ Translation test completed!')
}

testTranslation().catch(console.error)
