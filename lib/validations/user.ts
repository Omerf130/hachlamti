import { z } from 'zod'

/**
 * Schema for user signup
 */
export const signupSchema = z
  .object({
    email: z.string().email('כתובת אימייל לא תקינה'),
    password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'הסיסמאות אינן תואמות',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

