'use client';

import * as Ariakit from '@ariakit/react';
import { X } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { Boundary } from '@/components/internal/boundary';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { createEvent } from '../calendar-actions';
import { formatDay } from '../calendar-utils';
import { CalendarPicker } from './calendar-picker';
import { EventFields } from './event-fields';
import type { Calendar, CalendarColor, CalendarEvent } from '../types/calendar';

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium';
const controlHeight = 'h-12';

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
  onCreateFailed,
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
  onCreateFailed?: (sourceId: string) => void;
}) {
  const weekday = WEEKDAY_NAMES[new Date(`${day}T00:00:00.000Z`).getUTCDay()];
  const calendarOptions = calendars ?? [];
  const writableCalendarId =
    defaultCalendarId ?? (calendarOptions.find(calendar => !calendar.isDemo) ?? calendarOptions[0])?.id;

  async function submitAction(formData: FormData) {
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
    let tempId: string | null = null;
    if (values.title.trim()) {
      tempId = optimisticEventId(day, values);
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
      store.hide();
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
    if (result.error) {
      if (tempId) onCreateFailed?.(tempId);
      toast.error(result.error);
      return;
    }
    const created = result.data;
    if (!created) {
      if (tempId) onCreateFailed?.(tempId);
      toast.error('Event was saved, but the response was empty.');
      return;
    }
    toast.success('Event added to your calendar.');
  }

  const values = {
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
    if (event.key !== 'Enter' || (!event.metaKey && !event.ctrlKey)) return;

    event.preventDefault();
    event.currentTarget.requestSubmit();
  }

  return (
    <Boundary label="EventCreateDialog" asChild>
      <Ariakit.Popover
        store={store}
        modal
        unmountOnHide
        fixed
        fitViewport
        overlap
        overflowPadding={16}
        portal
        getAnchorRect={anchorRect ? () => anchorRect : undefined}
        gutter={10}
        wrapperProps={{
          className:
            'event-popover-wrapper max-sm:!inset-0 max-sm:!h-dvh max-sm:!w-screen max-sm:!max-h-none max-sm:!max-w-none max-sm:!overflow-hidden',
        }}
        backdrop={<div className="fixed inset-0 z-40 bg-black/40 sm:hidden" />}
        className={cn(
          'border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 flex max-h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border shadow-2xl outline-none',
          'max-sm:!inset-0 max-sm:!h-dvh max-sm:!max-h-dvh max-sm:!w-full max-sm:!max-w-none max-sm:!translate-x-0 max-sm:!translate-y-0 max-sm:rounded-none max-sm:border-0',
        )}
        style={{ viewTransitionName: 'dialog' }}
      >
        <div className="border-divider dark:border-divider-dark flex min-h-16 items-start justify-between gap-4 border-b px-4 py-3 max-sm:[&_button]:size-10 max-sm:[&_svg]:size-5">
          <div className="min-w-0">
            <Ariakit.PopoverHeading className="text-base font-semibold tracking-tight">
              New event
            </Ariakit.PopoverHeading>
            <Ariakit.PopoverDescription className="text-muted mt-0.5 text-sm">
              {formatDay(day)}
            </Ariakit.PopoverDescription>
          </div>
          <IconButton className="-mr-1" label="Close" render={<Ariakit.PopoverDismiss />}>
            <X className="size-4" />
          </IconButton>
        </div>
        <form
          action={submitAction}
          className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-none"
          data-calendar-editing
          onKeyDown={handleSubmitShortcut}
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:flex-none sm:overflow-visible">
            <EventFields
              allDay={allDay}
              controlHeight={controlHeight}
              onAllDayChange={setAllDay}
              titleInvalidMessage="Add a title before saving the event."
              values={values}
            />
            <div className={calendarOptions.length > 0 ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
              {calendarOptions.length > 0 ? (
                <div className="min-w-0">
                  <span className={fieldLabel}>Calendar</span>
                  <CalendarPicker
                    calendars={calendarOptions}
                    defaultValue={values.calendarId || writableCalendarId}
                    name="calendarId"
                  />
                </div>
              ) : null}
              <label className="min-w-0">
                <span className={fieldLabel}>Repeat</span>
                <select defaultValue={values.repeat} name="repeat">
                  <option value="">Does not repeat</option>
                  <option value="weekly">Weekly on {weekdayLabel.format(new Date(`${day}T00:00:00.000Z`))}</option>
                  <option value="weekday">Every weekday</option>
                </select>
              </label>
            </div>
          </div>
          <div className="border-divider dark:border-divider-dark flex justify-end gap-2 border-t px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] max-sm:[&_button]:h-11 max-sm:[&_button]:flex-1">
            <Button render={<Ariakit.PopoverDismiss />} variant="ghost">
              Cancel
            </Button>
            <Button type="submit">Create event</Button>
          </div>
        </form>
      </Ariakit.Popover>
    </Boundary>
  );
}
