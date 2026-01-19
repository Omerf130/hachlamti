'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTherapistStatus } from '@/app/actions/therapist'
import styles from './ApprovalButtons.module.scss'

interface ApprovalButtonsProps {
  therapistId: string
  therapistName: string
}

export default function ApprovalButtons({ therapistId, therapistName }: ApprovalButtonsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await updateTherapistStatus(therapistId, 'APPROVED')
      router.push('/admin/therapists?success=approved')
      router.refresh()
    } catch (error) {
      alert('שגיאה באישור המטפל. נסה שוב.')
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      await updateTherapistStatus(therapistId, 'REJECTED')
      router.push('/admin/therapists?success=rejected')
      router.refresh()
    } catch (error) {
      alert('שגיאה בדחיית המטפל. נסה שוב.')
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
          ✓ אשר מטפל
        </button>

        <button
          onClick={() => setShowRejectModal(true)}
          className={`${styles.button} ${styles.reject}`}
          disabled={isProcessing}
        >
          ✕ דחה בקשה
        </button>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className={styles.modalOverlay} onClick={() => !isProcessing && setShowApproveModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>אישור מטפל</h3>
            <p className={styles.modalText}>
              האם אתה בטוח שברצונך לאשר את <strong>{therapistName}</strong>?
            </p>
            <p className={styles.modalSubtext}>
              המשתמש יועבר לתפקיד THERAPIST ויוכל לערוך את הפרופיל שלו.
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

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => !isProcessing && setShowRejectModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>דחיית בקשה</h3>
            <p className={styles.modalText}>
              האם אתה בטוח שברצונך לדחות את הבקשה של <strong>{therapistName}</strong>?
            </p>
            <p className={styles.modalSubtext} style={{ color: '#e53e3e' }}>
              הבקשה תימחק לצמיתות ולא ניתן יהיה לשחזר אותה.
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

