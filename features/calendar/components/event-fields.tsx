'use client';

import { DURATION_OPTIONS } from '../utils/grid';

export type EventFieldValues = {
  description: string;
  duration: string;
  start: string;
  title: string;
};

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium';
const disabledTimeBlock =
  'opacity-55 [&_input]:bg-card [&_input]:text-muted [&_select]:bg-card [&_select]:text-muted dark:[&_input]:bg-card-dark dark:[&_select]:bg-card-dark';
const titlePattern = '.*\\S.*';

function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes === 60) return '1 hour';
  if (minutes % 60 === 0) return `${minutes / 60} hours`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function durationOptions(value: string) {
  const current = Number(value);
  const options = Number.isFinite(current) ? [...DURATION_OPTIONS, current] : DURATION_OPTIONS;
  return [...new Set(options)].sort((a, b) => a - b);
}

export function EventFields({
  allDay,
  busy = false,
  controlHeight,
  onAllDayChange,
  titleInvalidMessage,
  values,
}: {
  allDay: boolean;
  busy?: boolean;
  controlHeight: string;
  onAllDayChange: (allDay: boolean) => void;
  titleInvalidMessage: string;
  values: EventFieldValues;
}) {
  return (
    <>
      <label className="block">
        <span className={fieldLabel}>Title</span>
        <input
          autoFocus
          className={controlHeight}
          defaultValue={values.title}
          disabled={busy}
          name="title"
          onInput={event => event.currentTarget.setCustomValidity('')}
          onInvalid={event => event.currentTarget.setCustomValidity(titleInvalidMessage)}
          pattern={titlePattern}
          placeholder="What's happening?"
          required
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          checked={allDay}
          className="size-4 w-auto"
          disabled={busy}
          name="allDay"
          onChange={event => onAllDayChange(event.target.checked)}
          type="checkbox"
        />
        All day
      </label>
      <div
        aria-disabled={allDay}
        className={`grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] ${allDay ? disabledTimeBlock : ''}`}
      >
        <label className="min-w-0">
          <span className={fieldLabel}>Starts at</span>
          <input
            className={`${controlHeight} min-w-0`}
            defaultValue={values.start}
            disabled={allDay || busy}
            name={allDay ? undefined : 'start'}
            type="time"
          />
          {allDay ? <input name="start" type="hidden" value={values.start} /> : null}
        </label>
        <label className="min-w-0">
          <span className={fieldLabel}>Duration</span>
          <select
            className={`${controlHeight} min-w-0`}
            defaultValue={values.duration}
            disabled={allDay || busy}
            name={allDay ? undefined : 'duration'}
          >
            {durationOptions(values.duration).map(duration => (
              <option key={duration} value={duration}>
                {durationLabel(duration)}
              </option>
            ))}
          </select>
          {allDay ? <input name="duration" type="hidden" value={values.duration} /> : null}
        </label>
      </div>
      {allDay ? <p className="text-muted -mt-1 text-xs">This event will fill the all-day row.</p> : null}
      <label className="block">
        <span className={fieldLabel}>Description</span>
        <textarea
          defaultValue={values.description}
          disabled={busy}
          name="description"
          placeholder="Add notes, links, or context"
          rows={2}
        />
      </label>
    </>
  );
}

export function formatDuration(minutes: number) {
  return durationLabel(minutes);
}
