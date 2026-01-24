'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteStoryAdmin } from '@/app/actions/story'
import styles from './DeleteStoryButtonAdmin.module.scss'

interface DeleteStoryButtonAdminProps {
  storyId: string
  storyTitle: string
}

export default function DeleteStoryButtonAdmin({
  storyId,
  storyTitle,
}: DeleteStoryButtonAdminProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteStoryAdmin(storyId)
      if (result.success) {
        router.refresh()
        setShowModal(false)
      } else {
        alert(`שגיאה: ${result.error}`)
      }
    } catch (error) {
      alert('שגיאה במחיקת הסיפור')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${styles.actionButton} ${styles.delete}`}
      >
        🗑️ מחק
      </button>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>מחיקת סיפור</h3>
            <p className={styles.modalText}>
              האם אתה בטוח שברצונך למחוק את הסיפור{' '}
              <strong>&quot;{storyTitle}&quot;</strong>?
            </p>
            <p className={styles.modalWarning}>
              פעולה זו תמחק את הסיפור לצמיתות ולא ניתן יהיה לשחזר אותו.
            </p>

            <div className={styles.modalActions}>
              <button
                onClick={handleDelete}
                className={`${styles.modalButton} ${styles.delete}`}
                disabled={isDeleting}
              >
                {isDeleting ? 'מוחק...' : 'מחק סיפור'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={`${styles.modalButton} ${styles.cancel}`}
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

