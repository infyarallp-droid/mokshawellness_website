import { cookies } from 'next/headers';

// The visitor's session token lives in an httpOnly cookie on this website's own
// domain: scripts on the page cannot read it, and it is only ever sent to this
// server, which forwards it to the admin API.

export const SESSION_COOKIE = 'mw_session';
/** Not a secret: only tells the page header to show "My account" instead of "Sign in". */
export const SIGNED_IN_HINT = 'mw_signed_in';
/** Short-lived ticket between "Continue with Google" and "add your mobile number". */
export const GOOGLE_PENDING_COOKIE = 'mw_google_pending';
export const OAUTH_STATE_COOKIE = 'mw_oauth';

const secure = process.env.NODE_ENV === 'production';

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function setSession(token: string, expiresAt: string | Date) {
  const jar = await cookies();
  const expires = new Date(expiresAt);
  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure, sameSite: 'lax', path: '/', expires });
  jar.set(SIGNED_IN_HINT, '1', { httpOnly: false, secure, sameSite: 'lax', path: '/', expires });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(SIGNED_IN_HINT);
}

/** Only allow redirects to paths on this site (no open redirects). */
export function safeNext(next: string | null | undefined, fallback = '/account'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
