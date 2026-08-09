import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';
import { normalizeDatabaseUrl } from '../lib/database-url';

const demoCalendars = [
  { color: 'blue', key: 'work', name: 'Work' },
  { color: 'sky', key: 'personal', name: 'Personal' },
  { color: 'amber', key: 'reminders', name: 'Reminders' },
  { color: 'indigo', key: 'side-project', name: 'Side project' },
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
    recurrence: 'monday',
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
    day: '2026-08-11',
    description: 'Review the new onboarding flow with design and product.',
    duration: 45,
    recurrence: null,
    start: '14:00',
    title: 'Onboarding design review',
  },
  {
    allDay: false,
    calendar: 'work',
    day: '2026-08-12',
    description: 'Review the open pull requests needed for the release.',
    duration: 60,
    recurrence: null,
    start: '11:00',
    title: 'Code review',
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
    day: '2026-08-10',
    description: 'Get outside before opening Slack.',
    duration: 30,
    recurrence: 'weekday',
    start: '07:30',
    title: 'Morning walk',
  },
  {
    allDay: false,
    calendar: 'personal',
    day: '2026-08-10',
    description: 'Leave the desk and eat lunch away from the screen.',
    duration: 45,
    recurrence: 'weekday',
    start: '12:30',
    title: 'Lunch away from desk',
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
    recurrence: null,
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
    calendar: 'reminders',
    day: '2026-08-10',
    description: 'Submit last month’s travel and equipment receipts.',
    duration: 15,
    recurrence: null,
    start: '16:30',
    title: 'Submit expenses',
  },
  {
    allDay: false,
    calendar: 'reminders',
    day: '2026-08-11',
    description: 'Renew the side-project domain before it expires.',
    duration: 15,
    recurrence: null,
    start: '16:45',
    title: 'Renew domain',
  },
  {
    allDay: false,
    calendar: 'reminders',
    day: '2026-08-12',
    description: 'Call and schedule the next check-up.',
    duration: 15,
    recurrence: null,
    start: '16:45',
    title: 'Book dentist appointment',
  },
  {
    allDay: false,
    calendar: 'reminders',
    day: '2026-08-13',
    description: 'The pharmacy closes at six.',
    duration: 15,
    recurrence: null,
    start: '17:15',
    title: 'Pick up prescription',
  },
  {
    allDay: false,
    calendar: 'reminders',
    day: '2026-08-14',
    description: 'Put the recycling by the door before dinner.',
    duration: 15,
    recurrence: null,
    start: '17:30',
    title: 'Take out recycling',
  },
  {
    allDay: false,
    calendar: 'reminders',
    day: '2026-08-16',
    description: 'Water the plants before leaving for the day.',
    duration: 15,
    recurrence: 'sunday',
    start: '10:00',
    title: 'Water plants',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-10',
    description: 'Sort the latest beta reports into launch blockers and follow-ups.',
    duration: 45,
    recurrence: null,
    start: '18:00',
    title: 'Triage beta feedback',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-11',
    description: 'Finish the final empty, loading, and success states.',
    duration: 90,
    recurrence: null,
    start: '19:00',
    title: 'Finish onboarding flow',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-12',
    description: 'Fix the last issue blocking the release candidate.',
    duration: 60,
    recurrence: null,
    start: '18:30',
    title: 'Fix launch blocker',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-13',
    description: 'Summarize the new features, fixes, and upgrade notes.',
    duration: 45,
    recurrence: null,
    start: '19:00',
    title: 'Write release notes',
  },
  {
    allDay: false,
    calendar: 'side-project',
    day: '2026-08-14',
    description: 'Record a short walkthrough for the launch post.',
    duration: 60,
    recurrence: null,
    start: '18:30',
    title: 'Record product demo',
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
    calendar: 'reminders',
    day: '2026-08-14',
    description: 'Publish the updated screenshots after the release.',
    duration: 1440,
    recurrence: null,
    start: '00:00',
    title: 'Update portfolio screenshots',
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
