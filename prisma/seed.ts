import { config } from 'dotenv'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../generated/prisma/client'

// A developer's week. Recurring rituals (standup, focus, ceremonies) are the
// demo backbone — they exist every matching weekday and can't be deleted, only
// rescheduled. One-off events are fully editable. A few deliberately overlap
// (Tue mornings, Mon afternoon) to exercise the side-by-side column layout.
const seedEvents = [
  // Daily rituals (recurring, Mon–Fri)
  { calendar: 'focus', color: 'violet', day: '2026-08-10', duration: 45, id: 'morning-focus', recurrence: 'weekday', start: '08:30', title: 'Deep work: no meetings' },
  { calendar: 'team', color: 'blue', day: '2026-08-10', duration: 15, id: 'daily-standup', recurrence: 'weekday', start: '09:15', title: 'Standup' },
  { calendar: 'personal', color: 'amber', day: '2026-08-10', duration: 45, id: 'lunch', recurrence: 'weekday', start: '12:30', title: 'Lunch' },

  // Weekly ceremonies (recurring)
  { calendar: 'team', color: 'blue', day: '2026-08-10', duration: 60, id: 'sprint-planning', recurrence: 'monday', start: '11:00', title: 'Sprint planning' },
  { calendar: 'team', color: 'blue', day: '2026-08-12', duration: 45, id: 'backlog-grooming', recurrence: 'wednesday', start: '15:00', title: 'Backlog grooming' },
  { calendar: 'focus', color: 'violet', day: '2026-08-13', duration: 60, id: 'release-window', recurrence: 'thursday', start: '16:00', title: 'Release: ship to prod' },
  { calendar: 'team', color: 'blue', day: '2026-08-14', duration: 45, id: 'sprint-retro', recurrence: 'friday', start: '15:30', title: 'Sprint retro' },
  { calendar: 'personal', color: 'rose', day: '2026-08-16', duration: 45, id: 'plan-the-week', recurrence: 'sunday', start: '17:00', title: 'Plan the week' },

  // One-off events (editable + deletable)
  { calendar: 'personal', color: 'rose', day: '2026-08-10', duration: 30, id: 'one-on-one-mira', start: '13:00', title: '1:1 with Mira' },
  { calendar: 'focus', color: 'violet', day: '2026-08-10', duration: 60, id: 'pr-review', start: '13:15', title: 'PR review: auth refactor' },
  { calendar: 'personal', color: 'rose', day: '2026-08-11', duration: 60, id: 'design-review', start: '10:30', title: 'Design review' },
  { calendar: 'focus', color: 'violet', day: '2026-08-11', duration: 90, id: 'pairing-session', start: '10:45', title: 'Pairing: rate limiter' },
  { calendar: 'team', color: 'amber', day: '2026-08-12', duration: 45, id: 'incident-retro', start: '13:00', title: 'Incident retro' },
  { calendar: 'focus', color: 'violet', day: '2026-08-13', duration: 30, id: 'deploy-window', start: '09:45', title: 'Deploy: canary' },
  { calendar: 'personal', color: 'amber', day: '2026-08-13', duration: 30, id: 'coffee-with-sam', start: '15:00', title: 'Coffee with Sam' },
  { calendar: 'team', color: 'blue', day: '2026-08-14', duration: 45, id: 'demo-day', start: '11:00', title: 'Demo day' },
]

config({ path: '.env.local' })

const url = process.env.DATABASE_URL ?? 'file:./prisma/pace.db'
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: url.replace(/^file:/, '') }),
})

async function main() {
  await prisma.booking.deleteMany()
  await prisma.bookingPage.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.user.deleteMany()

  const aurora = await prisma.user.create({
    data: { handle: 'aurora', name: 'Aurora Scharff' },
  })

  await prisma.calendarEvent.createMany({
    data: seedEvents.map((event) => ({
      ...event,
      day: new Date(`${event.day}T00:00:00.000Z`),
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
