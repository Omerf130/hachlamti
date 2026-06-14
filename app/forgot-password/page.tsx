'use client'

import { useState, FormEvent } from 'react'
import styles from './forgot-password.module.scss'

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'אירעה שגיאה. אנא נסה שוב.')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError('אירעה שגיאה. אנא נסה שוב מאוחר יותר.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>&#9993;</span>
            <h1 className={styles.title}>בדוק את האימייל שלך</h1>
            <p className={styles.successText}>
              אם האימייל קיים במערכת, נשלח אליך קישור לאיפוס הסיסמה.
              הקישור יהיה תקף לשעה אחת.
            </p>
            <a href="/login" className={styles.backLink}>
              חזרה להתחברות
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>שכחת סיסמה?</h1>
        <p className={styles.subtitle}>
          הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="email">אימייל</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="הכנס את כתובת האימייל שלך"
            />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'שולח...' : 'שלח קישור איפוס'}
          </button>
        </form>
        <div className={styles.loginLink}>
          <p>
            נזכרת בסיסמה?{' '}
            <a href="/login" className={styles.link}>
              התחבר כאן
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
