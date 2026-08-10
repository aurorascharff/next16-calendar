'use client';

import { useActionState } from 'react';
import { toast } from 'sonner';
import { Boundary } from '@/components/internal/boundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { NewCalendarButton } from '@/features/calendar/components/calendar-manager';
import { updateBookingAvailability } from '../booking-actions';

type Settings = {
  active: boolean;
  calendarId: string;
  calendars: { color: string; id: string; name: string }[];
  duration: number;
  endTime: string;
  handle: string;
  startTime: string;
  title: string;
};

type FormValues = {
  active: boolean;
  calendarId: string;
  duration: string;
  endTime: string;
  startTime: string;
  title: string;
};

type State = { key?: number; values?: FormValues };

const fieldLabel = 'text-muted mb-1.5 block text-xs font-medium';

export function BookingSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction] = useActionState(async (_prev: State, formData: FormData): Promise<State> => {
    const values = {
      active: formData.get('active') === 'on',
      calendarId: String(formData.get('calendarId')),
      duration: String(formData.get('duration')),
      endTime: String(formData.get('endTime')),
      startTime: String(formData.get('startTime')),
      title: String(formData.get('title')),
    };
    const result = await updateBookingAvailability({
      active: values.active,
      calendarId: values.calendarId,
      duration: Number(values.duration),
      endTime: values.endTime,
      startTime: values.startTime,
      title: values.title,
    });

    if (result.error) {
      toast.error(result.error);
      return { key: Date.now(), values };
    }
    toast.success('Availability updated.');
    return {};
  }, {});

  const values = state.values ?? {
    active: settings.active,
    calendarId: settings.calendarId,
    duration: String(settings.duration),
    endTime: settings.endTime,
    startTime: settings.startTime,
    title: settings.title,
  };
  const hasCalendars = settings.calendars.length > 0;

  return (
    <Boundary label="BookingSettingsForm" asChild>
      <form action={formAction} className="flex flex-1 flex-col" key={state.key ?? settings.handle}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Availability settings</h2>
            <p className="text-muted mt-1 text-sm">Control the shared booking link for @{settings.handle}.</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Input
              defaultChecked={hasCalendars && values.active}
              disabled={!hasCalendars}
              name="active"
              type="checkbox"
              variant="checkbox"
            />
            Active
          </label>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className={fieldLabel}>Title</span>
            <Input defaultValue={values.title} name="title" />
          </label>
          {hasCalendars ? (
            <label className="block">
              <span className={fieldLabel}>Calendar</span>
              <Select defaultValue={values.calendarId} name="calendarId">
                {settings.calendars.map(calendar => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </option>
                ))}
              </Select>
            </label>
          ) : (
            <div>
              <span className={fieldLabel}>Calendar</span>
              <div className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark flex min-h-12 items-center justify-between gap-3 rounded-md border px-3 py-2">
                <p className="text-muted text-sm">Create a calendar to accept bookings.</p>
                <NewCalendarButton className="shrink-0">Create calendar</NewCalendarButton>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className={fieldLabel}>Start</span>
              <Input defaultValue={values.startTime} name="startTime" type="time" />
            </label>
            <label className="block">
              <span className={fieldLabel}>End</span>
              <Input defaultValue={values.endTime} name="endTime" type="time" />
            </label>
            <label className="block">
              <span className={fieldLabel}>Duration</span>
              <Select defaultValue={values.duration} name="duration">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
              </Select>
            </label>
          </div>
        </div>
        <div className="mt-auto flex justify-end pt-5">
          <Button disabled={!hasCalendars} type="submit">
            Save settings
          </Button>
        </div>
      </form>
    </Boundary>
  );
}
