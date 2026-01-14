import { type TherapistDocument } from '@/models/Therapist'
import { findMany } from '@/lib/db-queries'
import StorySubmissionForm from './StorySubmissionForm'
import styles from './page.module.scss'

// Ensure Therapist model is imported
import '@/models/Therapist'

async function getTherapists(): Promise<TherapistDocument[]> {
  return findMany<TherapistDocument>('Therapist', { status: 'APPROVED' }, {
    fullName: 1,
  })
}

export default async function SubmitStoryPage(): Promise<JSX.Element> {
  const therapists = await getTherapists()

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>שתף סיפור החלמה</h1>
      <StorySubmissionForm therapists={therapists} />
    </main>
  )
}
