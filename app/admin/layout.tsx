import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Therapist from '@/models/Therapist'
import { connectDB } from '@/lib/db'
import styles from './layout.module.scss'

async function getPendingCount() {
  try {
    await connectDB()
    const count = await Therapist.countDocuments({ status: 'PENDING' })
    return count
  } catch (error) {
    console.error('Error fetching pending count:', error)
    return 0
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Protect admin routes - only ADMIN role allowed
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin')
  }

  const pendingCount = await getPendingCount()

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Link href="/">← חזרה לאתר הראשי</Link>
          </div>
          <h1 className={styles.title}>ניהול Hachlamti</h1>
          <div className={styles.user}>
            <span className={styles.email}>{session.user.email}</span>
          </div>
        </div>
      </header>

      <nav className={styles.nav}>
        <Link href="/admin" className={styles.navLink}>
          דשבורד
        </Link>
        <Link href="/admin/therapists" className={styles.navLink}>
          בקשות מטפלים
          {pendingCount > 0 && (
            <span className={styles.badge}>{pendingCount}</span>
          )}
        </Link>
        <Link href="/admin/stories" className={styles.navLink}>
          ניהול סיפורים
        </Link>
      </nav>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>Hachlamti Admin Panel</p>
      </footer>
    </div>
  )
}

