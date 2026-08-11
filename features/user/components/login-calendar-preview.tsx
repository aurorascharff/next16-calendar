import { CalendarDays, ChevronLeft, ChevronRight, Link2 } from 'lucide-react';
import { FlowMark } from '@/components/ui/flow-mark';

const days = [
  { label: 'Mon', date: 10 },
  { label: 'Tue', date: 11, active: true },
  { label: 'Wed', date: 12 },
  { label: 'Thu', date: 13 },
  { label: 'Fri', date: 14 },
  { label: 'Sat', date: 15 },
  { label: 'Sun', date: 16 },
];

const miniMonthDays = [
  27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  28, 29, 30,
];

const events = [
  { day: 1, start: 19, duration: 11, title: 'Focus time', tone: 'bg-blue-600' },
  { day: 2, start: 11, duration: 7, title: 'Run before stand-up', tone: 'bg-sky-600' },
  { day: 2, start: 19, duration: 11, title: 'Focus time', tone: 'bg-blue-600' },
  { day: 2, start: 33, duration: 9, title: 'Pair on API caching', tone: 'bg-indigo-600' },
  { day: 3, start: 19, duration: 11, title: 'Focus time', tone: 'bg-blue-600' },
  { day: 3, start: 48, duration: 8, title: 'Design crit', tone: 'bg-violet-600' },
  { day: 4, start: 19, duration: 11, title: 'Focus time', tone: 'bg-blue-600' },
  { day: 5, start: 19, duration: 11, title: 'Focus time', tone: 'bg-blue-600' },
  { day: 6, start: 35, duration: 15, title: 'Long walk', tone: 'bg-cyan-600' },
  { day: 7, start: 27, duration: 6, title: 'Water plants', tone: 'bg-cyan-600' },
];

export function LoginCalendarPreview() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden select-none">
      <div className="flex size-full opacity-75 saturate-75">
        <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark hidden w-60 shrink-0 flex-col border-r p-4 md:flex">
          <div className="mb-7 flex items-center gap-2.5 px-2">
            <FlowMark className="size-8" />
            <div>
              <p className="font-semibold tracking-tight">Flow</p>
              <p className="text-muted text-xs">Shape your day</p>
            </div>
          </div>
          <div className="bg-card dark:bg-card-dark flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold">
            <CalendarDays className="size-4" />
            Calendar
          </div>
          <div className="text-muted mt-1 flex items-center gap-3 px-3 py-3 text-sm">
            <Link2 className="size-4" />
            Booking link
          </div>
          <div className="mt-7 px-2">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">August 2026</p>
              <div className="text-muted flex gap-2">
                <ChevronLeft className="size-4" />
                <ChevronRight className="size-4" />
              </div>
            </div>
            <div className="text-muted mb-2 grid grid-cols-7 text-center text-[10px] font-medium">
              {'MTWTFSS'.split('').map((day, index) => (
                <span key={index}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs tabular-nums">
              {miniMonthDays.map((day, index) => (
                <span
                  className={index < 5 || index > 32 ? 'text-muted/40' : index === 15 ? 'font-semibold' : ''}
                  key={index}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-8 px-2">
            <p className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">Calendars</p>
            {[
              ['bg-blue-500', 'Work'],
              ['bg-cyan-500', 'Personal'],
              ['bg-violet-500', 'Side project'],
            ].map(([tone, label]) => (
              <div className="text-muted flex items-center gap-2.5 py-2 text-sm" key={label}>
                <span className={`size-2.5 rounded-full ${tone}`} />
                {label}
              </div>
            ))}
          </div>
        </aside>

        <section className="bg-surface dark:bg-surface-dark flex min-w-0 flex-1 flex-col">
          <header className="border-divider dark:border-divider-dark flex h-16 shrink-0 items-center justify-between border-b px-5 sm:px-7">
            <div className="flex items-center gap-4">
              <FlowMark className="size-7 md:hidden" />
              <p className="text-lg font-semibold tracking-tight">August 2026</p>
            </div>
            <div className="border-divider bg-card dark:border-divider-dark dark:bg-card-dark flex rounded-lg border p-1 text-sm">
              <span className="bg-surface dark:bg-surface-dark rounded-md px-3 py-1 font-medium">Week</span>
              <span className="text-muted px-3 py-1">Month</span>
            </div>
          </header>
          <div className="border-divider dark:border-divider-dark grid h-16 shrink-0 grid-cols-7 border-b pl-12 sm:pl-16">
            {days.map(day => (
              <div
                className={`border-divider dark:border-divider-dark flex min-w-0 items-center justify-center gap-2 border-l text-sm ${day.active ? 'bg-action/10' : ''}`}
                key={day.label}
              >
                <span className="text-muted hidden text-[11px] font-medium uppercase sm:inline">{day.label}</span>
                <span
                  className={`font-semibold tabular-nums ${day.active ? 'bg-action grid size-8 place-items-center rounded-full text-white' : ''}`}
                >
                  {day.date}
                </span>
              </div>
            ))}
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden pl-12 sm:pl-16">
            <div className="absolute inset-y-0 left-0 w-12 sm:w-16">
              {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00'].map((time, index) => (
                <span
                  className="text-muted absolute right-2 -translate-y-1/2 text-[10px] tabular-nums sm:text-xs"
                  key={time}
                  style={{ top: `${index * 16.66 + 8}%` }}
                >
                  {time}
                </span>
              ))}
            </div>
            <div className="absolute inset-0 grid grid-cols-7">
              {days.map(day => (
                <div
                  className={`border-divider dark:border-divider-dark border-l ${day.active ? 'bg-action/10' : ''}`}
                  key={day.label}
                />
              ))}
            </div>
            <div className="absolute inset-0 grid grid-rows-6">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="border-divider dark:border-divider-dark border-b" key={index} />
              ))}
            </div>
            {events.map(event => (
              <div
                className={`absolute overflow-hidden rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm ${event.tone}`}
                key={`${event.day}-${event.start}-${event.title}`}
                style={{
                  height: `${event.duration}%`,
                  left: `calc(${((event.day - 1) / 7) * 100}% + 0.25rem)`,
                  top: `${event.start}%`,
                  width: `calc(${100 / 7}% - 0.5rem)`,
                }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
