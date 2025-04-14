export const i18n = {
  locales: [
    { code: 'nb-NO', name: 'Norsk', icon: '🇳🇴', direction: 'ltr' },
    { code: 'en-US', name: 'English', icon: '🇺🇸', direction: 'ltr' },
    { code: 'ar', name: 'العربية', icon: '🇸🇦', direction: 'rtl' },
  ],
  defaultLocale: 'nb-NO',
}

export const getDirection = (locale: string) => {
  const localeConfig = i18n.locales.find((l) => l.code === locale)
  return localeConfig?.direction || 'ltr'
}
export type I18nConfig = typeof i18n
export type Locale = I18nConfig['locales'][number]
