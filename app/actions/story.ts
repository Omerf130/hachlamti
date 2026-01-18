'use server'

import { connectDB } from '@/lib/db'
import { createStorySchema, updateStoryStatusSchema } from '@/lib/validations/story'
import Story, { type StoryDocument } from '@/models/Story'
import ReviewLog from '@/models/ReviewLog'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { PublicationChoice } from '@/lib/validations/story'
import { ZodError } from 'zod'
import mongoose from 'mongoose'

/**
 * Computes displayName based on publicationChoice and submitterFullName
 * @param publicationChoice - How the user wants the story published
 * @param submitterFullName - The submitter's full name
 * @returns The computed displayName
 */
function computeDisplayName(
  publicationChoice: PublicationChoice,
  submitterFullName: string
): string {
  switch (publicationChoice) {
    case 'FULL_NAME':
      return submitterFullName.trim()

    case 'FIRST_NAME_ONLY': {
      const trimmed = submitterFullName.trim()
      const parts = trimmed.split(/\s+/).filter((part) => part.length > 0)

      if (parts.length === 0) {
        return 'אנונימי'
      }

      // Return first name only
      return parts[0] || 'אנונימי'
    }

    case 'ANONYMOUS':
      return 'אנונימי'

    default:
      throw new Error(`Unknown publication choice: ${publicationChoice}`)
  }
}

/**
 * Server Action: Create a new recovery story
 * Validates input, computes displayName, and creates story with PENDING_REVIEW status
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
      validated.publicationChoice,
      validated.submitterFullName
    )

    // Create story with new schema fields
    const story = new Story({
      status: 'PENDING_REVIEW',
      
      submitterFullName: validated.submitterFullName,
      submitterPhone: validated.submitterPhone,
      submitterEmail: validated.submitterEmail,
      submissionDate: validated.submissionDate,
      mayContact: validated.mayContact,
      publicationChoice: validated.publicationChoice,
      
      title: validated.title,
      problem: validated.problem,
      previousAttempts: validated.previousAttempts,
      solution: validated.solution,
      results: validated.results,
      messageToOthers: validated.messageToOthers,
      freeTextStory: validated.freeTextStory,
      
      declarationTruthful: validated.declarationTruthful,
      declarationConsent: validated.declarationConsent,
      declarationNotMedicalAdvice: validated.declarationNotMedicalAdvice,
      declarationEditingConsent: validated.declarationEditingConsent,
      
      displayName,
      submittedAt: new Date(),
    })

    await story.save()

    return {
      success: true,
      storyId: story._id.toString(),
    }
  } catch (error) {
    console.error('Create story error:', error)
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError
          ? `שגיאת אימות: ${firstError.path.join('.')} - ${firstError.message}`
          : 'שגיאת אימות',
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
      error: 'שגיאה בלתי צפויה אירעה',
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
    type StoryFindOne = (filter: { _id: mongoose.Types.ObjectId }) => Promise<StoryDocument | null>
    const story = await (Story.findOne as unknown as StoryFindOne)({ _id: storyIdObj })

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
    console.error('Update story status error:', error)
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
