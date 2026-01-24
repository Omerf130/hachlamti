'use server'

import { connectDB } from '@/lib/db'
import {
  createTherapistSchema,
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
  { success: true; therapistId: string } | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return {
        success: false,
        error: 'עליך להיות מחובר כדי לשלוח בקשה',
      }
    }

    // Validate input
    const validated = createTherapistSchema.parse(input)

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

    // Create therapist with new schema fields
    const therapist = new Therapist({
      userId: new mongoose.Types.ObjectId(session.user.id),
      status: 'PENDING',
      fullName: validated.fullName,
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
      // Map Zod errors to user-friendly Hebrew messages
      const fieldErrors: Record<string, string> = {}
      const errorMessages: string[] = []
      
      error.errors.forEach((err) => {
        const field = err.path.join('.')
        const hebrewFieldNames: Record<string, string> = {
          'fullName': 'שם מלא',
          'phoneWhatsApp': 'טלפון',
          'treatmentSpecialties': 'התמחויות טיפוליות',
          'yearsExperience': 'שנות ניסיון',
          'professionalDescription': 'תיאור מקצועי',
          'healthIssues': 'בעיות בריאות',
          'languages': 'שפות',
          'geographicArea': 'אזור גיאוגרפי',
          'treatmentLocations': 'מקומות טיפול',
          'declarationAccurate': 'אישור דיוק',
          'declarationCertified': 'אישור הסמכה',
          'declarationTerms': 'אישור תנאי שימוש',
          'declarationConsent': 'אישור פרסום',
          'declarationResponsibility': 'אישור אחריות',
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
 * Server Action: Update therapist status (admin only)
 * Validates admin session, updates therapist status, upgrades user role on approval
 * Hard deletes on rejection
 */
export async function updateTherapistStatus(
  therapistId: string,
  status: 'APPROVED' | 'REJECTED'
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

    // Find therapist
    const therapist = await findOne(Therapist, { _id: new mongoose.Types.ObjectId(therapistId) })

    if (!therapist) {
      return {
        success: false,
        error: 'Therapist not found',
      }
    }

    // Handle rejection - hard delete
    if (status === 'REJECTED') {
      type TherapistDeleteOne = (filter: { _id: mongoose.Types.ObjectId }) => Promise<any>
      await (Therapist.deleteOne as unknown as TherapistDeleteOne)({ 
        _id: new mongoose.Types.ObjectId(therapistId) 
      })

      // Log rejection to ReviewLog before deletion
      const reviewLog = new ReviewLog({
        entityType: 'THERAPIST',
        entityId: therapist._id.toString(),
        adminUserId: session.user.id,
        decision: 'REJECTED',
        notes: 'Application rejected and deleted',
      })
      await reviewLog.save()

      // Revalidate paths
      revalidatePath('/admin/therapists')
      revalidatePath('/therapists')

      return {
        success: true,
      }
    }

    // Handle approval
    if (status === 'APPROVED') {
      // Update therapist status
      therapist.status = 'APPROVED'
      await therapist.save()

      // Upgrade user role from BASIC to THERAPIST
      const User = (await import('@/models/User')).default
      const user = await findOne(User, { _id: therapist.userId })
      
      if (user) {
        user.role = 'THERAPIST'
        await user.save()
      }

      // Log approval
      const reviewLog = new ReviewLog({
        entityType: 'THERAPIST',
        entityId: therapist._id.toString(),
        adminUserId: session.user.id,
        decision: 'APPROVED',
        notes: 'Application approved',
      })
      await reviewLog.save()

      // Revalidate paths
      revalidatePath('/admin/therapists')
      revalidatePath('/therapists')

      return {
        success: true,
      }
    }

    return {
      success: false,
      error: 'Invalid status',
    }
  } catch (error) {
    console.error('Update therapist status error:', error)
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
