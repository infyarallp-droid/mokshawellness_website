import { NextResponse } from 'next/server';
import { adminFetch } from '@/lib/server/admin-api';
import { isSameOrigin, jsonError } from '@/lib/server/request';
import { clearSession, getSessionToken } from '@/lib/server/session';

export const runtime = 'nodejs';

// POST /api/auth/logout — end the session on the API and forget it here.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError(403, 'Not allowed');
  const token = await getSessionToken();
  if (token) await adminFetch('/api/customer-auth/logout', { method: 'POST', session: token, timeoutMs: 10_000 }).catch(() => undefined);
  await clearSession();
  return NextResponse.json({ ok: true });
}
