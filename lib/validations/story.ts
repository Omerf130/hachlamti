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
 * Privacy Level Enum
 */
export const PrivacyLevelSchema = z.enum([
  'FULL_NAME',
  'FIRST_NAME_LAST_INITIAL',
  'ANONYMOUS',
  'INTERNAL_ONLY',
])

export type PrivacyLevel = z.infer<typeof PrivacyLevelSchema>

/**
 * Schema for creating a new story
 * Used in createStory Server Action
 */
export const createStorySchema = z.object({
  privacyLevel: PrivacyLevelSchema,
  submitterName: z.string().min(1).optional(),
  medicalCondition: z.string().min(1),
  treatmentCategory: z.string().min(1),
  treatmentProcess: z.string().min(1),
  duration: z.string().optional(),
  outcome: z.string().optional(),
  therapistId: z.string().optional(),
  therapistNameRaw: z.string().optional(),
  transcript: z.string().optional(),
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

