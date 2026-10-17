import { NextResponse } from 'next/server';
import { AdminApiError } from './admin-api';

/**
 * Same-origin check for state-changing requests (CSRF defence in addition to
 * SameSite=Lax cookies): the browser's Origin must be this site.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') === 'same-origin';
  try {
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

/** Turn any thrown error into a safe JSON response (API messages are passed through; internals are not). */
export function errorResponse(err: unknown) {
  if (err instanceof AdminApiError) {
    const { code, fields } = err.body as { code?: string; fields?: unknown };
    return jsonError(err.status, err.message, { ...(code ? { code } : {}), ...(fields ? { fields } : {}) });
  }
  console.error('[website] unexpected error', err);
  return jsonError(500, 'Something went wrong. Please try again.');
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
