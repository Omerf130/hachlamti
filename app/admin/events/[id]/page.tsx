import { notFound, redirect } from 'next/navigation'
import { findById } from '@/lib/mongoose-helpers'
import Event from '@/models/Event'
import ApprovalButtons from './ApprovalButtons'
import styles from './page.module.scss'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventReviewPage({ params }: PageProps) {
  const { id } = await params
  const event = await findById(Event, id)

  if (!event) {
    notFound()
  }

  if (event.status !== 'PENDING') {
    redirect('/admin/events')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>סקירת אירוע</h1>
        <span className={styles.badge}>ממתין לאישור</span>
      </div>

      <ApprovalButtons eventId={id} eventTitle={event.title} />

      <div className={styles.content}>
        {event.featuredImageUrl && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>תמונת אירוע</h2>
            <img
              src={event.featuredImageUrl}
              alt={event.title}
              className={styles.eventImage}
            />
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>פרטי אירוע</h2>

          <div className={styles.field}>
            <span className={styles.label}>כותרת:</span>
            <span className={styles.value}>{event.title}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>סוג אירוע:</span>
            <span className={styles.tag}>{event.eventType}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>תאריך:</span>
            <span className={styles.value}>
              {new Date(event.eventDate).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>שעה:</span>
            <span className={styles.value}>{event.eventTime}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>מיקום:</span>
            <span className={styles.value}>
              {event.locationType === 'ONLINE' ? 'אונליין' : `פיזי - ${event.city}`}
            </span>
          </div>

          {event.price && (
            <div className={styles.field}>
              <span className={styles.label}>מחיר:</span>
              <span className={styles.value}>{event.price}</span>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>תיאור</h2>
          <p className={styles.text}>{event.description}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מטפל/ת</h2>
          <div className={styles.field}>
            <span className={styles.label}>שם:</span>
            <span className={styles.value}>{event.therapistName}</span>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>קישור הרשמה</h2>
          <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {event.registrationUrl}
          </a>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מידע על ההגשה</h2>
          <div className={styles.field}>
            <span className={styles.label}>תאריך הגשה:</span>
            <span className={styles.value}>
              {new Date(event.createdAt).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </section>
      </div>

      <div className={styles.bottomActions}>
        <ApprovalButtons eventId={id} eventTitle={event.title} />
      </div>
    </div>
  )
}
