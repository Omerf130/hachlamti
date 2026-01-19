import { notFound, redirect } from 'next/navigation'
import { findById } from '@/lib/mongoose-helpers'
import Therapist from '@/models/Therapist'
import ApprovalButtons from './ApprovalButtons'
import styles from './page.module.scss'

interface PageProps {
  params: { id: string }
}

export default async function TherapistReviewPage({ params }: PageProps) {
  const therapist = await findById(Therapist, params.id)

  if (!therapist) {
    notFound()
  }

  // If not pending, redirect to list
  if (therapist.status !== 'PENDING') {
    redirect('/admin/therapists')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>סקירת בקשת מטפל</h1>
        <span className={styles.badge}>ממתין לאישור</span>
      </div>

      <ApprovalButtons therapistId={params.id} therapistName={therapist.fullName} />

      <div className={styles.content}>
        {/* Section 1: Personal Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>פרטים אישיים</h2>
          
          <div className={styles.field}>
            <span className={styles.label}>שם מלא:</span>
            <span className={styles.value}>{therapist.fullName}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>אימייל:</span>
            <span className={styles.value}>{therapist.email}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>טלפון (WhatsApp):</span>
            <span className={styles.value}>{therapist.phoneWhatsApp}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>שנות ניסיון:</span>
            <span className={styles.value}>{therapist.yearsExperience}</span>
          </div>
        </section>

        {/* Section 2: Professional Profile */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>פרופיל מקצועי</h2>

          <div className={styles.field}>
            <span className={styles.label}>התמחויות טיפוליות:</span>
            <div className={styles.tags}>
              {therapist.treatmentSpecialties.map((specialty: string, idx: number) => (
                <span key={idx} className={styles.tag}>{specialty}</span>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>תיאור מקצועי:</span>
            <p className={styles.text}>{therapist.professionalDescription}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>בעיות בריאות:</span>
            <div className={styles.tags}>
              {therapist.healthIssues.map((issue: string, idx: number) => (
                <span key={idx} className={styles.tag}>{issue}</span>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>שפות:</span>
            <div className={styles.tags}>
              {therapist.languages.map((lang: string, idx: number) => (
                <span key={idx} className={styles.tag}>{lang}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Location & Availability */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מיקום וזמינות</h2>

          <div className={styles.field}>
            <span className={styles.label}>אזור גיאוגרפי:</span>
            <span className={styles.value}>{therapist.geographicArea}</span>
          </div>

          {therapist.clinicAddress && (
            <div className={styles.field}>
              <span className={styles.label}>כתובת מרפאה:</span>
              <span className={styles.value}>{therapist.clinicAddress}</span>
            </div>
          )}

          <div className={styles.field}>
            <span className={styles.label}>מקומות טיפול:</span>
            <div className={styles.tags}>
              {therapist.treatmentLocations.map((location: string, idx: number) => (
                <span key={idx} className={styles.tag}>{location}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: External Links */}
        {therapist.externalLinks && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>קישורים</h2>

            {therapist.externalLinks.website && (
              <div className={styles.field}>
                <span className={styles.label}>אתר אינטרנט:</span>
                <a href={therapist.externalLinks.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {therapist.externalLinks.website}
                </a>
              </div>
            )}

            {therapist.externalLinks.facebook && (
              <div className={styles.field}>
                <span className={styles.label}>פייסבוק:</span>
                <a href={therapist.externalLinks.facebook} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {therapist.externalLinks.facebook}
                </a>
              </div>
            )}

            {therapist.externalLinks.instagram && (
              <div className={styles.field}>
                <span className={styles.label}>אינסטגרם:</span>
                <a href={therapist.externalLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {therapist.externalLinks.instagram}
                </a>
              </div>
            )}
          </section>
        )}

        {/* Section 5: Additional Notes */}
        {therapist.additionalNotes && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>הערות נוספות</h2>
            <p className={styles.text}>{therapist.additionalNotes}</p>
          </section>
        )}

        {/* Section 6: Submission Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מידע על ההגשה</h2>

          <div className={styles.field}>
            <span className={styles.label}>תאריך הגשה:</span>
            <span className={styles.value}>
              {new Date(therapist.createdAt).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </section>
      </div>

      {/* Bottom action buttons */}
      <div className={styles.bottomActions}>
        <ApprovalButtons therapistId={params.id} therapistName={therapist.fullName} />
      </div>
    </div>
  )
}

