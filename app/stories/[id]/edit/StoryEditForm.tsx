'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateStory } from '@/app/actions/story'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.scss'

// Form schema for editing (no declarations required)
const editStoryFormSchema = z.object({
  submitterFullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  submitterPhone: z.string().min(1, 'מספר טלפון הוא שדה חובה'),
  mayContact: z.boolean(),
  publicationChoice: z.enum(['FULL_NAME', 'FIRST_NAME_ONLY', 'ANONYMOUS']),
  
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  problem: z.string().min(1, 'תיאור הבעיה הוא שדה חובה'),
  previousAttempts: z.string().min(1, 'תיאור ניסיונות קודמים הוא שדה חובה'),
  solution: z.string().min(1, 'תיאור הפתרון הוא שדה חובה'),
  results: z.string().min(1, 'תיאור התוצאות הוא שדה חובה'),
  messageToOthers: z.string().min(1, 'הודעה לאחרים היא שדה חובה'),
  freeTextStory: z.string().optional(),
})

type EditStoryFormInput = z.infer<typeof editStoryFormSchema>

interface StoryEditFormProps {
  initialData: {
    _id: string
    submitterFullName: string
    submitterPhone: string
    mayContact: boolean
    publicationChoice: 'FULL_NAME' | 'FIRST_NAME_ONLY' | 'ANONYMOUS'
    title: string
    problem: string
    previousAttempts: string
    solution: string
    results: string
    messageToOthers: string
    freeTextStory: string
  }
}

export default function StoryEditForm({ initialData }: StoryEditFormProps) {
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditStoryFormInput>({
    resolver: zodResolver(editStoryFormSchema),
    defaultValues: {
      submitterFullName: initialData.submitterFullName,
      submitterPhone: initialData.submitterPhone,
      mayContact: initialData.mayContact,
      publicationChoice: initialData.publicationChoice,
      title: initialData.title,
      problem: initialData.problem,
      previousAttempts: initialData.previousAttempts,
      solution: initialData.solution,
      results: initialData.results,
      messageToOthers: initialData.messageToOthers,
      freeTextStory: initialData.freeTextStory,
    },
  })

  const onSubmit = async (data: EditStoryFormInput) => {
    setLoading(true)
    setError('')

    const result = await updateStory({
      storyId: initialData._id,
      ...data,
    })

    if (result.success) {
      router.push('/my-stories')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Section A: Personal Details */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטים אישיים (למטרות יצירת קשר בלבד)</h2>
        <p className={styles.sectionNote}>לא יפורסמו ללא אישורך המפורש</p>

        <div className={styles.field}>
          <label>שם מלא *</label>
          <input type="text" {...register('submitterFullName')} disabled={loading} />
          {errors.submitterFullName && (
            <span className={styles.fieldError}>{errors.submitterFullName.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>מספר טלפון *</label>
          <input type="tel" {...register('submitterPhone')} disabled={loading} />
          {errors.submitterPhone && (
            <span className={styles.fieldError}>{errors.submitterPhone.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>האם ניתן ליצור איתך קשר להבהרות? *</label>
          <Controller
            name="mayContact"
            control={control}
            render={({ field }) => (
              <div className={styles.radioGroup}>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    checked={field.value === true}
                    onChange={() => field.onChange(true)}
                    disabled={loading}
                  />
                  <span>כן</span>
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    checked={field.value === false}
                    onChange={() => field.onChange(false)}
                    disabled={loading}
                  />
                  <span>לא</span>
                </label>
              </div>
            )}
          />
        </div>

        <div className={styles.field}>
          <label>כיצד תרצה שהסיפור יפורסם? *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radio}>
              <input
                type="radio"
                value="FULL_NAME"
                {...register('publicationChoice')}
                disabled={loading}
              />
              <span>שם מלא</span>
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                value="FIRST_NAME_ONLY"
                {...register('publicationChoice')}
                disabled={loading}
              />
              <span>שם פרטי בלבד</span>
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                value="ANONYMOUS"
                {...register('publicationChoice')}
                disabled={loading}
              />
              <span>אנונימי</span>
            </label>
          </div>
          {errors.publicationChoice && (
            <span className={styles.fieldError}>{errors.publicationChoice.message}</span>
          )}
        </div>
      </section>

      {/* Section B: Story Content */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>תוכן הסיפור</h2>

        <div className={styles.field}>
          <label>כותרת *</label>
          <input
            type="text"
            placeholder='לדוגמה: "איך החלמתי מ..."'
            {...register('title')}
            disabled={loading}
          />
          {errors.title && <span className={styles.fieldError}>{errors.title.message}</span>}
        </div>

        <div className={styles.field}>
          <label>הבעיה: מהי הבעיה הרפואית? *</label>
          <textarea {...register('problem')} rows={4} disabled={loading} />
          {errors.problem && <span className={styles.fieldError}>{errors.problem.message}</span>}
        </div>

        <div className={styles.field}>
          <label>ניסיונות קודמים: מה ניסית לפני? *</label>
          <textarea {...register('previousAttempts')} rows={4} disabled={loading} />
          {errors.previousAttempts && (
            <span className={styles.fieldError}>{errors.previousAttempts.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>הפתרון שעזר: סוג הטיפול, תיאור, משך וחוויה *</label>
          <textarea {...register('solution')} rows={4} disabled={loading} />
          {errors.solution && <span className={styles.fieldError}>{errors.solution.message}</span>}
        </div>

        <div className={styles.field}>
          <label>תוצאות: מה מצבך היום? *</label>
          <textarea {...register('results')} rows={4} disabled={loading} />
          {errors.results && <span className={styles.fieldError}>{errors.results.message}</span>}
        </div>

        <div className={styles.field}>
          <label>מסר לאחרים: מה היית אומר למי שעובר את זה כרגע? *</label>
          <textarea {...register('messageToOthers')} rows={4} disabled={loading} />
          {errors.messageToOthers && (
            <span className={styles.fieldError}>{errors.messageToOthers.message}</span>
          )}
        </div>

        <div className={styles.divider}>
          <span>או לחלופין</span>
        </div>

        <div className={styles.field}>
          <label>כתוב את הסיפור המלא שלך בחופשיות (אופציונלי)</label>
          <textarea {...register('freeTextStory')} rows={8} disabled={loading} />
        </div>
      </section>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.cancelButton}
          disabled={loading}
        >
          ביטול
        </button>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'שומר...' : 'שמור שינויים'}
        </button>
      </div>
    </form>
  )
}

