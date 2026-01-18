'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createStory } from '@/app/actions/story'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.scss'

// Simplified form schema for client-side
const storyFormSchema = z.object({
  // A. Personal Details
  submitterFullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  submitterPhone: z.string().min(1, 'מספר טלפון הוא שדה חובה'),
  submitterEmail: z.string().email('כתובת אימייל לא תקינה'),
  mayContact: z.boolean(),
  publicationChoice: z.enum(['FULL_NAME', 'FIRST_NAME_ONLY', 'ANONYMOUS']),
  
  // B. Story Content
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  problem: z.string().min(1, 'תיאור הבעיה הוא שדה חובה'),
  previousAttempts: z.string().min(1, 'תיאור ניסיונות קודמים הוא שדה חובה'),
  solution: z.string().min(1, 'תיאור הפתרון הוא שדה חובה'),
  results: z.string().min(1, 'תיאור התוצאות הוא שדה חובה'),
  messageToOthers: z.string().min(1, 'הודעה לאחרים היא שדה חובה'),
  freeTextStory: z.string().optional(),
  
  // C. Declarations
  declarationTruthful: z.boolean(),
  declarationConsent: z.boolean(),
  declarationNotMedicalAdvice: z.boolean(),
  declarationEditingConsent: z.boolean(),
})

type StoryFormInput = z.infer<typeof storyFormSchema>

export default function StorySubmissionForm(): JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoryFormInput>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      publicationChoice: 'ANONYMOUS',
      mayContact: true,
      declarationTruthful: false,
      declarationConsent: false,
      declarationNotMedicalAdvice: false,
      declarationEditingConsent: false,
    },
  })

  const onSubmit = async (data: StoryFormInput): Promise<void> => {
    setError('')
    setLoading(true)

    try {
      // Validate declarations
      if (!data.declarationTruthful || !data.declarationConsent || 
          !data.declarationNotMedicalAdvice || !data.declarationEditingConsent) {
        setError('יש לאשר את כל ההצהרות')
        setLoading(false)
        return
      }

      const submitData = {
        ...data,
        submissionDate: new Date(),
      }

      const result = await createStory(submitData)

      if (result.success) {
        setSuccess(true)
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
        <h2>תודה רבה על השיתוף.</h2>
        <p>האתר יעלה לאוויר בקרוב, ואנשים רבים יוכלו לשאוב תקווה והשראה מהסיפור שלך.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* A. Personal Details */}
      <section className={styles.section}>
        <h2>פרטים אישיים (למטרת יצירת קשר בלבד)</h2>
        
        <div className={styles.field}>
          <label htmlFor="submitterFullName">שם מלא *</label>
          <input
            id="submitterFullName"
            type="text"
            {...register('submitterFullName')}
            placeholder="הכנס שם מלא"
            disabled={loading}
          />
          {errors.submitterFullName && (
            <span className={styles.fieldError}>{errors.submitterFullName.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="submitterPhone">מספר טלפון *</label>
          <p className={styles.hint}>לא יפורסם ללא אישורך המפורש</p>
          <input
            id="submitterPhone"
            type="tel"
            {...register('submitterPhone')}
            placeholder="הכנס מספר טלפון"
            disabled={loading}
          />
          {errors.submitterPhone && (
            <span className={styles.fieldError}>{errors.submitterPhone.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="submitterEmail">אימייל *</label>
          <input
            id="submitterEmail"
            type="email"
            {...register('submitterEmail')}
            placeholder="הכנס כתובת אימייל"
            disabled={loading}
          />
          {errors.submitterEmail && (
            <span className={styles.fieldError}>{errors.submitterEmail.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>האם ניתן ליצור איתך קשר להבהרות? *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radio}>
              <input
                type="radio"
                value="true"
                {...register('mayContact', { setValueAs: (v) => v === 'true' })}
                disabled={loading}
              />
              <span>כן</span>
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                value="false"
                {...register('mayContact', { setValueAs: (v) => v === 'true' })}
                disabled={loading}
              />
              <span>לא</span>
            </label>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="publicationChoice">איך תרצה שהסיפור יפורסם? *</label>
          <select id="publicationChoice" {...register('publicationChoice')} disabled={loading}>
            <option value="FULL_NAME">שם מלא</option>
            <option value="FIRST_NAME_ONLY">שם פרטי בלבד</option>
            <option value="ANONYMOUS">אנונימי</option>
          </select>
          {errors.publicationChoice && (
            <span className={styles.fieldError}>{errors.publicationChoice.message}</span>
          )}
        </div>
      </section>

      {/* B. Story Content */}
      <section className={styles.section}>
        <h2>תוכן הסיפור</h2>
        
        <div className={styles.field}>
          <label htmlFor="title">כותרת *</label>
          <input
            id="title"
            type="text"
            {...register('title')}
            placeholder='לדוגמה: "איך החלמתי מ..."'
            disabled={loading}
          />
          {errors.title && (
            <span className={styles.fieldError}>{errors.title.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="problem">הבעיה: מהו המצב הרפואי? *</label>
          <textarea
            id="problem"
            {...register('problem')}
            rows={5}
            placeholder="תאר את הבעיה או המצב הרפואי שהיה לך"
            disabled={loading}
          />
          {errors.problem && (
            <span className={styles.fieldError}>{errors.problem.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="previousAttempts">ניסיונות קודמים: מה ניסית לפני? *</label>
          <textarea
            id="previousAttempts"
            {...register('previousAttempts')}
            rows={5}
            placeholder="תאר טיפולים או פתרונות אחרים שניסית"
            disabled={loading}
          />
          {errors.previousAttempts && (
            <span className={styles.fieldError}>{errors.previousAttempts.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="solution">הפתרון שעזר: סוג הטיפול, תיאור, משך וחוויה *</label>
          <textarea
            id="solution"
            {...register('solution')}
            rows={6}
            placeholder="תאר את הטיפול שעזר לך, כמה זמן זה לקח, ואיך היה התהליך"
            disabled={loading}
          />
          {errors.solution && (
            <span className={styles.fieldError}>{errors.solution.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="results">תוצאות: מה מצבך היום? *</label>
          <textarea
            id="results"
            {...register('results')}
            rows={5}
            placeholder="תאר מה המצב שלך כיום לאחר הטיפול"
            disabled={loading}
          />
          {errors.results && (
            <span className={styles.fieldError}>{errors.results.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="messageToOthers">מסר לאחרים: מה היית אומר למישהו שעובר את זה כרגע? *</label>
          <textarea
            id="messageToOthers"
            {...register('messageToOthers')}
            rows={4}
            placeholder="מסר של תקווה ועידוד למי שעובר את מה שעברת"
            disabled={loading}
          />
          {errors.messageToOthers && (
            <span className={styles.fieldError}>{errors.messageToOthers.message}</span>
          )}
        </div>

        <div className={styles.divider}>
          <span>או לחלופין</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="freeTextStory">ניתן לכתוב את הסיפור המלא באופן חופשי למטה (אופציונלי)</label>
          <textarea
            id="freeTextStory"
            {...register('freeTextStory')}
            rows={10}
            placeholder="כתוב את הסיפור המלא שלך באופן חופשי..."
            disabled={loading}
          />
        </div>
      </section>

      {/* C. Declarations */}
      <section className={styles.section}>
        <h2>הצהרות ואישורים (חובה) *</h2>
        <div className={styles.declarationsGroup}>
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationTruthful')} disabled={loading} />
            <span>אני מאשר/ת שהסיפור שלי אמיתי ומדויק.</span>
          </label>
          
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationConsent')} disabled={loading} />
            <span>אני מסכים/ה לפרסום הסיפור שלי בפלטפורמה בהתאם לבחירת הפרטיות שלי.</span>
          </label>
          
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationNotMedicalAdvice')} disabled={loading} />
            <span>אני מבין/ה שהסיפור הזה הוא למטרת שיתוף חוויה בלבד ואינו מחליף ייעוץ רפואי.</span>
          </label>
          
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationEditingConsent')} disabled={loading} />
            <span>אני מבין/ה שהפלטפורמה עשויה לערוך את הסיפור למטרות שפה וכתיב בלבד.</span>
          </label>
        </div>
      </section>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'שולח...' : 'שלח סיפור'}
      </button>
    </form>
  )
}
