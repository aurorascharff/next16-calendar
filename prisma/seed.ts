import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';
import { normalizeDatabaseUrl } from '../lib/database-url';

// The demo events below are authored against this Monday-start week; seeding shifts them
// by whole weeks onto the current week so the calendar always opens on populated days.
const anchorWeekMonday = '2026-08-10';

const demoCalendars = [
  { color: 'blue', key: 'work', name: 'Work' },
  { color: 'cyan', key: 'personal', name: 'Personal' },
  { color: 'violet', key: 'side-project', name: 'Side project' },
] as const;

type DemoEvent = {
  allDay: boolean;
  calendar: (typeof demoCalendars)[number]['key'];
  day: string;
  description: string;
  duration: number;
  recurrence: string | null;
  start: string;
  title: string;
};

const demoEvents = [
  {
    allDay: false,
    calendar: 'work',
    day: '2026-08-10',
    description: 'Protected time for the highest-priority engineering task.',
    duration: 90,
    recurrence: 'weekday',
    start: '08:30',
    title: 'Focus time',
  },
  {
    allDay: false,
    calendar: 'work',
    day: '2026-08-10',
    description: 'Daily team updates and blockers.',
    duration: 15,
    recurrence: 'weekday',
    start: '10:15',
    title: 'Stand-up',
  },
  {
    allDay: false,
    calendar: 'work',
    day: '2026-08-10',
    description: 'Confirm the release scope, owners, risks, and rollout plan.',
    duration: 60,
    recurrence: null,
    start: '11:00',
    title: 'Release planning',
  },
  {
    allDay: false,
    calendar: 'work',
    day: '2026-08-11',
    description: 'Work through the cache invalidation changes together.',
    duration: 90,
    recurrence: null,
    start: '10:45',
    title: 'Pair on API caching',
  },
  {
    allDay: false,
    calendar: 'work',
    day: '2026-08-12',
    description: 'Tighten the onboarding flow before it reaches implementation.',
    duration: 60,
    recurrence: null,
    start: '13:30',
    title: 'Onboarding design crit',
  },
  {
    allDay: false,
    calendar: 'work',
    day: '2026-08-13',
    description: 'Walk through monitoring, rollback, support, and the final release checklist.',
    duration: 45,
    recurrence: null,
    start: '15:00',
    title: 'Production readiness review',
  },
  {
    allDay: false,
    calendar: 'work',
    day: '2026-08-14',
    description: 'Deploy the release and watch the first production signals.',
    duration: 60,
    recurrence: null,
    start: '14:00',
    title: 'Release window',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-11',
    description: 'Easy loop before notifications and meetings begin.',
    duration: 45,
    recurrence: 'tuesday',
    start: '07:00',
    title: 'Run before stand-up',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-12',
    description: 'Strength session after work.',
    duration: 60,
    recurrence: null,
    start: '18:00',
    title: 'Gym',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-14',
    description: 'Dinner reservation at the place by the river.',
    duration: 120,
    recurrence: null,
    start: '19:00',
    title: 'Dinner with friends',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-15',
    description: 'Take the long route through the park.',
    duration: 90,
    recurrence: 'saturday',
    start: '11:00',
    title: 'Long walk',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-16',
    description: 'Review the week ahead and plan meals.',
    duration: 45,
    recurrence: 'sunday',
    start: '17:00',
    title: 'Weekly reset',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-10',
    description: 'Submit last month’s travel and equipment receipts.',
    duration: 15,
    recurrence: null,
    start: '16:30',
    title: 'Submit expenses',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-12',
    description: 'Call and schedule the next check-up.',
    duration: 15,
    recurrence: null,
    start: '16:45',
    title: 'Book dentist appointment',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-14',
    description: 'Put the recycling by the door before dinner.',
    duration: 15,
    recurrence: 'friday',
    start: '17:30',
    title: 'Take out recycling',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-16',
    description: 'Water the plants before leaving for the day.',
    duration: 15,
    recurrence: 'sunday',
    start: '10:00',
    title: 'Water plants',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-13',
    description: 'Try the noodle place that just opened around the corner.',
    duration: 90,
    recurrence: null,
    start: '18:30',
    title: 'Noodles with Mira',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-11',
    description: 'Keep one evening reserved for building and shipping the side project.',
    duration: 90,
    recurrence: 'tuesday',
    start: '19:00',
    title: 'Side project build session',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-12',
    description: 'Explain what changed, why it matters, and what comes next.',
    duration: 60,
    recurrence: null,
    start: '19:30',
    title: 'Write the v0.4 release post',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-13',
    description: 'Record the short walkthrough for launch day.',
    duration: 60,
    recurrence: null,
    start: '20:00',
    title: 'Record the launch demo',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-15',
    description: 'Publish the release and verify the production deployment.',
    duration: 90,
    recurrence: null,
    start: '13:00',
    title: 'Ship v0.4',
  },
  {
    allDay: true,
    calendar: 'work',
    day: '2026-08-14',
    description: 'The team release is scheduled for today.',
    duration: 1440,
    recurrence: null,
    start: '00:00',
    title: 'Release day',
  },
  {
    allDay: true,
    calendar: 'side-project',
    day: '2026-08-14',
    description: 'Final launch preparation for the side project.',
    duration: 1440,
    recurrence: null,
    start: '00:00',
    title: 'v0.4 launch prep',
  },
  {
    allDay: true,
    calendar: 'personal',
    day: '2026-08-15',
    description: 'Keep the afternoon clear after the side-project launch.',
    duration: 1440,
    recurrence: null,
    start: '00:00',
    title: 'Offline afternoon',
  },
] satisfies DemoEvent[];

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDay(day: string) {
  return new Date(`${day}T00:00:00.000Z`);
}

function currentWeekMonday() {
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday;
}

function shiftToCurrentWeek(day: string, weekMonday: Date) {
  const offset = Math.round((utcDay(day).getTime() - utcDay(anchorWeekMonday).getTime()) / DAY_MS);
  const shifted = new Date(weekMonday);
  shifted.setUTCDate(shifted.getUTCDate() + offset);
  return shifted;
}

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

  const weekMonday = currentWeekMonday();

  await prisma.calendarEvent.createMany({
    data: demoEvents.map(event => ({
      allDay: event.allDay,
      calendarId: calendarIds[event.calendar],
      day: shiftToCurrentWeek(event.day, weekMonday),
      demo: true,
      description: event.description,
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
    process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
