'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from './Navigation.module.scss'

export default function Navigation(): JSX.Element {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAuthenticated = !!session
  const isAdmin = session?.user?.role === 'ADMIN'
  const isTherapist = session?.user?.role === 'THERAPIST'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [therapistId, setTherapistId] = useState<string | null>(null)

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: pathname || '/' })
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Fetch therapist profile ID if user is a therapist
  useEffect(() => {
    const fetchTherapistId = async () => {
      if (!isTherapist) {
        setTherapistId(null)
        return
      }

      try {
        const response = await fetch('/api/therapists/my-profile')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.therapistId) {
            setTherapistId(data.therapistId)
          } else {
            setTherapistId(null)
          }
        } else {
          setTherapistId(null)
        }
      } catch (error) {
        console.error('Error fetching therapist profile:', error)
        setTherapistId(null)
      }
    }

    fetchTherapistId()
  }, [isTherapist])

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        {/* Hamburger Button */}
        <button 
          className={styles.hamburger}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="תפריט"
        >
          <span className={isMenuOpen ? styles.hamburgerOpen : ''}></span>
          <span className={isMenuOpen ? styles.hamburgerOpen : ''}></span>
          <span className={isMenuOpen ? styles.hamburgerOpen : ''}></span>
        </button>

        {/* Navigation Links */}
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
          <Link href="/" className={styles.link} onClick={closeMenu}>
            בית
          </Link>
          <Link href="/stories" className={styles.link} onClick={closeMenu}>
            סיפורים
          </Link>
          <Link href="/therapists" className={styles.link} onClick={closeMenu}>
            מטפלים
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/submit-story" className={styles.link} onClick={closeMenu}>
                שתף סיפור
              </Link>
              <Link href="/my-stories" className={styles.link} onClick={closeMenu}>
                הסיפורים שלי
              </Link>
              {isTherapist && therapistId && (
                <Link href={`/therapists/${therapistId}`} className={styles.link} onClick={closeMenu}>
                  הפרופיל שלי
                </Link>
              )}
              <Link href="/apply-therapist" className={styles.link} onClick={closeMenu}>
                הצטרף כמטפל
              </Link>
              {isAdmin && (
                <Link href="/admin" className={styles.adminButton} onClick={closeMenu}>
                  🛡️ ניהול
                </Link>
              )}
              <button onClick={() => { handleLogout(); closeMenu(); }} className={styles.button}>
                התנתק
              </button>
            </>
          ) : (
            <>
              <Link href="/signup" className={styles.button} onClick={closeMenu}>
                הרשמה
              </Link>
              <Link href="/login" className={styles.button} onClick={closeMenu}>
                התחבר
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

