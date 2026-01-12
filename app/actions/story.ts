'use server'

import { connectDB } from '@/lib/db'
import { createStorySchema, updateStoryStatusSchema } from '@/lib/validations/story'
import Story, { type StoryDocument } from '@/models/Story'
import ReviewLog from '@/models/ReviewLog'
import Therapist, { type TherapistDocument } from '@/models/Therapist'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { PrivacyLevel } from '@/lib/validations/story'
import { ZodError } from 'zod'
import mongoose from 'mongoose'

/**
 * Computes displayName based on privacyLevel and submitterName
 * @param privacyLevel - The privacy level
 * @param submitterName - The submitter's name (optional)
 * @returns The computed displayName
 */
function computeDisplayName(
  privacyLevel: PrivacyLevel,
  submitterName?: string
): string {
  switch (privacyLevel) {
    case 'FULL_NAME':
      if (!submitterName || submitterName.trim().length === 0) {
        throw new Error('submitterName is required for FULL_NAME privacy level')
      }
      return submitterName.trim()

    case 'FIRST_NAME_LAST_INITIAL': {
      if (!submitterName || submitterName.trim().length === 0) {
        throw new Error(
          'submitterName is required for FIRST_NAME_LAST_INITIAL privacy level'
        )
      }
      const trimmed = submitterName.trim()
      const parts = trimmed.split(/\s+/).filter((part) => part.length > 0)

      if (parts.length === 0) {
        throw new Error('submitterName must contain at least one name')
      }

      // If only one name provided, use it as-is
      if (parts.length === 1) {
        return parts[0] || ''
      }

      // First name + last initial
      const firstName = parts[0] || ''
      const lastInitial = parts[parts.length - 1]?.[0] || ''
      return `${firstName} ${lastInitial}.`
    }

    case 'ANONYMOUS':
      return 'אנונימי'

    case 'INTERNAL_ONLY':
      return 'פנימי'

    default:
      throw new Error(`Unknown privacy level: ${privacyLevel}`)
  }
}

/**
 * Server Action: Create a new story
 * Validates input, computes displayName, and creates story with DRAFT status
 */
export async function createStory(
  input: unknown
): Promise<{ success: true; storyId: string } | { success: false; error: string }> {
  try {
    // Validate input
    const validated = createStorySchema.parse(input)

    // Connect to database
    await connectDB()

    // Compute displayName
    const displayName = computeDisplayName(
      validated.privacyLevel,
      validated.submitterName
    )

    // Handle therapist linking
    let therapistDisplayName: string | undefined
    let therapistId: string | undefined

    if (validated.therapistId) {
      // Verify therapist exists and is approved
      const therapistIdObj = new mongoose.Types.ObjectId(validated.therapistId)
      // TypeScript workaround: Mongoose findOne has complex overloads
      // Using unknown to narrow type per CURSOR_RULES.md (no any allowed)
      const findOneMethod = Therapist.findOne as unknown as (
        filter: { _id: mongoose.Types.ObjectId }
      ) => { exec: () => Promise<TherapistDocument | null> }
      const therapist = await findOneMethod({ _id: therapistIdObj }).exec()
      if (!therapist) {
        return {
          success: false,
          error: 'Therapist not found',
        }
      }
      if (therapist.status !== 'APPROVED') {
        return {
          success: false,
          error: 'Therapist is not approved',
        }
      }
      therapistId = validated.therapistId
      therapistDisplayName = therapist.fullName
    }

    // Create story
    const story = new Story({
      status: 'DRAFT',
      privacyLevel: validated.privacyLevel,
      submitterName: validated.submitterName,
      displayName,
      medicalCondition: validated.medicalCondition,
      treatmentCategory: validated.treatmentCategory,
      treatmentProcess: validated.treatmentProcess,
      duration: validated.duration,
      outcome: validated.outcome,
      therapistId: therapistId ? therapistId : undefined,
      therapistDisplayName,
      therapistNameRaw: validated.therapistNameRaw,
      transcript: validated.transcript,
      submittedAt: new Date(),
    })

    await story.save()

    return {
      success: true,
      storyId: story._id.toString(),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError
          ? `Validation failed: ${firstError.path.join('.')} - ${firstError.message}`
          : 'Validation failed',
      }
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Server Action: Update story status (admin only)
 * Validates admin session, updates story status, and logs to ReviewLog
 */
export async function updateStoryStatus(
  input: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    // Validate input
    const validated = updateStoryStatusSchema.parse(input)

    // Connect to database
    await connectDB()

    // Find story
    const storyIdObj = new mongoose.Types.ObjectId(validated.storyId)
    // TypeScript workaround: Mongoose findOne has complex overloads
    // Using unknown to narrow type per CURSOR_RULES.md (no any allowed)
    const findOneMethod = Story.findOne as unknown as (
      filter: { _id: mongoose.Types.ObjectId }
    ) => { exec: () => Promise<StoryDocument | null> }
    const story = await findOneMethod({ _id: storyIdObj }).exec()
    if (!story) {
      return {
        success: false,
        error: 'Story not found',
      }
    }

    // Update status
    story.status = validated.status

    // Set publishedAt if status is PUBLISHED
    if (validated.status === 'PUBLISHED' && !story.publishedAt) {
      story.publishedAt = new Date()
    }

    await story.save()

    // Map status to ReviewLog decision
    let decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
    if (validated.status === 'PUBLISHED') {
      decision = 'APPROVED'
    } else if (validated.status === 'REJECTED') {
      decision = 'REJECTED'
    } else {
      decision = 'CHANGES_REQUESTED'
    }

    // Log to ReviewLog
    const reviewLog = new ReviewLog({
      entityType: 'STORY',
      entityId: story._id.toString(),
      adminUserId: session.user.id,
      decision,
      notes: validated.notes,
    })

    await reviewLog.save()

    // Revalidate relevant paths
    revalidatePath('/admin/stories')
    revalidatePath('/stories')

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError
          ? `Validation failed: ${firstError.path.join('.')} - ${firstError.message}`
          : 'Validation failed',
      }
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

