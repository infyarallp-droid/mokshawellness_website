import { NextResponse } from 'next/server';
import { adminJson, clientIpFrom } from '@/lib/server/admin-api';
import { errorResponse, isSameOrigin, jsonError, readJson } from '@/lib/server/request';
import { safeNext, setSession } from '@/lib/server/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST /api/auth/login — mobile number + password
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError(403, 'Please use the sign-in form on this website.');
  const body = await readJson(request);
  if (!body) return jsonError(400, 'The form could not be read. Please try again.');
  try {
    const res = await adminJson<{ token: string; expiresAt: string; account: { mustChangePassword: boolean } }>('/api/customer-auth/login', {
      method: 'POST',
      body: { mobile: String(body.mobile ?? ''), password: String(body.password ?? '') },
      clientIp: clientIpFrom(request.headers),
      userAgent: request.headers.get('user-agent'),
    });
    await setSession(res.token, res.expiresAt);
    const next = res.account.mustChangePassword ? '/account/settings?change-password=1' : safeNext(body.next as string);
    return NextResponse.json({ ok: true, next });
  } catch (err) {
    return errorResponse(err);
  }
}
