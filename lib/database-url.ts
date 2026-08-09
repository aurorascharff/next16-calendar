export function normalizeDatabaseUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.searchParams.get('sslmode') !== 'disable') {
    parsed.searchParams.set('sslmode', 'verify-full');
  }
  return parsed.toString();
}
