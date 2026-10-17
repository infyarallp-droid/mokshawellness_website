import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AdminApiError, adminJson, clientIpFrom } from '@/lib/server/admin-api';
import { exchangeCode, googleConfig } from '@/lib/server/google';
import { GOOGLE_PENDING_COOKIE, OAUTH_STATE_COOKIE, getSessionToken, safeNext, setSession } from '@/lib/server/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

const back = (request: Request, path: string) => NextResponse.redirect(new URL(path, request.url));

// GET /api/auth/google/callback?code&state — Google redirects here after the user chooses an account.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const raw = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete({ name: OAUTH_STATE_COOKIE, path: '/api/auth/google' });
  const cfg = googleConfig();
  if (!cfg) return back(request, '/login?error=google-unavailable');
  if (url.searchParams.get('error')) return back(request, '/login?error=google-cancelled');

  let saved: { state: string; verifier: string; mode: 'login' | 'link'; next: string };
  try {
    saved = JSON.parse(raw ?? '');
  } catch {
    return back(request, '/login?error=google-expired');
  }
  const state = url.searchParams.get('state') ?? '';
  // The state proves this response belongs to the sign-in this browser started.
  if (!state || state.length !== saved.state.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(saved.state))) {
    return back(request, '/login?error=google-expired');
  }
  const idToken = await exchangeCode(cfg, url.searchParams.get('code') ?? '', saved.verifier);
  if (!idToken) return back(request, '/login?error=google-failed');

  const meta = { clientIp: clientIpFrom(request.headers), userAgent: request.headers.get('user-agent') };
  try {
    if (saved.mode === 'link') {
      const session = await getSessionToken();
      if (!session) return back(request, '/login?next=/account/settings');
      await adminJson('/api/account/google', { method: 'POST', body: { idToken }, session, ...meta });
      return back(request, '/account/settings?google=connected');
    }

    const res = await adminJson<{ status: 'SIGNED_IN' | 'NEEDS_MOBILE'; token?: string; expiresAt?: string; pendingToken?: string; profile?: { name: string | null; email: string | null } }>(
      '/api/customer-auth/google',
      { method: 'POST', body: { idToken }, ...meta },
    );
    if (res.status === 'SIGNED_IN' && res.token && res.expiresAt) {
      await setSession(res.token, res.expiresAt);
      return back(request, safeNext(saved.next));
    }
    // New Google user: a mobile number is mandatory before any account exists.
    jar.set(GOOGLE_PENDING_COOKIE, JSON.stringify({ pendingToken: res.pendingToken, name: res.profile?.name ?? '', email: res.profile?.email ?? '', next: saved.next }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 20 * 60,
    });
    return back(request, '/signup/google');
  } catch (err) {
    const message = err instanceof AdminApiError ? err.message : 'Google sign-in failed. Please try again.';
    const target = saved.mode === 'link' ? '/account/settings' : '/login';
    return back(request, `${target}?error=${encodeURIComponent(message)}`);
  }
}
