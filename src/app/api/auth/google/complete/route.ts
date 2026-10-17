import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminJson, clientIpFrom } from '@/lib/server/admin-api';
import { errorResponse, isSameOrigin, jsonError, readJson } from '@/lib/server/request';
import { GOOGLE_PENDING_COOKIE, safeNext, setSession } from '@/lib/server/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST /api/auth/google/complete — the mandatory mobile-number step for new Google sign-ups.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError(403, 'Not allowed');
  const jar = await cookies();
  let pending: { pendingToken: string; next?: string };
  try {
    pending = JSON.parse(jar.get(GOOGLE_PENDING_COOKIE)?.value ?? '');
  } catch {
    return jsonError(401, 'Your Google sign-in has expired. Please choose "Continue with Google" again.', { code: 'EXPIRED' });
  }
  const body = await readJson(request);
  if (!body) return jsonError(400, 'The form could not be read. Please try again.');
  try {
    const res = await adminJson<{ token: string; expiresAt: string }>('/api/customer-auth/google/complete', {
      method: 'POST',
      body: {
        pendingToken: pending.pendingToken,
        fullName: String(body.fullName ?? ''),
        mobile: String(body.mobile ?? ''),
        whatsappOptIn: body.whatsappOptIn === true,
      },
      clientIp: clientIpFrom(request.headers),
      userAgent: request.headers.get('user-agent'),
    });
    jar.delete(GOOGLE_PENDING_COOKIE);
    await setSession(res.token, res.expiresAt);
    return NextResponse.json({ ok: true, next: safeNext(pending.next) });
  } catch (err) {
    return errorResponse(err);
  }
}
