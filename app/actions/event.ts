'use server'

import { connectDB } from '@/lib/db'
import Event from '@/models/Event'
import Therapist from '@/models/Therapist'
import ReviewLog from '@/models/ReviewLog'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import mongoose from 'mongoose'
import { findOne, deleteById } from '@/lib/mongoose-helpers'

interface CreateEventInput {
  featuredImageUrl: string
  title: string
  eventType: string
  eventDate: string
  eventTime: string
  locationType: 'PHYSICAL' | 'ONLINE'
  city?: string
  price?: string
  description: string
  registrationUrl: string
}

export async function createEvent(
  input: CreateEventInput
): Promise<{ success: true; eventId: string } | { success: false; error: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id || session.user.role !== 'THERAPIST') {
      return { success: false, error: 'עליך להיות מטפל מאושר כדי ליצור אירוע' }
    }

    if (!input.title || !input.eventType || !input.eventDate || !input.eventTime ||
        !input.locationType || !input.description || !input.registrationUrl || !input.featuredImageUrl) {
      return { success: false, error: 'אנא מלא את כל השדות הנדרשים' }
    }

    if (input.locationType === 'PHYSICAL' && !input.city) {
      return { success: false, error: 'אנא הזן עיר לאירוע פיזי' }
    }

    await connectDB()

    const therapist = await findOne(Therapist, {
      userId: new mongoose.Types.ObjectId(session.user.id),
      status: 'APPROVED',
    })

    if (!therapist) {
      return { success: false, error: 'לא נמצא פרופיל מטפל מאושר' }
    }

    const event = new Event({
      therapistId: therapist._id,
      therapistName: therapist.fullName,
      status: 'PENDING',
      featuredImageUrl: input.featuredImageUrl,
      title: input.title,
      eventType: input.eventType,
      eventDate: new Date(input.eventDate),
      eventTime: input.eventTime,
      locationType: input.locationType,
      city: input.locationType === 'PHYSICAL' ? input.city : undefined,
      price: input.price || undefined,
      description: input.description,
      registrationUrl: input.registrationUrl,
    })

    await event.save()

    revalidatePath('/my-events')
    revalidatePath('/admin/events')

    return { success: true, eventId: event._id.toString() }
  } catch (error) {
    console.error('Create event error:', error)
    return { success: false, error: 'שגיאה בלתי צפויה אירעה. אנא נסה שוב.' }
  }
}

export async function updateEventStatus(
  eventId: string,
  status: 'APPROVED' | 'REJECTED'
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Admin access required' }
    }

    await connectDB()

    const event = await findOne(Event, { _id: new mongoose.Types.ObjectId(eventId) })
    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    if (status === 'REJECTED') {
      await deleteById(Event, eventId)

      const reviewLog = new ReviewLog({
        entityType: 'EVENT',
        entityId: eventId,
        adminUserId: session.user.id,
        decision: 'REJECTED',
        notes: 'Event rejected and deleted',
      })
      await reviewLog.save()
    } else {
      event.status = 'APPROVED'
      await event.save()

      const reviewLog = new ReviewLog({
        entityType: 'EVENT',
        entityId: eventId,
        adminUserId: session.user.id,
        decision: 'APPROVED',
        notes: 'Event approved',
      })
      await reviewLog.save()
    }

    revalidatePath('/admin/events')
    revalidatePath('/events')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Update event status error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteEvent(
  eventId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectDB()

    const event = await findOne(Event, { _id: new mongoose.Types.ObjectId(eventId) })
    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    const isAdmin = session.user.role === 'ADMIN'
    const therapist = await findOne(Therapist, {
      userId: new mongoose.Types.ObjectId(session.user.id),
    })
    const isOwner = therapist && event.therapistId.toString() === therapist._id.toString()

    if (!isAdmin && !isOwner) {
      return { success: false, error: 'Unauthorized: You can only delete your own events' }
    }

    await deleteById(Event, eventId)

    revalidatePath('/my-events')
    revalidatePath('/events')
    revalidatePath('/admin/events')

    return { success: true }
  } catch (error) {
    console.error('Delete event error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
