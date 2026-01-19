import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: 'BASIC' | 'THERAPIST' | 'ADMIN'
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      role?: 'BASIC' | 'THERAPIST' | 'ADMIN'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'BASIC' | 'THERAPIST' | 'ADMIN'
    id?: string
  }
}

