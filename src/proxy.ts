import { NextResponse, type NextRequest } from 'next/server';

// Quick redirect for signed-out visitors on account pages. This is only a
// convenience: every account request is still authorised by the admin API.
export function proxy(request: NextRequest) {
  if (!request.cookies.has('mw_session')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout', '/payment/:path*'],
};
