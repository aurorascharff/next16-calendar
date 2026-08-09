import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';
import { normalizeDatabaseUrl } from '../lib/database-url';

const demoCalendars = [
  { color: 'violet', key: 'focus', name: 'Focus' },
  { color: 'blue', key: 'team', name: 'Team' },
  { color: 'rose', key: 'personal', name: 'Personal' },
] as const;

const demoEvents = [
  {
    allDay: false,
    calendar: 'focus',
    day: '2026-08-10',
    duration: 45,
    recurrence: 'weekday',
    start: '08:30',
    title: 'Deep work: no meetings',
  },
  {
    allDay: false,
    calendar: 'team',
    day: '2026-08-10',
    duration: 15,
    recurrence: 'weekday',
    start: '09:15',
    title: 'Standup',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-10',
    duration: 45,
    recurrence: 'weekday',
    start: '12:30',
    title: 'Lunch',
  },
  {
    allDay: false,
    calendar: 'team',
    day: '2026-08-10',
    duration: 60,
    recurrence: 'monday',
    start: '11:00',
    title: 'Sprint planning',
  },
  {
    allDay: false,
    calendar: 'team',
    day: '2026-08-12',
    duration: 45,
    recurrence: 'wednesday',
    start: '15:00',
    title: 'Backlog grooming',
  },
  {
    allDay: false,
    calendar: 'focus',
    day: '2026-08-13',
    duration: 60,
    recurrence: 'thursday',
    start: '16:00',
    title: 'Release: ship to prod',
  },
  {
    allDay: false,
    calendar: 'team',
    day: '2026-08-14',
    duration: 45,
    recurrence: 'friday',
    start: '15:30',
    title: 'Sprint retro',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-16',
    duration: 45,
    recurrence: 'sunday',
    start: '17:00',
    title: 'Plan the week',
  },
  {
    allDay: true,
    calendar: 'team',
    day: '2026-08-12',
    duration: 1440,
    recurrence: null,
    start: '00:00',
    title: 'Launch window',
  },
  {
    allDay: true,
    calendar: 'personal',
    day: '2026-08-15',
    duration: 1440,
    recurrence: null,
    start: '00:00',
    title: 'Offline day',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-10',
    duration: 30,
    recurrence: null,
    start: '13:00',
    title: '1:1 with Mira',
  },
  {
    allDay: false,
    calendar: 'focus',
    day: '2026-08-10',
    duration: 60,
    recurrence: null,
    start: '13:15',
    title: 'PR review: auth refactor',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-11',
    duration: 60,
    recurrence: null,
    start: '10:30',
    title: 'Design review',
  },
  {
    allDay: false,
    calendar: 'focus',
    day: '2026-08-11',
    duration: 90,
    recurrence: null,
    start: '10:45',
    title: 'Pairing: rate limiter',
  },
  {
    allDay: false,
    calendar: 'team',
    day: '2026-08-12',
    duration: 45,
    recurrence: null,
    start: '13:00',
    title: 'Incident retro',
  },
  {
    allDay: false,
    calendar: 'focus',
    day: '2026-08-13',
    duration: 30,
    recurrence: null,
    start: '09:45',
    title: 'Deploy: canary',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-13',
    duration: 30,
    recurrence: null,
    start: '15:00',
    title: 'Coffee with Sam',
  },
  {
    allDay: false,
    calendar: 'team',
    day: '2026-08-14',
    duration: 45,
    recurrence: null,
    start: '11:00',
    title: 'Demo day',
  },
] as const;

config({ path: '.env.local' });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL!) }),
});

async function main() {
  await prisma.booking.deleteMany();
  await prisma.bookingPage.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.calendar.deleteMany();
  await prisma.user.deleteMany();

  const calendarIds: Record<string, string> = {};
  for (const calendar of demoCalendars) {
    const created = await prisma.calendar.create({
      data: { color: calendar.color, isDemo: true, name: calendar.name, userId: null },
    });
    calendarIds[calendar.key] = created.id;
  }

  await prisma.calendarEvent.createMany({
    data: demoEvents.map(event => ({
      allDay: event.allDay,
      calendarId: calendarIds[event.calendar],
      day: new Date(`${event.day}T00:00:00.000Z`),
      demo: true,
      duration: event.duration,
      recurrence: event.recurrence,
      start: event.start,
      title: event.title,
      userId: null,
    })),
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async error => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
