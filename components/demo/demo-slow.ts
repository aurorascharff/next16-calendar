import 'server-only';

export function isSlowEnabled() {
  return process.env.NODE_ENV === 'development';
}
