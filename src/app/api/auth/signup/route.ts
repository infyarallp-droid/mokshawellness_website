import { NextResponse } from 'next/server';
import { adminJson, clientIpFrom } from '@/lib/server/admin-api';
import { errorResponse, isSameOrigin, jsonError, readJson } from '@/lib/server/request';
import { safeNext, setSession } from '@/lib/server/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST /api/auth/signup — create an account with mobile number + password
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError(403, 'Please use the sign-up form on this website.');
  const body = await readJson(request);
  if (!body) return jsonError(400, 'The form could not be read. Please try again.');
  // Honeypot: bots fill hidden fields; answer vaguely and create nothing.
  if (body.company) return jsonError(400, 'Please check the form and try again.');
  try {
    const res = await adminJson<{ token: string; expiresAt: string }>('/api/customer-auth/signup', {
      method: 'POST',
      body: {
        fullName: String(body.fullName ?? ''),
        mobile: String(body.mobile ?? ''),
        email: String(body.email ?? ''),
        password: String(body.password ?? ''),
        whatsappOptIn: body.whatsappOptIn === true,
      },
      clientIp: clientIpFrom(request.headers),
      userAgent: request.headers.get('user-agent'),
    });
    await setSession(res.token, res.expiresAt);
    return NextResponse.json({ ok: true, next: safeNext(body.next as string) });
  } catch (err) {
    return errorResponse(err);
  }
}
