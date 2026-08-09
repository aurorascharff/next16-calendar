'use client';

import * as Ariakit from '@ariakit/react';
import { Trash2, X } from 'lucide-react';
import { useActionState, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteEvent, updateEvent } from '../calendar-actions';
import { formatDay } from '../calendar-utils';
import type { CalendarEvent } from '../types/calendar';

type EventEditorProps = {
  anchorRect?: DOMRect | null;
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

export function EventEditor({ anchorRect, event, onClose, onDeleted, onUpdated }: EventEditorProps) {
  const [isDeleting, startDelete] = useTransition();
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
      getAnchorRect={anchorRect ? () => anchorRect : undefined}
      gutter={10}
      hideOnEscape={!busy}
      hideOnInteractOutside={!busy}
      className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 w-[min(24rem,calc(100vw-2rem))] rounded-lg border p-4 shadow-2xl outline-none"
      style={{ viewTransitionName: 'dialog' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Ariakit.PopoverHeading className="text-base font-semibold tracking-tight">Edit event</Ariakit.PopoverHeading>
          <Ariakit.PopoverDescription className="text-muted mt-0.5 text-sm">
            {formatDay(event.day)}
            {event.allDay ? ' · All day' : ` · ${event.start}`}
          </Ariakit.PopoverDescription>
        </div>
        <Ariakit.PopoverDismiss
          aria-label="Close"
          className="text-muted hover:bg-card focus-visible:ring-accent dark:hover:bg-card-dark -mr-1 rounded-md p-1 transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white"
          disabled={busy}
        >
          <X className="size-4" />
        </Ariakit.PopoverDismiss>
      </div>
      <form action={formAction} className="mt-4 space-y-4" key={state.key ?? event.id}>
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
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            className="text-danger hover:bg-danger/10 inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            disabled={busy}
            onClick={remove}
            type="button"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
          <div className="flex gap-2">
            <Ariakit.PopoverDismiss
              className="text-muted focus-visible:ring-accent rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50 dark:hover:text-white"
              disabled={busy}
            >
              Cancel
            </Ariakit.PopoverDismiss>
            <Button disabled={busy} type="submit">
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
    </Ariakit.Popover>
  );
}
