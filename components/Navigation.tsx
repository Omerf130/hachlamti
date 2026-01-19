'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import styles from './Navigation.module.scss'

export default function Navigation(): JSX.Element {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAuthenticated = !!session

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: pathname || '/' })
  }

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.link}>
        בית
      </Link>
      <Link href="/stories" className={styles.link}>
        סיפורים
      </Link>
      <Link href="/therapists" className={styles.link}>
        מטפלים
      </Link>

      {isAuthenticated ? (
        <>
          <Link href="/submit-story" className={styles.link}>
            שתף סיפור
          </Link>
          <Link href="/my-stories" className={styles.link}>
            הסיפורים שלי
          </Link>
          <button onClick={handleLogout} className={styles.button}>
            התנתק
          </button>
        </>
      ) : (
        <>
          <Link href="/signup" className={styles.button}>
            הרשמה
          </Link>
          <Link href="/login" className={styles.button}>
            התחבר
          </Link>
        </>
      )}
    </nav>
  )
}

