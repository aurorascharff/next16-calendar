// Normalize the Postgres connection string to `sslmode=verify-full`.
// `prefer`, `require`, and `verify-ca` adopt weaker libpq semantics in
// pg-connection-string v3 / pg v9 and emit a deprecation warning today. We
// always want full TLS verification, so rewrite (or append) the param before
// passing the URL to any client/adapter/CLI codepath. An explicit
// `sslmode=disable` is left as-is for a local/CI Postgres without TLS.
export function normalizeDatabaseUrl(url: string): string {
  const parsed = new URL(url)
  if (parsed.searchParams.get('sslmode') !== 'disable') {
    parsed.searchParams.set('sslmode', 'verify-full')
  }
  return parsed.toString()
}
