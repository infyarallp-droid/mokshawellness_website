import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL('/', request.url));
}
