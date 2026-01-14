'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupInput } from '@/lib/validations/user'
import { signup } from '@/app/actions/user'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.scss'

export default function SignupForm(): JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput): Promise<void> => {
    setError('')
    setLoading(true)

    try {
      // Create user account
      const result = await signup({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Automatically sign in the user after successful signup
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError('המשתמש נוצר בהצלחה, אך לא ניתן להתחבר. אנא נסה להתחבר ידנית.')
        setLoading(false)
        return
      }

      setSuccess(true)
      // Redirect to home page after 1 second
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
    } catch (err) {
      setError('שגיאה ביצירת המשתמש. אנא נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <p>ההרשמה בוצעה בהצלחה!</p>
        <p>מעבירים אותך לדף הבית...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="email">אימייל *</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          placeholder="הכנס כתובת אימייל"
          disabled={loading}
        />
        {errors.email && (
          <span className={styles.fieldError}>{errors.email.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">סיסמה *</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          placeholder="הכנס סיסמה (לפחות 6 תווים)"
          disabled={loading}
        />
        {errors.password && (
          <span className={styles.fieldError}>{errors.password.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword">אימות סיסמה *</label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          placeholder="הכנס שוב את הסיסמה"
          disabled={loading}
        />
        {errors.confirmPassword && (
          <span className={styles.fieldError}>
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'נרשם...' : 'הרשמה'}
      </button>

      <div className={styles.loginLink}>
        <p>
          כבר יש לך חשבון?{' '}
          <a href="/login" className={styles.link}>
            התחבר כאן
          </a>
        </p>
      </div>
    </form>
  )
}

