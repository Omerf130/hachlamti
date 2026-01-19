'use client'

import { useState } from 'react'
import { deleteStory } from '@/app/actions/story'
import { useRouter } from 'next/navigation'
import styles from './page.module.scss'

interface DeleteStoryButtonProps {
  storyId: string
  storyTitle: string
}

export default function DeleteStoryButton({ storyId, storyTitle }: DeleteStoryButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    const result = await deleteStory(storyId)

    if (result.success) {
      // Close dialog and refresh the page
      setShowConfirm(false)
      router.refresh()
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className={styles.deleteButton}
        disabled={loading}
      >
        מחק
      </button>

      {showConfirm && (
        <div className={styles.modalOverlay} onClick={() => !loading && setShowConfirm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>מחיקת סיפור</h3>
            <p className={styles.modalMessage}>
              האם אתה בטוח שברצונך למחוק את הסיפור "{storyTitle}"?
              <br />
              <strong>פעולה זו לא ניתנת לביטול.</strong>
            </p>
            
            {error && (
              <div className={styles.modalError}>
                {error}
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowConfirm(false)}
                className={styles.modalCancelButton}
                disabled={loading}
              >
                ביטול
              </button>
              <button
                onClick={handleDelete}
                className={styles.modalDeleteButton}
                disabled={loading}
              >
                {loading ? 'מוחק...' : 'מחק'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

