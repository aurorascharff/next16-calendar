'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DURATION_OPTIONS } from '../utils/grid';
import type { Ref } from 'react';

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
  date,
  onAllDayChange,
  titleRef,
  titleInvalidMessage,
  values,
}: {
  allDay: boolean;
  busy?: boolean;
  controlHeight: string;
  date?: { onChange: (value: string) => void; value: string };
  onAllDayChange: (allDay: boolean) => void;
  titleRef?: Ref<HTMLInputElement>;
  titleInvalidMessage: string;
  values: EventFieldValues;
}) {
  return (
    <>
      <label className="block">
        <span className={fieldLabel}>Title</span>
        <Input
          autoFocus
          className={controlHeight}
          defaultValue={values.title}
          disabled={busy}
          name="title"
          onInput={event => event.currentTarget.setCustomValidity('')}
          onInvalid={event => event.currentTarget.setCustomValidity(titleInvalidMessage)}
          pattern={titlePattern}
          placeholder="What's happening?"
          ref={titleRef}
          required
        />
      </label>
      {date ? (
        <label className="block min-w-0 overflow-hidden">
          <span className={fieldLabel}>Date</span>
          <Input
            className={controlHeight}
            disabled={busy}
            name="day"
            onInput={event => date.onChange(event.currentTarget.value)}
            required
            type="date"
            value={date.value}
          />
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <Input
          checked={allDay}
          disabled={busy}
          name="allDay"
          onChange={event => onAllDayChange(event.target.checked)}
          type="checkbox"
          variant="checkbox"
        />
        All day
      </label>
      <div
        aria-disabled={allDay}
        className={`grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] ${allDay ? disabledTimeBlock : ''}`}
      >
        <label className="min-w-0 overflow-hidden">
          <span className={fieldLabel}>Starts at</span>
          <Input
            className={`${controlHeight} block w-full max-w-full min-w-0 overflow-hidden`}
            defaultValue={values.start}
            disabled={allDay || busy}
            name={allDay ? undefined : 'start'}
            type="time"
          />
          {allDay ? <Input name="start" type="hidden" value={values.start} variant="unstyled" /> : null}
        </label>
        <label className="min-w-0">
          <span className={fieldLabel}>Duration</span>
          <Select
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
          </Select>
          {allDay ? <Input name="duration" type="hidden" value={values.duration} variant="unstyled" /> : null}
        </label>
      </div>
      <label className="block">
        <span className={fieldLabel}>Description</span>
        <Textarea
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
