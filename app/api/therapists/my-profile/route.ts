import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Therapist from '@/models/Therapist'
import mongoose from 'mongoose'

/**
 * GET /api/therapists/my-profile
 * Returns the therapist profile ID for the currently logged-in user
 * Only returns ID if therapist status is 'APPROVED'
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has THERAPIST role
    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { success: false, error: 'User is not a therapist' },
        { status: 403 }
      )
    }

    await connectDB()

    // Find therapist by userId with APPROVED status
    // Using type assertion to handle Mongoose typing issues
    type TherapistFindOneType = (filter: any) => {
      select: (fields: any) => {
        exec: () => Promise<any>
      }
    }

    const therapist = await (Therapist.findOne as unknown as TherapistFindOneType)({
      userId: new mongoose.Types.ObjectId(session.user.id),
      status: 'APPROVED',
    })
      .select('_id')
      .exec()

    if (!therapist) {
      return NextResponse.json(
        { success: false, error: 'Therapist profile not found or not approved' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      therapistId: therapist._id.toString(),
    })
  } catch (error) {
    console.error('Error fetching therapist profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch therapist profile',
      },
      { status: 500 }
    )
  }
}

