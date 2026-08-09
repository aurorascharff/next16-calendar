'use client';

import * as Ariakit from '@ariakit/react';
import { AlignLeft, ArrowLeft, CalendarDays, Check, Pencil, Repeat2, Trash2, X } from 'lucide-react';
import { type ReactNode, useActionState, useId, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Boundary } from '@/components/internal/boundary';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { deleteEvent, updateEvent } from '../calendar-actions';
import { formatDay } from '../calendar-utils';
import { colorStyle } from '../utils/colors';
import { DURATION_OPTIONS } from '../utils/grid';
import type { Calendar, CalendarEvent } from '../types/calendar';

type EventPopoverProps = {
  anchorRect?: DOMRect | null;
  calendar?: Calendar;
  event: CalendarEvent;
  onClose: () => void;
  onDeleted: (sourceId: string) => void;
  onUpdated: (
    event: Pick<CalendarEvent, 'allDay' | 'description' | 'duration' | 'sourceId' | 'start' | 'title'>,
  ) => void;
};

type FormValues = {
  allDay: boolean;
  description: string;
  duration: string;
  start: string;
  title: string;
};

type FormState = { key?: number; values?: FormValues };

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium';
const disabledTimeBlock =
  'opacity-55 [&_input]:bg-card [&_input]:text-muted [&_select]:bg-card [&_select]:text-muted dark:[&_input]:bg-card-dark dark:[&_select]:bg-card-dark';
const controlHeight = 'h-10';
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

export function EventPopover({ anchorRect, calendar, event, onClose, onDeleted, onUpdated }: EventPopoverProps) {
  const formId = useId();
  const [isDeleting, startDelete] = useTransition();
  const [mode, setMode] = useState<'details' | 'edit'>('details');
  const store = Ariakit.usePopoverStore({
    defaultOpen: true,
    placement: 'right-start',
    setOpen(open) {
      if (!open) onClose();
    },
  });

  const [state, formAction, isSaving] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const allDay = formData.get('allDay') === 'on';
      const values = {
        allDay,
        description: String(formData.get('description') ?? ''),
        duration: String(formData.get('duration')),
        start: String(formData.get('start')),
        title: String(formData.get('title')),
      };
      const input = {
        allDay,
        description: values.description,
        duration: Number(values.duration),
        eventId: event.sourceId,
        start: values.start,
        title: values.title,
      };

      if (input.title.trim()) {
        onUpdated({
          allDay,
          description: input.description,
          duration: input.duration,
          sourceId: event.sourceId,
          start: input.start,
          title: input.title,
        });
      }

      const result = await updateEvent(input);
      if (result.error) {
        toast.error(result.error);
        return { key: Date.now(), values };
      }

      store.hide();
      toast.success('Event updated.');
      return {};
    },
    {},
  );

  function remove() {
    startDelete(async () => {
      onDeleted(event.sourceId);
      const result = await deleteEvent(event.sourceId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      store.hide();
      toast.success('Event removed.');
    });
  }

  const busy = isSaving || isDeleting;
  const values = state.values ?? {
    allDay: event.allDay,
    description: event.description ?? '',
    duration: String(event.duration),
    start: event.start,
    title: event.title,
  };
  const [allDay, setAllDay] = useState(values.allDay);

  return (
    <Boundary label="EventPopover" asChild>
      <Ariakit.Popover
        store={store}
        unmountOnHide
        fixed
        fitViewport
        flip="left-start"
        overflowPadding={16}
        portal
        getAnchorRect={anchorRect ? () => anchorRect : undefined}
        gutter={10}
        hideOnEscape={!busy}
        hideOnInteractOutside={!busy}
        wrapperProps={{
          className:
            'event-popover-wrapper max-sm:!inset-0 max-sm:!h-dvh max-sm:!w-screen max-sm:!max-h-none max-sm:!max-w-none',
        }}
        backdrop={<div className="fixed inset-0 z-40 bg-black/40 sm:hidden" />}
        className={cn(
          'border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 flex max-h-[calc(100dvh-2rem)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border shadow-2xl outline-none',
          'max-sm:!inset-0 max-sm:!h-dvh max-sm:!max-h-dvh max-sm:!w-full max-sm:!max-w-none max-sm:!translate-x-0 max-sm:!translate-y-0 max-sm:rounded-none max-sm:border-0',
        )}
        style={{ viewTransitionName: 'dialog' }}
      >
        {mode === 'details' ? (
          <>
            <EventPopoverHeader busy={busy} event={event}>
              <IconButton disabled={busy} label="Edit event" onClick={() => setMode('edit')} size="sm">
                <Pencil className="size-4" />
              </IconButton>
              <IconButton
                className="text-danger hover:bg-danger/10 hover:text-danger dark:hover:bg-danger/10 dark:hover:text-danger"
                disabled={busy}
                label="Delete event"
                onClick={remove}
                size="sm"
              >
                <Trash2 className="size-4" />
              </IconButton>
            </EventPopoverHeader>
            <EventDetails calendar={calendar} event={event} />
          </>
        ) : (
          <>
            <EventPopoverHeader busy={busy} event={event}>
              <IconButton disabled={busy} label="Back to event details" onClick={() => setMode('details')} size="sm">
                <ArrowLeft className="size-4" />
              </IconButton>
              <IconButton
                className="text-accent hover:bg-accent/10 hover:text-accent dark:hover:bg-accent/10 dark:hover:text-accent"
                disabled={busy}
                form={formId}
                label="Save changes"
                size="sm"
                type="submit"
              >
                <Check className="size-4" />
              </IconButton>
            </EventPopoverHeader>
            <EventEditForm
              allDay={allDay}
              busy={busy}
              formAction={formAction}
              formId={formId}
              onAllDayChange={setAllDay}
              state={state}
              values={values}
            />
          </>
        )}
      </Ariakit.Popover>
    </Boundary>
  );
}

function EventPopoverHeader({ busy, children, event }: { busy: boolean; children: ReactNode; event: CalendarEvent }) {
  return (
    <div className="border-divider dark:border-divider-dark flex min-h-16 items-start justify-between gap-3 border-b px-4 py-3">
      <div className="min-w-0">
        <Ariakit.PopoverHeading className="text-base leading-snug font-semibold tracking-tight break-words">
          {event.title}
        </Ariakit.PopoverHeading>
        <Ariakit.PopoverDescription className="text-muted mt-0.5 text-sm">
          {formatDay(event.day)}
          {event.allDay ? ' · All day' : ` · ${event.start}`}
        </Ariakit.PopoverDescription>
      </div>
      <div className="-mr-1 flex shrink-0 items-center gap-0.5">
        {children}
        <IconButton label="Close" render={<Ariakit.PopoverDismiss disabled={busy} />} size="sm">
          <X className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}

function EventDetails({ calendar, event }: { calendar?: Calendar; event: CalendarEvent }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:flex-none">
      <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 gap-y-3 text-sm">
        <CalendarDays className="text-muted mt-0.5 size-4" />
        <div>
          <p>{formatDay(event.day)}</p>
          <p className="text-muted mt-0.5">
            {event.allDay ? 'All day' : `${event.start} · ${durationLabel(event.duration)}`}
          </p>
        </div>
        <span className="mt-1 size-2.5 rounded-full" style={colorStyle(event.color)} />
        <p>{calendar?.name ?? 'Calendar'}</p>
        {event.recurring ? (
          <>
            <Repeat2 className="text-muted mt-0.5 size-4" />
            <p>{event.recurrence ? `Repeats ${event.recurrence.toLowerCase()}` : 'Repeating event'}</p>
          </>
        ) : null}
        <AlignLeft className="text-muted mt-0.5 size-4" />
        <p className={cn('whitespace-pre-wrap', !event.description && 'text-muted')}>
          {event.description || 'No description'}
        </p>
      </div>
    </div>
  );
}

function EventEditForm({
  allDay,
  busy,
  formAction,
  formId,
  onAllDayChange,
  state,
  values,
}: {
  allDay: boolean;
  busy: boolean;
  formAction: (formData: FormData) => void;
  formId: string;
  onAllDayChange: (allDay: boolean) => void;
  state: FormState;
  values: FormValues;
}) {
  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-none"
      data-calendar-editing
      id={formId}
      key={state.key ?? 'event-edit'}
    >
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-4 sm:flex-none sm:overflow-visible">
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input
            autoFocus
            className={controlHeight}
            defaultValue={values.title}
            name="title"
            onInput={event => event.currentTarget.setCustomValidity('')}
            onInvalid={event => event.currentTarget.setCustomValidity('Add a title before saving.')}
            pattern={titlePattern}
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
        <div aria-disabled={allDay} className={`grid grid-cols-2 gap-3 ${allDay ? disabledTimeBlock : ''}`}>
          <label className="block">
            <span className={fieldLabel}>Starts at</span>
            <input
              className={controlHeight}
              defaultValue={values.start}
              disabled={allDay || busy}
              name={allDay ? undefined : 'start'}
              type="time"
            />
            {allDay ? <input name="start" type="hidden" value={values.start} /> : null}
          </label>
          <label className="block">
            <span className={fieldLabel}>Duration</span>
            <select
              className={controlHeight}
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
      </div>
    </form>
  );
}
