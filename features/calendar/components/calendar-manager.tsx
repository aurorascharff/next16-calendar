'use client';

import * as Ariakit from '@ariakit/react';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useActionState, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { createCalendar, deleteCalendar, updateCalendar } from '../calendar-actions';
import { CALENDAR_COLORS, dotClass } from '../utils/colors';
import { useCalendarVisibility } from './calendar-visibility';
import type { Calendar, CalendarColor } from '../types/calendar';

export function CalendarManager({ calendars }: { calendars: Calendar[] }) {
  const { hidden, toggle } = useCalendarVisibility();
  const [editing, setEditing] = useState<Calendar | 'new' | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const demoColors = new Set(calendars.filter(calendar => calendar.isDemo).map(calendar => calendar.color));
  const store = Ariakit.useDialogStore({
    setOpen(open) {
      if (!open) setEditing(null);
    },
  });

  function remove(calendar: Calendar) {
    startDelete(async () => {
      const result = await deleteCalendar(calendar.id);
      if (result.error) toast.error(result.error);
      else toast.success('Calendar deleted.');
    });
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between px-3">
        <p className="text-muted text-xs font-semibold tracking-wide uppercase">Calendars</p>
        <button
          aria-label="New calendar"
          className="text-muted rounded p-0.5 transition-colors hover:text-black dark:hover:text-white"
          onClick={() => {
            setEditing('new');
            store.show();
          }}
          type="button"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="space-y-0.5">
        {calendars.map(calendar => {
          const isHidden = hidden.has(calendar.id);
          return (
            <div
              className="group hover:bg-card dark:hover:bg-card-dark flex items-center gap-2 rounded-md pr-1 pl-3 transition-colors"
              key={calendar.id}
            >
              <button
                aria-pressed={!isHidden}
                className="flex min-w-0 flex-1 items-center gap-2.5 py-1.5 text-left text-sm"
                onClick={() => toggle(calendar.id)}
                type="button"
              >
                <span
                  className={cn(
                    'size-2.5 shrink-0 rounded-full transition-opacity',
                    dotClass[calendar.color],
                    isHidden && 'opacity-25',
                  )}
                />
                <span className={cn('text-muted truncate', isHidden && 'line-through opacity-60')}>
                  {calendar.name}
                </span>
              </button>
              <Ariakit.MenuProvider>
                <Ariakit.MenuButton
                  aria-label={`${calendar.name} options`}
                  className="text-muted rounded p-1 opacity-0 transition group-hover:opacity-100 hover:text-black focus-visible:opacity-100 dark:hover:text-white"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="size-4" />
                </Ariakit.MenuButton>
                <Ariakit.Menu
                  gutter={4}
                  className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark z-50 min-w-36 rounded-md border p-1 shadow-lg outline-none"
                >
                  <Ariakit.MenuItem
                    className="hover:bg-card dark:hover:bg-card-dark flex items-center gap-2 rounded px-2 py-1.5 text-sm"
                    onClick={() => {
                      setEditing(calendar);
                      store.show();
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Ariakit.MenuItem>
                  <Ariakit.MenuItem
                    className="text-danger hover:bg-danger/10 flex items-center gap-2 rounded px-2 py-1.5 text-sm"
                    onClick={() => remove(calendar)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Ariakit.MenuItem>
                </Ariakit.Menu>
              </Ariakit.MenuProvider>
            </div>
          );
        })}
      </div>
      {editing ? (
        <CalendarFormDialog
          calendar={editing === 'new' ? null : editing}
          colors={CALENDAR_COLORS.filter(
            color => !demoColors.has(color) || (editing !== 'new' && color === editing.color),
          )}
          key={editing === 'new' ? 'new' : editing.id}
          store={store}
        />
      ) : null}
    </>
  );
}

function CalendarFormDialog({
  calendar,
  colors,
  store,
}: {
  calendar: Calendar | null;
  colors: CalendarColor[];
  store: Ariakit.DialogStore;
}) {
  const [color, setColor] = useState<CalendarColor>(calendar?.color ?? colors[0] ?? 'indigo');

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; key?: number; values?: { name: string } }, formData: FormData) => {
      const name = String(formData.get('name'));
      const result = calendar
        ? await updateCalendar({ color, id: calendar.id, name })
        : await createCalendar({ color, name });
      if (result.error) return { error: result.error, key: Date.now(), values: { name } };
      store.hide();
      toast.success(calendar ? 'Calendar updated.' : 'Calendar created.');
      return {};
    },
    {},
  );

  const name = state.values?.name ?? calendar?.name ?? '';

  return (
    <Dialog busy={isPending} store={store} title={calendar ? 'Edit calendar' : 'New calendar'}>
      <form action={formAction} className="mt-4 space-y-4" key={state.key ?? calendar?.id ?? 'new-calendar'}>
        <label className="block">
          <span className="text-muted mb-1.5 block text-xs font-medium">Name</span>
          <input autoFocus defaultValue={name} name="name" placeholder="e.g. Side project" />
        </label>
        <div>
          <span className="text-muted mb-1.5 block text-xs font-medium">Color</span>
          <div className="flex gap-2">
            {colors.map(option => (
              <button
                aria-label={option}
                aria-pressed={color === option}
                className={cn(
                  'ring-offset-surface dark:ring-offset-surface-dark size-7 rounded-full ring-2 ring-offset-2 transition',
                  dotClass[option],
                  color === option ? 'ring-accent' : 'ring-transparent',
                )}
                key={option}
                onClick={() => setColor(option)}
                type="button"
              />
            ))}
          </div>
        </div>
        {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Ariakit.DialogDismiss
            className="text-muted rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-black disabled:opacity-50 dark:hover:text-white"
            disabled={isPending}
          >
            Cancel
          </Ariakit.DialogDismiss>
          <button
            className="bg-accent hover:bg-accent-hover rounded-md px-3.5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Saving…' : calendar ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
