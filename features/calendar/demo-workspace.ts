import type { PrismaClient } from '../../generated/prisma/client'

const demoCalendars = [
  { color: 'violet', key: 'focus', name: 'Focus' },
  { color: 'blue', key: 'team', name: 'Team' },
  { color: 'rose', key: 'personal', name: 'Personal' },
] as const

const demoEvents = [
  { calendar: 'focus', day: '2026-08-10', duration: 45, recurrence: 'weekday', start: '08:30', title: 'Deep work: no meetings' },
  { calendar: 'team', day: '2026-08-10', duration: 15, recurrence: 'weekday', start: '09:15', title: 'Standup' },
  { calendar: 'personal', day: '2026-08-10', duration: 45, recurrence: 'weekday', start: '12:30', title: 'Lunch' },
  { calendar: 'team', day: '2026-08-10', duration: 60, recurrence: 'monday', start: '11:00', title: 'Sprint planning' },
  { calendar: 'team', day: '2026-08-12', duration: 45, recurrence: 'wednesday', start: '15:00', title: 'Backlog grooming' },
  { calendar: 'focus', day: '2026-08-13', duration: 60, recurrence: 'thursday', start: '16:00', title: 'Release: ship to prod' },
  { calendar: 'team', day: '2026-08-14', duration: 45, recurrence: 'friday', start: '15:30', title: 'Sprint retro' },
  { calendar: 'personal', day: '2026-08-16', duration: 45, recurrence: 'sunday', start: '17:00', title: 'Plan the week' },
  { allDay: true, calendar: 'team', day: '2026-08-12', duration: 1440, recurrence: null, start: '00:00', title: 'Launch window' },
  { allDay: true, calendar: 'personal', day: '2026-08-15', duration: 1440, recurrence: null, start: '00:00', title: 'Offline day' },
  { calendar: 'personal', day: '2026-08-10', duration: 30, recurrence: null, start: '13:00', title: '1:1 with Mira' },
  { calendar: 'focus', day: '2026-08-10', duration: 60, recurrence: null, start: '13:15', title: 'PR review: auth refactor' },
  { calendar: 'personal', day: '2026-08-11', duration: 60, recurrence: null, start: '10:30', title: 'Design review' },
  { calendar: 'focus', day: '2026-08-11', duration: 90, recurrence: null, start: '10:45', title: 'Pairing: rate limiter' },
  { calendar: 'team', day: '2026-08-12', duration: 45, recurrence: null, start: '13:00', title: 'Incident retro' },
  { calendar: 'focus', day: '2026-08-13', duration: 30, recurrence: null, start: '09:45', title: 'Deploy: canary' },
  { calendar: 'personal', day: '2026-08-13', duration: 30, recurrence: null, start: '15:00', title: 'Coffee with Sam' },
  { calendar: 'team', day: '2026-08-14', duration: 45, recurrence: null, start: '11:00', title: 'Demo day' },
] as const

export async function createDemoWorkspace(prisma: PrismaClient, userId: string, handle: string) {
  const calendarIds: Record<string, string> = {}
  for (const calendar of demoCalendars) {
    const created = await prisma.calendar.create({
      data: { color: calendar.color, isDemo: true, name: calendar.name, userId },
    })
    calendarIds[calendar.key] = created.id
  }

  await prisma.calendarEvent.createMany({
    data: demoEvents.map((event) => ({
      calendarId: calendarIds[event.calendar],
      allDay: 'allDay' in event ? event.allDay : false,
      day: new Date(`${event.day}T00:00:00.000Z`),
      demo: true,
      duration: event.duration,
      recurrence: event.recurrence,
      start: event.start,
      title: event.title,
      userId,
    })),
  })

  await prisma.bookingPage.create({
    data: { endTime: '16:00', handle, startTime: '09:30', title: 'A focused 30 minute conversation', userId },
  })
}
