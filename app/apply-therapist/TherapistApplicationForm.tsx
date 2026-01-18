'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createTherapist } from '@/app/actions/therapist'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.scss'

// Simplified form schema for client-side (will be validated on server)
const therapistFormSchema = z.object({
  fullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  phoneWhatsApp: z.string().min(1, 'מספר טלפון (ווטסאפ) הוא שדה חובה'),
  treatmentSpecialties: z.string().min(1, 'יש להזין לפחות תחום התמחות אחד'),
  yearsExperience: z.number({ invalid_type_error: 'יש להזין מספר' }).int().min(0),
  certifications: z.array(z.object({
    name: z.string().min(1, 'שם תעודה הוא שדה חובה'),
    fileUrl: z.string().optional(),
  })),
  
  professionalDescription: z.string().min(1, 'תיאור מקצועי הוא שדה חובה'),
  healthIssues: z.string().min(1, 'יש להזין לפחות בעיה בריאותית אחת'),
  languages: z.object({
    hebrew: z.boolean().optional(),
    english: z.boolean().optional(),
    russian: z.boolean().optional(),
    arabic: z.boolean().optional(),
    french: z.boolean().optional(),
    other: z.string().optional(),
  }),
  geographicArea: z.string().min(1, 'אזור גיאוגרפי הוא שדה חובה'),
  clinicAddress: z.string().optional(),
  treatmentLocations: z.object({
    fixedClinic: z.boolean().optional(),
    homeVisits: z.boolean().optional(),
    remote: z.boolean().optional(),
    combination: z.boolean().optional(),
  }),
  
  availability: z.string().optional(), // Simplified for MVP
  
  website: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  
  profileImageUrl: z.string().optional(),
  clinicImageUrl: z.string().optional(),
  
  declarationAccurate: z.boolean(),
  declarationCertified: z.boolean(),
  declarationTerms: z.boolean(),
  declarationConsent: z.boolean(),
  declarationResponsibility: z.boolean(),
  
  additionalNotes: z.string().optional(),
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
    control,
    formState: { errors },
  } = useForm<TherapistFormInput>({
    resolver: zodResolver(therapistFormSchema),
    defaultValues: {
      certifications: [{ name: '', fileUrl: '' }],
      declarationAccurate: false,
      declarationCertified: false,
      declarationTerms: false,
      declarationConsent: false,
      declarationResponsibility: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certifications',
  })

  const parseArrayField = (value: string): string[] => {
    if (!value || value.trim().length === 0) return []
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  const onSubmit = async (data: TherapistFormInput): Promise<void> => {
    setError('')
    setLoading(true)

    try {
      // Parse treatment specialties
      const treatmentSpecialties = parseArrayField(data.treatmentSpecialties)
      
      // Parse health issues
      const healthIssues = parseArrayField(data.healthIssues)
      
      // Parse languages
      const languages: string[] = []
      if (data.languages.hebrew) languages.push('עברית')
      if (data.languages.english) languages.push('אנגלית')
      if (data.languages.russian) languages.push('רוסית')
      if (data.languages.arabic) languages.push('ערבית')
      if (data.languages.french) languages.push('צרפתית')
      if (data.languages.other && data.languages.other.trim()) {
        languages.push(data.languages.other.trim())
      }
      
      // Parse treatment locations
      const treatmentLocations: string[] = []
      if (data.treatmentLocations.fixedClinic) treatmentLocations.push('FIXED_CLINIC')
      if (data.treatmentLocations.homeVisits) treatmentLocations.push('HOME_VISITS')
      if (data.treatmentLocations.remote) treatmentLocations.push('REMOTE')
      if (data.treatmentLocations.combination) treatmentLocations.push('COMBINATION')
      
      // Validate required arrays
      if (treatmentSpecialties.length === 0) {
        setError('יש להזין לפחות תחום התמחות אחד')
        setLoading(false)
        return
      }
      if (healthIssues.length === 0) {
        setError('יש לבחור לפחות בעיה בריאותית אחת')
        setLoading(false)
        return
      }
      if (languages.length === 0) {
        setError('יש לבחור לפחות שפה אחת')
        setLoading(false)
        return
      }
      if (treatmentLocations.length === 0) {
        setError('יש לבחור לפחות מיקום טיפול אחד')
        setLoading(false)
        return
      }
      
      // Validate declarations
      if (!data.declarationAccurate || !data.declarationCertified || 
          !data.declarationTerms || !data.declarationConsent || 
          !data.declarationResponsibility) {
        setError('יש לאשר את כל ההצהרות')
        setLoading(false)
        return
      }

      // Prepare submit data
      const submitData = {
        fullName: data.fullName,
        email: data.email,
        phoneWhatsApp: data.phoneWhatsApp,
        treatmentSpecialties,
        yearsExperience: data.yearsExperience,
        certifications: data.certifications.filter(c => c.name.trim().length > 0),
        
        professionalDescription: data.professionalDescription,
        healthIssues,
        languages,
        geographicArea: data.geographicArea,
        clinicAddress: data.clinicAddress || undefined,
        treatmentLocations,
        
        availability: data.availability ? { notes: data.availability } : {},
        
        externalLinks: {
          website: data.website || undefined,
          facebook: data.facebook || undefined,
          instagram: data.instagram || undefined,
        },
        
        profileImageUrl: data.profileImageUrl || undefined,
        clinicImageUrl: data.clinicImageUrl || undefined,
        
        declarationAccurate: true,
        declarationCertified: true,
        declarationTerms: true,
        declarationConsent: true,
        declarationResponsibility: true,
        
        additionalNotes: data.additionalNotes || undefined,
      }

      const result = await createTherapist(submitData)

      if (result.success) {
        setSuccess(true)
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
        <h2>תודה שמילאת את הטופס.</h2>
        <p>נשמח אם תשתף את טופס סיפורי ההחלמה עם מטופלים שהחלימו בזכות הטיפול שלך,</p>
        <p>כדי שנוכל לחבר עוד מטופלים לעבודה שלך.</p>
        <p className={styles.launchNote}>האתר יעלה לאוויר בקרוב.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* A. Personal & Professional Details */}
      <section className={styles.section}>
        <h2>פרטים אישיים ומקצועיים</h2>
        
        <div className={styles.field}>
          <label htmlFor="fullName">שם מלא *</label>
          <input
            id="fullName"
            type="text"
            {...register('fullName')}
            placeholder="הכנס שם מלא"
            disabled={loading}
          />
          {errors.fullName && (
            <span className={styles.fieldError}>{errors.fullName.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="email">אימייל *</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="הכנס כתובת אימייל"
            disabled={loading}
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="phoneWhatsApp">טלפון (ווטסאפ) *</label>
          <input
            id="phoneWhatsApp"
            type="tel"
            {...register('phoneWhatsApp')}
            placeholder="הכנס מספר טלפון לווטסאפ"
            disabled={loading}
          />
          {errors.phoneWhatsApp && (
            <span className={styles.fieldError}>{errors.phoneWhatsApp.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="treatmentSpecialties">תחומי טיפול * (הפרד בפסיקים)</label>
          <textarea
            id="treatmentSpecialties"
            {...register('treatmentSpecialties')}
            placeholder="לדוגמה: טיפול קוגניטיבי-התנהגותי, טיפול דינמי, אוסטאופתיה"
            rows={3}
            disabled={loading}
          />
          {errors.treatmentSpecialties && (
            <span className={styles.fieldError}>{errors.treatmentSpecialties.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="yearsExperience">שנות ניסיון *</label>
          <input
            id="yearsExperience"
            type="number"
            min="0"
            {...register('yearsExperience', { valueAsNumber: true })}
            placeholder="מספר שנות ניסיון"
            disabled={loading}
          />
          {errors.yearsExperience && (
            <span className={styles.fieldError}>{errors.yearsExperience.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>תעודות והסמכות</label>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.certificationEntry}>
              <input
                {...register(`certifications.${index}.name`)}
                placeholder="שם התעודה"
                disabled={loading}
              />
              <input
                {...register(`certifications.${index}.fileUrl`)}
                placeholder="קישור לקובץ (אופציונלי)"
                disabled={loading}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className={styles.removeButton}
                  disabled={loading}
                >
                  הסר
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: '', fileUrl: '' })}
            className={styles.addButton}
            disabled={loading}
          >
            + הוסף תעודה
          </button>
        </div>
      </section>

      {/* B. Professional Profile */}
      <section className={styles.section}>
        <h2>פרופיל מקצועי</h2>
        
        <div className={styles.field}>
          <label htmlFor="professionalDescription">תיאור מקצועי קצר *</label>
          <p className={styles.hint}>מי אתה / מהי הגישה הטיפולית שלך?</p>
          <textarea
            id="professionalDescription"
            {...register('professionalDescription')}
            rows={5}
            placeholder="תאר את עצמך ואת הגישה הטיפולית שלך"
            disabled={loading}
          />
          {errors.professionalDescription && (
            <span className={styles.fieldError}>{errors.professionalDescription.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="healthIssues">בעיות בריאות שאתה עובד איתן * (הפרד בפסיקים)</label>
          <textarea
            id="healthIssues"
            {...register('healthIssues')}
            placeholder="לדוגמה: כאבי גב, חרדה, בעיות עיכול, PTSD, סוכרת"
            rows={3}
            disabled={loading}
          />
          {errors.healthIssues && (
            <span className={styles.fieldError}>{errors.healthIssues.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>שפות *</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('languages.hebrew')} disabled={loading} />
              <span>עברית</span>
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('languages.english')} disabled={loading} />
              <span>אנגלית</span>
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('languages.russian')} disabled={loading} />
              <span>רוסית</span>
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('languages.arabic')} disabled={loading} />
              <span>ערבית</span>
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('languages.french')} disabled={loading} />
              <span>צרפתית</span>
            </label>
            <div className={styles.otherInput}>
              <label htmlFor="languagesOther">אחר:</label>
              <input
                id="languagesOther"
                type="text"
                {...register('languages.other')}
                placeholder="ציין שפות נוספות"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="geographicArea">אזור גיאוגרפי *</label>
          <select id="geographicArea" {...register('geographicArea')} disabled={loading}>
            <option value="">בחר אזור</option>
            <option value="תל אביב">תל אביב</option>
            <option value="ירושלים">ירושלים</option>
            <option value="חיפה">חיפה</option>
            <option value="באר שבע">באר שבע</option>
            <option value="מרכז">מרכז</option>
            <option value="צפון">צפון</option>
            <option value="דרום">דרום</option>
            <option value="אונליין">אונליין</option>
          </select>
          {errors.geographicArea && (
            <span className={styles.fieldError}>{errors.geographicArea.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="clinicAddress">כתובת קליניקה (אופציונלי)</label>
          <input
            id="clinicAddress"
            type="text"
            {...register('clinicAddress')}
            placeholder="רחוב, עיר"
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label>היכן מסופק הטיפול? *</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('treatmentLocations.fixedClinic')} disabled={loading} />
              <span>קליניקה קבועה</span>
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('treatmentLocations.homeVisits')} disabled={loading} />
              <span>ביקורי בית</span>
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('treatmentLocations.remote')} disabled={loading} />
              <span>מרחוק (אונליין / טלפון)</span>
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register('treatmentLocations.combination')} disabled={loading} />
              <span>שילוב</span>
            </label>
          </div>
        </div>
      </section>

      {/* C. Availability */}
      <section className={styles.section}>
        <h2>זמינות</h2>
        <div className={styles.field}>
          <label htmlFor="availability">ימים ושעות פעילות (אופציונלי)</label>
          <p className={styles.hint}>תאר את זמני הזמינות שלך</p>
          <textarea
            id="availability"
            {...register('availability')}
            rows={4}
            placeholder="לדוגמה: ראשון-חמישי 9:00-17:00"
            disabled={loading}
          />
        </div>
      </section>

      {/* D. External Links */}
      <section className={styles.section}>
        <h2>קישורים חיצוניים (עד 3)</h2>
        <div className={styles.field}>
          <label htmlFor="website">אתר אישי</label>
          <input
            id="website"
            type="url"
            {...register('website')}
            placeholder="https://..."
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="facebook">פייסבוק</label>
          <input
            id="facebook"
            type="url"
            {...register('facebook')}
            placeholder="https://facebook.com/..."
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="instagram">אינסטגרם</label>
          <input
            id="instagram"
            type="url"
            {...register('instagram')}
            placeholder="https://instagram.com/..."
            disabled={loading}
          />
        </div>
      </section>

      {/* E. Images */}
      <section className={styles.section}>
        <h2>תמונות (אופציונלי)</h2>
        <p className={styles.hint}>בשלב זה, הזן קישורים לתמונות</p>
        <div className={styles.field}>
          <label htmlFor="profileImageUrl">תמונת פרופיל</label>
          <input
            id="profileImageUrl"
            type="url"
            {...register('profileImageUrl')}
            placeholder="https://..."
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="clinicImageUrl">תמונת קליניקה / עסק</label>
          <input
            id="clinicImageUrl"
            type="url"
            {...register('clinicImageUrl')}
            placeholder="https://..."
            disabled={loading}
          />
        </div>
      </section>

      {/* F. Declarations */}
      <section className={styles.section}>
        <h2>הצהרות ואישורים (חובה) *</h2>
        <div className={styles.declarationsGroup}>
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationAccurate')} disabled={loading} />
            <span>אני מאשר/ת שכל המידע שסיפקתי מדויק ואמיתי.</span>
          </label>
          {errors.declarationAccurate && (
            <span className={styles.fieldError}>{errors.declarationAccurate.message}</span>
          )}
          
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationCertified')} disabled={loading} />
            <span>אני מטפל/ת מוסמך/ת עם כישורים מתאימים.</span>
          </label>
          
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationTerms')} disabled={loading} />
            <span>קראתי ומסכים/ה לתנאי השימוש של הפלטפורמה.</span>
          </label>
          
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationConsent')} disabled={loading} />
            <span>אני מסכים/ה לפרסום הפרופיל שלי בפלטפורמה.</span>
          </label>
          
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('declarationResponsibility')} disabled={loading} />
            <span>אני מבין/ה שהפלטפורמה אינה אחראית לתוכן שאני מספק/ת.</span>
          </label>
        </div>
      </section>

      {/* G. Additional Notes */}
      <section className={styles.section}>
        <h2>הערות נוספות</h2>
        <div className={styles.field}>
          <label htmlFor="additionalNotes">האם יש משהו נוסף שתרצה שנדע? (אופציונלי)</label>
          <textarea
            id="additionalNotes"
            {...register('additionalNotes')}
            rows={4}
            placeholder="כל מידע נוסף שתרצה לשתף"
            disabled={loading}
          />
        </div>
      </section>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'שולח...' : 'שלח בקשה'}
      </button>
    </form>
  )
}
