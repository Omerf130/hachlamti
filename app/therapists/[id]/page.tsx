import { type TherapistDocument } from '@/models/Therapist'
import { findOneByIdAndStatus } from '@/lib/db-queries'
import { notFound } from 'next/navigation'
import styles from './page.module.scss'
import sharedStyles from '@/styles/detail-page.module.scss'

// Ensure Therapist model is imported
import '@/models/Therapist'

interface TherapistDetailPageProps {
  params: {
    id: string
  }
}

async function getTherapist(id: string): Promise<TherapistDocument | null> {
  return findOneByIdAndStatus<TherapistDocument>('Therapist', id, 'APPROVED')
}

export default async function TherapistDetailPage({
  params,
}: TherapistDetailPageProps): Promise<JSX.Element> {
  const therapist = await getTherapist(params.id)

  if (!therapist) {
    notFound()
  }

  return (
    <main className={sharedStyles.main}>
      <article className={sharedStyles.container}>
        <header className={sharedStyles.header}>
          <h1 className={sharedStyles.title}>{therapist.fullName}</h1>
          {therapist.specialties.length > 0 && (
            <div className={sharedStyles.meta}>
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

        <div className={sharedStyles.content}>
          {therapist.locations.length > 0 && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>מיקומים</h2>
              <p className={sharedStyles.text}>
                {therapist.locations.join(', ')}
              </p>
            </section>
          )}

          {therapist.languages.length > 0 && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>שפות</h2>
              <p className={sharedStyles.text}>
                {therapist.languages.join(', ')}
              </p>
            </section>
          )}

          {therapist.targetAudiences.length > 0 && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>קהלי יעד</h2>
              <p className={sharedStyles.text}>
                {therapist.targetAudiences.join(', ')}
              </p>
            </section>
          )}

          {therapist.treatmentApproach && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>גישת טיפול</h2>
              <p className={sharedStyles.text}>{therapist.treatmentApproach}</p>
            </section>
          )}

          {therapist.yearsExperience && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>שנות ניסיון</h2>
              <p className={sharedStyles.text}>{therapist.yearsExperience}</p>
            </section>
          )}

          {therapist.education && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>השכלה</h2>
              <p className={sharedStyles.text}>{therapist.education}</p>
            </section>
          )}
        </div>
      </article>
    </main>
  )
}

