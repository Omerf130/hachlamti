'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createStory, getApprovedTherapists } from '@/app/actions/story'
import { useState, useEffect } from 'react'
import styles from './page.module.scss'
import { PRIMARY_OPTIONS, getSubOptions } from '@/lib/healthOptions'
import { ALT_TREATMENT_PRIMARY_OPTIONS, getAltTreatmentSubOptions } from '@/lib/alternativeTreatmentOptions'

// Simplified form schema for client-side
const storyFormSchema = z.object({
  // A. Personal Details
  submitterFullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  submitterPhone: z.string().min(1, 'מספר טלפון הוא שדה חובה'),
  mayContact: z.boolean(),
  allowWhatsAppContact: z.boolean(),
  publicationChoice: z.enum(['FULL_NAME', 'FIRST_NAME_ONLY', 'ANONYMOUS']),
  therapistName: z.string().min(1, 'יש לבחור מטפל'),
  therapistNameOther: z.string().optional(),

  // A2. Health Challenge
  healthChallenge: z.object({
    primary: z.string().min(1, 'יש לבחור תחום החלמה'),
    primaryOtherText: z.string().optional(),
    sub: z.string().min(1, 'יש לבחור תת קטגוריה'),
    subOtherText: z.string().optional(),
    durationBeforeRecovery: z.string().min(1, 'יש למלא כמה זמן סבלת מהבעיה'),
    impactOnQualityOfLife: z.string().min(1, 'יש למלא כיצד המחלה השפיעה על איכות החיים'),
  }).refine((data) => {
    // If primary is "אחר", primaryOtherText is required
    if (data.primary === 'אחר' && (!data.primaryOtherText || data.primaryOtherText.trim() === '')) {
      return false
    }
    // If sub is "אחר", subOtherText is required
    if (data.sub === 'אחר' && (!data.subOtherText || data.subOtherText.trim() === '')) {
      return false
    }
    return true
  }, {
    message: 'יש למלא את כל השדות הנדרשים',
  }),

  // A3. Alternative Treatment
  alternativeTreatment: z.object({
    primary: z.string().min(1, 'יש לבחור שיטת טיפול'),
    primaryOtherText: z.string().optional(),
    sub: z.string().min(1, 'יש לבחור תת קטגוריה'),
    subOtherText: z.string().optional(),
  }).refine((data) => {
    // If primary is "אחר", primaryOtherText is required
    if (data.primary === 'אחר' && (!data.primaryOtherText || data.primaryOtherText.trim() === '')) {
      return false
    }
    // If sub is "אחר", subOtherText is required
    if (data.sub === 'אחר' && (!data.subOtherText || data.subOtherText.trim() === '')) {
      return false
    }
    return true
  }, {
    message: 'יש למלא את כל השדות הנדרשים',
  }),

  // B. Story Content
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  problem: z.string().min(1, 'תיאור הבעיה הוא שדה חובה'),
  previousAttempts: z.string().min(1, 'תיאור ניסיונות קודמים הוא שדה חובה'),
  timeToInitialImprovement: z.string().min(1, 'יש למלא תוך כמה זמן הרגשת בשינוי'),
  currentHealthStatus: z.enum(['החלמה מלאה', 'שיפור משמעותי', 'שליטה בסימפטומים'], {
    errorMap: () => ({ message: 'יש לבחור מצב בריאותי נוכחי' }),
  }),
  mostImportantTip: z.string().min(1, 'יש למלא את הטיפ החשוב ביותר'),
  messageToOthers: z.string().min(1, 'הודעה לאחרים היא שדה חובה'),

  // C. Declarations - must be true
  declarationTruthful: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר שהסיפור אמיתי ומדויק' }),
  }),
  declarationConsent: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר הסכמה לפרסום' }),
  }),
  declarationNotMedicalAdvice: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר הבנת אופי השיתוף' }),
  }),
  declarationEditingConsent: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר אפשרות לעריכה' }),
  }),
}).refine((data) => {
  if (data.therapistName === 'אחר' && (!data.therapistNameOther || data.therapistNameOther.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'יש למלא את שם המטפל כאשר בוחרים אחר',
  path: ['therapistNameOther']
})

type StoryFormInput = z.infer<typeof storyFormSchema>

export default function StorySubmissionForm(): JSX.Element {
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [subOptions, setSubOptions] = useState<string[]>(['אחר'])
  const [altTreatmentSubOptions, setAltTreatmentSubOptions] = useState<string[]>(['אחר'])
  const [therapists, setTherapists] = useState<Array<{ id: string; fullName: string }>>([])


  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StoryFormInput>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      publicationChoice: 'ANONYMOUS',
      mayContact: true,
      allowWhatsAppContact: false,
      therapistName: '',
      therapistNameOther: '',
      healthChallenge: {
        primary: '',
        primaryOtherText: '',
        sub: '',
        subOtherText: '',
        durationBeforeRecovery: '',
        impactOnQualityOfLife: '',
      },
      alternativeTreatment: {
        primary: '',
        primaryOtherText: '',
        sub: '',
        subOtherText: '',
      },
    },
  })

  // Watch primary selection for cascading dropdown (Health Challenge)
  const watchPrimary = watch('healthChallenge.primary')
  const watchSub = watch('healthChallenge.sub')

  // Watch primary selection for cascading dropdown (Alternative Treatment)
  const watchAltTreatmentPrimary = watch('alternativeTreatment.primary')
  const watchAltTreatmentSub = watch('alternativeTreatment.sub')

  // Watch therapist name selection
  const watchTherapistName = watch('therapistName')

  // Fetch approved therapists on mount
  useEffect(() => {
    async function loadTherapists() {
      const result = await getApprovedTherapists()
      if (result.success) {
        setTherapists(result.therapists)
      }
    }
    loadTherapists()
  }, [])

  // Update sub options when primary changes (Health Challenge)
  useEffect(() => {
    if (watchPrimary) {
      const newSubOptions = getSubOptions(watchPrimary)
      setSubOptions(newSubOptions)

      // Reset sub when primary changes
      setValue('healthChallenge.sub', '')
      setValue('healthChallenge.subOtherText', '')

      // If primary is "אחר", automatically set sub to "אחר"
      if (watchPrimary === 'אחר') {
        setValue('healthChallenge.sub', 'אחר')
      }
    } else {
      setSubOptions(['אחר'])
    }
  }, [watchPrimary, setValue])

  // Update sub options when primary changes (Alternative Treatment)
  useEffect(() => {
    if (watchAltTreatmentPrimary) {
      const newSubOptions = getAltTreatmentSubOptions(watchAltTreatmentPrimary)
      setAltTreatmentSubOptions(newSubOptions)

      // Reset sub when primary changes
      setValue('alternativeTreatment.sub', '')
      setValue('alternativeTreatment.subOtherText', '')

      // If primary is "אחר", automatically set sub to "אחר"
      if (watchAltTreatmentPrimary === 'אחר') {
        setValue('alternativeTreatment.sub', 'אחר')
      }
    } else {
      setAltTreatmentSubOptions(['אחר'])
    }
  }, [watchAltTreatmentPrimary, setValue])

  const onSubmit = async (data: StoryFormInput): Promise<void> => {
    console.log('Form submitted with data:', data)
    setError('')
    setLoading(true)

    try {
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
      console.error('Story submission error:', err)
      setError('שגיאה ביצירת הסיפור. אנא נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.success}>
            <h2>✨ תודה רבה על השיתוף!</h2>
            <p>נשמח אם תשלח את הקישור הבא למטפל שעזר לך להחלים, נשמח שיהיה חלק מקהילת המטפלים שלנו, שיוכל לעזור גם למטופלים נוספים</p>
            <p>https://hachlamti.vercel.app/</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>תודה שבחרת לשתף את סיפור ההחלמה </h1>
          <p className={styles.subtitle}>
            הקמתי את האתר הזה מתוך הבנה עמוקה שברגעי חולי או משבר, הדבר שאנחנו הכי זקוקים לו הוא <strong>תקווה</strong>.
            <br />
            לפעמים, הדרך להחלמה עוברת בשבילים פחות שגרתיים, והידע הזה – הניסיון האישי שצברתם – הוא אוצר שאין לו מחיר ומקור השראה לכל מי שעדיין מחפש את הדרך.
            <br />
            כל פרט שתשתפו יכול להיות תחילת ההחלמה של מישהו אחר.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <strong>⚠️ שגיאה</strong>
              <p style={{ whiteSpace: 'pre-line', margin: '0.5rem 0 0 0' }}>{error}</p>
            </div>
          )}

          {/* Show validation errors if present */}
          {Object.keys(errors).length > 0 && !error && (
            <div className={styles.error}>
              <strong>⚠️ יש לתקן את השדות המסומנים באדום</strong>
              <p style={{ marginTop: '0.5rem' }}>
                אנא מלא את כל שדות החובה ובדוק שהמידע נכון.
              </p>
            </div>
          )}

          {/* A. Personal Details */}
          <section className={styles.section}>
            <h2>פרטים אישיים (למטרת יצירת קשר בלבד)</h2>

            <div className={styles.field}>
              <label htmlFor="submitterFullName">שם מלא *</label>
              <p className={styles.hint}>לא יפורסם ללא אישורך המפורש</p>
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
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  {...register('allowWhatsAppContact')}
                  disabled={loading}
                />
                <span>
                  פרטיך האישיים נשמרים במערכת המאובטחת שלנו בלבד. האם תאפשר/י שנציג מהאתר יפנה אליך במידת הצורך בווטסאפ להבהרות או במידה וגולשים ירצו לשאול אותך שאלות?
                </span>
              </label>
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
              <label>אני מאפשר לספר את הסיפור שלי באמצעות *</label>
              <Controller
                name="publicationChoice"
                control={control}
                render={({ field }) => (
                  <div className={styles.radioGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="radio"
                        checked={field.value === 'FULL_NAME'}
                        onChange={() => field.onChange('FULL_NAME')}
                        disabled={loading}
                      />
                      <span>שם מלא</span>
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="radio"
                        checked={field.value === 'FIRST_NAME_ONLY'}
                        onChange={() => field.onChange('FIRST_NAME_ONLY')}
                        disabled={loading}
                      />
                      <span>שם פרטי בלבד</span>
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="radio"
                        checked={field.value === 'ANONYMOUS'}
                        onChange={() => field.onChange('ANONYMOUS')}
                        disabled={loading}
                      />
                      <span>אנונימי</span>
                    </label>
                  </div>
                )}
              />
              {errors.publicationChoice && (
                <span className={styles.fieldError}>{errors.publicationChoice.message}</span>
              )}
            </div>


          </section>

          {/* A2. Health Challenge */}
          <section className={styles.section}>
            <h2>האתגר הבריאותי</h2>

            <div className={styles.field}>
              <label htmlFor="healthChallenge.primary">תחומי החלמה ומצבים בריאותיים *</label>
              <select
                id="healthChallenge.primary"
                {...register('healthChallenge.primary')}
                disabled={loading}
              >
                <option value="">בחר תחום</option>
                {PRIMARY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.healthChallenge?.primary && (
                <span className={styles.fieldError}>{errors.healthChallenge.primary.message}</span>
              )}
            </div>

            {/* Show primaryOtherText input if primary is "אחר" */}
            {watchPrimary === 'אחר' && (
              <div className={styles.field}>
                <label htmlFor="healthChallenge.primaryOtherText">פרט את תחום ההחלמה *</label>
                <input
                  id="healthChallenge.primaryOtherText"
                  type="text"
                  {...register('healthChallenge.primaryOtherText')}
                  placeholder="הכנס את תחום ההחלמה"
                  disabled={loading}
                />
                {errors.healthChallenge?.primaryOtherText && (
                  <span className={styles.fieldError}>{errors.healthChallenge.primaryOtherText.message}</span>
                )}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="healthChallenge.sub">תת קטגוריה *</label>
              <select
                id="healthChallenge.sub"
                {...register('healthChallenge.sub')}
                disabled={loading || !watchPrimary}
              >
                <option value="">בחר תת קטגוריה</option>
                {subOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.healthChallenge?.sub && (
                <span className={styles.fieldError}>{errors.healthChallenge.sub.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="therapistName">שם המטפל *</label>
              <select
                id="therapistName"
                {...register('therapistName')}
                disabled={loading}
              >
                <option value="">בחר מטפל</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.fullName}>
                    {therapist.fullName}
                  </option>
                ))}
                <option value="אחר">אחר</option>
              </select>
              {errors.therapistName && (
                <span className={styles.fieldError}>{errors.therapistName.message}</span>
              )}
            </div>

            {/* Show therapistNameOther input if "אחר" is selected */}
            {watchTherapistName === 'אחר' && (
              <div className={styles.field}>
                <label htmlFor="therapistNameOther">שם המטפל (טקסט חופשי) *</label>
                <input
                  id="therapistNameOther"
                  type="text"
                  {...register('therapistNameOther')}
                  placeholder="הכנס את שם המטפל"
                  disabled={loading}
                />
                {errors.therapistNameOther && (
                  <span className={styles.fieldError}>{errors.therapistNameOther.message}</span>
                )}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="submitterPhone">טלפון מטפל*</label>
              {/* <p className={styles.hint}>לא יפורסם ללא אישורך המפורש</p> */}
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

            {/* Show subOtherText input if sub is "אחר" */}
            {watchSub === 'אחר' && (
              <div className={styles.field}>
                <label htmlFor="healthChallenge.subOtherText">פרט את תת הקטגוריה *</label>
                <input
                  id="healthChallenge.subOtherText"
                  type="text"
                  {...register('healthChallenge.subOtherText')}
                  placeholder="הכנס את תת הקטגוריה"
                  disabled={loading}
                />
                {errors.healthChallenge?.subOtherText && (
                  <span className={styles.fieldError}>{errors.healthChallenge.subOtherText.message}</span>
                )}
              </div>
            )}


          </section>


          {/* B. Story Content */}
          <section className={styles.section}>
            <h2>תהליך ההחלמה</h2>

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
              <label htmlFor="healthChallenge.durationBeforeRecovery">כמה זמן סבלת מהבעיה לפני ההחלמה *</label>
              <input
                id="healthChallenge.durationBeforeRecovery"
                type="text"
                {...register('healthChallenge.durationBeforeRecovery')}
                placeholder='לדוגמה: "שנתיים" או "כמה חודשים"'
                disabled={loading}
              />
              {errors.healthChallenge?.durationBeforeRecovery && (
                <span className={styles.fieldError}>{errors.healthChallenge.durationBeforeRecovery.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="healthChallenge.impactOnQualityOfLife">איך המחלה השפיעה על איכות החיים שלך *</label>
              <textarea
                id="healthChallenge.impactOnQualityOfLife"
                {...register('healthChallenge.impactOnQualityOfLife')}
                rows={4}
                placeholder="תאר כיצד הבעיה השפיעה על חייך היומיומיים"
                disabled={loading}
              />
              {errors.healthChallenge?.impactOnQualityOfLife && (
                <span className={styles.fieldError}>{errors.healthChallenge.impactOnQualityOfLife.message}</span>
              )}
            </div>

            <section className={styles.section}>
              <h2>איזה שיטת טיפול אלטרנטיבית עיקרית עזרה לך?</h2>

              <div className={styles.field}>
                <label htmlFor="alternativeTreatment.primary">קטגוריית טיפול *</label>
                <select
                  id="alternativeTreatment.primary"
                  {...register('alternativeTreatment.primary')}
                  disabled={loading}
                >
                  <option value="">בחר קטגוריה</option>
                  {ALT_TREATMENT_PRIMARY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.alternativeTreatment?.primary && (
                  <span className={styles.fieldError}>{errors.alternativeTreatment.primary.message}</span>
                )}
              </div>

              {/* Show primaryOtherText input if primary is "אחר" */}
              {watchAltTreatmentPrimary === 'אחר' && (
                <div className={styles.field}>
                  <label htmlFor="alternativeTreatment.primaryOtherText">פרט את שיטת הטיפול *</label>
                  <input
                    id="alternativeTreatment.primaryOtherText"
                    type="text"
                    {...register('alternativeTreatment.primaryOtherText')}
                    placeholder="הכנס את שיטת הטיפול"
                    disabled={loading}
                  />
                  {errors.alternativeTreatment?.primaryOtherText && (
                    <span className={styles.fieldError}>{errors.alternativeTreatment.primaryOtherText.message}</span>
                  )}
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="alternativeTreatment.sub">תת קטגוריה *</label>
                <select
                  id="alternativeTreatment.sub"
                  {...register('alternativeTreatment.sub')}
                  disabled={loading || !watchAltTreatmentPrimary}
                >
                  <option value="">בחר תת קטגוריה</option>
                  {altTreatmentSubOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.alternativeTreatment?.sub && (
                  <span className={styles.fieldError}>{errors.alternativeTreatment.sub.message}</span>
                )}
              </div>

              {/* Show subOtherText input if sub is "אחר" */}
              {watchAltTreatmentSub === 'אחר' && (
                <div className={styles.field}>
                  <label htmlFor="alternativeTreatment.subOtherText">פרט את תת הקטגוריה *</label>
                  <input
                    id="alternativeTreatment.subOtherText"
                    type="text"
                    {...register('alternativeTreatment.subOtherText')}
                    placeholder="הכנס את תת הקטגוריה"
                    disabled={loading}
                  />
                  {errors.alternativeTreatment?.subOtherText && (
                    <span className={styles.fieldError}>{errors.alternativeTreatment.subOtherText.message}</span>
                  )}
                </div>
              )}
            </section>

            <div className={styles.field}>
              <label htmlFor="timeToInitialImprovement">תוך כמה זמן הרגשת בשינוי ראשוני *</label>
              <input
                id="timeToInitialImprovement"
                type="text"
                {...register('timeToInitialImprovement')}
                placeholder='לדוגמה: "שבועיים" או "חודש"'
                disabled={loading}
              />
              {errors.timeToInitialImprovement && (
                <span className={styles.fieldError}>{errors.timeToInitialImprovement.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label>מה מצבך הבריאותי היום? *</label>
              <Controller
                name="currentHealthStatus"
                control={control}
                render={({ field }) => (
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="radio"
                        checked={field.value === 'החלמה מלאה'}
                        onChange={() => field.onChange('החלמה מלאה')}
                        disabled={loading}
                      />
                      <span>החלמה מלאה</span>
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="radio"
                        checked={field.value === 'שיפור משמעותי'}
                        onChange={() => field.onChange('שיפור משמעותי')}
                        disabled={loading}
                      />
                      <span>שיפור משמעותי</span>
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="radio"
                        checked={field.value === 'שליטה בסימפטומים'}
                        onChange={() => field.onChange('שליטה בסימפטומים')}
                        disabled={loading}
                      />
                      <span>שליטה בסימפטומים</span>
                    </label>
                  </div>
                )}
              />
              {errors.currentHealthStatus && (
                <span className={styles.fieldError}>{errors.currentHealthStatus.message}</span>
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
              <label htmlFor="mostImportantTip">מה הטיפ הכי חשוב שיש לך למי שסובל מאותה בעיה (מסר של תקווה) *</label>
              <textarea
                id="mostImportantTip"
                {...register('mostImportantTip')}
                rows={4}
                placeholder="שתף טיפ חשוב או מסר תקווה"
                disabled={loading}
              />
              {errors.mostImportantTip && (
                <span className={styles.fieldError}>{errors.mostImportantTip.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="messageToOthers">מה המסר העיקרי שלך למי שנמצא כרגע בשיא המחלה ומרגיש "חסר אונים"? *</label>
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
          </section>

          {/* C. Declarations */}
          <section className={styles.section}>
            <h2>הצהרות ואישורים (חובה) *</h2>
            <div className={styles.declarationsGroup}>
              {errors.declarationTruthful && (
                <span className={styles.fieldError}>{errors.declarationTruthful.message}</span>
              )}
              <label className={styles.checkbox}>
                <input type="checkbox" {...register('declarationTruthful')} disabled={loading} />
                <span>אני מאשר/ת שהסיפור שלי אמיתי ומדויק.</span>
              </label>

              {errors.declarationConsent && (
                <span className={styles.fieldError}>{errors.declarationConsent.message}</span>
              )}
              <label className={styles.checkbox}>
                <input type="checkbox" {...register('declarationConsent')} disabled={loading} />
                <span>אני מסכים/ה לפרסום הסיפור שלי בפלטפורמה בהתאם לבחירת הפרטיות שלי.</span>
              </label>

              {errors.declarationNotMedicalAdvice && (
                <span className={styles.fieldError}>{errors.declarationNotMedicalAdvice.message}</span>
              )}
              <label className={styles.checkbox}>
                <input type="checkbox" {...register('declarationNotMedicalAdvice')} disabled={loading} />
                <span>אני מבין/ה שהסיפור הזה הוא למטרת שיתוף חוויה בלבד ואינו מחליף ייעוץ רפואי.</span>
              </label>

              {errors.declarationEditingConsent && (
                <span className={styles.fieldError}>{errors.declarationEditingConsent.message}</span>
              )}
              <label className={styles.checkbox}>
                <input type="checkbox" {...register('declarationEditingConsent')} disabled={loading} />
                <span>אני מבין/ה שהפלטפורמה עשויה לערוך את הסיפור למטרות שפה וכתיב בלבד.</span>
              </label>
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1.5rem', 
              backgroundColor: '#f0f9ff', 
              border: '2px solid #93c5fd',
              borderRadius: '12px',
              textAlign: 'right'
            }}>
              <p style={{ 
                fontWeight: 600, 
                marginBottom: '1rem', 
                color: '#1e40af',
                fontSize: '1.1rem'
              }}>
                 נשמח אם תשתף את הקישור הבא עם המטפל שעזר לך
              </p>
              <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                חשוב שהוא יהיה חלק מקהילת המטפלים שלנו, כדי שיוכל לעזור גם למטופלים נוספים
              </p>
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                marginTop: '1rem'
              }}>
                <a 
                  href="https://hachlamti.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '1rem'
                  }}
                >
                  🔗 https://hachlamti.vercel.app/
                </a>
              </div>
            </div>
          </section>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? '⏳ שולח...' : '💌 שלח סיפור'}
          </button>
        </form>
      </div>
    </div>
  )
}
