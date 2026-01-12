import mongoose, { Schema, model, models } from 'mongoose'

/**
 * Therapist Status Enum
 */
export type TherapistStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

/**
 * Therapist Document Interface
 */
export interface TherapistDocument extends mongoose.Document {
  status: TherapistStatus
  fullName: string
  email?: string
  phone?: string
  specialties: string[]
  languages: string[]
  targetAudiences: string[]
  locations: string[]
  treatmentApproach?: string
  yearsExperience?: number
  education?: string
  certifications?: Record<string, unknown>
  availability?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

/**
 * Therapist Schema
 */
const TherapistSchema = new Schema<TherapistDocument>(
  {
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      required: true,
      default: 'PENDING',
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    specialties: {
      type: [String],
      required: true,
      default: [],
    },
    languages: {
      type: [String],
      required: true,
      default: [],
    },
    targetAudiences: {
      type: [String],
      required: true,
      default: [],
    },
    locations: {
      type: [String],
      required: true,
      default: [],
      index: true,
    },
    treatmentApproach: {
      type: String,
      required: false,
    },
    yearsExperience: {
      type: Number,
      required: false,
    },
    education: {
      type: String,
      required: false,
    },
    certifications: {
      type: Schema.Types.Mixed,
      required: false,
    },
    availability: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes
TherapistSchema.index({ status: 1 })
TherapistSchema.index({ locations: 1 })
TherapistSchema.index({ specialties: 1 })

// Prevent model recompilation in development
const Therapist =
  models.Therapist || model<TherapistDocument>('Therapist', TherapistSchema)

export default Therapist

