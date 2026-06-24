import Event from '@/models/Event'
import { findMany } from '@/lib/mongoose-helpers'
import styles from './page.module.scss'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'
import SearchInput from '@/components/SearchInput'
import { Suspense } from 'react'

async function getEvents(query?: string) {
  const filter: Record<string, unknown> = { status: 'APPROVED' }

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { eventType: { $regex: query, $options: 'i' } },
      { therapistName: { $regex: query, $options: 'i' } },
      { city: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ]
  }

  return findMany(Event, filter, { eventDate: 1 })
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function EventsPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams
  const query = params.q ?? ''
  const events = await getEvents(query || undefined)

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1 className={styles.title}>אירועים</h1>
        <p className={styles.intro}>
          גלו אירועים, סדנאות והרצאות בתחום הבריאות וההחלמה.
          הצטרפו לאירועים שמעניינים אתכם ולמדו מהמומחים.
        </p>
      </section>

      <section className={styles.searchSection}>
        <Suspense fallback={
          <div className={styles.searchBar}>
            <input type="text" placeholder="חיפוש אירועים..." className={styles.searchInput} disabled />
          </div>
        }>
          <SearchInput
            basePath="/events"
            placeholder="חיפוש אירועים..."
            className={styles.searchInput}
            iconClassName={styles.searchIcon}
            wrapperClassName={styles.searchBar}
          />
        </Suspense>
      </section>

      <section className={styles.gridSection}>
        {events.length === 0 ? (
          <EmptyState message={query ? 'לא נמצאו אירועים תואמים' : 'אין אירועים זמינים כרגע'} />
        ) : (
          <div className={styles.grid}>
            {events.map((event) => (
              <article key={event._id.toString()} className={styles.card}>
                {event.featuredImageUrl && (
                  <div className={styles.cardImageWrapper}>
                    <img
                      src={event.featuredImageUrl}
                      alt={event.title}
                      className={styles.cardImage}
                    />
                  </div>
                )}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{event.title}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.tag}>{event.eventType}</span>
                  </div>
                  <p className={styles.cardDate}>
                    {new Date(event.eventDate).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} | {event.eventTime}
                  </p>
                  <p className={styles.cardLocation}>
                    {event.locationType === 'ONLINE' ? 'אונליין' : event.city}
                  </p>
                  <Link href={`/therapists`} className={styles.cardTherapist}>
                    {event.therapistName}
                  </Link>
                  {event.price && (
                    <p className={styles.cardPrice}>{event.price}</p>
                  )}
                  <p className={styles.cardSummary}>
                    {truncate(event.description, 120)}
                  </p>
                </div>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cardButton}
                >
                  פרטים נוספים והרשמה
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
