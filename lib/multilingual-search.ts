'use server'

import { translationService } from './translation-new'
import { cache } from 'react'

export interface MultilingualSearchOptions {
  query: string
  category: string
  targetLanguage: 'ar' | 'en-US' | 'nb-NO'
  sourceLanguage?: string
}

export interface ProcessedSearchTerms {
  originalQuery: string
  translatedQueries: string[]
  originalCategory: string
  translatedCategories: string[]
  detectedLanguage?: string
}

export interface MongoFilter {
  $or?: Array<Record<string, unknown>>
  $and?: Array<Record<string, unknown>>
  category?: Record<string, unknown>
  [key: string]: unknown
}

class MultilingualSearch {
  /**
   * Detects the language of the input text based on character patterns
   */
  public detectLanguage(text: string): string {
    if (!text) return 'en-US'

    const normalizedText = text.toLowerCase().trim()

    // Arabic detection - look for Arabic script
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar'
    }

    // Norwegian detection - look for specific Norwegian characters
    if (/[æøåÆØÅ]/.test(text)) {
      return 'nb-NO'
    }

    // Enhanced Norwegian words/phrases detection
    const norwegianWords = [
      // Common words
      'og',
      'eller',
      'for',
      'med',
      'på',
      'av',
      'til',
      'fra',
      'som',
      'jeg',
      'du',
      'han',
      'hun',
      'det',
      'vi',
      'de',
      'ikke',
      'være',
      'ha',
      'kunne',
      'skulle',
      'ville',
      'få',
      // Product-related Norwegian words
      'sko',
      'skjorte',
      'bukse',
      'jakke',
      'kjole',
      'genser',
      'trøye',
      'shorts',
      'jeans',
      'undertøy',
      // Shopping/ecommerce related Norwegian words
      'pris',
      'kvalitet',
      'størrelse',
      'farge',
      'merke',
      'produkter',
      'kjøp',
      'salg',
      'tilbud',
      // Color names in Norwegian
      'rød',
      'blå',
      'grønn',
      'gul',
      'svart',
      'hvit',
      'grå',
      'brun',
      'rosa',
      'lilla',
      // Category names in Norwegian
      'klær',
      'elektronikk',
      'hjem',
      'hage',
      'sport',
      'barn',
      'dame',
      'herre',
      // Norwegian specific words that are different from English
      'størrelse',
      'levering',
      'bestilling',
      'betaling',
      'retur',
      'garanti',
      // Common Norwegian adjectives for products
      'god',
      'beste',
      'billig',
      'dyr',
      'ny',
      'brukt',
      'stor',
      'liten',
      'lett',
      'tung',
    ]

    const words = normalizedText.split(/\s+/)

    // Check if any word is specifically Norwegian
    for (const word of words) {
      if (norwegianWords.includes(word)) {
        return 'nb-NO'
      }
    }

    // Check for Norwegian word patterns or endings
    for (const word of words) {
      // Norwegian word endings that are distinctive
      if (
        word.length > 3 &&
        (word.endsWith('else') || // Norwegian: størrelse, hastighelse
          word.endsWith('het') || // Norwegian: kvalitet, sikkerhet
          word.endsWith('ing') || // Norwegian: levering, bestilling (though English has this too)
          word.endsWith('skap') || // Norwegian: landskap, partnerskap
          word.endsWith('dom')) // Norwegian: fridom, visdom
      ) {
        return 'nb-NO'
      }
    }

    // Check for multiple Norwegian characteristics
    const norwegianMatches = words.filter((word) =>
      norwegianWords.includes(word)
    ).length
    if (norwegianMatches > 0) {
      return 'nb-NO'
    }

    // If it's a single word and contains certain letter combinations common in Norwegian
    if (words.length === 1) {
      const word = words[0]
      // Norwegian letter combinations
      if (
        word.includes('skj') ||
        word.includes('kj') ||
        word.includes('øy') ||
        word.includes('ey') ||
        word.includes('åk') ||
        word.includes('ål')
      ) {
        return 'nb-NO'
      }
    }

    // Default to English
    return 'en-US'
  } /**
   * Common product term mappings for multilingual search
   */
  private getCommonProductTerms(): Record<string, Record<string, string[]>> {
    return {
      ar: {
        حذاء: ['shoe', 'shoes', 'sneaker', 'sneakers', 'footwear'],
        قميص: ['shirt', 't-shirt', 'tshirt', 'top'],
        بنطلون: ['pants', 'trousers', 'jeans', 'bottom'],
        فستان: ['dress', 'gown'],
        جاكيت: ['jacket', 'coat', 'blazer'],
        ساعة: ['watch', 'timepiece'],
        هاتف: ['phone', 'mobile', 'smartphone'],
        حقيبة: ['bag', 'handbag', 'purse', 'backpack'],
        نظارة: ['glasses', 'sunglasses', 'eyewear'],
        سوار: ['bracelet', 'wristband'],
      },
      'nb-NO': {
        sko: ['shoe', 'shoes', 'sneaker', 'sneakers', 'footwear'],
        skjorte: ['shirt', 't-shirt', 'tshirt', 'top'],
        bukse: ['pants', 'trousers', 'jeans', 'bottom'],
        kjole: ['dress', 'gown'],
        jakke: ['jacket', 'coat', 'blazer'],
        klokke: ['watch', 'timepiece'],
        telefon: ['phone', 'mobile', 'smartphone'],
        veske: ['bag', 'handbag', 'purse', 'backpack'],
        briller: ['glasses', 'sunglasses', 'eyewear'],
        armbånd: ['bracelet', 'wristband'],
      },
      'en-US': {
        shoes: ['حذاء', 'sko'],
        shirt: ['قميص', 'skjorte'],
        pants: ['بنطلون', 'bukse'],
        dress: ['فستان', 'kjole'],
        jacket: ['جاكيت', 'jakke'],
        watch: ['ساعة', 'klokke'],
        phone: ['هاتف', 'telefon'],
        bag: ['حقيبة', 'veske'],
        glasses: ['نظارة', 'briller'],
        bracelet: ['سوار', 'armbånd'],
      },
    }
  }

  /**
   * Translates a search query to all supported languages to ensure comprehensive search coverage
   * Uses simple product term mappings for better accuracy
   */
  private async translateToAllLanguages(
    text: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    if (!text || text.trim() === '' || text === 'all') {
      return [text]
    }

    const detectedLang = sourceLanguage || this.detectLanguage(text)
    const translations = new Set([text]) // Always include original
    const lowerText = text.toLowerCase().trim()

    // Generate fuzzy variations of the original text for typo tolerance
    const fuzzyVariations = this.generateFuzzyVariations(text)
    fuzzyVariations.forEach((variation) => translations.add(variation))

    // Check if this is a common product term we can directly map
    const productTerms = this.getCommonProductTerms()

    // Check if the query matches any common product terms
    if (productTerms[detectedLang as keyof typeof productTerms]) {
      const termMappings =
        productTerms[detectedLang as keyof typeof productTerms]

      for (const [term, equivalents] of Object.entries(termMappings)) {
        if (
          lowerText === term.toLowerCase() ||
          lowerText.includes(term.toLowerCase())
        ) {
          // Add direct English equivalents
          equivalents.forEach((equiv) => {
            translations.add(equiv)
            translations.add(equiv.toLowerCase())
          })
        }
      }
    }

    // For common English terms, add their foreign equivalents
    if (detectedLang === 'en-US') {
      const englishTerms = productTerms['en-US']
      for (const [englishTerm, foreignEquivalents] of Object.entries(
        englishTerms
      )) {
        if (
          lowerText === englishTerm.toLowerCase() ||
          lowerText.includes(englishTerm.toLowerCase())
        ) {
          foreignEquivalents.forEach((equiv) => translations.add(equiv))
        }
      }
    }

    // Only use translation service as fallback for terms we don't have mappings for
    const hasDirectMapping =
      Array.from(translations).length > fuzzyVariations.length + 1

    if (!hasDirectMapping) {
      try {
        const targetLanguages: ('ar' | 'en-US' | 'nb-NO')[] = [
          'ar',
          'en-US',
          'nb-NO',
        ]

        for (const targetLang of targetLanguages) {
          if (targetLang === detectedLang) continue
          try {
            const result = await translationService.translate({
              text,
              targetLanguage: targetLang,
              sourceLanguage: detectedLang,
            })

            if (result.translatedText && result.translatedText !== text) {
              // For translated text, try to extract simple terms instead of complex phrases
              const simplifiedTranslation = this.extractSimpleTerms(
                result.translatedText
              )
              translations.add(simplifiedTranslation)
              translations.add(simplifiedTranslation.toLowerCase())
            }
          } catch (error) {
            console.warn(`Translation failed for ${targetLang}:`, error)
          }
        }
      } catch (error) {
        console.warn('Translation service error:', error)
      }
    }

    return Array.from(translations)
  }
  /**
   * Extracts simple product terms from complex translated phrases
   */
  private extractSimpleTerms(translatedText: string): string {
    // Remove common phrases and extract the core product term
    const simplified = translatedText
      .replace(/^(a pair of|en|et)\s+/i, '') // Remove "a pair of", "en", "et"
      .replace(/\s*\.\.\.\s*/g, '') // Remove "..."
      .replace(/[!?,.]/g, '') // Remove punctuation
      .trim()

    // If it's still a complex phrase, try to extract the key noun
    const words = simplified.split(/\s+/)
    if (words.length > 2) {
      // Look for common product keywords
      const productKeywords = [
        'shoes',
        'shoe',
        'shirt',
        'pants',
        'dress',
        'jacket',
        'watch',
        'phone',
        'bag',
      ]
      const foundKeyword = words.find((word) =>
        productKeywords.some((keyword) =>
          word.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      if (foundKeyword) {
        return foundKeyword
      }
      // Otherwise, take the last word which is often the noun
      return words[words.length - 1]
    }

    return simplified
  }
  /**
   * Creates multiple search patterns for MongoDB regex matching
   * Enhanced with fuzzy search capabilities
   */ private createSearchPatterns(
    terms: string[],
    restrictive: boolean = false
  ): Array<{ $regex: string; $options: string }> {
    const patterns = []

    for (const term of terms) {
      if (!term || term.trim() === '') continue

      // Escape special regex characters
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      // Add exact match pattern
      patterns.push({
        $regex: escapedTerm,
        $options: 'i',
      })

      // Add word boundary patterns for better matching
      patterns.push({
        $regex: `\\b${escapedTerm}\\b`,
        $options: 'i',
      })

      // Add partial match for compound words
      if (escapedTerm.length > 3) {
        patterns.push({
          $regex: `${escapedTerm}`,
          $options: 'i',
        })
      }

      // Add fuzzy patterns for typo tolerance only if not restrictive
      if (!restrictive && term.length >= 4) {
        // Increased minimum length from 3 to 4
        // Create pattern that allows for single character differences
        const chars = escapedTerm.split('')

        // Pattern for missing character (e.g., "shos" should match "shoes") - only for longer terms
        if (chars.length >= 4) {
          // Increased from 3 to 4
          for (let i = 0; i < chars.length; i++) {
            const pattern = chars
              .slice(0, i)
              .concat(chars.slice(i + 1))
              .join('.')
            if (pattern.length >= 3) {
              // Increased from 2 to 3
              patterns.push({
                $regex: pattern,
                $options: 'i',
              })
            }
          }
        }

        // Pattern for extra character (e.g., "shoeees" should match "shoes")
        const deduplicatedPattern = escapedTerm.replace(/(.)\1+/g, '$1')
        if (
          deduplicatedPattern !== escapedTerm &&
          deduplicatedPattern.length >= 3
        ) {
          patterns.push({
            $regex: deduplicatedPattern,
            $options: 'i',
          })
        }
      }
    }

    return patterns
  }

  /**
   * Processes search terms and categories for multilingual search
   */
  async processSearchTerms(
    options: MultilingualSearchOptions
  ): Promise<ProcessedSearchTerms> {
    const { query, category, sourceLanguage } = options

    // Detect language if not provided
    const detectedLanguage =
      sourceLanguage || this.detectLanguage(query || category)

    // Process query
    const translatedQueries =
      query === 'all' || !query
        ? [query]
        : await this.translateToAllLanguages(query, detectedLanguage)

    // Process category
    let translatedCategories = [category]
    if (category !== 'all' && category) {
      translatedCategories = await this.translateToAllLanguages(
        category,
        detectedLanguage
      )
    }

    return {
      originalQuery: query,
      translatedQueries,
      originalCategory: category,
      translatedCategories,
      detectedLanguage,
    }
  }
  /**
   * Creates a MongoDB query filter for multilingual search
   */ createMultilingualFilter(searchTerms: ProcessedSearchTerms): MongoFilter {
    const filters: MongoFilter = {}

    // Query filter - search in name, description, and category
    if (searchTerms.originalQuery && searchTerms.originalQuery !== 'all') {
      const queryPatterns = this.createSearchPatterns(
        searchTerms.translatedQueries,
        true // Use restrictive mode for search results
      )

      // Create $or conditions for different fields
      const searchConditions = []

      // Search in product name
      for (const pattern of queryPatterns) {
        searchConditions.push({ name: pattern })
      }

      // Search in product description
      for (const pattern of queryPatterns) {
        searchConditions.push({ description: pattern })
      }

      // Search in brand
      for (const pattern of queryPatterns) {
        searchConditions.push({ brand: pattern })
      }

      if (searchConditions.length > 0) {
        filters.$or = searchConditions
      }
    }

    // Category filter
    if (
      searchTerms.originalCategory &&
      searchTerms.originalCategory !== 'all'
    ) {
      const categoryPatterns = this.createSearchPatterns(
        searchTerms.translatedCategories,
        false // Less restrictive for categories
      )

      // For category, we want exact or partial matches
      const categoryConditions = categoryPatterns.map((pattern) => ({
        category: pattern,
      }))

      if (filters.$or && categoryConditions.length > 0) {
        // If we already have query filters, add category as additional AND condition
        // We'll use $or for categories too, but wrap it properly
        filters.$and = [{ $or: filters.$or }, { $or: categoryConditions }]
        delete filters.$or
      } else if (categoryConditions.length > 0) {
        // If no query, just filter by category
        filters.$or = categoryConditions
      }
    }

    return filters
  }

  /**
   * Fetch all unique product categories from the database
   */
  private async getProductCategories(): Promise<string[]> {
    try {
      const { getAllCategories } = await import('./actions/product.actions')
      const categories = await getAllCategories()
      return categories || []
    } catch (error) {
      console.error('Error fetching product categories:', error)
      return []
    }
  }

  /**
   * Translate categories to the target language
   */
  async translateCategories(
    categories: string[],
    targetLanguage: 'ar' | 'en-US' | 'nb-NO'
  ): Promise<Array<{ original: string; translated: string }>> {
    const translatedCategories: Array<{
      original: string
      translated: string
    }> = []

    for (const category of categories) {
      try {
        // Try to translate category to target language
        const translationResult = await translationService.translate({
          text: category,
          targetLanguage,
          sourceLanguage: 'en-US', // Categories are typically stored in English
        })
        if (translationResult.translatedText) {
          translatedCategories.push({
            original: category,
            translated: translationResult.translatedText,
          })
        } else {
          // Fallback to original category if translation fails
          translatedCategories.push({
            original: category,
            translated: category,
          })
        }
      } catch (error) {
        console.error(`Error translating category "${category}":`, error)
        // Fallback to original category
        translatedCategories.push({
          original: category,
          translated: category,
        })
      }
    }

    return translatedCategories
  }

  /**
   * Calculate Levenshtein distance between two strings (edit distance)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length
    const matrix = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(null))

    for (let i = 0; i <= len1; i++) matrix[i][0] = i
    for (let j = 0; j <= len2; j++) matrix[0][j] = j

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        )
      }
    }

    return matrix[len1][len2]
  }

  /**
   * Calculate similarity ratio between two strings (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const maxLen = Math.max(str1.length, str2.length)
    if (maxLen === 0) return 1
    const distance = this.levenshteinDistance(
      str1.toLowerCase(),
      str2.toLowerCase()
    )
    return (maxLen - distance) / maxLen
  }
  /**
   * Generate fuzzy variations of a search term to handle typos
   */
  private generateFuzzyVariations(term: string): string[] {
    if (!term || term.length < 3) return [term]

    const variations = new Set([term])
    const lowerTerm = term.toLowerCase()

    // Common product keywords with typical misspellings
    const commonCorrections: Record<string, string[]> = {
      shoes: ['shos', 'shose', 'sheos', 'shoeees', 'shue', 'sho', 'shoess'],
      shirt: ['shrit', 'shart', 'shitr', 'shirtt', 'shiert'],
      pants: ['pnts', 'panst', 'pantss', 'pant'],
      jacket: ['jaket', 'jacet', 'jackeet', 'jakett'],
      dress: ['dres', 'drss', 'dresss', 'dresse'],
      jeans: ['jens', 'jeanes', 'jean', 'janes'],
      watch: ['wach', 'watsh', 'wath', 'watchh'],
      phone: ['phon', 'fone', 'phne', 'phonee'],
      computer: ['compter', 'computr', 'comuter', 'computerr'],
      laptop: ['lptop', 'labtop', 'laptpp', 'laptopp'],
      // Norwegian corrections
      sko: ['sk', 'skoo', 'soko', 'skko'],
      skjorte: ['skjore', 'skjrt', 'skjorta'],
      bukse: ['bukse', 'bkse', 'buksse'],
    }

    // Check if the input term is a misspelling of a known word
    for (const [correct, misspellings] of Object.entries(commonCorrections)) {
      if (misspellings.includes(lowerTerm)) {
        variations.add(correct)
        variations.add(correct.charAt(0).toUpperCase() + correct.slice(1))
      }
      // Also check if input is close to the correct word
      if (this.calculateSimilarity(lowerTerm, correct) >= 0.7) {
        variations.add(correct)
      }
    }

    // Generate phonetic variations for common substitutions
    const phoneticVariations = lowerTerm
      .replace(/ph/g, 'f') // phone → fone
      .replace(/ck/g, 'k') // jacket → jaket
      .replace(/ee/g, 'e') // shoes → shose
      .replace(/([aeiou])\1/g, '$1') // remove double vowels

    if (phoneticVariations !== lowerTerm) {
      variations.add(phoneticVariations)
    }

    // Generate common typo patterns
    const chars = lowerTerm.split('')

    // Transpose adjacent characters (shoes → sheos)
    for (let i = 0; i < chars.length - 1; i++) {
      const transposed = [...chars]
      ;[transposed[i], transposed[i + 1]] = [transposed[i + 1], transposed[i]]
      variations.add(transposed.join(''))
    }

    // Remove double letters (shoeees → shoes)
    const deduplicated = lowerTerm.replace(/(.)\1+/g, '$1')
    if (deduplicated !== lowerTerm) {
      variations.add(deduplicated)
    }

    // Add missing letters at end (sho → shoes for similarity check)
    if (lowerTerm.length >= 3) {
      for (const [correct] of Object.entries(commonCorrections)) {
        if (
          correct.startsWith(lowerTerm) &&
          correct.length <= lowerTerm.length + 3
        ) {
          variations.add(correct)
        }
      }
    }

    return Array.from(variations)
  } /**
   * Generate search suggestions based on partial input
   * Includes spell checking and auto-complete functionality
   */
  async generateSearchSuggestions(
    partialQuery: string,
    targetLanguage: 'ar' | 'en-US' | 'nb-NO' = 'en-US',
    limit: number = 5
  ): Promise<string[]> {
    if (!partialQuery || partialQuery.length < 2) return []

    const suggestions = new Set<string>()
    const lowerQuery = partialQuery.toLowerCase()

    try {
      // First priority: Fetch actual product categories that have products
      const categoriesWithProducts = await this.getCategoriesWithProducts()
      const translatedCategories = await this.translateCategories(
        categoriesWithProducts,
        targetLanguage
      )

      // Find categories that match the query
      for (const categoryObj of translatedCategories) {
        const category = categoryObj.translated
        const lowerCategory = category.toLowerCase()

        // Exact start matches
        if (lowerCategory.startsWith(lowerQuery)) {
          suggestions.add(category)
        }
        // Contains matches
        else if (lowerCategory.includes(lowerQuery)) {
          suggestions.add(category)
        }
        // More strict fuzzy matches for categories (higher threshold)
        else {
          const similarity = this.calculateSimilarity(lowerQuery, lowerCategory)
          if (similarity >= 0.8) {
            // Increased from 0.6 to 0.8 for more strict matching
            suggestions.add(category)
          }
        }
      }

      // Second priority: Get actual product names that match
      if (suggestions.size < limit) {
        const matchingProducts = await this.getMatchingProductNames(
          partialQuery,
          limit - suggestions.size
        )
        for (const productName of matchingProducts) {
          if (suggestions.size >= limit) break
          suggestions.add(productName)
        }
      }
    } catch (error) {
      console.error('Error fetching categories for suggestions:', error)
    }

    // If we still have room for more suggestions, add common product search terms
    if (suggestions.size < limit) {
      const commonTerms: Record<string, string[]> = {
        'en-US': [
          'shoes',
          'shirt',
          'pants',
          'dress',
          'jacket',
          'jeans',
          'watch',
          'phone',
          'laptop',
          'computer',
          'headphones',
          'camera',
          'bag',
          'wallet',
          'belt',
          'sneakers',
          'boots',
          'sandals',
          'shorts',
          'skirt',
          'sweater',
          'hoodie',
        ],
        'nb-NO': [
          'sko',
          'skjorte',
          'bukse',
          'kjole',
          'jakke',
          'jeans',
          'klokke',
          'telefon',
          'laptop',
          'datamaskin',
          'hodetelefoner',
          'kamera',
          'veske',
          'lommebok',
          'belte',
          'joggesko',
          'støvler',
          'sandaler',
          'shorts',
          'skjørt',
          'genser',
          'hettegenser',
        ],
        ar: [
          'حذاء',
          'قميص',
          'بنطلون',
          'فستان',
          'سترة',
          'جينز',
          'ساعة',
          'هاتف',
          'لابتوب',
          'كمبيوتر',
          'سماعات',
          'كاميرا',
          'حقيبة',
          'محفظة',
          'حزام',
        ],
      }

      const termsForLanguage =
        commonTerms[targetLanguage] || commonTerms['en-US']

      // Find terms that start with the partial query
      for (const term of termsForLanguage) {
        if (suggestions.size >= limit) break
        if (term.toLowerCase().startsWith(lowerQuery)) {
          suggestions.add(term)
        }
      }

      // Find terms that contain the partial query
      for (const term of termsForLanguage) {
        if (suggestions.size >= limit) break
        if (
          term.toLowerCase().includes(lowerQuery) &&
          !term.toLowerCase().startsWith(lowerQuery)
        ) {
          suggestions.add(term)
        }
      }

      // Add fuzzy matches for typo tolerance
      for (const term of termsForLanguage) {
        if (suggestions.size >= limit) break
        const similarity = this.calculateSimilarity(
          lowerQuery,
          term.toLowerCase()
        )
        if (similarity >= 0.6 && similarity < 1.0) {
          suggestions.add(term)
        }
      }
    }

    // Convert to array and limit results
    return Array.from(suggestions).slice(0, limit)
  }
  /**
   * Detect if a query might be misspelled and suggest corrections
   */
  async detectAndCorrectSpelling(
    query: string,
    targetLanguage: 'ar' | 'en-US' | 'nb-NO' = 'en-US'
  ): Promise<{
    isLikelyMisspelled: boolean
    suggestions: string[]
    correctedQuery?: string
  }> {
    if (!query || query.length < 3) {
      return { isLikelyMisspelled: false, suggestions: [] }
    }
    const lowerQuery = query.toLowerCase()

    // Common product keywords with typical misspellings
    const commonCorrections: Record<string, string[]> = {
      shoes: ['shos', 'shose', 'sheos', 'shoeees', 'shue', 'sho', 'shoess'],
      shirt: ['shrit', 'shart', 'shitr', 'shirtt', 'shiert'],
      pants: ['pnts', 'panst', 'pantss', 'pant'],
      jacket: ['jaket', 'jacet', 'jackeet', 'jakett'],
      dress: ['dres', 'drss', 'dresss', 'dresse'],
      jeans: ['jens', 'jeanes', 'jean', 'janes'],
      watch: ['wach', 'watsh', 'wath', 'watchh'],
      phone: ['phon', 'fone', 'phne', 'phonee'],
      computer: ['compter', 'computr', 'comuter', 'computerr'],
      laptop: ['lptop', 'labtop', 'laptpp', 'laptopp'],
      // Norwegian corrections
      sko: ['sk', 'skoo', 'soko', 'skko'],
      skjorte: ['skjore', 'skjrt', 'skjorta'],
      bukse: ['bukse', 'bkse', 'buksse'],
      // Arabic corrections (shoes = حذاء)
      حذاء: ['حدا', 'حذا', 'حداء', 'حذائ', 'حذاؤ'],
      // Arabic corrections (shirt = قميص)
      قميص: ['قمص', 'قميس', 'قمیص', 'قميصs'],
      // Arabic corrections (pants = بنطلون)
      بنطلون: ['بنطلن', 'بنطال', 'بنطلوں'],
      // Arabic corrections (watch = ساعة)
      ساعة: ['ساعه', 'ساعة', 'ساعاة'],
      // Arabic corrections (phone = هاتف)
      هاتف: ['هاتفf', 'هاتففf', 'هاتv'],
    }

    // Check if the input is actually a known misspelling
    let correctedQuery: string | undefined
    let isLikelyMisspelled = false

    for (const [correct, misspellings] of Object.entries(commonCorrections)) {
      if (misspellings.includes(lowerQuery)) {
        correctedQuery = correct
        isLikelyMisspelled = true
        break
      }
    }

    // If not a known misspelling, check if it's close to a correct word but not exact
    if (!isLikelyMisspelled) {
      for (const [correct] of Object.entries(commonCorrections)) {
        const similarity = this.calculateSimilarity(lowerQuery, correct)
        // Only suggest if it's similar but not exact, and similarity is high
        if (similarity >= 0.8 && similarity < 1.0 && lowerQuery !== correct) {
          correctedQuery = correct
          isLikelyMisspelled = true
          break
        }
      }
    }

    // Get suggestions based on the corrected query or original
    const suggestions = await this.generateSearchSuggestions(
      correctedQuery || query,
      targetLanguage,
      3
    )

    return {
      isLikelyMisspelled,
      suggestions: isLikelyMisspelled ? suggestions : [],
      correctedQuery,
    }
  }

  /**
   * Fetch all unique product categories that actually have products
   */
  private async getCategoriesWithProducts(): Promise<string[]> {
    try {
      const { connectToDatabase } = await import('./db')
      const Product = (await import('./db/models/product.model')).default

      await connectToDatabase()

      // Get categories that have at least one published product
      const categoriesWithProducts = await Product.distinct('category', {
        isPublished: true,
        category: { $exists: true, $ne: null },
      })

      return categoriesWithProducts.filter((cat) => cat && cat.trim() !== '')
    } catch (error) {
      console.error('Error fetching categories with products:', error)
      return []
    }
  }
  /**
   * Get product names that match the partial query
   */
  private async getMatchingProductNames(
    partialQuery: string,
    limit: number
  ): Promise<string[]> {
    try {
      const { connectToDatabase } = await import('./db')
      const Product = (await import('./db/models/product.model')).default

      await connectToDatabase()

      // Search for products whose names contain the query
      const products = await Product.find({
        isPublished: true,
        name: {
          $regex: partialQuery,
          $options: 'i',
        },
      })
        .select('name')
        .limit(limit)
        .lean()

      return products
        .map((p) => p.name)
        .filter((name) => name && name.trim() !== '')
    } catch (error) {
      console.error('Error fetching matching product names:', error)
      return []
    }
  }
}

// Cache the multilingual search instance
const getMultilingualSearchInstance = cache(() => new MultilingualSearch())

/**
 * Main function to process search terms for multilingual search
 */
export async function processMultilingualSearch(
  options: MultilingualSearchOptions
): Promise<ProcessedSearchTerms> {
  const search = getMultilingualSearchInstance()
  return search.processSearchTerms(options)
}

/**
 * Creates MongoDB filter for multilingual search
 */
export async function createMultilingualSearchFilter(
  searchTerms: ProcessedSearchTerms
): Promise<MongoFilter> {
  const search = getMultilingualSearchInstance()
  return search.createMultilingualFilter(searchTerms)
}

/**
 * Translates categories for display in target language
 */
export async function translateCategoriesForDisplay(
  categories: string[],
  targetLanguage: 'ar' | 'en-US' | 'nb-NO'
): Promise<Array<{ original: string; translated: string }>> {
  const search = getMultilingualSearchInstance()
  return search.translateCategories(categories, targetLanguage)
}

/**
 * Generate search suggestions for auto-complete
 */
export async function generateSearchSuggestions(
  partialQuery: string,
  targetLanguage: 'ar' | 'en-US' | 'nb-NO' = 'en-US',
  limit: number = 5
): Promise<string[]> {
  const search = getMultilingualSearchInstance()
  return search.generateSearchSuggestions(partialQuery, targetLanguage, limit)
}

/**
 * Detect and correct spelling errors in search queries
 */
export async function detectAndCorrectSpelling(
  query: string,
  targetLanguage: 'ar' | 'en-US' | 'nb-NO' = 'en-US'
): Promise<{
  isLikelyMisspelled: boolean
  suggestions: string[]
  correctedQuery?: string
}> {
  const search = getMultilingualSearchInstance()
  return search.detectAndCorrectSpelling(query, targetLanguage)
}

/**
 * Detect the language of a search query
 */
export async function detectQueryLanguage(
  query: string
): Promise<'ar' | 'en-US' | 'nb-NO'> {
  const search = getMultilingualSearchInstance()
  return search.detectLanguage(query) as 'ar' | 'en-US' | 'nb-NO'
}

export { MultilingualSearch }
