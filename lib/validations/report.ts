import { z } from 'zod'

/**
 * Report Entity Type Enum
 */
export const ReportEntityTypeSchema = z.enum(['STORY', 'THERAPIST'])

export type ReportEntityType = z.infer<typeof ReportEntityTypeSchema>

/**
 * Schema for creating a new report
 * Used in createReport Server Action
 */
export const createReportSchema = z.object({
  entityType: ReportEntityTypeSchema,
  entityId: z.string().min(1),
  reason: z.string().min(1),
  details: z.string().optional(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>

