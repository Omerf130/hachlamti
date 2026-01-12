'use server'

import { connectDB } from '@/lib/db'
import { createReportSchema } from '@/lib/validations/report'
import Report from '@/models/Report'
import { ZodError } from 'zod'

/**
 * Server Action: Create a new report
 * Validates input and creates report with OPEN status
 */
export async function createReport(
  input: unknown
): Promise<{ success: true; reportId: string } | { success: false; error: string }> {
  try {
    // Validate input
    const validated = createReportSchema.parse(input)

    // Connect to database
    await connectDB()

    // Create report
    const report = new Report({
      entityType: validated.entityType,
      entityId: validated.entityId,
      reason: validated.reason,
      details: validated.details,
      status: 'OPEN',
    })

    await report.save()

    return {
      success: true,
      reportId: report._id.toString(),
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

