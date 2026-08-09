export const SESSION_COOKIE = 'flow-user';
export const STALE_SESSION_COOKIES = ['dayline-user', 'cadence-user'];
export const SESSION_COOKIES = [SESSION_COOKIE, ...STALE_SESSION_COOKIES];
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type CookieDeleter = { delete(name: string): unknown };

export function deleteSessionCookies(cookies: CookieDeleter) {
  cookies.delete(SESSION_COOKIE);
  for (const name of STALE_SESSION_COOKIES) cookies.delete(name);
}
