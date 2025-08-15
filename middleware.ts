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
  // Note: /checkout requires auth and should handle its own redirect
]

// Protected pages that require auth but should handle their own redirects
const protectedPages = ['/checkout', '/checkout/(.*)', '/admin', '/admin/(.*)']
const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )

  const protectedPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${protectedPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)
  const isProtectedPage = protectedPathnameRegex.test(req.nextUrl.pathname)

  if (isPublicPage) {
    // Public pages - allow access and apply i18n
    return intlMiddleware(req)
  } else if (isProtectedPage) {
    // Protected pages - let them handle their own auth redirects
    // but still apply i18n middleware
    return intlMiddleware(req)
  } else {
    // Other private pages - check auth here
    if (!req.auth) {
      const newUrl = new URL(
        `/sign-in?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`,
        req.nextUrl.origin
      )
      return Response.redirect(newUrl)
    } else {
      return intlMiddleware(req)
    }
  }
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
