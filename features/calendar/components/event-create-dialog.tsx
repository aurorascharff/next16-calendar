'use client';

import * as Ariakit from '@ariakit/react';
import { X } from 'lucide-react';
import { useActionState, useState, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { createEvent } from '../calendar-actions';
import { formatDay } from '../calendar-utils';
import { CalendarPicker } from './calendar-picker';
import type { Calendar, CalendarColor, CalendarEvent } from '../types/calendar';

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium';
const disabledTimeBlock =
  'opacity-55 [&_input]:bg-card [&_input]:text-muted [&_select]:bg-card [&_select]:text-muted dark:[&_input]:bg-card-dark dark:[&_select]:bg-card-dark';
const titlePattern = '.*\\S.*';

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const weekdayLabel = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long' });

type FormValues = {
  allDay: boolean;
  calendarId: string;
  description: string;
  duration: string;
  repeat: string;
  start: string;
  title: string;
};

type State = { error?: string; key?: number; values?: FormValues };

function optimisticEventId(day: string, values: Pick<FormValues, 'start' | 'title'>) {
  return `optimistic:${day}:${values.start}:${values.title}:${Date.now()}`;
}

export function EventCreateDialog({
  store,
  day,
  calendars,
  defaultAllDay = false,
  anchorRect,
  defaultCalendarId,
  defaultStart = '10:00',
  defaultDuration = 60,
  onCreated,
}: {
  store: Ariakit.PopoverStore;
  day: string;
  calendars?: Calendar[];
  defaultAllDay?: boolean;
  anchorRect?: DOMRect | null;
  defaultCalendarId?: string;
  defaultStart?: string;
  defaultDuration?: number;
  onCreated?: (event: CalendarEvent) => void;
}) {
  const weekday = WEEKDAY_NAMES[new Date(`${day}T00:00:00.000Z`).getUTCDay()];
  const calendarOptions = calendars ?? [];
  const writableCalendarId =
    defaultCalendarId ?? (calendarOptions.find(calendar => !calendar.isDemo) ?? calendarOptions[0])?.id;

  const [state, formAction, isPending] = useActionState(async (_prev: State, formData: FormData): Promise<State> => {
    const repeat = String(formData.get('repeat'));
    const allDay = formData.get('allDay') === 'on';
    const values = {
      allDay,
      calendarId: String(formData.get('calendarId') ?? ''),
      description: String(formData.get('description') ?? ''),
      duration: String(formData.get('duration')),
      repeat,
      start: String(formData.get('start')),
      title: String(formData.get('title')),
    };
    const recurrence = repeat === 'weekday' ? 'weekday' : repeat === 'weekly' ? weekday : null;
    if (values.title.trim()) {
      const tempId = optimisticEventId(day, values);
      const calendarId = values.calendarId || writableCalendarId || '';
      const calendar = calendarOptions.find(option => option.id === calendarId);
      onCreated?.({
        allDay,
        calendarId,
        color: (calendar?.color ?? 'blue') as CalendarColor,
        day,
        description: values.description.trim() || null,
        duration: allDay ? 24 * 60 : Number(values.duration),
        id: tempId,
        isDemo: false,
        recurrence,
        recurring: Boolean(recurrence),
        sourceId: tempId,
        start: allDay ? '00:00' : values.start,
        title: values.title.trim(),
      });
    }
    const result = await createEvent({
      allDay,
      calendarId: values.calendarId || undefined,
      day,
      description: values.description,
      duration: Number(values.duration),
      recurrence,
      start: values.start,
      title: values.title,
    });
    if (result.error) return { error: result.error, key: Date.now(), values };
    const created = result.data;
    if (!created) return { error: 'Event was saved, but the response was empty.', key: Date.now(), values };
    store.hide();
    toast.success('Event added to your calendar.');
    return {};
  }, {});

  const values = state.values ?? {
    allDay: defaultAllDay,
    calendarId: writableCalendarId ?? '',
    description: '',
    duration: String(defaultDuration),
    repeat: '',
    start: defaultStart,
    title: '',
  };
  const [allDay, setAllDay] = useState(values.allDay);

  function handleSubmitShortcut(event: KeyboardEvent<HTMLFormElement>) {
    if (isPending || event.key !== 'Enter' || (!event.metaKey && !event.ctrlKey)) return;

    event.preventDefault();
    event.currentTarget.requestSubmit();
  }

  return (
    <Ariakit.Popover
      store={store}
      unmountOnHide
      fixed
      fitViewport
      overlap
      overflowPadding={16}
      portal
      getAnchorRect={anchorRect ? () => anchorRect : undefined}
      gutter={10}
      hideOnEscape={!isPending}
      hideOnInteractOutside={!isPending}
      className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 max-h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border p-4 shadow-2xl outline-none"
      style={{ viewTransitionName: 'dialog' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Ariakit.PopoverHeading className="text-base font-semibold tracking-tight">New event</Ariakit.PopoverHeading>
          <Ariakit.PopoverDescription className="text-muted mt-0.5 text-sm">
            {formatDay(day)}
          </Ariakit.PopoverDescription>
        </div>
        <IconButton className="-mr-1" label="Close" render={<Ariakit.PopoverDismiss disabled={isPending} />}>
          <X className="size-4" />
        </IconButton>
      </div>
      <form
        action={formAction}
        className="mt-3 space-y-3"
        key={state.key ?? 'new-event'}
        onKeyDown={handleSubmitShortcut}
      >
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input
            autoFocus
            defaultValue={values.title}
            name="title"
            onInput={event => event.currentTarget.setCustomValidity('')}
            onInvalid={event => event.currentTarget.setCustomValidity('Add a title before saving the event.')}
            pattern={titlePattern}
            placeholder="What's happening?"
            required
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={allDay}
            className="size-4 w-auto"
            name="allDay"
            onChange={event => setAllDay(event.target.checked)}
            type="checkbox"
          />
          All day
        </label>
        <div
          aria-disabled={allDay}
          className={`${calendarOptions.length > 0 ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'} ${allDay ? disabledTimeBlock : ''}`}
        >
          <label className="block">
            <span className={fieldLabel}>Starts at</span>
            <input defaultValue={values.start} disabled={allDay} name={allDay ? undefined : 'start'} type="time" />
            {allDay ? <input name="start" type="hidden" value={values.start} /> : null}
          </label>
          <label className="block">
            <span className={fieldLabel}>Duration</span>
            <select defaultValue={values.duration} disabled={allDay} name={allDay ? undefined : 'duration'}>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">90 minutes</option>
              <option value="120">2 hours</option>
            </select>
            {allDay ? <input name="duration" type="hidden" value={values.duration} /> : null}
          </label>
        </div>
        {allDay ? <p className="text-muted -mt-1 text-xs">This event will fill the all-day row.</p> : null}
        <label className="block">
          <span className={fieldLabel}>Description</span>
          <textarea
            defaultValue={values.description}
            name="description"
            placeholder="Add notes, links, or context"
            rows={2}
          />
        </label>
        <div className={calendarOptions.length > 0 ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
          {calendarOptions.length > 0 ? (
            <div className="block">
              <span className={fieldLabel}>Calendar</span>
              <CalendarPicker
                calendars={calendarOptions}
                defaultValue={values.calendarId || writableCalendarId}
                name="calendarId"
              />
            </div>
          ) : null}
          <label className="block">
            <span className={fieldLabel}>Repeat</span>
            <select defaultValue={values.repeat} name="repeat">
              <option value="">Does not repeat</option>
              <option value="weekly">Weekly on {weekdayLabel.format(new Date(`${day}T00:00:00.000Z`))}</option>
              <option value="weekday">Every weekday</option>
            </select>
          </label>
        </div>
        {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button render={<Ariakit.PopoverDismiss disabled={isPending} />} variant="ghost">
            Cancel
          </Button>
          <Button type="submit">Create event</Button>
        </div>
      </form>
    </Ariakit.Popover>
  );
}
