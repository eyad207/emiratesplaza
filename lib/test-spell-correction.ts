import { detectAndCorrectSpelling } from '@/lib/multilingual-search'

export async function testSpellCorrection() {
  console.log('🧪 Testing Enhanced Spell Correction...\n')

  const testCases = [
    { input: 'kso', expected: 'sko', language: 'nb-NO' as const },
    { input: 'احاذيي', expected: 'حذاء', language: 'ar' as const },
    { input: 'skjort', expected: 'skjorte', language: 'nb-NO' as const },
    { input: 'shos', expected: 'shoes', language: 'en-US' as const },
    { input: 'bkse', expected: 'bukse', language: 'nb-NO' as const },
    { input: 'قمص', expected: 'قميص', language: 'ar' as const },
  ]

  for (const testCase of testCases) {
    try {
      const result = await detectAndCorrectSpelling(
        testCase.input,
        testCase.language
      )

      const status =
        result.isLikelyMisspelled && result.correctedQuery === testCase.expected
          ? '✅ PASS'
          : '❌ FAIL'

      console.log(
        `${status} | Input: "${testCase.input}" | Expected: "${testCase.expected}" | Got: "${result.correctedQuery || 'none'}" | Misspelled: ${result.isLikelyMisspelled}`
      )

      if (result.suggestions.length > 0) {
        console.log(`   📝 Suggestions: [${result.suggestions.join(', ')}]`)
      }
      console.log('')
    } catch (error) {
      console.error(`❌ ERROR testing "${testCase.input}":`, error)
    }
  }

  console.log('🏁 Test complete!')
}

// Export for use in API endpoints or direct testing
export default testSpellCorrection
