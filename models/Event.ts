import mongoose, { Schema, model, models } from 'mongoose'

export type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type LocationType = 'PHYSICAL' | 'ONLINE'

export interface EventDocument extends mongoose.Document {
  therapistId: mongoose.Types.ObjectId
  therapistName: string
  status: EventStatus
  featuredImageUrl: string
  title: string
  eventType: string
  eventDate: Date
  eventTime: string
  locationType: LocationType
  city?: string
  price?: string
  description: string
  registrationUrl: string
  createdAt: Date
  updatedAt: Date
}

const EventSchema = new Schema<EventDocument>(
  {
    therapistId: {
      type: Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true,
    },
    therapistName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      required: true,
      default: 'PENDING',
    },
    featuredImageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    locationType: {
      type: String,
      enum: ['PHYSICAL', 'ONLINE'],
      required: true,
    },
    city: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    registrationUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

EventSchema.index({ status: 1 })
EventSchema.index({ eventDate: 1 })

const Event = models.Event || model<EventDocument>('Event', EventSchema)

export default Event
