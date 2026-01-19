'use server'

import { connectDB } from '@/lib/db'
import {
  createTherapistSchema,
  updateTherapistStatusSchema,
} from '@/lib/validations/therapist'
import Therapist from '@/models/Therapist'
import ReviewLog from '@/models/ReviewLog'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import { findOne } from '@/lib/mongoose-helpers'

/**
 * Server Action: Create a new therapist application
 * Validates input and creates therapist with PENDING status
 * Requires authentication - userId is set from session
 */
export async function createTherapist(
  input: unknown
): Promise<
  { success: true; therapistId: string } | { success: false; error: string }
> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return {
        success: false,
        error: 'Unauthorized: You must be logged in to submit a therapist application',
      }
    }

    // Validate input
    const validated = createTherapistSchema.parse(input)

    // Connect to database
    await connectDB()

    // Create therapist with new schema fields
    const therapist = new Therapist({
      userId: new mongoose.Types.ObjectId(session.user.id),
      status: 'PENDING',
      fullName: validated.fullName,
      email: validated.email,
      phoneWhatsApp: validated.phoneWhatsApp,
      treatmentSpecialties: validated.treatmentSpecialties,
      yearsExperience: validated.yearsExperience,
      
      professionalDescription: validated.professionalDescription,
      healthIssues: validated.healthIssues,
      languages: validated.languages,
      geographicArea: validated.geographicArea,
      clinicAddress: validated.clinicAddress,
      treatmentLocations: validated.treatmentLocations,
      
      availability: validated.availability,
      
      externalLinks: validated.externalLinks,
      
      declarationAccurate: validated.declarationAccurate,
      declarationCertified: validated.declarationCertified,
      declarationTerms: validated.declarationTerms,
      declarationConsent: validated.declarationConsent,
      declarationResponsibility: validated.declarationResponsibility,
      
      additionalNotes: validated.additionalNotes,
    })

    await therapist.save()

    return {
      success: true,
      therapistId: therapist._id.toString(),
    }
  } catch (error) {
    console.error('Create therapist error:', error)
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
 * Server Action: Update therapist status (admin only)
 * Validates admin session, updates therapist status, upgrades user role on approval, and logs to ReviewLog
 */
export async function updateTherapistStatus(
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
    const validated = updateTherapistStatusSchema.parse(input)

    // Find therapist
    const therapist = await findOne(Therapist, { _id: new mongoose.Types.ObjectId(validated.therapistId) })

    if (!therapist) {
      return {
        success: false,
        error: 'Therapist not found',
      }
    }

    // Update status
    therapist.status = validated.status
    await therapist.save()

    // If approved, upgrade user role from BASIC to THERAPIST
    if (validated.status === 'APPROVED') {
      const User = (await import('@/models/User')).default
      const user = await findOne(User, { _id: therapist.userId })
      
      if (user) {
        user.role = 'THERAPIST'
        await user.save()
      }
    }

    // Map status to ReviewLog decision
    let decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
    if (validated.status === 'APPROVED') {
      decision = 'APPROVED'
    } else if (validated.status === 'REJECTED') {
      decision = 'REJECTED'
    } else {
      decision = 'CHANGES_REQUESTED'
    }

    // Log to ReviewLog
    const reviewLog = new ReviewLog({
      entityType: 'THERAPIST',
      entityId: therapist._id.toString(),
      adminUserId: session.user.id,
      decision,
      notes: validated.notes,
    })

    await reviewLog.save()

    // Revalidate relevant paths
    revalidatePath('/admin/therapists')
    revalidatePath('/therapists')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Update therapist status error:', error)
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
