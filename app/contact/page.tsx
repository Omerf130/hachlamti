'use client'

import { useState, FormEvent } from 'react'
import styles from './contact.module.scss'

export default function ContactPage(): JSX.Element {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLoading(true)

    // Simulated delay — backend integration will be added later
    await new Promise((resolve) => setTimeout(resolve, 800))

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>&#10003;</span>
            <h1 className={styles.title}>ההודעה נשלחה בהצלחה!</h1>
            <p className={styles.successText}>
              תודה שפנית אלינו. נחזור אליך בהקדם האפשרי.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>צור קשר</h1>
        <p className={styles.subtitle}>
          יש לכם שאלה, הצעה או בעיה? נשמח לשמוע מכם.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">שם מלא</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="הכנס את שמך המלא"
            />
          </div>
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
          <div className={styles.field}>
            <label htmlFor="subject">נושא</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={loading}
              placeholder="נושא הפנייה"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="message">הודעה</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
              rows={5}
              placeholder="כתוב את הודעתך כאן..."
            />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'שולח...' : 'שלח הודעה'}
          </button>
        </form>
      </div>
    </div>
  )
}
