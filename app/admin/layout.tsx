import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLogoutButton from './AdminLogoutButton'
import styles from './layout.module.scss'

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
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <nav className={styles.nav}>
        <Link href="/admin" className={styles.navLink}>
          דשבורד
        </Link>
        <Link href="/admin/therapists" className={styles.navLink}>
          בקשות מטפלים
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

