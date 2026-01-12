import Link from 'next/link'
import styles from './page.module.scss'

export default function Home(): JSX.Element {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Hachlamti</h1>
      <p className={styles.description}>
        פלטפורמה לפרסום סיפורי החלמה וחיבור למטפלים
      </p>
      <nav className={styles.nav}>
        <Link href="/stories">קרא סיפורים</Link>
        <Link href="/therapists">מצא מטפל</Link>
        <Link href="/submit-story">שתף סיפור</Link>
      </nav>
    </main>
  )
}

