import mongoose from 'mongoose'

/**
 * MongoDB connection singleton for Next.js App Router
 * Handles connection caching for serverless environments (Vercel)
 */

interface MongooseConnection {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}

// Cache connection to prevent multiple connections in serverless environment
declare global {
    var mongoose: MongooseConnection | undefined
}

const cached: MongooseConnection = global.mongoose || {
    conn: null,
    promise: null,
}

if (!global.mongoose) {
    global.mongoose = cached
}

/**
 * Connects to MongoDB Atlas using connection string from environment variable
 * Returns cached connection if already connected
 * @returns Mongoose connection instance
 * @throws Error if MONGODB_URI is not set or connection fails
 */
export async function connectDB(): Promise<typeof mongoose> {
    const MONGODB_URI = process.env.MONGODB_URI

    if (!MONGODB_URI) {
        throw new Error(
            'Please define MONGODB_URI environment variable inside .env.local'
        )
    }

    // Return cached connection if available
    if (cached.conn) {
        return cached.conn
    }

    // Return existing promise if connection is in progress
    if (cached.promise) {
        return cached.promise
    }

    // Create new connection promise
    cached.promise = mongoose
        .connect(MONGODB_URI, {
            bufferCommands: false,
        })
        .then((mongooseInstance: typeof mongoose) => {
            cached.conn = mongooseInstance
            return mongooseInstance
        })
        .catch((error: unknown) => {
            cached.promise = null
            throw error
        })

    return cached.promise
}

/**
 * Disconnects from MongoDB (useful for testing or cleanup)
 */
export async function disconnectDB(): Promise<void> {
    if (cached.conn) {
        await mongoose.disconnect()
        cached.conn = null
        cached.promise = null
    }
}

