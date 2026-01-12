import { connectDB } from '@/lib/db'
import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify MongoDB connection
 * GET /api/test-db
 * Returns connection status and MongoDB connection state
 */
export async function GET(): Promise<NextResponse> {
  try {
    const mongoose = await connectDB()
    const connectionState = mongoose.connection.readyState

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

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        connectionState,
        stateMessage,
        databaseName: mongoose.connection.name,
        host: mongoose.connection.host,
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

