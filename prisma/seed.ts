import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { normalizeDatabaseUrl } from '../lib/database-url'

// A developer's week across three demo calendars. Recurring rituals repeat every
// matching weekday; one-offs sit alongside them. A few deliberately overlap
// (Tue mornings, Mon afternoon) to exercise the side-by-side column layout.
const seedEvents = [
  { calendar: 'focus', day: '2026-08-10', duration: 45, recurrence: 'weekday', start: '08:30', title: 'Deep work: no meetings' },
  { calendar: 'team', day: '2026-08-10', duration: 15, recurrence: 'weekday', start: '09:15', title: 'Standup' },
  { calendar: 'personal', day: '2026-08-10', duration: 45, recurrence: 'weekday', start: '12:30', title: 'Lunch' },
  { calendar: 'team', day: '2026-08-10', duration: 60, recurrence: 'monday', start: '11:00', title: 'Sprint planning' },
  { calendar: 'team', day: '2026-08-12', duration: 45, recurrence: 'wednesday', start: '15:00', title: 'Backlog grooming' },
  { calendar: 'focus', day: '2026-08-13', duration: 60, recurrence: 'thursday', start: '16:00', title: 'Release: ship to prod' },
  { calendar: 'team', day: '2026-08-14', duration: 45, recurrence: 'friday', start: '15:30', title: 'Sprint retro' },
  { calendar: 'personal', day: '2026-08-16', duration: 45, recurrence: 'sunday', start: '17:00', title: 'Plan the week' },
  { calendar: 'personal', day: '2026-08-10', duration: 30, start: '13:00', title: '1:1 with Mira' },
  { calendar: 'focus', day: '2026-08-10', duration: 60, start: '13:15', title: 'PR review: auth refactor' },
  { calendar: 'personal', day: '2026-08-11', duration: 60, start: '10:30', title: 'Design review' },
  { calendar: 'focus', day: '2026-08-11', duration: 90, start: '10:45', title: 'Pairing: rate limiter' },
  { calendar: 'team', day: '2026-08-12', duration: 45, start: '13:00', title: 'Incident retro' },
  { calendar: 'focus', day: '2026-08-13', duration: 30, start: '09:45', title: 'Deploy: canary' },
  { calendar: 'personal', day: '2026-08-13', duration: 30, start: '15:00', title: 'Coffee with Sam' },
  { calendar: 'team', day: '2026-08-14', duration: 45, start: '11:00', title: 'Demo day' },
] as const

const demoCalendars = [
  { color: 'violet', key: 'focus', name: 'Focus' },
  { color: 'blue', key: 'team', name: 'Team' },
  { color: 'rose', key: 'personal', name: 'Personal' },
] as const

config({ path: '.env.local' })

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL!) }),
})

async function main() {
  await prisma.booking.deleteMany()
  await prisma.bookingPage.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.calendar.deleteMany()
  await prisma.user.deleteMany()

  const aurora = await prisma.user.create({ data: { handle: 'aurora', name: 'Aurora Scharff' } })

  const calendarIds: Record<string, string> = {}
  for (const calendar of demoCalendars) {
    const created = await prisma.calendar.create({
      data: { color: calendar.color, isDemo: true, name: calendar.name, userId: aurora.id },
    })
    calendarIds[calendar.key] = created.id
  }

  await prisma.calendarEvent.createMany({
    data: seedEvents.map((event) => ({
      calendarId: calendarIds[event.calendar],
      day: new Date(`${event.day}T00:00:00.000Z`),
      demo: true,
      duration: event.duration,
      recurrence: 'recurrence' in event ? event.recurrence : null,
      start: event.start,
      title: event.title,
      userId: aurora.id,
    })),
  })

  await prisma.bookingPage.create({
    data: {
      endTime: '16:00',
      handle: 'aurora',
      startTime: '09:30',
      title: 'A focused 30 minute conversation',
      userId: aurora.id,
    },
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
