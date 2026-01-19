'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SuccessMessage.module.scss'

interface SuccessMessageProps {
  success?: string
}

export default function SuccessMessage({ success }: SuccessMessageProps) {
  const router = useRouter()
  const [visible, setVisible] = useState(!!success)

  useEffect(() => {
    if (success) {
      setVisible(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false)
        // Clean URL after fade out
        setTimeout(() => {
          router.replace('/admin/therapists')
        }, 300)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [success, router])

  if (!visible || !success) return null

  const getMessage = () => {
    switch (success) {
      case 'approved':
        return {
          icon: '✓',
          text: 'המטפל אושר בהצלחה! המשתמש קיבל הרשאות THERAPIST.',
          type: 'success',
        }
      case 'rejected':
        return {
          icon: '✓',
          text: 'הבקשה נדחתה ונמחקה בהצלחה.',
          type: 'warning',
        }
      default:
        return null
    }
  }

  const message = getMessage()
  if (!message) return null

  return (
    <div className={`${styles.alert} ${styles[message.type]}`}>
      <span className={styles.icon}>{message.icon}</span>
      <span className={styles.text}>{message.text}</span>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => router.replace('/admin/therapists'), 300)
        }}
        className={styles.close}
        aria-label="סגור"
      >
        ✕
      </button>
    </div>
  )
}

