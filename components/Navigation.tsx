import Link from 'next/link'
import styles from './Navigation.module.scss'

export default function Navigation(): JSX.Element {
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
      <Link href="/submit-story" className={styles.link}>
        שתף סיפור
      </Link>
    </nav>
  )
}

