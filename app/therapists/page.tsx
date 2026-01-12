import { connectDB } from '@/lib/db'
import { type TherapistDocument } from '@/models/Therapist'
import mongoose from 'mongoose'
import styles from './page.module.scss'
import Link from 'next/link'

// Ensure Therapist model is imported
import '@/models/Therapist'

async function getTherapists(): Promise<TherapistDocument[]> {
  try {
    await connectDB()

    const TherapistModel = mongoose.models.Therapist
    if (!TherapistModel) {
      return []
    }

    const filter = { status: 'APPROVED' }
    const query = TherapistModel.find(filter).sort({ createdAt: -1 })
    const execResult = query.exec() as unknown as Promise<TherapistDocument[]>
    const therapists = await execResult

    return therapists || []
  } catch {
    // Return empty array on any error
    return []
  }
}

export default async function TherapistsPage(): Promise<JSX.Element> {
  const therapists = await getTherapists()

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>מטפלים</h1>
      {therapists.length === 0 ? (
        <div className={styles.empty}>
          <p>אין מטפלים זמינים כרגע</p>
        </div>
      ) : (
        <ul className={styles.therapistsList}>
          {therapists.map((therapist) => (
            <li key={therapist._id.toString()} className={styles.therapistItem}>
              <Link
                href={`/therapists/${therapist._id.toString()}`}
                className={styles.therapistLink}
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

