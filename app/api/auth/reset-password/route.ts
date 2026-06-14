import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { message: 'חסרים פרטים נדרשים' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
        { status: 400 }
      )
    }

    await connectDB()

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    type UserFindOne = (filter: Record<string, unknown>) => Promise<InstanceType<typeof User> | null>
    const user = await (User.findOne as unknown as UserFindOne)({
      email: email.toLowerCase(),
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'הקישור אינו תקף או שפג תוקפו. אנא בקש קישור חדש.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    return NextResponse.json({
      message: 'הסיסמה עודכנה בהצלחה',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'אירעה שגיאה. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    )
  }
}
