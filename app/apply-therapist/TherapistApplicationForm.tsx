'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createTherapist } from '@/app/actions/therapist'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.scss'

// Form schema - accepts strings for array fields (from textareas)
const therapistFormSchema = z.object({
  fullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || z.string().email().safeParse(val).success,
      'כתובת אימייל לא תקינה'
    ),
  phone: z.string().optional(),
  specialties: z.string().min(1, 'יש להזין לפחות תחום התמחות אחד'),
  languages: z.string().min(1, 'יש להזין לפחות שפה אחת'),
  targetAudiences: z.string().min(1, 'יש להזין לפחות קהל יעד אחד'),
  locations: z.string().min(1, 'יש להזין לפחות אזור פעילות אחד'),
  treatmentApproach: z.string().optional(),
  yearsExperience: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined
      const num = Number.parseInt(val, 10)
      return Number.isNaN(num) ? undefined : num
    })
    .pipe(z.number().int().min(0).optional()),
  education: z.string().optional(),
  certifications: z.string().optional(),
  availability: z.string().optional(),
})

type TherapistFormInput = z.infer<typeof therapistFormSchema>

export default function TherapistApplicationForm(): JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TherapistFormInput>({
    resolver: zodResolver(therapistFormSchema),
    defaultValues: {
      specialties: '',
      languages: '',
      targetAudiences: '',
      locations: '',
    },
  })

  // Helper function to parse comma or newline separated values
  const parseArrayField = (value: string): string[] => {
    if (!value || value.trim().length === 0) {
      return []
    }
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  const onSubmit = async (data: TherapistFormInput): Promise<void> => {
    setError('')
    setLoading(true)

    try {
      // Parse array fields from textarea inputs
      const specialties = parseArrayField(data.specialties)
      const languages = parseArrayField(data.languages)
      const targetAudiences = parseArrayField(data.targetAudiences)
      const locations = parseArrayField(data.locations)

      // Validate arrays are not empty
      if (specialties.length === 0) {
        setError('יש להזין לפחות תחום התמחות אחד')
        setLoading(false)
        return
      }
      if (languages.length === 0) {
        setError('יש להזין לפחות שפה אחת')
        setLoading(false)
        return
      }
      if (targetAudiences.length === 0) {
        setError('יש להזין לפחות קהל יעד אחד')
        setLoading(false)
        return
      }
      if (locations.length === 0) {
        setError('יש להזין לפחות אזור פעילות אחד')
        setLoading(false)
        return
      }

      // Prepare data for server action
      const submitData = {
        fullName: data.fullName,
        email: data.email && data.email.trim() !== '' ? data.email : undefined,
        phone: data.phone && data.phone.trim() !== '' ? data.phone : undefined,
        specialties,
        languages,
        targetAudiences,
        locations,
        treatmentApproach:
          data.treatmentApproach && data.treatmentApproach.trim() !== ''
            ? data.treatmentApproach
            : undefined,
        yearsExperience: data.yearsExperience,
        education:
          data.education && data.education.trim() !== ''
            ? data.education
            : undefined,
        certifications:
          data.certifications && data.certifications.trim() !== ''
            ? { notes: data.certifications }
            : undefined,
        availability:
          data.availability && data.availability.trim() !== ''
            ? { notes: data.availability }
            : undefined,
      }

      const result = await createTherapist(submitData)

      if (result.success) {
        setSuccess(true)
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/therapists')
        }, 2000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('שגיאה בשליחת הבקשה. אנא נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <p>תודה! הבקשה נשלחה בהצלחה וממתינה לאישור.</p>
        <p>מעבירים אותך לדף המטפלים...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="fullName">שם מלא *</label>
        <input
          id="fullName"
          type="text"
          {...register('fullName')}
          placeholder="הכנס שם מלא"
        />
        {errors.fullName && (
          <span className={styles.fieldError}>{errors.fullName.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="email">אימייל</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          placeholder="הכנס כתובת אימייל"
        />
        {errors.email && (
          <span className={styles.fieldError}>{errors.email.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">טלפון</label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="הכנס מספר טלפון"
        />
        {errors.phone && (
          <span className={styles.fieldError}>{errors.phone.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="specialties">
          תחומי התמחות * (הפרד בפסיקים או שורות חדשות)
        </label>
        <textarea
          id="specialties"
          {...register('specialties')}
          placeholder="לדוגמה: טיפול קוגניטיבי-התנהגותי, טיפול דינמי, טיפול זוגי"
          rows={4}
        />
        {errors.specialties && (
          <span className={styles.fieldError}>{errors.specialties.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="languages">
          שפות * (הפרד בפסיקים או שורות חדשות)
        </label>
        <textarea
          id="languages"
          {...register('languages')}
          placeholder="לדוגמה: עברית, אנגלית, ערבית"
          rows={3}
        />
        {errors.languages && (
          <span className={styles.fieldError}>{errors.languages.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="targetAudiences">
          קהלי יעד * (הפרד בפסיקים או שורות חדשות)
        </label>
        <textarea
          id="targetAudiences"
          {...register('targetAudiences')}
          placeholder="לדוגמה: מבוגרים, נוער, זוגות, משפחות"
          rows={3}
        />
        {errors.targetAudiences && (
          <span className={styles.fieldError}>
            {errors.targetAudiences.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="locations">
          אזורי פעילות * (הפרד בפסיקים או שורות חדשות)
        </label>
        <textarea
          id="locations"
          {...register('locations')}
          placeholder="לדוגמה: תל אביב, ירושלים, אונליין"
          rows={3}
        />
        {errors.locations && (
          <span className={styles.fieldError}>{errors.locations.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="treatmentApproach">גישת טיפול</label>
        <textarea
          id="treatmentApproach"
          {...register('treatmentApproach')}
          placeholder="תאר את גישת הטיפול שלך"
          rows={4}
        />
        {errors.treatmentApproach && (
          <span className={styles.fieldError}>
            {errors.treatmentApproach.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="yearsExperience">שנות ניסיון</label>
        <input
          id="yearsExperience"
          type="number"
          min="0"
          {...register('yearsExperience')}
          placeholder="מספר שנות ניסיון"
        />
        {errors.yearsExperience && (
          <span className={styles.fieldError}>
            {errors.yearsExperience.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="education">השכלה</label>
        <textarea
          id="education"
          {...register('education')}
          placeholder="תאר את ההשכלה וההכשרה שלך"
          rows={4}
        />
        {errors.education && (
          <span className={styles.fieldError}>{errors.education.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="certifications">תעודות והסמכות</label>
        <textarea
          id="certifications"
          {...register('certifications')}
          placeholder="רשום תעודות והסמכות רלוונטיות"
          rows={3}
        />
        {errors.certifications && (
          <span className={styles.fieldError}>
            {errors.certifications.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="availability">זמינות</label>
        <textarea
          id="availability"
          {...register('availability')}
          placeholder="תאר את זמני הזמינות שלך"
          rows={3}
        />
        {errors.availability && (
          <span className={styles.fieldError}>
            {errors.availability.message}
          </span>
        )}
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'שולח...' : 'שלח בקשה'}
      </button>
    </form>
  )
}

