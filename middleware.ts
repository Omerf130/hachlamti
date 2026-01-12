import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }

        // Require admin role for admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin'
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*'],
}

