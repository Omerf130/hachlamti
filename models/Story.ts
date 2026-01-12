import mongoose, { Schema, model, models } from 'mongoose'

/**
 * Story Status Enum
 */
export type StoryStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'INTERNAL_ONLY'
  | 'ARCHIVED'

/**
 * Privacy Level Enum
 */
export type PrivacyLevel =
  | 'FULL_NAME'
  | 'FIRST_NAME_LAST_INITIAL'
  | 'ANONYMOUS'
  | 'INTERNAL_ONLY'

/**
 * Story Document Interface
 */
export interface StoryDocument extends mongoose.Document {
  status: StoryStatus
  privacyLevel: PrivacyLevel
  submitterName?: string
  displayName: string
  medicalCondition: string
  treatmentCategory: string
  treatmentProcess: string
  duration?: string
  outcome?: string
  therapistId?: mongoose.Types.ObjectId
  therapistDisplayName?: string
  therapistNameRaw?: string
  media?: Record<string, unknown>
  transcript?: string
  submittedAt: Date
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Story Schema
 */
const StorySchema = new Schema<StoryDocument>(
  {
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_REVIEW',
        'PUBLISHED',
        'REJECTED',
        'INTERNAL_ONLY',
        'ARCHIVED',
      ],
      required: true,
      default: 'DRAFT',
      index: true,
    },
    privacyLevel: {
      type: String,
      enum: ['FULL_NAME', 'FIRST_NAME_LAST_INITIAL', 'ANONYMOUS', 'INTERNAL_ONLY'],
      required: true,
    },
    submitterName: {
      type: String,
      required: false,
    },
    displayName: {
      type: String,
      required: true,
    },
    medicalCondition: {
      type: String,
      required: true,
      index: true,
    },
    treatmentCategory: {
      type: String,
      required: true,
      index: true,
    },
    treatmentProcess: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: false,
    },
    outcome: {
      type: String,
      required: false,
    },
    therapistId: {
      type: Schema.Types.ObjectId,
      ref: 'Therapist',
      required: false,
      index: true,
    },
    therapistDisplayName: {
      type: String,
      required: false,
    },
    therapistNameRaw: {
      type: String,
      required: false,
    },
    media: {
      type: Schema.Types.Mixed,
      required: false,
    },
    transcript: {
      type: String,
      required: false,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    publishedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes
StorySchema.index({ status: 1 })
StorySchema.index({ medicalCondition: 1 })
StorySchema.index({ treatmentCategory: 1 })
StorySchema.index({ submittedAt: 1 })
StorySchema.index({ therapistId: 1 })

// Prevent model recompilation in development
const Story = models.Story || model<StoryDocument>('Story', StorySchema)

export default Story

