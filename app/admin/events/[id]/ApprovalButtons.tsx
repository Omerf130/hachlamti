'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEventStatus } from '@/app/actions/event'
import styles from './ApprovalButtons.module.scss'

interface ApprovalButtonsProps {
  eventId: string
  eventTitle: string
}

export default function ApprovalButtons({ eventId, eventTitle }: ApprovalButtonsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await updateEventStatus(eventId, 'APPROVED')
      router.push('/admin/events?success=approved')
      router.refresh()
    } catch {
      alert('שגיאה באישור האירוע. נסה שוב.')
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      await updateEventStatus(eventId, 'REJECTED')
      router.push('/admin/events?success=rejected')
      router.refresh()
    } catch {
      alert('שגיאה בדחיית האירוע. נסה שוב.')
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className={styles.actions}>
        <button
          onClick={() => setShowApproveModal(true)}
          className={`${styles.button} ${styles.approve}`}
          disabled={isProcessing}
        >
          ✓ אשר אירוע
        </button>

        <button
          onClick={() => setShowRejectModal(true)}
          className={`${styles.button} ${styles.reject}`}
          disabled={isProcessing}
        >
          ✕ דחה אירוע
        </button>
      </div>

      {showApproveModal && (
        <div className={styles.modalOverlay} onClick={() => !isProcessing && setShowApproveModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>אישור אירוע</h3>
            <p className={styles.modalText}>
              האם אתה בטוח שברצונך לאשר את האירוע <strong>&quot;{eventTitle}&quot;</strong>?
            </p>
            <p className={styles.modalSubtext}>
              האירוע יופיע בדף האירועים ובעמוד הבית.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={handleApprove}
                className={`${styles.modalButton} ${styles.approve}`}
                disabled={isProcessing}
              >
                {isProcessing ? 'מעבד...' : 'אשר'}
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className={`${styles.modalButton} ${styles.cancel}`}
                disabled={isProcessing}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => !isProcessing && setShowRejectModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>דחיית אירוע</h3>
            <p className={styles.modalText}>
              האם אתה בטוח שברצונך לדחות את האירוע <strong>&quot;{eventTitle}&quot;</strong>?
            </p>
            <p className={styles.modalSubtext} style={{ color: '#e53e3e' }}>
              האירוע יימחק לצמיתות ולא ניתן יהיה לשחזר אותו.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={handleReject}
                className={`${styles.modalButton} ${styles.reject}`}
                disabled={isProcessing}
              >
                {isProcessing ? 'מוחק...' : 'דחה ומחק'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className={`${styles.modalButton} ${styles.cancel}`}
                disabled={isProcessing}
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
