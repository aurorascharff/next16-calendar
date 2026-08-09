'use client';

import { useActionState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

type State = { error?: string; key?: number; values?: FormValues };

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

    if (result.error) return { error: result.error, key: Date.now(), values };
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

  return (
    <form action={formAction} key={state.key ?? settings.handle}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Availability settings</h2>
          <p className="text-muted mt-1 text-sm">Control the shared booking link for @{settings.handle}.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input className="size-4 w-auto" defaultChecked={values.active} name="active" type="checkbox" />
          Active
        </label>
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className={fieldLabel}>Title</span>
          <input defaultValue={values.title} name="title" />
        </label>
        <label className="block">
          <span className={fieldLabel}>Calendar</span>
          <select defaultValue={values.calendarId} disabled={!settings.calendars.length} name="calendarId">
            {settings.calendars.length ? (
              settings.calendars.map(calendar => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))
            ) : (
              <option value="">Create a calendar first</option>
            )}
          </select>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className={fieldLabel}>Start</span>
            <input defaultValue={values.startTime} name="startTime" type="time" />
          </label>
          <label className="block">
            <span className={fieldLabel}>End</span>
            <input defaultValue={values.endTime} name="endTime" type="time" />
          </label>
          <label className="block">
            <span className={fieldLabel}>Duration</span>
            <select defaultValue={values.duration} name="duration">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </label>
        </div>
      </div>
      {state.error ? <p className="text-danger mt-4 text-sm">{state.error}</p> : null}
      <div className="mt-5 flex justify-end">
        <Button type="submit">Save settings</Button>
      </div>
    </form>
  );
}
