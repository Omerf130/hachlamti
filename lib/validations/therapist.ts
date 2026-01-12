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
 * Schema for creating a new therapist application
 * Used in createTherapist Server Action
 */
export const createTherapistSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  specialties: z.array(z.string()).min(1),
  languages: z.array(z.string()).min(1),
  targetAudiences: z.array(z.string()).min(1),
  locations: z.array(z.string()).min(1),
  treatmentApproach: z.string().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  education: z.string().optional(),
  certifications: z.record(z.unknown()).optional(),
  availability: z.record(z.unknown()).optional(),
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

