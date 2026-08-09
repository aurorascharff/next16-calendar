'use client';

import * as Ariakit from '@ariakit/react';
import { AlignLeft, CalendarDays, Pencil, Repeat2, Trash2, X } from 'lucide-react';
import { useActionState, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { deleteEvent, updateEvent } from '../calendar-actions';
import { formatDay } from '../calendar-utils';
import { dotClass } from '../utils/colors';
import type { Calendar, CalendarEvent } from '../types/calendar';

type EventEditorProps = {
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

type State = { error?: string; key?: number; values?: FormValues };

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium';
const disabledTimeBlock =
  'opacity-55 [&_input]:bg-card [&_input]:text-muted [&_select]:bg-card [&_select]:text-muted dark:[&_input]:bg-card-dark dark:[&_select]:bg-card-dark';

function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes === 60) return '1 hour';
  if (minutes % 60 === 0) return `${minutes / 60} hours`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

export function EventEditor({ anchorRect, calendar, event, onClose, onDeleted, onUpdated }: EventEditorProps) {
  const [isDeleting, startDelete] = useTransition();
  const [mode, setMode] = useState<'details' | 'edit'>('details');
  const store = Ariakit.usePopoverStore({
    defaultOpen: true,
    placement: 'top-start',
    setOpen(open) {
      if (!open) onClose();
    },
  });

  const [state, formAction, isSaving] = useActionState(async (_prev: State, formData: FormData): Promise<State> => {
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
    const result = await updateEvent(input);
    if (result.error) return { error: result.error, key: Date.now(), values };
    onUpdated({
      allDay,
      description: input.description,
      duration: input.duration,
      sourceId: event.sourceId,
      start: input.start,
      title: input.title,
    });
    store.hide();
    toast.success('Event updated.');
    return {};
  }, {});

  function remove() {
    startDelete(async () => {
      const result = await deleteEvent(event.sourceId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onDeleted(event.sourceId);
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
    <Ariakit.Popover
      store={store}
      unmountOnHide
      fixed
      fitViewport
      portal
      getAnchorRect={anchorRect ? () => anchorRect : undefined}
      gutter={10}
      hideOnEscape={!busy}
      hideOnInteractOutside={!busy}
      wrapperProps={{
        className:
          'event-editor-wrapper max-sm:!inset-0 max-sm:!h-dvh max-sm:!w-screen max-sm:!max-h-none max-sm:!max-w-none',
      }}
      backdrop={<div className="fixed inset-0 z-40 bg-black/40 sm:hidden" />}
      className={cn(
        'border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border shadow-2xl outline-none',
        'max-sm:!inset-0 max-sm:!h-dvh max-sm:!max-h-dvh max-sm:!w-full max-sm:!max-w-none max-sm:!translate-x-0 max-sm:!translate-y-0 max-sm:rounded-none max-sm:border-0',
      )}
      style={{ viewTransitionName: 'dialog' }}
    >
      <div className="border-divider dark:border-divider-dark flex items-start justify-between gap-4 border-b px-4 py-4 sm:border-b-0 sm:pb-2">
        <div className="min-w-0">
          <Ariakit.PopoverHeading className="truncate text-base font-semibold tracking-tight">
            {mode === 'details' ? event.title : 'Edit event'}
          </Ariakit.PopoverHeading>
          <Ariakit.PopoverDescription className="text-muted mt-0.5 text-sm">
            {formatDay(event.day)}
            {event.allDay ? ' · All day' : ` · ${event.start}`}
          </Ariakit.PopoverDescription>
        </div>
        <IconButton className="-mr-1" label="Close" render={<Ariakit.PopoverDismiss disabled={busy} />} size="sm">
          <X className="size-4" />
        </IconButton>
      </div>

      {mode === 'details' ? (
        <>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 sm:flex-none">
            <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 gap-y-4 text-sm">
              <CalendarDays className="text-muted mt-0.5 size-4" />
              <div>
                <p>{formatDay(event.day)}</p>
                <p className="text-muted mt-0.5">
                  {event.allDay ? 'All day' : `${event.start} · ${durationLabel(event.duration)}`}
                </p>
              </div>
              <span className={cn('mt-1 size-2.5 rounded-full', dotClass[event.color])} />
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
          <div className="border-divider dark:border-divider-dark mt-auto flex items-center justify-between gap-3 border-t p-4">
            <Button
              className="text-danger hover:bg-danger/10 hover:text-danger dark:hover:bg-danger/10 dark:hover:text-danger"
              disabled={busy}
              onClick={remove}
              variant="ghost"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
            <Button onClick={() => setMode('edit')}>
              <Pencil className="size-4" />
              Edit event
            </Button>
          </div>
        </>
      ) : (
        <form
          action={formAction}
          className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-none"
          key={state.key ?? event.id}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 sm:flex-none sm:overflow-visible">
            <label className="block">
              <span className={fieldLabel}>Title</span>
              <input autoFocus defaultValue={values.title} name="title" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={allDay}
                className="size-4 w-auto"
                name="allDay"
                onChange={inputEvent => setAllDay(inputEvent.target.checked)}
                type="checkbox"
              />
              All day
            </label>
            <div aria-disabled={allDay} className={`grid grid-cols-2 gap-3 ${allDay ? disabledTimeBlock : ''}`}>
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
            {allDay ? <p className="text-muted -mt-2 text-xs">This event will fill the all-day row.</p> : null}
            <label className="block">
              <span className={fieldLabel}>Description</span>
              <textarea
                defaultValue={values.description}
                name="description"
                placeholder="Add notes, links, or context"
                rows={3}
              />
            </label>
            {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
          </div>
          <div className="border-divider dark:border-divider-dark mt-auto flex justify-end gap-2 border-t p-4">
            <Button disabled={busy} onClick={() => setMode('details')} variant="ghost">
              Cancel
            </Button>
            <Button disabled={busy} type="submit">
              Save changes
            </Button>
          </div>
        </form>
      )}
    </Ariakit.Popover>
  );
}
