import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authorizeUrl, googleConfig, pkce } from '@/lib/server/google';
import { OAUTH_STATE_COOKIE, getSessionToken, safeNext } from '@/lib/server/session';

export const runtime = 'nodejs';

// GET /api/auth/google?next=/account            → sign in / sign up with Google
// GET /api/auth/google?mode=link                  → connect Google to the signed-in account
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cfg = googleConfig();
  if (!cfg) return NextResponse.redirect(new URL('/login?error=google-unavailable', url));
  const mode = url.searchParams.get('mode') === 'link' ? 'link' : 'login';
  if (mode === 'link' && !(await getSessionToken())) return NextResponse.redirect(new URL('/login?next=/account/settings', url));

  const { verifier, challenge, state } = pkce();
  (await cookies()).set(OAUTH_STATE_COOKIE, JSON.stringify({ state, verifier, mode, next: safeNext(url.searchParams.get('next')) }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // must survive the top-level redirect back from Google
    path: '/api/auth/google',
    maxAge: 10 * 60,
  });
  return NextResponse.redirect(authorizeUrl(cfg, state, challenge));
}
