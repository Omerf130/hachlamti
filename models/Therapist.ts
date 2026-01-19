import mongoose, { Schema, model, models } from 'mongoose'

/**
 * Therapist Status Enum
 */
export type TherapistStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

/**
 * Treatment Location Type
 */
export type TreatmentLocationType = 'FIXED_CLINIC' | 'HOME_VISITS' | 'REMOTE' | 'COMBINATION'

/**
 * Health Issue Option
 */
export type HealthIssue = 'BACK_PAIN' | 'ANXIETY' | 'DIGESTIVE_ISSUES' | 'PTSD' | 'DIABETES' | 'OTHER'

/**
 * Language Option
 */
export type Language = 'HEBREW' | 'ENGLISH' | 'RUSSIAN' | 'ARABIC' | 'FRENCH' | 'OTHER'

/**
 * Weekly Session Time
 */
export interface SessionTime {
  from: string // HH:MM format
  to: string // HH:MM format
}

/**
 * Day Schedule
 */
export interface DaySchedule {
  sessionA?: SessionTime
  sessionB?: SessionTime
}

/**
 * Weekly Availability
 */
export interface WeeklyAvailability {
  sunday?: DaySchedule
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  saturday?: DaySchedule
}

/**
 * External Links
 */
export interface ExternalLinks {
  website?: string
  facebook?: string
  instagram?: string
}

/**
 * Therapist Document Interface
 */
export interface TherapistDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  status: TherapistStatus
  
  // A. Personal & Professional Details
  fullName: string
  email: string
  phoneWhatsApp: string
  treatmentSpecialties: string[] // free text/tags
  yearsExperience: number
  
  // B. Professional Profile
  professionalDescription: string
  healthIssues: string[] // includes predefined + "other" text
  languages: string[] // includes predefined + "other" text
  geographicArea: string
  clinicAddress?: string
  treatmentLocations: TreatmentLocationType[]
  
  // C. Availability
  availability: WeeklyAvailability
  
  // D. External Links
  externalLinks?: ExternalLinks
  
  // E. Declarations (boolean flags - all must be true to submit)
  declarationAccurate: boolean
  declarationCertified: boolean
  declarationTerms: boolean
  declarationConsent: boolean
  declarationResponsibility: boolean
  
  // F. Additional Notes
  additionalNotes?: string
  
  createdAt: Date
  updatedAt: Date
}

/**
 * Therapist Schema
 */
const TherapistSchema = new Schema<TherapistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      required: true,
      default: 'PENDING',
      index: true,
    },
    
    // A. Personal & Professional Details
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneWhatsApp: {
      type: String,
      required: true,
    },
    treatmentSpecialties: {
      type: [String],
      required: true,
      default: [],
    },
    yearsExperience: {
      type: Number,
      required: true,
    },
    
    // B. Professional Profile
    professionalDescription: {
      type: String,
      required: true,
    },
    healthIssues: {
      type: [String],
      required: true,
      default: [],
    },
    languages: {
      type: [String],
      required: true,
      default: [],
    },
    geographicArea: {
      type: String,
      required: true,
      index: true,
    },
    clinicAddress: {
      type: String,
      required: false,
    },
    treatmentLocations: {
      type: [String],
      required: true,
      default: [],
    },
    
    // C. Availability
    availability: {
      type: Schema.Types.Mixed,
      required: true,
    },
    
    // D. External Links
    externalLinks: {
      website: { type: String, required: false },
      facebook: { type: String, required: false },
      instagram: { type: String, required: false },
    },
    
    // E. Declarations
    declarationAccurate: {
      type: Boolean,
      required: true,
    },
    declarationCertified: {
      type: Boolean,
      required: true,
    },
    declarationTerms: {
      type: Boolean,
      required: true,
    },
    declarationConsent: {
      type: Boolean,
      required: true,
    },
    declarationResponsibility: {
      type: Boolean,
      required: true,
    },
    
    // G. Additional Notes
    additionalNotes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes
TherapistSchema.index({ status: 1 })
TherapistSchema.index({ geographicArea: 1 })
TherapistSchema.index({ treatmentSpecialties: 1 })
TherapistSchema.index({ healthIssues: 1 })

// Prevent model recompilation in development
const Therapist =
  models.Therapist || model<TherapistDocument>('Therapist', TherapistSchema)

export default Therapist
