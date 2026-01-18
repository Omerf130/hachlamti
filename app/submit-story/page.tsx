import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import StorySubmissionForm from './StorySubmissionForm'
import styles from './page.module.scss'

export default async function SubmitStoryPage(): Promise<JSX.Element> {
  // Require authentication (any authenticated user can submit)
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/submit-story')}`)
  }

  return (
    <main className={styles.main}>
      <StorySubmissionForm />
    </main>
  )
}
