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
 * Base schema for story creation (without refine for form compatibility)
 * Used in StorySubmissionForm to avoid TypeScript deep inference issues
 */
export const createStoryBaseSchema = z.object({
  privacyLevel: PrivacyLevelSchema,
  submitterName: z.string().trim().optional(),
  medicalCondition: z.string().min(1),
  treatmentCategory: z.string().min(1),
  treatmentProcess: z.string().min(1),
  duration: z.string().optional(),
  outcome: z.string().optional(),
  therapistId: z.string().optional(),
  therapistNameRaw: z.string().optional(),
  transcript: z.string().optional(),
})

/**
 * Schema for creating a new story
 * Used in createStory Server Action
 * Validates submitterName requirements based on privacyLevel
 */
export const createStorySchema = createStoryBaseSchema.refine(
  (data) => {
    // FULL_NAME and FIRST_NAME_LAST_INITIAL require submitterName
    if (
      (data.privacyLevel === 'FULL_NAME' ||
        data.privacyLevel === 'FIRST_NAME_LAST_INITIAL') &&
      (!data.submitterName || data.submitterName.trim().length === 0)
    ) {
      return false
    }
    return true
  },
  {
    message:
      'submitterName is required for FULL_NAME and FIRST_NAME_LAST_INITIAL privacy levels',
    path: ['submitterName'],
  }
)

export type CreateStoryInput = z.infer<typeof createStorySchema>
export type CreateStoryBaseInput = z.infer<typeof createStoryBaseSchema>

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

