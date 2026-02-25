import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Therapist from '@/models/Therapist'

/**
 * GET /api/therapists/search
 * Search for approved therapists by name
 * Query parameter: q (search term)
 * Returns: Array of { id, fullName } objects
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim() || ''

    // Return empty array if query is too short
    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        therapists: [],
      })
    }

    await connectDB()

    // Query with regex for "contains" matching (case-insensitive)
    // Using type assertion to handle Mongoose typing issues
    type TherapistFindType = (filter: any) => {
      select: (fields: any) => {
        limit: (n: number) => {
          exec: () => Promise<any[]>
        }
      }
    }
    
    const therapists = await (Therapist.find as unknown as TherapistFindType)({
      status: 'APPROVED',
      fullName: { $regex: query, $options: 'i' },
    })
      .select('fullName')
      .limit(10)
      .exec()

    return NextResponse.json({
      success: true,
      therapists: therapists.map((t: any) => ({
        id: t._id.toString(),
        fullName: t.fullName,
      })),
    })
  } catch (error) {
    console.error('Error searching therapists:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search therapists',
      },
      { status: 500 }
    )
  }
}

