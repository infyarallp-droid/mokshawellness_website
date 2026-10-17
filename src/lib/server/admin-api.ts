// Server-only access to the Moksha admin API. The service key and session tokens
// are added here and never reach the browser.

export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export function adminConfig() {
  const url = process.env.ADMIN_API_URL?.replace(/\/+$/, '');
  const serviceKey = process.env.WEBSITE_SERVICE_KEY;
  return url && serviceKey ? { url, serviceKey } : null;
}

/** The visitor's IP as seen by this server (forwarded to the API for rate limiting). */
export function clientIpFrom(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
}

interface Opts {
  method?: string;
  body?: unknown;
  session?: string | null;
  clientIp?: string;
  userAgent?: string | null;
  /** Milliseconds; the free API tier can take ~50 s to wake. */
  timeoutMs?: number;
}

/** Call the admin API as the website. Returns the raw Response (for PDFs) — see adminJson for JSON. */
export async function adminFetch(path: string, opts: Opts = {}): Promise<Response> {
  const cfg = adminConfig();
  if (!cfg) throw new AdminApiError(503, 'Accounts are not switched on yet. Please contact the studio.');
  const headers: Record<string, string> = { 'x-service-key': cfg.serviceKey };
  if (opts.body !== undefined) headers['content-type'] = 'application/json';
  if (opts.session) headers.authorization = `Bearer ${opts.session}`;
  if (opts.clientIp) headers['x-client-ip'] = opts.clientIp;
  if (opts.userAgent) headers['user-agent'] = opts.userAgent.slice(0, 300);
  try {
    return await fetch(`${cfg.url}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(opts.timeoutMs ?? 55_000),
    });
  } catch (err) {
    console.error('[admin-api] unreachable:', (err as Error).name);
    throw new AdminApiError(502, 'We could not reach our system just now. Please try again in a minute.');
  }
}

/** JSON call; throws AdminApiError with the API's own message on failure. */
export async function adminJson<T = Record<string, unknown>>(path: string, opts: Opts = {}): Promise<T> {
  const res = await adminFetch(path, opts);
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new AdminApiError(res.status, typeof body.error === 'string' ? body.error : 'Something went wrong. Please try again.', body);
  return body as T;
}
