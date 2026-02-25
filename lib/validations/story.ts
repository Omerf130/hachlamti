import { z } from 'zod'
import { PRIMARY_OPTIONS, isValidSubCategory } from '../healthOptions'
import { ALT_TREATMENT_PRIMARY_OPTIONS, isValidAltTreatmentSubCategory } from '../alternativeTreatmentOptions'

/**
 * Story Status Enum
 */
export const StoryStatusSchema = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'INTERNAL_ONLY',
  'ARCHIVED',
])

export type StoryStatus = z.infer<typeof StoryStatusSchema>

/**
 * Publication Choice Enum
 */
export const PublicationChoiceSchema = z.enum([
  'FULL_NAME',
  'FIRST_NAME_ONLY',
  'ANONYMOUS',
])

export type PublicationChoice = z.infer<typeof PublicationChoiceSchema>

/**
 * Health Challenge Schema with validation
 */
export const HealthChallengeSchema = z.object({
  primary: z.string().min(1, 'יש לבחור תחום החלמה'),
  primaryOtherText: z.string().optional(),
  sub: z.string().min(1, 'יש לבחור תת קטגוריה'),
  subOtherText: z.string().optional(),
  durationBeforeRecovery: z.string().min(1, 'יש למלא כמה זמן סבלת מהבעיה'),
  impactOnQualityOfLife: z.string().min(1, 'יש למלא כיצד המחלה השפיעה על איכות החיים'),
}).superRefine((data, ctx) => {
  // Validate primary is in PRIMARY_OPTIONS
  if (!PRIMARY_OPTIONS.includes(data.primary)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'תחום החלמה לא תקין',
      path: ['primary'],
    })
  }
  
  // If primary is "אחר", primaryOtherText must be provided
  if (data.primary === 'אחר') {
    if (!data.primaryOtherText || data.primaryOtherText.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'יש להזין את תחום ההחלמה',
        path: ['primaryOtherText'],
      })
    }
    // When primary is "אחר", sub must also be "אחר"
    if (data.sub !== 'אחר') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'כאשר תחום ההחלמה הוא אחר, תת הקטגוריה חייבת להיות אחר',
        path: ['sub'],
      })
    }
  }
  
  // If sub is "אחר", subOtherText must be provided
  if (data.sub === 'אחר') {
    if (!data.subOtherText || data.subOtherText.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'יש להזין את תת הקטגוריה',
        path: ['subOtherText'],
      })
    }
  }
  
  // Validate sub belongs to primary (unless primary is "אחר")
  if (data.primary !== 'אחר' && !isValidSubCategory(data.primary, data.sub)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'תת הקטגוריה לא תואמת את תחום ההחלמה',
      path: ['sub'],
    })
  }
})

export type HealthChallenge = z.infer<typeof HealthChallengeSchema>

/**
 * Alternative Treatment Schema with validation
 */
export const AlternativeTreatmentSchema = z.object({
  primary: z.string().min(1, 'יש לבחור שיטת טיפול'),
  primaryOtherText: z.string().optional(),
  sub: z.string().min(1, 'יש לבחור תת קטגוריה'),
  subOtherText: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate primary is in ALT_TREATMENT_PRIMARY_OPTIONS
  if (!ALT_TREATMENT_PRIMARY_OPTIONS.includes(data.primary)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'שיטת הטיפול לא תקינה',
      path: ['primary'],
    })
  }
  
  // If primary is "אחר", primaryOtherText must be provided
  if (data.primary === 'אחר') {
    if (!data.primaryOtherText || data.primaryOtherText.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'יש להזין את שיטת הטיפול',
        path: ['primaryOtherText'],
      })
    }
    // When primary is "אחר", sub must also be "אחר"
    if (data.sub !== 'אחר') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'כאשר שיטת הטיפול היא אחר, תת הקטגוריה חייבת להיות אחר',
        path: ['sub'],
      })
    }
  }
  
  // If sub is "אחר", subOtherText must be provided
  if (data.sub === 'אחר') {
    if (!data.subOtherText || data.subOtherText.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'יש להזין את תת הקטגוריה',
        path: ['subOtherText'],
      })
    }
  }
  
  // Validate sub belongs to primary (unless primary is "אחר")
  if (data.primary !== 'אחר' && !isValidAltTreatmentSubCategory(data.primary, data.sub)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'תת הקטגוריה לא תואמת את שיטת הטיפול',
      path: ['sub'],
    })
  }
})

export type AlternativeTreatment = z.infer<typeof AlternativeTreatmentSchema>

/**
 * Schema for creating a new recovery story
 * Used in createStory Server Action
 */
export const createStorySchema = z.object({
  // A. Personal Details (For Contact Purposes Only)
  submitterFullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  submitterPhone: z.string().min(1, 'מספר טלפון הוא שדה חובה'),
  submissionDate: z.date().default(() => new Date()),
  mayContact: z.boolean({
    required_error: 'יש לבחור אם ניתן ליצור קשר להבהרות',
  }),
  allowWhatsAppContact: z.boolean().default(false),
  publicationChoice: PublicationChoiceSchema,
  therapistName: z.string().min(1, 'יש לבחור מטפל'),
  
  // A2. Health Challenge
  healthChallenge: HealthChallengeSchema,
  
  // A3. Alternative Treatment
  alternativeTreatment: AlternativeTreatmentSchema,
  
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
  
  // C. Declarations (all must be true)
  declarationTruthful: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר שהסיפור אמיתי ומדויק' }),
  }),
  declarationConsent: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר את ההסכמה לפרסום' }),
  }),
  declarationNotMedicalAdvice: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר את ההבנה שהסיפור אינו ייעוץ רפואי' }),
  }),
  declarationEditingConsent: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר את ההסכמה לעריכת השפה' }),
  }),
})

export type CreateStoryInput = z.infer<typeof createStorySchema>

/**
 * Schema for updating story status
 * Used in updateStoryStatus Server Action (admin only)
 */
export const updateStoryStatusSchema = z.object({
  storyId: z.string().min(1),
  status: StoryStatusSchema,
  notes: z.string().optional(),
})

export type UpdateStoryStatusInput = z.infer<typeof updateStoryStatusSchema>

/**
 * Schema for updating a story (user edit)
 * Users can edit their own stories
 */
export const updateStorySchema = z.object({
  storyId: z.string().min(1),
  
  // A. Personal Details
  submitterFullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  submitterPhone: z.string().min(1, 'מספר טלפון הוא שדה חובה'),
  mayContact: z.boolean({
    required_error: 'יש לבחור אם ניתן ליצור קשר להבהרות',
  }),
  allowWhatsAppContact: z.boolean().default(false),
  publicationChoice: PublicationChoiceSchema,
  therapistName: z.string().min(1, 'יש לבחור מטפל'),
  
  // A2. Health Challenge
  healthChallenge: HealthChallengeSchema,
  
  // A3. Alternative Treatment
  alternativeTreatment: AlternativeTreatmentSchema,
  
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
})

export type UpdateStoryInput = z.infer<typeof updateStorySchema>
