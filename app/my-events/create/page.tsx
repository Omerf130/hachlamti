'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/app/actions/event'
import styles from './create-event.module.scss'

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [locationType, setLocationType] = useState<'PHYSICAL' | 'ONLINE'>('PHYSICAL')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [registrationUrl, setRegistrationUrl] = useState('')
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      setError('גודל התמונה חייב להיות עד 1MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFeaturedImageUrl(base64)
      setImagePreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const result = await createEvent({
      featuredImageUrl,
      title,
      eventType,
      eventDate,
      eventTime,
      locationType,
      city: locationType === 'PHYSICAL' ? city : undefined,
      price: price || undefined,
      description,
      registrationUrl,
    })

    if (result.success) {
      router.push('/my-events')
    } else {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>יצירת אירוע חדש</h1>
        <p className={styles.subtitle}>
          מלא את הפרטים הבאים ליצירת אירוע. האירוע יפורסם לאחר אישור מנהל.
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>תמונת אירוע *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.fileInput}
          />
          {imagePreview && (
            <img src={imagePreview} alt="תצוגה מקדימה" className={styles.imagePreview} />
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>כותרת האירוע *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="שם האירוע"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>סוג האירוע *</label>
          <input
            type="text"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className={styles.input}
            placeholder="למשל: סדנה, הרצאה, קבוצת תמיכה, וובינר..."
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>תאריך *</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>שעה *</label>
            <input
              type="text"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className={styles.input}
              placeholder="למשל: 18:00-20:00"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>סוג מיקום *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="locationType"
                value="PHYSICAL"
                checked={locationType === 'PHYSICAL'}
                onChange={() => setLocationType('PHYSICAL')}
              />
              פיזי
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="locationType"
                value="ONLINE"
                checked={locationType === 'ONLINE'}
                onChange={() => setLocationType('ONLINE')}
              />
              אונליין
            </label>
          </div>
        </div>

        {locationType === 'PHYSICAL' && (
          <div className={styles.field}>
            <label className={styles.label}>עיר *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={styles.input}
              placeholder="הזן את שם העיר"
              required
            />
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>מחיר</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={styles.input}
            placeholder="למשל: חינם, 50 ש״ח, 120 ש״ח..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>תיאור קצר *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            placeholder="תאר את האירוע בקצרה..."
            rows={4}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>קישור להרשמה *</label>
          <input
            type="url"
            value={registrationUrl}
            onChange={(e) => setRegistrationUrl(e.target.value)}
            className={styles.input}
            placeholder="https://..."
            required
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'שולח...' : 'צור אירוע'}
        </button>
      </form>
    </main>
  )
}
