'use client'

import { useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createTherapist } from '@/app/actions/therapist'
import { useState } from 'react'
import styles from './page.module.scss'
import { PROFESSION_OPTIONS } from '@/lib/professionOptions'
import { PRIMARY_OPTIONS, getSubOptions } from '@/lib/healthOptions'
import imageCompression from 'browser-image-compression'

// Simplified form schema for client-side (will be validated on server)
const therapistFormSchema = z.object({
  fullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  profileImageUrl: z.string().min(1, 'תמונת פרופיל היא שדה חובה'),
  logoImageUrl: z.string().optional(),
  
  profession: z.object({
    value: z.string().min(1, 'יש לבחור מקצוע'),
    otherText: z.string().optional(),
  }),
  
  location: z.object({
    city: z.string().min(1, 'עיר היא שדה חובה'),
    activityHours: z.string().optional(),
  }),
  
  educationText: z.string().optional(),
  certificates: z.array(z.object({
    url: z.string(),
    fileName: z.string().optional(),
  })),
  
  specialServices: z.object({
    onlineTreatment: z.boolean(),
    homeVisits: z.boolean(),
    accessibleClinic: z.boolean(),
    languages: z.object({
      hebrew: z.boolean().optional(),
      english: z.boolean().optional(),
      russian: z.boolean().optional(),
      arabic: z.boolean().optional(),
      french: z.boolean().optional(),
      other: z.string().optional(),
    }),
  }),
  
  credoAndSpecialty: z.string().min(1, 'אני מאמין והתמחות הם שדות חובה'),
  
  treatedConditions: z.array(z.object({
    primary: z.string().min(1),
    primaryOtherText: z.string().optional(),
    sub: z.string().min(1),
    subOtherText: z.string().optional(),
  })),
  
  approachDescription: z.string().min(1, 'תיאור גישה טיפולית הוא שדה חובה'),
  inspirationStory: z.string().optional(),
  
  contacts: z.object({
    displayPhone: z.string().optional(),
    bookingPhone: z.string().optional(),
    websiteUrl: z.string().optional(),
    email: z.string().email('כתובת אימייל לא תקינה'),
  }),
  
  consentJoin: z.boolean(),
})

type TherapistFormInput = z.infer<typeof therapistFormSchema>

interface ConditionRow {
  id: number
  primary: string
  primaryOtherText: string
  sub: string
  subOtherText: string
}

export default function TherapistApplicationForm(): JSX.Element {
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [linkCopied, setLinkCopied] = useState<boolean>(false)
  
  // Multiple treated conditions state
  const [conditions, setConditions] = useState<ConditionRow[]>([
    { id: Date.now(), primary: '', primaryOtherText: '', sub: '', subOtherText: '' }
  ])
  
  // Sub-options for each condition
  const [conditionSubOptions, setConditionSubOptions] = useState<Record<number, string[]>>({})

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TherapistFormInput>({
    resolver: zodResolver(therapistFormSchema),
    defaultValues: {
      profession: { value: '', otherText: '' },
      location: { city: '', activityHours: '' },
      educationText: '',
      certificates: [],
      specialServices: {
        onlineTreatment: false,
        homeVisits: false,
        accessibleClinic: false,
        languages: {
          hebrew: false,
          english: false,
          russian: false,
          arabic: false,
          french: false,
          other: '',
        },
      },
      treatedConditions: [],
      contacts: {
        displayPhone: '',
        bookingPhone: '',
        websiteUrl: '',
        email: '',
      },
      consentJoin: false,
    },
  })

  const watchProfession = watch('profession.value')

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2)
  }

  // Helper function to compress image
  const compressImage = async (file: File, maxSizeMB: number = 0.8, maxWidthOrHeight: number = 1920): Promise<File> => {
    try {
      const options = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: file.type,
      }
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Compression error:', error)
      throw error
    }
  }

  // Handle image upload and convert to base64
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'profileImageUrl' | 'logoImageUrl'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset the input to allow re-selecting the same file after an error
    event.target.value = ''

    const maxSizeBytes = 1024 * 1024 // 1 MB
    const fileSizeMB = formatFileSize(file.size)

    try {
      let fileToProcess = file

      // Check if file exceeds 1 MB
      if (file.size > maxSizeBytes) {
        // Attempt automatic compression
        setError(`מנסה לדחוס את התמונה (גודל מקורי: ${fileSizeMB} MB)...`)
        fileToProcess = await compressImage(file, 0.8, 1920)
        
        // Check if compressed file is still too large
        if (fileToProcess.size > maxSizeBytes) {
          const compressedSizeMB = formatFileSize(fileToProcess.size)
          setError(`הקובץ גדול מדי גם לאחר דחיסה. גודל: ${compressedSizeMB} MB. אנא בחר תמונה קטנה יותר (עד 1MB).`)
          return
        }
        
        // Success message
        const compressedSizeMB = formatFileSize(fileToProcess.size)
        setError(`התמונה נדחסה בהצלחה מ-${fileSizeMB} MB ל-${compressedSizeMB} MB`)
        setTimeout(() => setError(''), 3000)
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setValue(field, reader.result as string)
      }
      reader.readAsDataURL(fileToProcess)
    } catch (error) {
      console.error('Image upload error:', error)
      setError('שגיאה בעיבוד התמונה. אנא נסה שוב.')
    }
  }

  // Handle certificate uploads
  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Reset the input
    event.target.value = ''

    const currentCerts = watch('certificates') || []
    const maxCerts = 5
    const remaining = maxCerts - currentCerts.length

    if (remaining <= 0) {
      setError('ניתן להעלות עד 5 תעודות')
      return
    }

    const maxSizeBytes = 1024 * 1024 // 1 MB
    const filesToUpload = Array.from(files).slice(0, remaining)

    try {
      const processedFiles: { url: string; fileName: string }[] = []

      for (const file of filesToUpload) {
        const fileSizeMB = formatFileSize(file.size)
        let fileToProcess = file

        // Only compress images, not PDFs
        if (file.type.startsWith('image/')) {
          if (file.size > maxSizeBytes) {
            setError(`מדחס ${file.name} (${fileSizeMB} MB)...`)
            fileToProcess = await compressImage(file, 0.8, 1600)
            
            if (fileToProcess.size > maxSizeBytes) {
              const compressedSizeMB = formatFileSize(fileToProcess.size)
              setError(`${file.name} גדול מדי (${compressedSizeMB} MB לאחר דחיסה). אנא בחר קובץ קטן יותר.`)
              continue
            }
          }
        } else if (file.size > maxSizeBytes) {
          // PDF or other file type - reject if too large
          setError(`${file.name} גדול מדי (${fileSizeMB} MB). גודל מקסימלי: 1MB.`)
          continue
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(fileToProcess)
        })

        processedFiles.push({
          url: base64,
          fileName: file.name,
        })
      }

      if (processedFiles.length > 0) {
        setValue('certificates', [...currentCerts, ...processedFiles])
        setError('')
      }
    } catch (error) {
      console.error('Certificate upload error:', error)
      setError('שגיאה בעיבוד הקבצים. אנא נסה שוב.')
    }
  }

  // Remove certificate
  const removeCertificate = (index: number) => {
    const certs = watch('certificates') || []
    setValue('certificates', certs.filter((_, i) => i !== index))
  }

  // Add new condition row
  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: Date.now(), primary: '', primaryOtherText: '', sub: '', subOtherText: '' }
    ])
  }

  // Remove condition row
  const removeCondition = (id: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id))
      const newSubOptions = { ...conditionSubOptions }
      delete newSubOptions[id]
      setConditionSubOptions(newSubOptions)
    }
  }

  // Update condition
  const updateCondition = (id: number, field: keyof ConditionRow, value: string) => {
    setConditions(conditions.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value }
        
        // If primary changes, reset sub and update sub-options
        if (field === 'primary') {
          updated.sub = ''
          updated.subOtherText = ''
          
          if (value) {
            const newSubOptions = getSubOptions(value)
            setConditionSubOptions(prev => ({ ...prev, [id]: newSubOptions }))
            
            // If primary is "אחר", automatically set sub to "אחר"
            if (value === 'אחר') {
              updated.sub = 'אחר'
            }
          } else {
            setConditionSubOptions(prev => {
              const newState = { ...prev }
              delete newState[id]
              return newState
            })
          }
        }
        
        return updated
      }
      return c
    }))
  }

  const onSubmit = async (data: TherapistFormInput): Promise<void> => {
    setError('')
    setLoading(true)

    try {
      // Validate profession "אחר"
      if (data.profession.value === 'אחר' && (!data.profession.otherText || data.profession.otherText.trim() === '')) {
        setError('יש למלא את שם המקצוע כאשר בוחרים אחר')
        setLoading(false)
        return
      }

      // Parse languages
      const languages: string[] = []
      if (data.specialServices.languages.hebrew) languages.push('עברית')
      if (data.specialServices.languages.english) languages.push('אנגלית')
      if (data.specialServices.languages.russian) languages.push('רוסית')
      if (data.specialServices.languages.arabic) languages.push('ערבית')
      if (data.specialServices.languages.french) languages.push('צרפתית')
      
      const languagesOtherText = data.specialServices.languages.other?.trim() || undefined
      if (languagesOtherText) {
        languages.push(languagesOtherText)
      }

      if (languages.length === 0) {
        setError('יש לבחור לפחות שפה אחת')
        setLoading(false)
        return
      }

      // Validate treated conditions
      if (conditions.length === 0 || conditions.every(c => !c.primary)) {
        setError('יש לבחור לפחות מצב בריאותי אחד')
        setLoading(false)
        return
      }

      // Validate each condition
      const validConditions = conditions.filter(c => c.primary && c.sub)
      if (validConditions.length === 0) {
        setError('יש להשלים את כל שדות המצבים הבריאותיים')
        setLoading(false)
        return
      }

      // Check "אחר" validations for conditions
      for (const cond of validConditions) {
        if (cond.primary === 'אחר' && (!cond.primaryOtherText || cond.primaryOtherText.trim() === '')) {
          setError('יש למלא תיאור כאשר בוחרים "אחר" בקטגוריה ראשית')
          setLoading(false)
          return
        }
        if (cond.sub === 'אחר' && (!cond.subOtherText || cond.subOtherText.trim() === '')) {
          setError('יש למלא תיאור כאשר בוחרים "אחר" בתת-קטגוריה')
          setLoading(false)
          return
        }
      }

      // Validate consent
      if (!data.consentJoin) {
        setError('יש לאשר הצטרפות לקהילה')
        setLoading(false)
        return
      }

      // Prepare submit data
      const submitData = {
        fullName: data.fullName,
        profileImageUrl: data.profileImageUrl,
        logoImageUrl: data.logoImageUrl || undefined,
        
        profession: data.profession,
        
        location: data.location,
        
        educationText: data.educationText || undefined,
        certificates: data.certificates || [],
        
        specialServices: {
          onlineTreatment: data.specialServices.onlineTreatment,
          homeVisits: data.specialServices.homeVisits,
          accessibleClinic: data.specialServices.accessibleClinic,
          languages,
          languagesOtherText,
        },
        
        credoAndSpecialty: data.credoAndSpecialty,
        
        treatedConditions: validConditions.map(c => ({
          primary: c.primary,
          primaryOtherText: c.primaryOtherText || undefined,
          sub: c.sub,
          subOtherText: c.subOtherText || undefined,
        })),
        
        approachDescription: data.approachDescription,
        inspirationStory: data.inspirationStory || undefined,
        
        contacts: {
          displayPhone: data.contacts.displayPhone || undefined,
          bookingPhone: data.contacts.bookingPhone || undefined,
          websiteUrl: data.contacts.websiteUrl || undefined,
          email: data.contacts.email,
        },
        
        consentJoin: true,
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

  const copyShareLink = () => {
    const link = 'https://hachlamti.vercel.app/submit-story'
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 3000)
    })
  }

  if (success) {
    return (
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.success}>
            <h2>✨ תודה שהצטרפת לקהילת המטפלים!</h2>
            <p>הבקשה שלך התקבלה ותיבדק בקרוב.</p>
            <p>שתף את הקישור הזה עם מטופלים שהחלימו:</p>
            <div className={styles.shareLink}>
              <input
                type="text"
                readOnly
                value="https://hachlamti.vercel.app/submit-story"
                style={{ flex: 1, padding: '0.5rem', marginLeft: '0.5rem' }}
              />
              <button
                onClick={copyShareLink}
                style={{
                  padding: '0.5rem 1rem',
                  background: linkCopied ? '#28a745' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {linkCopied ? '✓ הועתק!' : '📋 העתק קישור'}
              </button>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              האתר יעלה לאוויר בקרוב. 🎉
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>הצטרף לרשת המטפלים של הַחלמתי </h1>
          <p className={styles.subtitle}>
            מטפלות ומטפלים יקרים, האתר הוקם כדי להוכיח שההחלמה היא אפשרית, אנו מאמינים שהעדות החזקה ביותר ליכולות שלכם היא תוצאות בשטח שהם סיפורי ההחלמה של המטופלים שלכם
          </p>
          <p className={styles.hint}>
            <strong>טיפ:</strong> כדאי להכין מראש תמונת פרופיל וצילום תעודות הסמכה. 
            <br />
            <strong>חשוב:</strong> כל קובץ חייב להיות עד 1MB. תמונות גדולות יותר ידחסו אוטומטית.
            <br />
            מומלץ: תמונות בגודל 1920x1920 פיקסלים או פחות לאיכות מיטבית.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <strong>⚠️ שגיאה</strong>
              <p style={{ whiteSpace: 'pre-line', margin: '0.5rem 0 0 0' }}>{error}</p>
            </div>
          )}
          
          {Object.keys(errors).length > 0 && !error && (
            <div className={styles.error}>
              <strong>⚠️ יש לתקן את השדות המסומנים באדום</strong>
              <p style={{ marginTop: '0.5rem' }}>
                אנא מלא את כל שדות החובה ובדוק שהמידע נכון.
              </p>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <section className={styles.section}>
            <h2>פרטים בסיסיים</h2>
            
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
              <label htmlFor="profileImage">תמונת פרופיל (עד 1MB) *</label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'profileImageUrl')}
                disabled={loading}
              />
              <p className={styles.hint} style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                תמונות גדולות יידחסו אוטומטית. מומלץ: 1920x1920 פיקסלים או פחות.
              </p>
              {watch('profileImageUrl') && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img
                    src={watch('profileImageUrl')}
                    alt="Profile preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}
              {errors.profileImageUrl && (
                <span className={styles.fieldError}>{errors.profileImageUrl.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="logoImage">תמונת לוגו (עד 1MB, אופציונלי)</label>
              <input
                id="logoImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logoImageUrl')}
                disabled={loading}
              />
              <p className={styles.hint} style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                תמונות גדולות יידחסו אוטומטית.
              </p>
              {watch('logoImageUrl') && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img
                    src={watch('logoImageUrl')}
                    alt="Logo preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Profession */}
          <section className={styles.section}>
            <h2>מקצוע</h2>
            
            <div className={styles.field}>
              <label htmlFor="profession">מקצוע *</label>
              <select
                id="profession"
                {...register('profession.value')}
                disabled={loading}
              >
                <option value="">בחר מקצוע</option>
                {PROFESSION_OPTIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
              {errors.profession?.value && (
                <span className={styles.fieldError}>{errors.profession.value.message}</span>
              )}
            </div>

            {watchProfession === 'אחר' && (
              <div className={styles.field}>
                <label htmlFor="professionOther">שם המקצוע *</label>
                <input
                  id="professionOther"
                  type="text"
                  {...register('profession.otherText')}
                  placeholder="הכנס את שם המקצוע"
                  disabled={loading}
                />
                {errors.profession?.otherText && (
                  <span className={styles.fieldError}>{errors.profession.otherText.message}</span>
                )}
              </div>
            )}
          </section>

          {/* Section 3: Area of Activity */}
          <section className={styles.section}>
            <h2>אזור פעילות</h2>
            
            <div className={styles.field}>
              <label htmlFor="city">עיר *</label>
              <input
                id="city"
                type="text"
                {...register('location.city')}
                placeholder="הכנס עיר"
                disabled={loading}
              />
              {errors.location?.city && (
                <span className={styles.fieldError}>{errors.location.city.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="activityHours">שעות פעילות (אופציונלי)</label>
              <input
                id="activityHours"
                type="text"
                {...register('location.activityHours')}
                placeholder="לדוגמה: ראשון-חמישי 9:00-17:00"
                disabled={loading}
              />
            </div>

          </section>

          {/* Section 4: Education & Certificates */}
          <section className={styles.section}>
          <h2>שירותים מיוחדים (לסינון מתקדם)</h2>
            
            <div className={styles.field}>
              <label>סוגי שירות:</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    {...register('specialServices.onlineTreatment')}
                    disabled={loading}
                  />
                  <span>טיפול אונליין (זום/וידאו)</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    {...register('specialServices.homeVisits')}
                    disabled={loading}
                  />
                  <span>ביקורי בית</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    {...register('specialServices.accessibleClinic')}
                    disabled={loading}
                  />
                  <span>גישה לנכים / קליניקה נגישה</span>
                </label>
              </div>
            </div>
            <h2>השכלה ותעודות</h2>
            
            <div className={styles.field}>
              <label htmlFor="education">השכלה והסמכות (אופציונלי)</label>
              <textarea
                id="education"
                {...register('educationText')}
                rows={4}
                placeholder="תאר את ההשכלה וההסמכות המקצועיות שלך"
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="certificates">העלאת תעודות הסמכה (עד 5 קבצים, עד 1MB לכל קובץ, אופציונלי)</label>
              <input
                id="certificates"
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleCertificateUpload}
                disabled={loading || (watch('certificates')?.length || 0) >= 5}
              />
              <p className={styles.hint}>
                הועלו {watch('certificates')?.length || 0} מתוך 5 תעודות. כל קובץ חייב להיות עד 1MB.
              </p>
              
              {watch('certificates') && watch('certificates').length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  {watch('certificates').map((cert, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                        padding: '0.5rem',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                      }}
                    >
                      <span style={{ flex: 1 }}>{cert.fileName || `תעודה ${index + 1}`}</span>
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        הסר
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Special Services */}
          <section className={styles.section}>

            <div className={styles.field}>
              <label>שפות * (לפחות אחת):</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    {...register('specialServices.languages.hebrew')}
                    disabled={loading}
                  />
                  <span>עברית</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    {...register('specialServices.languages.english')}
                    disabled={loading}
                  />
                  <span>אנגלית</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    {...register('specialServices.languages.russian')}
                    disabled={loading}
                  />
                  <span>רוסית</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    {...register('specialServices.languages.arabic')}
                    disabled={loading}
                  />
                  <span>ערבית</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    {...register('specialServices.languages.french')}
                    disabled={loading}
                  />
                  <span>צרפתית</span>
                </label>
                <div className={styles.otherInput}>
                  <label htmlFor="languagesOther">אחר:</label>
                  <input
                    id="languagesOther"
                    type="text"
                    {...register('specialServices.languages.other')}
                    placeholder="ציין שפות נוספות"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Credo & Specialty */}
          <section className={styles.section}>
            <h2>אני מאמין והתמחות</h2>
            
            <div className={styles.field}>
              <label htmlFor="credoAndSpecialty">אני מאמין והתמחות *</label>
              <p className={styles.hint}>
                מה מייחד אותך? מה אתה מאמין בו? מה ההתמחות שלך?
              </p>
              <textarea
                id="credoAndSpecialty"
                {...register('credoAndSpecialty')}
                rows={5}
                placeholder="תאר את האמונות והעקרונות המקצועיים שלך"
                disabled={loading}
              />
              {errors.credoAndSpecialty && (
                <span className={styles.fieldError}>{errors.credoAndSpecialty.message}</span>
              )}
            </div>
          </section>

          {/* Section 7: Treated Conditions (Multiple Cascading) */}
          <section className={styles.section}>
            <h2>מצבים בריאותיים שאתה מטפל בהם *</h2>
            <p className={styles.hint}>בחר לפחות מצב בריאותי אחד</p>
            
            {conditions.map((condition, index) => {
              const subOptions = conditionSubOptions[condition.id] || ['אחר']
              
              return (
                <div
                  key={condition.id}
                  style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <strong>מצב בריאותי #{index + 1}</strong>
                    {conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCondition(condition.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        הסר
                      </button>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label>קטגוריה ראשית *</label>
                    <select
                      value={condition.primary}
                      onChange={(e) => updateCondition(condition.id, 'primary', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">בחר קטגוריה</option>
                      {PRIMARY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {condition.primary === 'אחר' && (
                    <div className={styles.field}>
                      <label>תיאור הקטגוריה *</label>
                      <input
                        type="text"
                        value={condition.primaryOtherText}
                        onChange={(e) => updateCondition(condition.id, 'primaryOtherText', e.target.value)}
                        placeholder="תאר את הקטגוריה"
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className={styles.field}>
                    <label>תת-קטגוריה *</label>
                    <select
                      value={condition.sub}
                      onChange={(e) => updateCondition(condition.id, 'sub', e.target.value)}
                      disabled={loading || !condition.primary}
                    >
                      <option value="">בחר תת-קטגוריה</option>
                      {subOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {condition.sub === 'אחר' && (
                    <div className={styles.field}>
                      <label>תיאור תת-הקטגוריה *</label>
                      <input
                        type="text"
                        value={condition.subOtherText}
                        onChange={(e) => updateCondition(condition.id, 'subOtherText', e.target.value)}
                        placeholder="תאר את תת-הקטגוריה"
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            <button
              type="button"
              onClick={addCondition}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem',
              }}
            >
              + הוסף מצב בריאותי נוסף
            </button>
          </section>

          {/* Section 8: Therapeutic Approach */}
          <section className={styles.section}>
            <h2>גישה טיפולית</h2>
            
            <div className={styles.field}>
              <label htmlFor="approachDescription">תיאור הגישה הטיפולית *</label>
              <p className={styles.hint}>
                תאר את הגישה הטיפולית שלך, השיטות שאתה משתמש בהן, ואיך אתה עוזר למטופלים
              </p>
              <textarea
                id="approachDescription"
                {...register('approachDescription')}
                rows={6}
                placeholder="תאר את הגישה הטיפולית שלך..."
                disabled={loading}
              />
              {errors.approachDescription && (
                <span className={styles.fieldError}>{errors.approachDescription.message}</span>
              )}
            </div>
          </section>

          {/* Section 9: Inspiration Story */}
          <section className={styles.section}>
            <h2>סיפור השראה קצר (אופציונלי)</h2>
            
            <div className={styles.field}>
              <label htmlFor="inspirationStory">סיפור השראה</label>
              <p className={styles.hint}>
                <strong>חשוב:</strong> אנא אל תזכיר שמות של אנשים בסיפור
              </p>
              <textarea
                id="inspirationStory"
                {...register('inspirationStory')}
                rows={6}
                placeholder="שתף סיפור מעורר השראה מהעבודה שלך (ללא שמות)"
                disabled={loading}
              />
            </div>
          </section>

          {/* Section 10: Contact Details */}
          <section className={styles.section}>
            <h2>פרטי יצירת קשר (להצגה באתר)</h2>
            
            {/* <div className={styles.field}>
              <label htmlFor="displayPhone">טלפון להצגה (אופציונלי)</label>
              <input
                id="displayPhone"
                type="tel"
                {...register('contacts.displayPhone')}
                placeholder="הכנס מספר טלפון"
                disabled={loading}
              />
            </div> */}

            <div className={styles.field}>
              <label htmlFor="bookingPhone">טלפון לתיאומים *</label>
              <input
                id="bookingPhone"
                type="tel"
                {...register('contacts.bookingPhone')}
                placeholder="הכנס מספר טלפון לתיאומים"
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">אימייל ליצירת קשר *</label>
              <input
                id="email"
                type="email"
                {...register('contacts.email')}
                placeholder="example@email.com"
                disabled={loading}
              />
              {errors.contacts?.email && (
                <span className={styles.fieldError}>{errors.contacts.email.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="websiteUrl">אתר / פייסבוק / אינסטגרם (אופציונלי)</label>
              <input
                id="websiteUrl"
                type="url"
                {...register('contacts.websiteUrl')}
                placeholder="https://..."
                disabled={loading}
              />
            </div>
          </section>

          {/* Section 11: Consent */}
          <section className={styles.section}>
            <h2>הסכמה *</h2>
            
            <div className={styles.field}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  {...register('consentJoin')}
                  disabled={loading}
                />
                <span>אני רוצה להצטרף ולהפיץ את הטוב שלי</span>
              </label>
              {errors.consentJoin && (
                <span className={styles.fieldError}>{errors.consentJoin.message}</span>
              )}
            </div>
          </section>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? '⏳ שולח...' : '📤 שלח בקשה'}
          </button>
        </form>
      </div>
    </div>
  )
}
