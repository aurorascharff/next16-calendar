export const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function weekdayName(day: string) {
  return WEEKDAY_NAMES[new Date(`${day}T00:00:00.000Z`).getUTCDay()];
}

export function matchesRecurrence(recurrence: string | null | undefined, day: string) {
  if (!recurrence) return false;
  const weekday = new Date(`${day}T00:00:00.000Z`).getUTCDay();
  return recurrence === 'weekday' ? weekday >= 1 && weekday <= 5 : recurrence === WEEKDAY_NAMES[weekday];
}

// One occurrence of a recurring event, addressable on its own so a drag can move a single day.
export function occurrenceId(sourceId: string, day: string) {
  return `${sourceId}:${day}`;
}

// Moving a recurring event keeps a weekday pattern, but a single-weekday pattern follows the drop day.
export function recurrenceAfterMove(recurrence: string, day: string) {
  return recurrence === 'weekday' ? 'weekday' : weekdayName(day);
}
