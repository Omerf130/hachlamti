import { z } from 'zod'

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
 * Schema for creating a new recovery story
 * Used in createStory Server Action
 */
export const createStorySchema = z.object({
  // A. Personal Details (For Contact Purposes Only)
  submitterFullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  submitterPhone: z.string().min(1, 'מספר טלפון הוא שדה חובה'),
  submitterEmail: z.string().email('כתובת אימייל לא תקינה'),
  submissionDate: z.date().default(() => new Date()),
  mayContact: z.boolean({
    required_error: 'יש לבחור אם ניתן ליצור קשר להבהרות',
  }),
  publicationChoice: PublicationChoiceSchema,
  
  // B. Story Content
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  problem: z.string().min(1, 'תיאור הבעיה הוא שדה חובה'),
  previousAttempts: z.string().min(1, 'תיאור ניסיונות קודמים הוא שדה חובה'),
  solution: z.string().min(1, 'תיאור הפתרון הוא שדה חובה'),
  results: z.string().min(1, 'תיאור התוצאות הוא שדה חובה'),
  messageToOthers: z.string().min(1, 'הודעה לאחרים היא שדה חובה'),
  freeTextStory: z.string().optional(),
  
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
