import { connectDB } from '@/lib/db'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

/**
 * Test endpoint to verify MongoDB connection
 * GET /api/test-db
 * Returns connection status and MongoDB connection state
 */
export async function GET(): Promise<NextResponse> {
  try {
    const mongooseInstance = await connectDB()
    const connectionState = mongooseInstance.connection.readyState

    // MongoDB connection states:
    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting

    const stateMessages: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }

    const stateMessage = stateMessages[connectionState] || 'unknown'

    // Test User model
    await import('@/models/User')
    const UserModel = mongoose.models.User
    const userCount = UserModel ? await UserModel.countDocuments() : 'Model not loaded'

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        connectionState,
        stateMessage,
        databaseName: mongooseInstance.connection.name,
        host: mongooseInstance.connection.host,
        userModelLoaded: !!UserModel,
        userCount,
        models: Object.keys(mongoose.models),
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

