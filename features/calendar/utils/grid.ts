import { timeToMinutes } from '../calendar-utils';
import type { CalendarEvent } from '../types/calendar';

export const HOUR_HEIGHT = 72;
export const TIME_COLUMN_WIDTH = 72;
export const DAY_COLUMN_MIN_WIDTH = 144;
export const START_HOUR = 6;
export const HOURS = Array.from({ length: 24 }, (_, index) => (START_HOUR + index) % 24);
export const START_MINUTES = START_HOUR * 60;
export const END_MINUTES = (24 + START_HOUR) * 60;
export const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT;
export const DEFAULT_SCROLL_HOUR = START_HOUR;
export const DEFAULT_SCROLL_TOP = (DEFAULT_SCROLL_HOUR * 60 - START_MINUTES) * (HOUR_HEIGHT / 60);
export const SNAP_MINUTES = 15;
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 24 * 60];
const MIN_PACK_DURATION = Math.ceil((25 / HOUR_HEIGHT) * 60);

export type Placement = { col: number; cols: number };

export function displayMinutes(minutes: number) {
  return minutes < START_MINUTES ? minutes + 24 * 60 : minutes;
}

export function eventStartMinutes(start: string) {
  return displayMinutes(timeToMinutes(start));
}

export function packDay(events: CalendarEvent[]): Map<string, Placement> {
  const items = events
    .map(event => ({
      end: eventStartMinutes(event.start) + Math.max(event.duration, MIN_PACK_DURATION),
      event,
      start: eventStartMinutes(event.start),
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
  const raw = START_MINUTES + (offset / HOUR_HEIGHT) * 60;
  const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
  return Math.max(START_MINUTES, Math.min(END_MINUTES, snapped));
}

export function minutesToTime(minutes: number) {
  const wrapped = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

export function nearestDuration(minutes: number) {
  return Math.max(SNAP_MINUTES, Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES);
}

export function topFor(minutes: number) {
  return ((displayMinutes(minutes) - START_MINUTES) / 60) * HOUR_HEIGHT;
}
