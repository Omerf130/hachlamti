import Link from 'next/link'
import styles from './page.module.scss'

export default function Home(): JSX.Element {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Hachlamti</h1>
      <p className={styles.description}>
        פלטפורמה לפרסום סיפורי החלמה וחיבור למטפלים
      </p>
      <div className={styles.actions}>
        <Link href="/stories" className={styles.button}>
          קרא סיפורים
        </Link>
        <Link href="/therapists" className={styles.button}>
          מצא מטפל
        </Link>
        <Link href="/submit-story" className={styles.buttonSecondary}>
          שתף סיפור
        </Link>
      </div>
    </main>
  )
}

