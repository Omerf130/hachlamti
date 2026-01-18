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
          {therapist.treatmentSpecialties.length > 0 && (
            <div className={sharedStyles.meta}>
              <div className={styles.specialties}>
                {therapist.treatmentSpecialties.map((specialty: string, index: number) => (
                  <span key={index} className={styles.badge}>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className={sharedStyles.content}>
          {therapist.professionalDescription && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>תיאור מקצועי</h2>
              <p className={sharedStyles.text}>{therapist.professionalDescription}</p>
            </section>
          )}

          {therapist.healthIssues.length > 0 && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>בעיות בריאות שאני עובד איתן</h2>
              <p className={sharedStyles.text}>
                {therapist.healthIssues.join(', ')}
              </p>
            </section>
          )}

          {therapist.geographicArea && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>אזור גיאוגרפי</h2>
              <p className={sharedStyles.text}>{therapist.geographicArea}</p>
            </section>
          )}

          {therapist.clinicAddress && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>כתובת הקליניקה</h2>
              <p className={sharedStyles.text}>{therapist.clinicAddress}</p>
            </section>
          )}

          {therapist.treatmentLocations.length > 0 && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>היכן ניתן הטיפול?</h2>
              <p className={sharedStyles.text}>
                {therapist.treatmentLocations.map((loc: string) => {
                  switch (loc) {
                    case 'FIXED_CLINIC': return 'קליניקה קבועה'
                    case 'HOME_VISITS': return 'ביקורי בית'
                    case 'REMOTE': return 'מרחוק (אונליין / טלפון)'
                    case 'COMBINATION': return 'שילוב'
                    default: return loc
                  }
                }).join(', ')}
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

          {therapist.yearsExperience !== undefined && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>שנות ניסיון</h2>
              <p className={sharedStyles.text}>{therapist.yearsExperience} שנים</p>
            </section>
          )}

          {therapist.phoneWhatsApp && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>יצירת קשר</h2>
              <p className={sharedStyles.text}>
                <a 
                  href={`https://wa.me/${therapist.phoneWhatsApp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappLink}
                >
                  📱 שלח הודעת וואטסאפ
                </a>
              </p>
            </section>
          )}

          {therapist.externalLinks && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>קישורים חיצוניים</h2>
              <div className={styles.links}>
                {therapist.externalLinks.website && (
                  <a 
                    href={therapist.externalLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    🌐 אתר אישי
                  </a>
                )}
                {therapist.externalLinks.facebook && (
                  <a 
                    href={therapist.externalLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    📘 פייסבוק
                  </a>
                )}
                {therapist.externalLinks.instagram && (
                  <a 
                    href={therapist.externalLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    📷 אינסטגרם
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  )
}

