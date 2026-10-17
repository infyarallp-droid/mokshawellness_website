import { NextResponse } from 'next/server';
import { adminFetch, clientIpFrom } from '@/lib/server/admin-api';
import { errorResponse, isSameOrigin, jsonError, readJson } from '@/lib/server/request';
import { clearSession, getSessionToken } from '@/lib/server/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

// The browser's gateway to the signed-in visitor's account on the admin API.
// Only these paths are forwarded; the session cookie becomes a Bearer token here.
const ALLOWED = [
  /^$/,
  /^profile$/,
  /^password$/,
  /^google$/,
  /^whatsapp$/,
  /^sessions(\/revoke-others)?$/,
  /^dashboard$/,
  /^plans$/,
  /^invoices\/[0-9a-f-]{36}\/pdf$/,
  /^receipts\/[0-9a-f-]{36}\/pdf$/,
  /^payments\/(order|verify)$/,
  /^payments\/orders\/[A-Za-z0-9_-]{5,60}$/,
];

async function forward(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const path = (await ctx.params).path.join('/');
  if (!ALLOWED.some((re) => re.test(path))) return jsonError(404, 'Not found');
  if (request.method !== 'GET' && !isSameOrigin(request)) return jsonError(403, 'Not allowed');
  const session = await getSessionToken();
  if (!session) return jsonError(401, 'Please sign in', { code: 'SIGNED_OUT' });

  const body = request.method === 'GET' || request.method === 'DELETE' ? undefined : ((await readJson(request)) ?? {});
  try {
    const res = await adminFetch(`/api/account${path ? `/${path}` : ''}`, {
      method: request.method,
      body,
      session,
      clientIp: clientIpFrom(request.headers),
      userAgent: request.headers.get('user-agent'),
    });
    if (res.status === 401) {
      await clearSession();
      return jsonError(401, 'Your session has ended. Please sign in again.', { code: 'SIGNED_OUT' });
    }
    const type = res.headers.get('content-type') ?? '';
    if (type.includes('application/pdf')) {
      return new NextResponse(res.body, {
        status: res.status,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': res.headers.get('content-disposition') ?? 'inline',
          'cache-control': 'private, no-store',
        },
      });
    }
    const json = await res.json().catch(() => ({ ok: false, error: 'Unexpected response' }));
    return NextResponse.json(json, { status: res.status, headers: { 'cache-control': 'private, no-store' } });
  } catch (err) {
    return errorResponse(err);
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
