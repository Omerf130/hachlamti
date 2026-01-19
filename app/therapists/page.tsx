import Therapist, { type TherapistDocument } from '@/models/Therapist'
import { findMany } from '@/lib/mongoose-helpers'
import styles from './page.module.scss'
import sharedStyles from '@/styles/list-page.module.scss'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'

async function getTherapists(): Promise<TherapistDocument[]> {
  return findMany(Therapist, { status: 'APPROVED' }, { createdAt: -1 })
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
                {therapist.treatmentSpecialties.length > 0 && (
                  <div className={styles.therapistSpecialties}>
                    {therapist.treatmentSpecialties.join(', ')}
                  </div>
                )}
                <div className={styles.therapistLocation}>
                  {therapist.geographicArea}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

