import mongoose, { Schema, model, models } from 'mongoose'

/**
 * Therapist Status Enum
 */
export type TherapistStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

/**
 * Health Challenge (same structure as Story)
 */
export interface HealthChallenge {
  primary: string
  primaryOtherText?: string
  sub: string
  subOtherText?: string
}

/**
 * Certificate Document
 */
export interface Certificate {
  url: string // base64 encoded
  fileName?: string
}

/**
 * Profession Info
 */
export interface Profession {
  value: string
  otherText?: string
}

/**
 * Location Info
 */
export interface Location {
  city: string
  activityHours?: string
  zoom: boolean
}

/**
 * Special Services (for filtering)
 */
export interface SpecialServices {
  onlineTreatment: boolean
  homeVisits: boolean
  accessibleClinic: boolean
  languages: string[]
  languagesOtherText?: string
}

/**
 * Contact Details
 */
export interface Contacts {
  displayPhone?: string
  bookingPhone?: string
  websiteUrl?: string
  email: string
}

/**
 * Therapist Document Interface
 */
export interface TherapistDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  status: TherapistStatus

  // Basic Info
  fullName: string
  profileImageUrl: string // base64 encoded
  logoImageUrl?: string // base64 encoded, optional

  // Profession
  profession: Profession

  // Location & Activity
  location: Location

  // Education & Credentials
  educationText?: string
  certificates: Certificate[] // max 10

  // Special Services (for filtering)
  specialServices: SpecialServices

  // Professional Info
  credoAndSpecialty: string // "אני מאמין"

  // Treated Conditions (multiple selections with same cascading structure as Story)
  treatedConditions: HealthChallenge[] // min 1

  // Approach & Story
  approachDescription: string // therapeutic approach (required)
  inspirationStory?: string // optional short story

  // Contact Details (to display on site)
  contacts: Contacts

  // Consent
  consentJoin: boolean // required true

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
    },

    // Basic Info
    fullName: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      required: true,
    },
    logoImageUrl: {
      type: String,
      required: false,
    },

    // Profession
    profession: {
      value: {
        type: String,
        required: true,
      },
      otherText: {
        type: String,
        required: false,
      },
    },

    // Location & Activity
    location: {
      city: {
        type: String,
        required: true,
      },
      activityHours: {
        type: String,
        required: false,
      },
      zoom: {
        type: Boolean,
        required: true,
        default: false,
      },
    },

    // Education & Credentials
    educationText: {
      type: String,
      required: false,
    },
    certificates: [
      {
        url: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: false,
        },
      },
    ],

    // Special Services
    specialServices: {
      onlineTreatment: {
        type: Boolean,
        required: true,
        default: false,
      },
      homeVisits: {
        type: Boolean,
        required: true,
        default: false,
      },
      accessibleClinic: {
        type: Boolean,
        required: true,
        default: false,
      },
      languages: {
        type: [String],
        required: true,
        default: [],
      },
      languagesOtherText: {
        type: String,
        required: false,
      },
    },

    // Professional Info
    credoAndSpecialty: {
      type: String,
      required: true,
    },

    // Treated Conditions
    treatedConditions: [
      {
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
    ],

    // Approach & Story
    approachDescription: {
      type: String,
      required: true,
    },
    inspirationStory: {
      type: String,
      required: false,
    },

    // Contact Details
    contacts: {
      displayPhone: {
        type: String,
        required: false,
      },
      bookingPhone: {
        type: String,
        required: false,
      },
      websiteUrl: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: true,
      },
    },

    // Consent
    consentJoin: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes
TherapistSchema.index({ status: 1 })
TherapistSchema.index({ 'profession.value': 1 })
TherapistSchema.index({ 'location.city': 1 })
TherapistSchema.index({ 'treatedConditions.primary': 1 })

// Prevent model recompilation in development
const Therapist =
  models.Therapist || model<TherapistDocument>('Therapist', TherapistSchema)

export default Therapist
