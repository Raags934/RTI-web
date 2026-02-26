/**
 * True when the app is running in the browser on localhost/127.0.0.1.
 * Use this to enable "local dev" mode: no Okta, local API (e.g. localhost:5000).
 */
export function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}
