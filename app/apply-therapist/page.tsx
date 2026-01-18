import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import TherapistApplicationForm from './TherapistApplicationForm'
import styles from './page.module.scss'

export default async function ApplyTherapistPage(): Promise<JSX.Element> {
  // Require authentication (any authenticated user can apply)
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/apply-therapist')}`)
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Join the Hachlamti Therapist Network 💚</h1>
      <p className={styles.subtitle}>
        Help more people heal. Fill in your details and your profile will be reviewed before the site goes live.
      </p>
      <TherapistApplicationForm />
    </main>
  )
}

