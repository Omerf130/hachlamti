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
 * Health Challenge Schema (same as Story)
 */
export const HealthChallengeSchema = z.object({
  primary: z.string().min(1, 'יש לבחור קטגוריה ראשית'),
  primaryOtherText: z.string().optional(),
  sub: z.string().min(1, 'יש לבחור תת-קטגוריה'),
  subOtherText: z.string().optional(),
})

/**
 * Certificate Schema
 */
export const CertificateSchema = z.object({
  url: z.string(),
  fileName: z.string().optional(),
})

/**
 * Profession Schema
 */
export const ProfessionSchema = z
  .object({
    value: z.string().min(1, 'יש לבחור מקצוע'),
    otherText: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.value === 'אחר' && (!data.otherText || data.otherText.trim() === '')) {
        return false
      }
      return true
    },
    {
      message: 'יש למלא את שם המקצוע כאשר בוחרים אחר',
      path: ['otherText'],
    }
  )

/**
 * Location Schema
 */
export const LocationSchema = z.object({
  city: z.string().min(1, 'עיר היא שדה חובה'),
  activityHours: z.string().optional(),
})

/**
 * Special Services Schema
 */
export const SpecialServicesSchema = z.object({
  onlineTreatment: z.boolean(),
  homeVisits: z.boolean(),
  accessibleClinic: z.boolean(),
  languages: z.array(z.string()).min(1, 'יש לבחור לפחות שפה אחת'),
  languagesOtherText: z.string().optional(),
})

/**
 * Contacts Schema
 */
export const ContactsSchema = z.object({
  displayPhone: z.string().optional(),
  bookingPhone: z.string().optional(),
  websiteUrl: z.string().url('כתובת אתר לא תקינה').optional().or(z.literal('')),
  email: z.string().email('כתובת אימייל לא תקינה'),
})

/**
 * Schema for creating a new therapist application
 * Used in createTherapist Server Action
 */
export const createTherapistSchema = z.object({
  // Basic Info
  fullName: z.string().min(1, 'שם מלא הוא שדה חובה'),
  profileImageUrl: z.string().min(1, 'תמונת פרופיל היא שדה חובה'),
  logoImageUrl: z.string().optional(),

  // Profession
  profession: ProfessionSchema,

  // Location & Activity
  location: LocationSchema,

  // Education & Credentials
  educationText: z.string().optional(),
  certificates: z.array(CertificateSchema).max(10, 'ניתן להעלות עד 10 תעודות'),

  // Special Services
  specialServices: SpecialServicesSchema,

  // Professional Info
  credoAndSpecialty: z.string().min(1, 'אני מאמין והתמחות הם שדות חובה'),

  // Treated Conditions
  treatedConditions: z.array(HealthChallengeSchema).min(1, 'יש לבחור לפחות מצב בריאותי אחד'),

  // Approach & Story
  approachDescription: z.string().min(1, 'תיאור גישה טיפולית הוא שדה חובה'),
  inspirationStory: z.string().optional(),

  // Contact Details
  contacts: ContactsSchema,

  // Consent
  consentJoin: z.literal(true, {
    errorMap: () => ({ message: 'יש לאשר הצטרפות לקהילה' }),
  }),
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

export type UpdateTherapistStatusInput = z.infer<typeof updateTherapistStatusSchema>
