'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteEvent } from '@/app/actions/event'
import styles from './page.module.scss'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
}

export default function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')
    try {
      const result = await deleteEvent(eventId)
      if (result.success) {
        router.refresh()
        setShowModal(false)
      } else {
        setError(result.error)
      }
    } catch {
      setError('שגיאה במחיקת האירוע')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={styles.deleteButton}
        disabled={isDeleting}
      >
        מחק
      </button>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>מחיקת אירוע</h3>
            <p className={styles.modalMessage}>
              האם אתה בטוח שברצונך למחוק את האירוע <strong>&quot;{eventTitle}&quot;</strong>?
            </p>
            {error && <p className={styles.modalError}>{error}</p>}
            <div className={styles.modalActions}>
              <button
                onClick={handleDelete}
                className={styles.modalDeleteButton}
                disabled={isDeleting}
              >
                {isDeleting ? 'מוחק...' : 'מחק'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={styles.modalCancelButton}
                disabled={isDeleting}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
