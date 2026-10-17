import crypto from 'node:crypto';
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { safeNext } from '@/lib/server/session';

export const runtime = 'nodejs';

/** Verify the short-lived HS256 preview token the admin API signs with the shared service key. */
function validPreviewToken(token: string): boolean {
  const key = process.env.WEBSITE_SERVICE_KEY;
  const parts = token.split('.');
  if (!key || parts.length !== 3) return false;
  const [h, p, sig] = parts;
  const expected = crypto.createHmac('sha256', key).update(`${h}.${p}`).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const header = JSON.parse(Buffer.from(h, 'base64url').toString());
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString());
    return header.alg === 'HS256' && payload.aud === 'moksha-website-preview' && typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// GET /api/preview?token=…&path=/about — opened from the admin panel's "Preview" button.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!validPreviewToken(url.searchParams.get('token') ?? '')) {
    return new NextResponse('This preview link has expired. Open the preview again from the admin panel.', { status: 401 });
  }
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(safeNext(url.searchParams.get('path'), '/'), url));
}
