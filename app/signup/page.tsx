import SignupForm from './SignupForm'
import styles from './page.module.scss'

export default async function SignupPage(): Promise<JSX.Element> {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>הרשמה</h1>
      <SignupForm />
    </main>
  )
}

