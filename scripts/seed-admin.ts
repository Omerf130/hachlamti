import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

config()

const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = 'admin123!'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['BASIC', 'THERAPIST', 'ADMIN'], required: true, default: 'BASIC' },
}, { timestamps: true })

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set in .env')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  const User = mongoose.models.User || mongoose.model('User', UserSchema)

  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log(`Admin user (${ADMIN_EMAIL}) already exists with id: ${existing._id}`)
    await mongoose.disconnect()
    return
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const admin = await User.create({
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'ADMIN',
  })

  console.log(`Admin user created successfully!`)
  console.log(`  Email: ${ADMIN_EMAIL}`)
  console.log(`  ID:    ${admin._id}`)

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
