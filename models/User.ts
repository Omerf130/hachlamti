import mongoose, { Schema, model, models } from 'mongoose'

/**
 * User Role Enum
 */
export type UserRole = 'user' | 'admin'

/**
 * User Document Interface
 */
export interface UserDocument extends mongoose.Document {
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

/**
 * User Schema
 */
const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      default: 'user',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const User = models.User || model<UserDocument>('User', UserSchema)

export default User

