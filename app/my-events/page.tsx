import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Event from '@/models/Event'
import Therapist from '@/models/Therapist'
import Link from 'next/link'
import DeleteEventButton from './DeleteEventButton'
import styles from './page.module.scss'
import { findMany, findOne } from '@/lib/mongoose-helpers'
import mongoose from 'mongoose'

export const metadata = {
  title: 'האירועים שלי | Hachlamti',
  description: 'ניהול האירועים שלי',
}

export default async function MyEventsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id || session.user.role !== 'THERAPIST') {
    redirect('/login?callbackUrl=/my-events')
  }

  const therapist = await findOne(Therapist, {
    userId: new mongoose.Types.ObjectId(session.user.id),
    status: 'APPROVED',
  })

  if (!therapist) {
    redirect('/')
  }

  const events = await findMany(Event, { therapistId: therapist._id }, { createdAt: -1 })

  const statusLabels: Record<string, string> = {
    PENDING: 'ממתין לאישור',
    APPROVED: 'מאושר',
    REJECTED: 'נדחה',
  }

  const statusClasses: Record<string, string> = {
    PENDING: styles.statusPending ?? '',
    APPROVED: styles.statusApproved ?? '',
    REJECTED: styles.statusRejected ?? '',
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>האירועים שלי</h1>
        <p className={styles.subtitle}>
          כאן תוכל לנהל את האירועים שלך - ליצור אירועים חדשים ולמחוק קיימים
        </p>
        <Link href="/my-events/create" className={styles.createButton}>
          + צור אירוע חדש
        </Link>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>עדיין לא יצרת אירועים</p>
          <Link href="/my-events/create" className={styles.emptyButton}>
            צור את האירוע הראשון שלך
          </Link>
        </div>
      ) : (
        <div className={styles.eventsList}>
          {events.map((event) => (
            <div key={event._id.toString()} className={styles.eventCard}>
              <div className={styles.cardContent}>
                <h2 className={styles.eventTitle}>{event.title}</h2>
                <p className={styles.eventExcerpt}>
                  {event.description.substring(0, 150)}
                  {event.description.length > 150 ? '...' : ''}
                </p>
                <div className={styles.eventMeta}>
                  <span className={styles.date}>
                    {new Date(event.eventDate).toLocaleDateString('he-IL')} | {event.eventTime}
                  </span>
                  <span className={`${styles.status} ${statusClasses[event.status] || ''}`}>
                    {statusLabels[event.status] || event.status}
                  </span>
                </div>
                <div className={styles.eventMeta}>
                  <span className={styles.tag}>{event.eventType}</span>
                  <span>{event.locationType === 'ONLINE' ? 'אונליין' : event.city}</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <DeleteEventButton
                  eventId={event._id.toString()}
                  eventTitle={event.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
