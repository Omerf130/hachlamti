import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'onboarding@resend.dev'

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  const { data, error } = await resend.emails.send({
    from: `החלמתי <${FROM_EMAIL}>`,
    to: email,
    subject: 'איפוס סיסמה - החלמתי',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">איפוס סיסמה</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          שלום,
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          קיבלנו בקשה לאיפוס הסיסמה שלך באתר החלמתי. לחץ על הכפתור למטה כדי ליצור סיסמה חדשה:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #A7B88D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
            איפוס סיסמה
          </a>
        </div>
        <p style="color: #888; font-size: 14px; line-height: 1.6;">
          קישור זה תקף לשעה אחת בלבד. אם לא ביקשת לאפס את הסיסמה, ניתן להתעלם מהודעה זו.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          החלמתי - פלטפורמה לסיפורי החלמה וחיבור למטפלים
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }

  console.log('Email sent successfully, id:', data?.id)
}
