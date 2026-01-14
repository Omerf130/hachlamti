'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createStoryBaseSchema, type CreateStoryBaseInput } from '@/lib/validations/story'
import { createStory } from '@/app/actions/story'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TherapistDocument } from '@/models/Therapist'
import styles from './page.module.scss'

interface StorySubmissionFormProps {
  therapists: TherapistDocument[]
}

export default function StorySubmissionForm({
  therapists,
}: StorySubmissionFormProps): JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateStoryBaseInput>({
    resolver: zodResolver(createStoryBaseSchema),
    defaultValues: {
      privacyLevel: 'ANONYMOUS',
      therapistId: '',
      therapistNameRaw: '',
    },
  })

  const privacyLevel = watch('privacyLevel')
  const therapistSelection = watch('therapistId')

  const requiresSubmitterName =
    privacyLevel === 'FULL_NAME' || privacyLevel === 'FIRST_NAME_LAST_INITIAL'

  const onSubmit = async (data: CreateStoryBaseInput): Promise<void> => {
    setError('')
    setLoading(true)

    try {
      // Basic check for submitterName since we used the base schema
      if (requiresSubmitterName && (!data.submitterName || data.submitterName.trim() === '')) {
        setError('שם הוא שדה חובה לרמת הפרטיות שנבחרה')
        setLoading(false)
        return
      }

      // Clear therapist fields if not selected
      const submitData = {
        ...data,
        therapistId: data.therapistId || undefined,
        therapistNameRaw: data.therapistId ? undefined : data.therapistNameRaw || undefined,
      }

      const result = await createStory(submitData)

      if (result.success) {
        setSuccess(true)
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/stories')
        }, 2000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('שגיאה ביצירת הסיפור. אנא נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <p>תודה! הסיפור נשלח בהצלחה וממתין לאישור.</p>
        <p>מעבירים אותך לדף הסיפורים...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="privacyLevel">רמת פרטיות *</label>
        <select id="privacyLevel" {...register('privacyLevel')}>
          <option value="ANONYMOUS">אנונימי</option>
          <option value="FIRST_NAME_LAST_INITIAL">שם פרטי ואות ראשונה של שם משפחה</option>
          <option value="FULL_NAME">שם מלא</option>
        </select>
        {errors.privacyLevel && (
          <span className={styles.fieldError}>{errors.privacyLevel.message}</span>
        )}
      </div>

      {requiresSubmitterName && (
        <div className={styles.field}>
          <label htmlFor="submitterName">שם *</label>
          <input
            id="submitterName"
            type="text"
            {...register('submitterName')}
            disabled={loading}
          />
          {errors.submitterName && (
            <span className={styles.fieldError}>{errors.submitterName.message}</span>
          )}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="medicalCondition">מצב רפואי *</label>
        <input
          id="medicalCondition"
          type="text"
          {...register('medicalCondition')}
          disabled={loading}
        />
        {errors.medicalCondition && (
          <span className={styles.fieldError}>{errors.medicalCondition.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="treatmentCategory">קטגוריית טיפול *</label>
        <input
          id="treatmentCategory"
          type="text"
          {...register('treatmentCategory')}
          disabled={loading}
        />
        {errors.treatmentCategory && (
          <span className={styles.fieldError}>{errors.treatmentCategory.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="treatmentProcess">תהליך הטיפול *</label>
        <textarea
          id="treatmentProcess"
          rows={8}
          {...register('treatmentProcess')}
          disabled={loading}
        />
        {errors.treatmentProcess && (
          <span className={styles.fieldError}>{errors.treatmentProcess.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="duration">משך הטיפול</label>
        <input
          id="duration"
          type="text"
          {...register('duration')}
          disabled={loading}
          placeholder="למשל: 6 חודשים"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="outcome">תוצאות</label>
        <textarea
          id="outcome"
          rows={4}
          {...register('outcome')}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="therapistSelection">מטפל (אופציונלי)</label>
        <select
          id="therapistSelection"
          {...register('therapistId')}
          disabled={loading}
        >
          <option value="">בחר מטפל מהרשימה</option>
          {therapists.map((therapist) => (
            <option key={therapist._id.toString()} value={therapist._id.toString()}>
              {therapist.fullName}
            </option>
          ))}
        </select>
        <p className={styles.hint}>או הזן שם מטפל שלא ברשימה:</p>
        <input
          id="therapistNameRaw"
          type="text"
          {...register('therapistNameRaw')}
          disabled={loading || !!therapistSelection}
          placeholder="שם מטפל"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="transcript">תמלול (אופציונלי)</label>
        <textarea
          id="transcript"
          rows={4}
          {...register('transcript')}
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'שולח...' : 'שלח סיפור'}
      </button>
    </form>
  )
}
