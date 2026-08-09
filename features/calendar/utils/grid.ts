import { timeToMinutes } from '../calendar-utils';
import type { CalendarEvent } from '../types/calendar';

export const HOUR_HEIGHT = 72;
export const START_HOUR = 0;
export const HOURS = Array.from({ length: 24 }, (_, index) => START_HOUR + index);
export const END_MINUTES = 24 * 60;
export const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT;
export const DEFAULT_SCROLL_HOUR = 7;
export const DEFAULT_SCROLL_TOP = (DEFAULT_SCROLL_HOUR - START_HOUR) * HOUR_HEIGHT;
export const SNAP_MINUTES = 15;
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export type Placement = { col: number; cols: number };

export function packDay(events: CalendarEvent[]): Map<string, Placement> {
  const items = events
    .map(event => ({
      end: timeToMinutes(event.start) + event.duration,
      event,
      start: timeToMinutes(event.start),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const placement = new Map<string, Placement>();
  let cluster: typeof items = [];

  function flush() {
    const columnEnds: number[] = [];
    for (const item of cluster) {
      let col = columnEnds.findIndex(end => end <= item.start);
      if (col === -1) {
        col = columnEnds.length;
        columnEnds.push(item.end);
      } else {
        columnEnds[col] = item.end;
      }
      placement.set(item.event.id, { col, cols: 0 });
    }
    for (const item of cluster) {
      placement.get(item.event.id)!.cols = columnEnds.length;
    }
    cluster = [];
  }

  let clusterEnd = -1;
  for (const item of items) {
    if (cluster.length && item.start >= clusterEnd) {
      flush();
      clusterEnd = -1;
    }
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  flush();

  return placement;
}

export function snapMinutes(clientY: number, boundsTop: number) {
  const offset = Math.max(0, Math.min(GRID_HEIGHT, clientY - boundsTop));
  const raw = START_HOUR * 60 + (offset / HOUR_HEIGHT) * 60;
  const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
  return Math.max(START_HOUR * 60, Math.min(END_MINUTES, snapped));
}

export function minutesToTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function nearestDuration(minutes: number) {
  return DURATION_OPTIONS.reduce((best, option) =>
    Math.abs(option - minutes) < Math.abs(best - minutes) ? option : best,
  );
}

export function topFor(minutes: number) {
  return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}
