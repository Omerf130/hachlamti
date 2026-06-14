import Therapist, { type TherapistDocument } from '@/models/Therapist'
import { findMany } from '@/lib/mongoose-helpers'
import styles from './page.module.scss'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'
import SearchInput from '@/components/SearchInput'
import { Suspense } from 'react'

async function getTherapists(query?: string): Promise<TherapistDocument[]> {
  const filter: Record<string, unknown> = { status: 'APPROVED' }

  if (query) {
    filter.$or = [
      { fullName: { $regex: query, $options: 'i' } },
      { 'profession.value': { $regex: query, $options: 'i' } },
      { 'location.city': { $regex: query, $options: 'i' } },
      { 'treatedConditions.primary': { $regex: query, $options: 'i' } },
      { credoAndSpecialty: { $regex: query, $options: 'i' } },
    ]
  }

  return findMany(Therapist, filter, { createdAt: -1 })
}

function getProfessionLabel(therapist: TherapistDocument): string | null {
  if (!therapist.profession) return null
  if (therapist.profession.value === 'אחר' && therapist.profession.otherText) {
    return therapist.profession.otherText
  }
  return therapist.profession.value
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function TherapistsPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams
  const query = params.q ?? ''
  const therapists = await getTherapists(query || undefined)

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1 className={styles.title}>מטפלים מומלצים</h1>
        <p className={styles.intro}>
          מצאו מטפלים מקצועיים ומנוסים בתחומים שונים.
          כל המטפלים עברו תהליך אישור ומחויבים ללוות אתכם בדרך להחלמה.
        </p>
      </section>

      <section className={styles.searchSection}>
        <Suspense fallback={
          <div className={styles.searchBar}>
            <input type="text" placeholder="חיפוש מטפלים..." className={styles.searchInput} disabled />
          </div>
        }>
          <SearchInput
            basePath="/therapists"
            placeholder="חיפוש מטפלים..."
            className={styles.searchInput}
            iconClassName={styles.searchIcon}
            wrapperClassName={styles.searchBar}
          />
        </Suspense>
      </section>

      <section className={styles.gridSection}>
        {therapists.length === 0 ? (
          <EmptyState message={query ? 'לא נמצאו מטפלים תואמים' : 'אין מטפלים זמינים כרגע'} />
        ) : (
          <div className={styles.grid}>
            {therapists.map((therapist) => {
              const profession = getProfessionLabel(therapist)
              return (
                <article key={therapist._id.toString()} className={styles.card}>
                  <div className={styles.cardImageWrapper}>
                    {therapist.profileImageUrl ? (
                      <img
                        src={therapist.profileImageUrl}
                        alt={therapist.fullName}
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.cardImagePlaceholder}>
                        {therapist.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{therapist.fullName}</h3>
                    <div className={styles.cardMeta}>
                      {profession && (
                        <span className={styles.tag}>{profession}</span>
                      )}
                    </div>
                    {therapist.location?.city && (
                      <p className={styles.cardCity}>{therapist.location.city}</p>
                    )}
                  </div>
                  <Link
                    href={`/therapists/${therapist._id.toString()}`}
                    className={styles.cardButton}
                  >
                    צפה בפרופיל המלא
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
