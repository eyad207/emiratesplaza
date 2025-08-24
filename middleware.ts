import NextAuth from 'next-auth'
import authConfig from './auth.config'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const publicPages = [
  '/',
  '/search',
  '/sign-in',
  '/sign-up',
  '/cart',
  '/cart/(.*)',
  '/product/(.*)',
  '/page/(.*)',
  '/forgot-password',
  '/confirm-email', // Corrected spelling
  '/reset-password',
  // (/secret requires auth)
]
const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Remove locale from pathname for matching
  const pathnameWithoutLocale =
    req.nextUrl.pathname.replace(
      new RegExp(`^/(${routing.locales.join('|')})`),
      ''
    ) || '/'

  const publicPathnameRegex = RegExp(
    `^(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )

  const isPublicPage = publicPathnameRegex.test(pathnameWithoutLocale)

  if (isPublicPage) {
    return intlMiddleware(req)
  } else {
    if (!req.auth) {
      // Get the current locale from the pathname
      const localeMatch = req.nextUrl.pathname.match(
        new RegExp(`^/(${routing.locales.join('|')})`)
      )
      const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale

      const signInUrl = new URL(
        `/${currentLocale}/sign-in?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`,
        req.nextUrl.origin
      )
      return Response.redirect(signInUrl)
    } else {
      return intlMiddleware(req)
    }
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.* (files with extensions)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
