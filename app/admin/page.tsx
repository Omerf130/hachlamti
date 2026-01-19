import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Therapist from '@/models/Therapist'
import Story from '@/models/Story'
import styles from './page.module.scss'

async function getStats() {
  await connectDB()

  const [pendingTherapists, approvedTherapists, publishedStories] = await Promise.all([
    Therapist.countDocuments({ status: 'PENDING' }),
    Therapist.countDocuments({ status: 'APPROVED' }),
    Story.countDocuments({ status: 'PUBLISHED' }),
  ])

  return {
    pendingTherapists,
    approvedTherapists,
    publishedStories,
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  const stats = await getStats()

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h1 className={styles.title}>ברוך הבא, {session?.user?.email}</h1>
        <p className={styles.subtitle}>פאנל ניהול Hachlamti</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statValue}>{stats.pendingTherapists}</div>
          <div className={styles.statLabel}>מטפלים ממתינים לאישור</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✓</div>
          <div className={styles.statValue}>{stats.approvedTherapists}</div>
          <div className={styles.statLabel}>מטפלים מאושרים</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📖</div>
          <div className={styles.statValue}>{stats.publishedStories}</div>
          <div className={styles.statLabel}>סיפורים פורסמו</div>
        </div>
      </div>

      {stats.pendingTherapists > 0 && (
        <div className={styles.alert}>
          <span className={styles.alertIcon}>🔔</span>
          <span>יש {stats.pendingTherapists} בקשות מטפלים הממתינות לבדיקה</span>
        </div>
      )}

      <div className={styles.actions}>
        <Link href="/admin/therapists" className={styles.primaryButton}>
          <span className={styles.buttonIcon}>👥</span>
          עבור לבקשות מטפלים
        </Link>

        <Link href="/admin/stories" className={styles.secondaryButton}>
          <span className={styles.buttonIcon}>📚</span>
          ניהול סיפורים
        </Link>
      </div>

      <div className={styles.quickLinks}>
        <h2 className={styles.sectionTitle}>קישורים מהירים</h2>
        <div className={styles.links}>
          <Link href="/therapists" className={styles.quickLink}>
            צפייה בדף המטפלים הציבורי
          </Link>
          <Link href="/stories" className={styles.quickLink}>
            צפייה בדף הסיפורים הציבורי
          </Link>
          <Link href="/" className={styles.quickLink}>
            דף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}
