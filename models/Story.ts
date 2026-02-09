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
 * Publication Privacy Choice
 */
export type PublicationChoice = 'FULL_NAME' | 'FIRST_NAME_ONLY' | 'ANONYMOUS'

/**
 * Health Challenge
 */
export interface HealthChallenge {
  primary: string
  primaryOtherText?: string
  sub: string
  subOtherText?: string
}

/**
 * Story Document Interface
 */
export interface StoryDocument extends mongoose.Document {
  authorUserId: mongoose.Types.ObjectId
  status: StoryStatus
  
  // A. Personal Details (For Contact Purposes Only)
  submitterFullName: string
  submitterPhone: string
  submissionDate: Date
  mayContact: boolean
  allowWhatsAppContact: boolean
  publicationChoice: PublicationChoice
  
  // A2. Health Challenge
  healthChallenge: HealthChallenge
  
  // B. Story Content
  title: string
  problem: string // The medical condition
  previousAttempts: string // What was tried before
  solution: string // Type of treatment, description, duration, experience
  results: string // Current condition
  messageToOthers: string // Message to someone going through this
  freeTextStory?: string // Alternative: full story written freely
  
  // C. Declarations (boolean flags - all must be true to submit)
  declarationTruthful: boolean
  declarationConsent: boolean
  declarationNotMedicalAdvice: boolean
  declarationEditingConsent: boolean
  
  // Computed display name based on publicationChoice
  displayName: string
  
  // Dates
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
    authorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
      default: 'PUBLISHED',
    },
    
    // A. Personal Details
    submitterFullName: {
      type: String,
      required: true,
    },
    submitterPhone: {
      type: String,
      required: true,
    },
    submissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mayContact: {
      type: Boolean,
      required: true,
    },
    allowWhatsAppContact: {
      type: Boolean,
      required: true,
      default: false,
    },
    publicationChoice: {
      type: String,
      enum: ['FULL_NAME', 'FIRST_NAME_ONLY', 'ANONYMOUS'],
      required: true,
    },
    
    // A2. Health Challenge
    healthChallenge: {
      type: {
        primary: {
          type: String,
          required: true,
        },
        primaryOtherText: {
          type: String,
          required: false,
        },
        sub: {
          type: String,
          required: true,
        },
        subOtherText: {
          type: String,
          required: false,
        },
      },
      required: true,
      _id: false,
    },
    
    // B. Story Content
    title: {
      type: String,
      required: true,
    },
    problem: {
      type: String,
      required: true,
    },
    previousAttempts: {
      type: String,
      required: true,
    },
    solution: {
      type: String,
      required: true,
    },
    results: {
      type: String,
      required: true,
    },
    messageToOthers: {
      type: String,
      required: true,
    },
    freeTextStory: {
      type: String,
      required: false,
    },
    
    // C. Declarations
    declarationTruthful: {
      type: Boolean,
      required: true,
    },
    declarationConsent: {
      type: Boolean,
      required: true,
    },
    declarationNotMedicalAdvice: {
      type: Boolean,
      required: true,
    },
    declarationEditingConsent: {
      type: Boolean,
      required: true,
    },
    
    // Computed display name
    displayName: {
      type: String,
      required: true,
    },
    
    // Dates
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
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
StorySchema.index({ problem: 1 })
StorySchema.index({ submittedAt: 1 })
StorySchema.index({ publishedAt: 1 })

// Prevent model recompilation in development
const Story = models.Story || model<StoryDocument>('Story', StorySchema)

export default Story

