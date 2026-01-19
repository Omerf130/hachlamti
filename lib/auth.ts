import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

/**
 * NextAuth configuration for authentication
 * Supports both admin (env vars) and regular users (database)
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // First, check admin credentials from environment variables
          const adminEmail = process.env.ADMIN_EMAIL
          const adminPassword = process.env.ADMIN_PASSWORD

          if (adminEmail && adminPassword) {
            if (
              credentials.email === adminEmail &&
              credentials.password === adminPassword
            ) {
              return {
                id: 'admin',
                email: adminEmail,
                role: 'ADMIN',
              }
            }
          }

          // If not admin, check database for regular users
          await connectDB()
          
          // Use direct Mongoose query to ensure we get the password field
          // TypeScript workaround for Mongoose type overloads
          type UserFindOne = (filter: { email: string }) => Promise<InstanceType<typeof User> | null>
          const user = await (User.findOne as unknown as UserFindOne)({
            email: credentials.email.toLowerCase(),
          })

          if (!user) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isValidPassword) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

