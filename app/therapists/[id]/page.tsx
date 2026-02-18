import Therapist, { type TherapistDocument } from '@/models/Therapist'
import { findByIdAndStatus } from '@/lib/mongoose-helpers'
import { notFound } from 'next/navigation'
import styles from './page.module.scss'
import sharedStyles from '@/styles/detail-page.module.scss'
import Image from 'next/image'

interface TherapistDetailPageProps {
  params: {
    id: string
  }
}

async function getTherapist(id: string): Promise<TherapistDocument | null> {
  return findByIdAndStatus(Therapist, id, 'APPROVED')
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
          {/* Profile Image */}
          {therapist.profileImageUrl && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Image
                src={therapist.profileImageUrl}
                alt={therapist.fullName}
                width={200}
                height={200}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
          )}

          <h1 className={sharedStyles.title}>{therapist.fullName}</h1>
          
          {/* Profession */}
          <div className={sharedStyles.meta}>
            <div className={styles.specialties}>
              <span className={styles.badge}>
                {therapist.profession.value === 'אחר' && therapist.profession.otherText
                  ? therapist.profession.otherText
                  : therapist.profession.value}
              </span>
            </div>
          </div>

          {/* Logo Image */}
          {therapist.logoImageUrl && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Image
                src={therapist.logoImageUrl}
                alt="Logo"
                width={150}
                height={150}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
        </header>

        <div className={sharedStyles.content}>
          {/* Credo and Specialty */}
          {therapist.credoAndSpecialty && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>אני מאמין והתמחות</h2>
              <p className={sharedStyles.text}>{therapist.credoAndSpecialty}</p>
            </section>
          )}

          {/* Therapeutic Approach */}
          {therapist.approachDescription && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>גישה טיפולית</h2>
              <p className={sharedStyles.text}>{therapist.approachDescription}</p>
            </section>
          )}

          {/* Treated Conditions */}
          {therapist.treatedConditions && therapist.treatedConditions.length > 0 && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>מצבים בריאותיים שאני מטפל בהם</h2>
              <ul className={sharedStyles.text}>
                {therapist.treatedConditions.map((condition: { primary: string; primaryOtherText?: string; sub: string; subOtherText?: string }, index: number) => {
                  const primaryLabel = condition.primary === 'אחר' && condition.primaryOtherText
                    ? condition.primaryOtherText
                    : condition.primary
                  const subLabel = condition.sub === 'אחר' && condition.subOtherText
                    ? condition.subOtherText
                    : condition.sub
                  
                  return (
                    <li key={index}>
                      <strong>{primaryLabel}</strong> → {subLabel}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* Education */}
          {therapist.educationText && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>השכלה והסמכות</h2>
              <p className={sharedStyles.text}>{therapist.educationText}</p>
            </section>
          )}

          {/* Certificates */}
          {therapist.certificates && therapist.certificates.length > 0 && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>תעודות הסמכה</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {therapist.certificates.map((cert: { url: string; fileName?: string }, index: number) => (
                  <div key={index} style={{ maxWidth: '200px' }}>
                    <Image
                      src={cert.url}
                      alt={cert.fileName || `תעודה ${index + 1}`}
                      width={200}
                      height={150}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                    {cert.fileName && (
                      <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', textAlign: 'center' }}>
                        {cert.fileName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Location */}
          {therapist.location && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>מיקום ופעילות</h2>
              <p className={sharedStyles.text}>
                <strong>עיר:</strong> {therapist.location.city}
                {therapist.location.activityHours && (
                  <>
                    <br />
                    <strong>שעות פעילות:</strong> {therapist.location.activityHours}
                  </>
                )}
              </p>
            </section>
          )}

          {/* Special Services */}
          {therapist.specialServices && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>שירותים מיוחדים</h2>
              <div className={sharedStyles.text}>
                {therapist.specialServices.onlineTreatment && (
                  <p>✓ טיפול אונליין (זום/וידאו)</p>
                )}
                {therapist.specialServices.homeVisits && (
                  <p>✓ ביקורי בית</p>
                )}
                {therapist.specialServices.accessibleClinic && (
                  <p>✓ גישה לנכים / קליניקה נגישה</p>
                )}
                {therapist.specialServices.languages && therapist.specialServices.languages.length > 0 && (
                  <p>
                    <strong>שפות:</strong> {therapist.specialServices.languages.join(', ')}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Inspiration Story */}
          {therapist.inspirationStory && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>סיפור השראה</h2>
              <p className={sharedStyles.text}>{therapist.inspirationStory}</p>
            </section>
          )}

          {/* Contact Details */}
          {therapist.contacts && (
            <section className={sharedStyles.section}>
              <h2 className={sharedStyles.sectionTitle}>יצירת קשר</h2>
              <div className={sharedStyles.text}>
                {therapist.contacts.email && (
                  <p>
                    <strong>אימייל:</strong>{' '}
                    <a href={`mailto:${therapist.contacts.email}`}>{therapist.contacts.email}</a>
                  </p>
                )}
                {therapist.contacts.displayPhone && (
                  <p>
                    <strong>טלפון להצגה:</strong> {therapist.contacts.displayPhone}
                  </p>
                )}
                {therapist.contacts.bookingPhone && (
                  <p>
                    <strong>טלפון לתיאומים:</strong>{' '}
                    <a 
                      href={`https://wa.me/${therapist.contacts.bookingPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappLink}
                    >
                      {therapist.contacts.bookingPhone} 📱
                    </a>
                  </p>
                )}
                {therapist.contacts.websiteUrl && (
                  <p>
                    <a 
                      href={therapist.contacts.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                    >
                      🌐 אתר / פייסבוק
                    </a>
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  )
}
