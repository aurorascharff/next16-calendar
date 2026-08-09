'use server'

import { prisma } from '@/lib/db'
import { isDateKey } from '@/features/calendar/calendar-utils'

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

export async function bookSlot({
  day,
  guestName,
  handle,
  slot,
}: {
  day: string
  guestName: string
  handle: string
  slot: string
}) {
  if (!isDateKey(day) || !timePattern.test(slot)) {
    return { error: 'Choose a valid booking time.' }
  }

  const bookingPage = await prisma.bookingPage.findUnique({ where: { handle } })
  if (!bookingPage || !bookingPage.active) {
    return { error: 'This booking page is not available.' }
  }

  const startsAt = new Date(`${day}T${slot}:00.000Z`)
  try {
    await prisma.booking.create({
      data: {
        bookingPageId: bookingPage.id,
        guestName: guestName.trim() || 'Guest',
        startsAt,
      },
    })
  } catch {
    return { error: 'That time was just booked. Choose another slot.' }
  }

  return { data: { slot, startsAt } }
}
