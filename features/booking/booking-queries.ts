import 'server-only'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export async function getBookingProfile(handle: string) {
  const bookingPage = await prisma.bookingPage.findUnique({
    include: { user: { select: { handle: true, name: true } } },
    where: { handle },
  })

  if (!bookingPage || !bookingPage.active) notFound()

  return {
    duration: bookingPage.duration,
    endTime: bookingPage.endTime,
    handle: bookingPage.handle,
    name: bookingPage.user.name,
    startTime: bookingPage.startTime,
    title: bookingPage.title,
  }
}
