'use server'

import { connectDB } from '@/lib/db'
import { findOne } from '@/lib/db-queries'
import { signupSchema } from '@/lib/validations/user'
import User, { type UserDocument } from '@/models/User'
import { ZodError } from 'zod'
import bcrypt from 'bcryptjs'

/**
 * Server Action: Create a new user account
 * Validates input, checks for existing email, hashes password, and creates user
 */
export async function signup(
  input: unknown
): Promise<{ success: true; userId: string } | { success: false; error: string }> {
  try {
    // Validate input
    const validated = signupSchema.parse(input)

    // Connect to database
    await connectDB()

    // Ensure User model is imported
    await import('@/models/User')

    // Check if user already exists
    const existingUser = await findOne<UserDocument>('User', {
      email: validated.email.toLowerCase(),
    })
    if (existingUser) {
      return {
        success: false,
        error: 'כתובת אימייל זו כבר רשומה במערכת',
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Create user
    const user = new User({
      email: validated.email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
    })

    await user.save()

    return {
      success: true,
      userId: user._id.toString(),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError
          ? `${firstError.path.join('.')}: ${firstError.message}`
          : 'שגיאת אימות',
      }
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: 'שגיאה ביצירת המשתמש. אנא נסה שוב.',
    }
  }
}

