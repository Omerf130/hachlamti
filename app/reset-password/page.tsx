'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './reset-password.module.scss'

function ResetPasswordForm(): JSX.Element {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token || !email) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorMessage}>
            <h1 className={styles.title}>קישור לא תקין</h1>
            <p className={styles.errorText}>
              הקישור אינו תקין או שפג תוקפו. אנא בקש קישור חדש לאיפוס הסיסמה.
            </p>
            <a href="/forgot-password" className={styles.actionLink}>
              בקש קישור חדש
            </a>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'אירעה שגיאה. אנא נסה שוב.')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('אירעה שגיאה. אנא נסה שוב מאוחר יותר.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>&#10003;</span>
            <h1 className={styles.title}>הסיסמה עודכנה בהצלחה!</h1>
            <p className={styles.successText}>
              כעת תוכל להתחבר עם הסיסמה החדשה שלך.
            </p>
            <a href="/login" className={styles.actionLink}>
              עבור להתחברות
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>איפוס סיסמה</h1>
        <p className={styles.subtitle}>הזן את הסיסמה החדשה שלך.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="password">סיסמה חדשה</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="לפחות 6 תווים"
              minLength={6}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword">אימות סיסמה</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="הכנס שוב את הסיסמה"
            />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'מעדכן...' : 'עדכן סיסמה'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <p style={{ textAlign: 'center' }}>טוען...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
