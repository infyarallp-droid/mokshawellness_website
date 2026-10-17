import { NextResponse } from 'next/server';
import { clearSession, safeNext } from '@/lib/server/session';

export const runtime = 'nodejs';

// Server pages cannot change cookies while rendering; they send expired sessions here.
export async function GET(request: Request) {
  const url = new URL(request.url);
  await clearSession();
  return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(safeNext(url.searchParams.get('next')))}`, url));
}
