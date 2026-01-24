import { z } from 'zod'

/**
 * Therapist Status Enum
 */
export const TherapistStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
])

export type TherapistStatus = z.infer<typeof TherapistStatusSchema>

/**
 * Treatment Location Type
 */
export const TreatmentLocationSchema = z.enum([
  'FIXED_CLINIC',
  'HOME_VISITS',
  'REMOTE',
  'COMBINATION',
])

/**
 * Session Time Schema
 */
export const SessionTimeSchema = z.object({
  from: z.string().regex(/^\d{2}:\d{2}$/, 'זמן חייב להיות בפורמט HH:MM'),
  to: z.string().regex(/^\d{2}:\d{2}$/, 'זמן חייב להיות בפורמט HH:MM'),
})

/**
 * Day Schedule Schema
 */
export const DayScheduleSchema = z.object({
  sessionA: SessionTimeSchema.optional(),
  sessionB: SessionTimeSchema.optional(),
})

/**
 * Weekly Availability Schema
 */
export const WeeklyAvailabilitySchema = z.object({
  sunday: DayScheduleSchema.optional(),
  monday: DayScheduleSchema.optional(),
  tuesday: DayScheduleSchema.optional(),
  wednesday: DayScheduleSchema.optional(),
  thursday: DayScheduleSchema.optional(),
  friday: DayScheduleSchema.optional(),
  saturday: DayScheduleSchema.optional(),
})

/**
 * External Links Schema
 */
export const ExternalLinksSchema = z.object({
  website: z.string().url('כתובת אתר לא תקינה').optional().or(z.literal('')),
  facebook: z.string().url('כתובת פייסבוק לא תקינה').optional().or(z.literal('')),
  instagram: z.string().url('כתובת אינסטגרם לא תקינה').optional().or(z.literal('')),
})

/**
 * Schema for creating a new therapist application
 * Used in createTherapist Server Action
 */
export const createTherapistSchema = z.object({
  // A. Personal & Professional Details
  fullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  phoneWhatsApp: z.string().min(1, 'מספר טלפון (ווטסאפ) הוא שדה חובה'),
  treatmentSpecialties: z.array(z.string()).min(1, 'יש להזין לפחות תחום התמחות אחד'),
  yearsExperience: z.number().int().min(0, 'שנות ניסיון חייבות להיות מספר חיובי'),
  
  // B. Professional Profile
  professionalDescription: z.string().min(1, 'תיאור מקצועי הוא שדה חובה'),
  healthIssues: z.array(z.string()).min(1, 'יש לבחור לפחות בעיה בריאותית אחת'),
  languages: z.array(z.string()).min(1, 'יש לבחור לפחות שפה אחת'),
  geographicArea: z.string().min(1, 'אזור גיאוגרפי הוא שדה חובה'),
  clinicAddress: z.string().optional(),
  treatmentLocations: z.array(TreatmentLocationSchema).min(1, 'יש לבחור לפחות מיקום טיפול אחד'),
  
  // C. Availability
  availability: WeeklyAvailabilitySchema,
  
  // D. External Links
  externalLinks: ExternalLinksSchema.optional(),
  
  // E. Declarations (all must be true)
  declarationAccurate: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר שהמידע מדויק ואמיתי' }),
  }),
  declarationCertified: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר שאתה מטפל מוסמך' }),
  }),
  declarationTerms: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר את תנאי השימוש' }),
  }),
  declarationConsent: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר את הסכמה לפרסום הפרופיל' }),
  }),
  declarationResponsibility: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר את הבנת האחריות' }),
  }),
  
  // F. Additional Notes
  additionalNotes: z.string().optional(),
})

export type CreateTherapistInput = z.infer<typeof createTherapistSchema>

/**
 * Schema for updating therapist status
 * Used in updateTherapistStatus Server Action (admin only)
 */
export const updateTherapistStatusSchema = z.object({
  therapistId: z.string().min(1),
  status: TherapistStatusSchema,
  notes: z.string().optional(),
})

export type UpdateTherapistStatusInput = z.infer<
  typeof updateTherapistStatusSchema
>
