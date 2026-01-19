import Link from 'next/link'
import Therapist from '@/models/Therapist'
import { findMany } from '@/lib/mongoose-helpers'
import styles from './page.module.scss'

async function getTherapistApplications() {
  // Fetch all PENDING therapist applications
  const therapists = await findMany(
    Therapist,
    { status: 'PENDING' },
    { createdAt: -1 } // Newest first
  )
  
  return therapists
}

export default async function TherapistApplicationsPage() {
  const applications = await getTherapistApplications()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>בקשות מטפלים</h1>
        <p className={styles.subtitle}>
          {applications.length > 0
            ? `${applications.length} בקשות ממתינות לבדיקה`
            : 'אין בקשות ממתינות כרגע'}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h2 className={styles.emptyTitle}>אין בקשות ממתינות</h2>
          <p className={styles.emptyText}>
            כל הבקשות נבדקו או שלא הוגשו בקשות חדשות
          </p>
          <Link href="/admin" className={styles.backButton}>
            חזרה לדשבורד
          </Link>
        </div>
      ) : (
        <div className={styles.applications}>
          {applications.map((therapist) => (
            <div key={therapist._id.toString()} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{therapist.fullName}</h3>
                <span className={styles.badge}>ממתין</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.field}>
                  <span className={styles.label}>📧 אימייל:</span>
                  <span className={styles.value}>{therapist.email}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>📱 טלפון:</span>
                  <span className={styles.value}>{therapist.phoneWhatsApp}</span>
                </div>

                {therapist.treatmentSpecialties.length > 0 && (
                  <div className={styles.field}>
                    <span className={styles.label}>🎯 התמחויות:</span>
                    <div className={styles.specialties}>
                      {therapist.treatmentSpecialties.map((specialty: string, idx: number) => (
                        <span key={idx} className={styles.specialty}>
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.field}>
                  <span className={styles.label}>📍 אזור:</span>
                  <span className={styles.value}>{therapist.geographicArea}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>⏱️ ניסיון:</span>
                  <span className={styles.value}>{therapist.yearsExperience} שנים</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>📅 תאריך הגשה:</span>
                  <span className={styles.value}>
                    {new Date(therapist.createdAt).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Link
                  href={`/admin/therapists/${therapist._id.toString()}`}
                  className={styles.reviewButton}
                >
                  סקור בקשה
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

