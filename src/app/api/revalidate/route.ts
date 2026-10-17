import crypto from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CMS_TAG } from '@/lib/content';

export const runtime = 'nodejs';

// POST /api/revalidate — called by the admin API right after content is published,
// so the change is on the website at the next page view (no redeploy).
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get('x-revalidate-secret') ?? '';
  const ok =
    !!secret &&
    given.length === secret.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  // expire: 0 → the next visitor gets fresh content rather than one more stale view.
  revalidateTag(CMS_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: CMS_TAG, at: new Date().toISOString() });
}
