import { notFound, redirect } from 'next/navigation'
import { findById } from '@/lib/mongoose-helpers'
import Therapist from '@/models/Therapist'
import ApprovalButtons from './ApprovalButtons'
import styles from './page.module.scss'
import Image from 'next/image'

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

          {therapist.profileImageUrl && (
            <div className={styles.field}>
              <span className={styles.label}>תמונת פרופיל:</span>
              <div>
                <Image
                  src={therapist.profileImageUrl}
                  alt="Profile"
                  width={200}
                  height={200}
                  style={{ borderRadius: '8px', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          {therapist.logoImageUrl && (
            <div className={styles.field}>
              <span className={styles.label}>לוגו:</span>
              <div>
                <Image
                  src={therapist.logoImageUrl}
                  alt="Logo"
                  width={150}
                  height={150}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Profession */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מקצוע</h2>

          <div className={styles.field}>
            <span className={styles.label}>מקצוע:</span>
            <span className={styles.tag}>
              {therapist.profession.value === 'אחר' && therapist.profession.otherText
                ? therapist.profession.otherText
                : therapist.profession.value}
            </span>
          </div>
        </section>

        {/* Section 3: Location & Activity */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מיקום ופעילות</h2>

          <div className={styles.field}>
            <span className={styles.label}>עיר:</span>
            <span className={styles.value}>{therapist.location.city}</span>
          </div>

          {therapist.location.activityHours && (
            <div className={styles.field}>
              <span className={styles.label}>שעות פעילות:</span>
              <span className={styles.value}>{therapist.location.activityHours}</span>
            </div>
          )}

          <div className={styles.field}>
            <span className={styles.label}>זמין אונליין (Zoom):</span>
            <span className={styles.value}>{therapist.location.zoom ? 'כן ✓' : 'לא'}</span>
          </div>
        </section>

        {/* Section 4: Education & Credentials */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>השכלה ותעודות</h2>

          {therapist.educationText && (
            <div className={styles.field}>
              <span className={styles.label}>השכלה:</span>
              <p className={styles.text}>{therapist.educationText}</p>
            </div>
          )}

          {therapist.certificates && therapist.certificates.length > 0 && (
            <div className={styles.field}>
              <span className={styles.label}>תעודות ({therapist.certificates.length}):</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                {therapist.certificates.map((cert: { url: string; fileName?: string }, idx: number) => (
                  <div key={idx} style={{ maxWidth: '150px' }}>
                    <Image
                      src={cert.url}
                      alt={cert.fileName || `תעודה ${idx + 1}`}
                      width={150}
                      height={100}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                    {cert.fileName && (
                      <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{cert.fileName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 5: Special Services */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>שירותים מיוחדים</h2>

          <div className={styles.field}>
            <span className={styles.label}>סוגי שירות:</span>
            <div className={styles.tags}>
              {therapist.specialServices.onlineTreatment && (
                <span className={styles.tag}>טיפול אונליין</span>
              )}
              {therapist.specialServices.homeVisits && (
                <span className={styles.tag}>ביקורי בית</span>
              )}
              {therapist.specialServices.accessibleClinic && (
                <span className={styles.tag}>קליניקה נגישה</span>
              )}
            </div>
          </div>

          {therapist.specialServices.languages && therapist.specialServices.languages.length > 0 && (
            <div className={styles.field}>
              <span className={styles.label}>שפות:</span>
              <div className={styles.tags}>
                {therapist.specialServices.languages.map((lang: string, idx: number) => (
                  <span key={idx} className={styles.tag}>{lang}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 6: Professional Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>אני מאמין והתמחות</h2>

          <div className={styles.field}>
            <p className={styles.text}>{therapist.credoAndSpecialty}</p>
          </div>
        </section>

        {/* Section 7: Treated Conditions */}
        {therapist.treatedConditions && therapist.treatedConditions.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>מצבים בריאותיים ({therapist.treatedConditions.length})</h2>

            <div className={styles.field}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {therapist.treatedConditions.map((condition: { primary: string; primaryOtherText?: string; sub: string; subOtherText?: string }, idx: number) => {
                  const primaryLabel = condition.primary === 'אחר' && condition.primaryOtherText
                    ? condition.primaryOtherText
                    : condition.primary
                  const subLabel = condition.sub === 'אחר' && condition.subOtherText
                    ? condition.subOtherText
                    : condition.sub
                  
                  return (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      <strong>{primaryLabel}</strong> → {subLabel}
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Section 8: Therapeutic Approach */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>גישה טיפולית</h2>

          <div className={styles.field}>
            <p className={styles.text}>{therapist.approachDescription}</p>
          </div>
        </section>

        {/* Section 9: Inspiration Story */}
        {therapist.inspirationStory && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>סיפור השראה</h2>

            <div className={styles.field}>
              <p className={styles.text}>{therapist.inspirationStory}</p>
            </div>
          </section>
        )}

        {/* Section 10: Contact Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>פרטי יצירת קשר</h2>

          <div className={styles.field}>
            <span className={styles.label}>אימייל:</span>
            <span className={styles.value}>{therapist.contacts.email}</span>
          </div>

          {therapist.contacts.displayPhone && (
            <div className={styles.field}>
              <span className={styles.label}>טלפון להצגה:</span>
              <span className={styles.value}>{therapist.contacts.displayPhone}</span>
            </div>
          )}

          {therapist.contacts.bookingPhone && (
            <div className={styles.field}>
              <span className={styles.label}>טלפון לתיאומים:</span>
              <span className={styles.value}>{therapist.contacts.bookingPhone}</span>
            </div>
          )}

          {therapist.contacts.websiteUrl && (
            <div className={styles.field}>
              <span className={styles.label}>אתר / פייסבוק:</span>
              <a href={therapist.contacts.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {therapist.contacts.websiteUrl}
              </a>
            </div>
          )}
        </section>

        {/* Section 11: Submission Info */}
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

          <div className={styles.field}>
            <span className={styles.label}>הסכמה:</span>
            <span className={styles.value}>{therapist.consentJoin ? 'אישר הצטרפות ✓' : 'לא אישר'}</span>
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
