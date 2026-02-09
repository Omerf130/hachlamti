'use server'

import { connectDB } from '@/lib/db'
import { createStorySchema, updateStorySchema, updateStoryStatusSchema } from '@/lib/validations/story'
import Story from '@/models/Story'
import ReviewLog from '@/models/ReviewLog'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { PublicationChoice } from '@/lib/validations/story'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import { findOne, deleteById } from '@/lib/mongoose-helpers'

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
 * Validates input, computes displayName, and creates story with PUBLISHED status
 * Stories are published immediately upon creation (no admin approval required)
 */
export async function createStory(
  input: unknown
): Promise<{ success: true; storyId: string } | { success: false; error: string; fieldErrors?: Record<string, string> }> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return {
        success: false,
        error: 'עליך להיות מחובר כדי לשלוח סיפור',
      }
    }

    // Validate input
    const validated = createStorySchema.parse(input)

    // Connect to database
    await connectDB()

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      console.error('Invalid user ID format:', session.user.id)
      return {
        success: false,
        error: 'שגיאה במערכת. אנא נסה להתחבר מחדש.',
      }
    }

    // Compute displayName
    const displayName = computeDisplayName(
      validated.publicationChoice,
      validated.submitterFullName
    )

    // Create story with new schema fields
    const story = new Story({
      authorUserId: new mongoose.Types.ObjectId(session.user.id),
      status: 'PUBLISHED',
      
      submitterFullName: validated.submitterFullName,
      submitterPhone: validated.submitterPhone,
      submissionDate: validated.submissionDate,
      mayContact: validated.mayContact,
      allowWhatsAppContact: validated.allowWhatsAppContact,
      publicationChoice: validated.publicationChoice,
      
      healthChallenge: validated.healthChallenge,
      alternativeTreatment: validated.alternativeTreatment,
      
      title: validated.title,
      problem: validated.problem,
      previousAttempts: validated.previousAttempts,
      messageToOthers: validated.messageToOthers,
      
      declarationTruthful: validated.declarationTruthful,
      declarationConsent: validated.declarationConsent,
      declarationNotMedicalAdvice: validated.declarationNotMedicalAdvice,
      declarationEditingConsent: validated.declarationEditingConsent,
      
      displayName,
      submittedAt: new Date(),
      publishedAt: new Date(),
    })

    await story.save()

    return {
      success: true,
      storyId: story._id.toString(),
    }
  } catch (error) {
    console.error('Create story error:', error)
    if (error instanceof ZodError) {
      // Map Zod errors to user-friendly Hebrew messages
      const fieldErrors: Record<string, string> = {}
      const errorMessages: string[] = []
      
      error.errors.forEach((err) => {
        const field = err.path.join('.')
        const hebrewFieldNames: Record<string, string> = {
          'submitterFullName': 'שם מלא',
          'submitterPhone': 'מספר טלפון',
          'healthChallenge.primary': 'תחום החלמה',
          'healthChallenge.primaryOtherText': 'תיאור תחום החלמה',
          'healthChallenge.sub': 'תת קטגוריה',
          'healthChallenge.subOtherText': 'תיאור תת קטגוריה',
          'healthChallenge.durationBeforeRecovery': 'משך הסבל מהבעיה',
          'healthChallenge.impactOnQualityOfLife': 'השפעה על איכות החיים',
          'alternativeTreatment.primary': 'שיטת טיפול',
          'alternativeTreatment.primaryOtherText': 'תיאור שיטת טיפול',
          'alternativeTreatment.sub': 'תת קטגוריה של שיטת טיפול',
          'alternativeTreatment.subOtherText': 'תיאור תת קטגוריה של שיטת טיפול',
          'title': 'כותרת',
          'problem': 'תיאור הבעיה',
          'previousAttempts': 'ניסיונות קודמים',
          'messageToOthers': 'הודעה לאחרים',
          'declarationTruthful': 'אישור אמיתות',
          'declarationConsent': 'אישור פרסום',
          'declarationNotMedicalAdvice': 'אישור הבנת אופי השיתוף',
          'declarationEditingConsent': 'אישור עריכה',
        }
        
        const hebrewField = hebrewFieldNames[field] || field
        fieldErrors[field] = err.message
        errorMessages.push(`${hebrewField}: ${err.message}`)
      })
      
      return {
        success: false,
        error: `אנא תקן את השדות הבאים:\n${errorMessages.join('\n')}`,
        fieldErrors,
      }
    }
    if (error instanceof Error) {
      // Filter out technical MongoDB errors
      if (error.message.includes('24 character hex string') || 
          error.message.includes('ObjectId') ||
          error.message.includes('Uint8Array')) {
        return {
          success: false,
          error: 'שגיאה במערכת. אנא נסה להתחבר מחדש או פנה לתמיכה.',
        }
      }
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: 'שגיאה בלתי צפויה אירעה. אנא נסה שוב.',
    }
  }
}

/**
 * Server Action: Update a story (user edit)
 * Users can edit only their own stories (admins can edit any story)
 */
export async function updateStory(
  input: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return {
        success: false,
        error: 'Unauthorized: You must be logged in to edit a story',
      }
    }

    // Validate input
    const validated = updateStorySchema.parse(input)

    // Find story
    const story = await findOne(Story, { _id: new mongoose.Types.ObjectId(validated.storyId) })

    if (!story) {
      return {
        success: false,
        error: 'Story not found',
      }
    }

    // Check ownership (allow ADMIN to edit any story)
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = story.authorUserId.toString() === session.user.id

    if (!isAdmin && !isOwner) {
      return {
        success: false,
        error: 'Unauthorized: You can only edit your own stories',
      }
    }

    // Update story fields
    story.submitterFullName = validated.submitterFullName
    story.submitterPhone = validated.submitterPhone
    story.mayContact = validated.mayContact
    story.allowWhatsAppContact = validated.allowWhatsAppContact
    story.publicationChoice = validated.publicationChoice
    
    story.healthChallenge = validated.healthChallenge
    story.alternativeTreatment = validated.alternativeTreatment
    
    story.title = validated.title
    story.problem = validated.problem
    story.previousAttempts = validated.previousAttempts
    story.messageToOthers = validated.messageToOthers

    // Recompute displayName
    story.displayName = computeDisplayName(
      validated.publicationChoice,
      validated.submitterFullName
    )

    await story.save()

    // Revalidate relevant paths
    revalidatePath('/stories')
    revalidatePath(`/stories/${validated.storyId}`)
    revalidatePath('/admin/stories')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Update story error:', error)
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
 * Server Action: Delete a story (hard delete)
 * Users can only delete their own stories
 */
export async function deleteStory(
  storyId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return {
        success: false,
        error: 'Unauthorized: You must be logged in to delete a story',
      }
    }

    // Validate storyId
    if (!storyId || storyId.trim() === '') {
      return {
        success: false,
        error: 'Story ID is required',
      }
    }

    // Find story
    const story = await findOne(Story, { _id: new mongoose.Types.ObjectId(storyId) })

    if (!story) {
      return {
        success: false,
        error: 'Story not found',
      }
    }

    // Check ownership
    if (story.authorUserId.toString() !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized: You can only delete your own stories',
      }
    }

    // Hard delete the story
    const deleted = await deleteById(Story, storyId)
    
    if (!deleted) {
      return {
        success: false,
        error: 'Failed to delete story',
      }
    }

    // Revalidate relevant paths
    revalidatePath('/my-stories')
    revalidatePath('/stories')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Delete story error:', error)
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
 * Server Action: Delete a story (admin only - can delete any story)
 * Validates admin session and performs hard delete
 */
export async function deleteStoryAdmin(
  storyId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    // Connect to database
    await connectDB()

    if (!storyId) {
      return {
        success: false,
        error: 'Story ID is required',
      }
    }

    // Hard delete the story
    const deleted = await deleteById(Story, storyId)
    
    if (!deleted) {
      return {
        success: false,
        error: 'Failed to delete story',
      }
    }

    // Revalidate relevant paths
    revalidatePath('/admin/stories')
    revalidatePath('/stories')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Delete story (admin) error:', error)
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
    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    // Validate input
    const validated = updateStoryStatusSchema.parse(input)

    // Find story
    const story = await findOne(Story, { _id: new mongoose.Types.ObjectId(validated.storyId) })

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
