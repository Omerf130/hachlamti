import { type TherapistDocument } from '@/models/Therapist'
import { findMany } from '@/lib/db-queries'
import styles from './page.module.scss'
import sharedStyles from '@/styles/list-page.module.scss'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'

// Ensure Therapist model is imported
import '@/models/Therapist'

async function getTherapists(): Promise<TherapistDocument[]> {
  return findMany<TherapistDocument>('Therapist', { status: 'APPROVED' }, {
    createdAt: -1,
  })
}

export default async function TherapistsPage(): Promise<JSX.Element> {
  const therapists = await getTherapists()

  return (
    <main className={sharedStyles.main}>
      <h1 className={sharedStyles.title}>מטפלים</h1>
      {therapists.length === 0 ? (
        <EmptyState message="אין מטפלים זמינים כרגע" />
      ) : (
        <ul className={sharedStyles.list}>
          {therapists.map((therapist) => (
            <li key={therapist._id.toString()} className={sharedStyles.item}>
              <Link
                href={`/therapists/${therapist._id.toString()}`}
                className={sharedStyles.link}
              >
                <div className={styles.therapistName}>{therapist.fullName}</div>
                {therapist.specialties.length > 0 && (
                  <div className={styles.therapistSpecialties}>
                    {therapist.specialties.join(', ')}
                  </div>
                )}
                {therapist.locations.length > 0 && (
                  <div className={styles.therapistLocations}>
                    {therapist.locations.join(', ')}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

