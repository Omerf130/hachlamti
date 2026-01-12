import mongoose, { Schema, model, models } from 'mongoose'

/**
 * Report Entity Type Enum
 */
export type ReportEntityType = 'STORY' | 'THERAPIST'

/**
 * Report Status Enum
 */
export type ReportStatus = 'OPEN' | 'REVIEWING' | 'CLOSED'

/**
 * Report Document Interface
 */
export interface ReportDocument extends mongoose.Document {
  entityType: ReportEntityType
  entityId: string
  reason: string
  details?: string
  status: ReportStatus
  createdAt: Date
  updatedAt: Date
}

/**
 * Report Schema
 */
const ReportSchema = new Schema<ReportDocument>(
  {
    entityType: {
      type: String,
      enum: ['STORY', 'THERAPIST'],
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['OPEN', 'REVIEWING', 'CLOSED'],
      required: true,
      default: 'OPEN',
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const Report = models.Report || model<ReportDocument>('Report', ReportSchema)

export default Report

