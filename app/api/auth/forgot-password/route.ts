import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'אנא הזן כתובת אימייל' },
        { status: 400 }
      )
    }

    await connectDB()

    type UserFindOne = (filter: Record<string, unknown>) => Promise<InstanceType<typeof User> | null>
    const user = await (User.findOne as unknown as UserFindOne)({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'אם האימייל קיים במערכת, נשלח אליך קישור לאיפוס הסיסמה',
      })
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    user.resetToken = hashedToken
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    await sendPasswordResetEmail(user.email, rawToken)

    return NextResponse.json({
      message: 'אם האימייל קיים במערכת, נשלח אליך קישור לאיפוס הסיסמה',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'אירעה שגיאה. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    )
  }
}
