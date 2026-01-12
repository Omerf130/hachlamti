import { connectDB } from '@/lib/db'
import { type TherapistDocument } from '@/models/Therapist'
import { notFound } from 'next/navigation'
import mongoose from 'mongoose'
import styles from './page.module.scss'

// Ensure Therapist model is imported
import '@/models/Therapist'

interface TherapistDetailPageProps {
  params: {
    id: string
  }
}

async function getTherapist(id: string): Promise<TherapistDocument | null> {
  try {
    await connectDB()

    const TherapistModel = mongoose.models.Therapist
    if (!TherapistModel) {
      return null
    }

    const therapistIdObj = new mongoose.Types.ObjectId(id)
    const findOneMethod = TherapistModel.findOne as unknown as (
      filter: { _id: mongoose.Types.ObjectId; status: string }
    ) => { exec: () => Promise<TherapistDocument | null> }
    const therapist = await findOneMethod({
      _id: therapistIdObj,
      status: 'APPROVED',
    }).exec()

    return therapist
  } catch {
    // Return null on any error
    return null
  }
}

export default async function TherapistDetailPage({
  params,
}: TherapistDetailPageProps): Promise<JSX.Element> {
  const therapist = await getTherapist(params.id)

  if (!therapist) {
    notFound()
  }

  return (
    <main className={styles.main}>
      <article className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{therapist.fullName}</h1>
          {therapist.specialties.length > 0 && (
            <div className={styles.meta}>
              <div className={styles.specialties}>
                {therapist.specialties.map((specialty, index) => (
                  <span key={index} className={styles.badge}>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className={styles.content}>
          {therapist.locations.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>מיקומים</h2>
              <p className={styles.text}>{therapist.locations.join(', ')}</p>
            </section>
          )}

          {therapist.languages.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>שפות</h2>
              <p className={styles.text}>{therapist.languages.join(', ')}</p>
            </section>
          )}

          {therapist.targetAudiences.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>קהלי יעד</h2>
              <p className={styles.text}>
                {therapist.targetAudiences.join(', ')}
              </p>
            </section>
          )}

          {therapist.treatmentApproach && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>גישת טיפול</h2>
              <p className={styles.text}>{therapist.treatmentApproach}</p>
            </section>
          )}

          {therapist.yearsExperience && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>שנות ניסיון</h2>
              <p className={styles.text}>{therapist.yearsExperience}</p>
            </section>
          )}

          {therapist.education && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>השכלה</h2>
              <p className={styles.text}>{therapist.education}</p>
            </section>
          )}
        </div>
      </article>
    </main>
  )
}

