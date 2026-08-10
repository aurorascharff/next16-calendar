'use client';

import * as Ariakit from '@ariakit/react';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { type ReactNode, useActionState, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { createCalendar, deleteCalendar, updateCalendar } from '../calendar-actions';
import { CALENDAR_COLORS, colorStyle } from '../utils/colors';
import { useCalendarVisibility } from './calendar-visibility';
import type { Calendar, CalendarColor } from '../types/calendar';

export function CalendarManager({ calendars }: { calendars: Calendar[] }) {
  const { hidden, toggle } = useCalendarVisibility();
  const [editing, setEditing] = useState<Calendar | null>(null);
  const [isDeleting, startDelete] = useTransition();
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
      <div className="space-y-0.5">
        {calendars.map(calendar => {
          const isHidden = hidden.has(calendar.id);
          return (
            <div
              className="group hover:bg-card dark:hover:bg-card-dark flex items-center justify-center rounded-md transition-colors min-[110rem]:justify-start min-[110rem]:pr-1 min-[110rem]:pl-3"
              key={calendar.id}
            >
              <button
                aria-label={`${isHidden ? 'Show' : 'Hide'} ${calendar.name} calendar`}
                aria-pressed={!isHidden}
                className="grid size-9 shrink-0 place-items-center text-sm min-[110rem]:flex min-[110rem]:min-w-0 min-[110rem]:flex-1 min-[110rem]:justify-start min-[110rem]:gap-2.5 min-[110rem]:py-1.5 min-[110rem]:text-left"
                onClick={() => toggle(calendar.id)}
                type="button"
              >
                <span
                  className={cn('size-2.5 shrink-0 rounded-full transition-opacity', isHidden && 'opacity-25')}
                  style={colorStyle(calendar.color)}
                />
                <span
                  className={cn(
                    'text-muted hidden truncate min-[110rem]:inline',
                    isHidden && 'line-through opacity-60',
                  )}
                >
                  {calendar.name}
                </span>
              </button>
              <Ariakit.MenuProvider>
                <IconButton
                  className="hidden opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 min-[110rem]:inline-flex"
                  disabled={isDeleting}
                  label={`${calendar.name} options`}
                  render={<Ariakit.MenuButton />}
                  size="sm"
                >
                  <MoreHorizontal className="size-4" />
                </IconButton>
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
        <CalendarFormDialog calendar={editing} colors={CALENDAR_COLORS} key={editing.id} store={store} />
      ) : null}
    </>
  );
}

export function NewCalendarButton({ children, className }: { children?: ReactNode; className?: string }) {
  const store = Ariakit.useDialogStore();

  return (
    <>
      {children ? (
        <Button className={className} onClick={store.show} size="sm" variant="secondary">
          <Plus className="size-3.5" />
          {children}
        </Button>
      ) : (
        <IconButton className={className} label="New calendar" onClick={store.show} size="sm">
          <Plus className="size-4" />
        </IconButton>
      )}
      <CalendarFormDialog calendar={null} colors={CALENDAR_COLORS} store={store} />
    </>
  );
}

export function CalendarManagerSkeleton() {
  const widths = ['w-20', 'w-24', 'w-16', 'w-20'];

  return (
    <div aria-label="Loading calendars" className="space-y-0.5 px-0 min-[110rem]:px-3">
      {widths.map((width, index) => (
        <div className="flex h-9 items-center justify-center gap-2.5 min-[110rem]:h-8 min-[110rem]:justify-start" key={index}>
          <Skeleton className="size-2.5 shrink-0 rounded-full" />
          <Skeleton className={cn('hidden h-3 rounded-full min-[110rem]:block', width)} />
        </div>
      ))}
    </div>
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
    async (_prev: { key?: number; values?: { name: string } }, formData: FormData) => {
      const name = String(formData.get('name'));
      const result = calendar
        ? await updateCalendar({ color, id: calendar.id, name })
        : await createCalendar({ color, name });
      if (result.error) {
        toast.error(result.error);
        return { key: Date.now(), values: { name } };
      }
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
          <Input autoFocus defaultValue={name} name="name" placeholder="e.g. Side project" required />
        </label>
        <div>
          <span className="text-muted mb-1.5 block text-xs font-medium">Color</span>
          <div className="flex flex-wrap gap-2">
            {colors.map(option => (
              <button
                aria-label={option}
                aria-pressed={color === option}
                className={cn(
                  'ring-offset-surface dark:ring-offset-surface-dark size-7 rounded-full ring-2 ring-offset-2 transition',
                  color === option ? 'ring-accent' : 'ring-transparent',
                )}
                key={option}
                onClick={() => setColor(option)}
                style={colorStyle(option)}
                type="button"
              />
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button render={<Ariakit.DialogDismiss disabled={isPending} />} variant="ghost">
            Cancel
          </Button>
          <Button type="submit">{calendar ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
