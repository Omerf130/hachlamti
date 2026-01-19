import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Allow access to login page
    if (pathname === '/login') {
      return NextResponse.next()
    }

    // Require admin role for admin routes
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    // Authenticated-only routes (require any authenticated user)
    if (pathname === '/submit-story' || pathname === '/apply-therapist') {
      if (!token) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to login page
        if (pathname === '/login') {
          return true
        }

        // Require admin role for admin routes
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }

        // Require authentication for authenticated-only routes
        if (pathname === '/submit-story' || pathname === '/apply-therapist') {
          return !!token
        }

        // Allow all other routes (public)
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/submit-story',
    '/apply-therapist',
    '/login',
  ],
}

