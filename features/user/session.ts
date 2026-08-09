export const SESSION_COOKIE = 'flow-user';
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type CookieDeleter = { delete(name: string): unknown };

export function deleteSessionCookies(cookies: CookieDeleter) {
  cookies.delete(SESSION_COOKIE);
}
