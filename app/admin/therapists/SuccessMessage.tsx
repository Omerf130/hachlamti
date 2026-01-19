'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SuccessMessage.module.scss'

interface SuccessMessageProps {
  success?: 'approved' | 'rejected'
}

export default function SuccessMessage({ success }: SuccessMessageProps) {
  const router = useRouter()
  const [visible, setVisible] = useState<boolean>(!!success)

  useEffect(() => {
    if (!success) return undefined

    setVisible(true)

    const timer = setTimeout(() => {
      setVisible(false)

      setTimeout(() => {
        router.replace('/admin/therapists')
      }, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [success, router])

  if (!visible || !success) return null

  const message =
    success === 'approved'
      ? {
          icon: '✓',
          text: 'המטפל אושר בהצלחה! המשתמש קיבל הרשאות THERAPIST.',
          type: 'success',
        }
      : {
          icon: '✓',
          text: 'הבקשה נדחתה ונמחקה בהצלחה.',
          type: 'warning',
        }

  return (
    <div className={`${styles.alert} ${styles[message.type]}`}>
      <span className={styles.icon}>{message.icon}</span>
      <span className={styles.text}>{message.text}</span>

      <button
        type="button"
        className={styles.close}
        aria-label="סגור"
        onClick={() => {
          setVisible(false)
          setTimeout(() => router.replace('/admin/therapists'), 300)
        }}
      >
        ✕
      </button>
    </div>
  )
}