import mongoose, { Schema, model, models } from 'mongoose'

/**
 * Review Log Entity Type Enum
 */
export type ReviewLogEntityType = 'STORY' | 'THERAPIST'

/**
 * Review Decision Enum
 */
export type ReviewDecision = 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'

/**
 * ReviewLog Document Interface
 */
export interface ReviewLogDocument extends mongoose.Document {
  entityType: ReviewLogEntityType
  entityId: string
  adminUserId: string
  decision: ReviewDecision
  notes?: string
  createdAt: Date
}

/**
 * ReviewLog Schema
 */
const ReviewLogSchema = new Schema<ReviewLogDocument>(
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
    adminUserId: {
      type: String,
      required: true,
    },
    decision: {
      type: String,
      enum: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
)

// Prevent model recompilation in development
const ReviewLog =
  models.ReviewLog || model<ReviewLogDocument>('ReviewLog', ReviewLogSchema)

export default ReviewLog

