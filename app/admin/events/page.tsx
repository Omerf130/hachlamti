import Link from 'next/link'
import Event from '@/models/Event'
import { findMany } from '@/lib/mongoose-helpers'
import SuccessMessage from '../therapists/SuccessMessage'
import styles from './page.module.scss'

async function getPendingEvents() {
  return findMany(Event, { status: 'PENDING' }, { createdAt: -1 })
}

interface PageProps {
  searchParams: Promise<{ success?: string }>
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const events = await getPendingEvents()
  const params = await searchParams

  const success: 'approved' | 'rejected' | undefined =
    params.success === 'approved' || params.success === 'rejected'
      ? params.success
      : undefined

  return (
    <div className={styles.container}>
      <SuccessMessage success={success} />

      <div className={styles.header}>
        <h1 className={styles.title}>אישור אירועים</h1>
        <p className={styles.subtitle}>
          {events.length > 0
            ? `${events.length} אירועים ממתינים לאישור`
            : 'אין אירועים ממתינים כרגע'}
        </p>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <h2 className={styles.emptyTitle}>אין אירועים ממתינים</h2>
          <p className={styles.emptyText}>כל האירועים נבדקו או שלא הוגשו אירועים חדשים</p>
          <Link href="/admin" className={styles.backButton}>
            חזרה לדשבורד
          </Link>
        </div>
      ) : (
        <div className={styles.applications}>
          {events.map((event) => (
            <div key={event._id.toString()} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{event.title}</h3>
                <span className={styles.badge}>ממתין</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.field}>
                  <span className={styles.label}>מטפל/ת:</span>
                  <span className={styles.value}>{event.therapistName}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>סוג אירוע:</span>
                  <span className={styles.specialty}>{event.eventType}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>תאריך:</span>
                  <span className={styles.value}>
                    {new Date(event.eventDate).toLocaleDateString('he-IL')} | {event.eventTime}
                  </span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>מיקום:</span>
                  <span className={styles.value}>
                    {event.locationType === 'ONLINE' ? 'אונליין' : event.city}
                  </span>
                </div>

                {event.price && (
                  <div className={styles.field}>
                    <span className={styles.label}>מחיר:</span>
                    <span className={styles.value}>{event.price}</span>
                  </div>
                )}

                <div className={styles.field}>
                  <span className={styles.label}>תאריך הגשה:</span>
                  <span className={styles.value}>
                    {new Date(event.createdAt).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Link
                  href={`/admin/events/${event._id.toString()}`}
                  className={styles.reviewButton}
                >
                  סקור אירוע
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
