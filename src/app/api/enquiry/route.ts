import { NextResponse } from 'next/server';
import { enquirySchema, normalizeMobile } from '@/content/enquiry';
import { allProgrammes } from '@/content/programmes';

// Website enquiry → Moksha admin panel "Leads" inbox.
//
// The browser talks only to this route. The admin API key stays on the server,
// so it never appears in the page source or in the visitor's network tab.

export const runtime = 'nodejs';
// The admin API is on a free tier that sleeps when idle; give it time to wake.
export const maxDuration = 60;
const UPSTREAM_TIMEOUT_MS = 55_000;

// Light per-IP throttle. It is per server instance, so it slows a casual
// spammer rather than stopping a determined one — the honeypot does the rest.
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, fields }, { status });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'The form could not be read. Please try again.');
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '');
      // A filled honeypot is a bot: answer as if it worked and store nothing.
      if (key === 'company') return NextResponse.json({ ok: true });
      if (key && !fields[key]) fields[key] = issue.message;
    }
    return fail(400, 'Please check the highlighted fields.', fields);
  }
  const input = parsed.data;
  if (input.company) return NextResponse.json({ ok: true });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (throttled(ip)) return fail(429, 'You have sent several enquiries already. Please wait a few minutes and try again.');

  const adminUrl = process.env.ADMIN_API_URL?.replace(/\/+$/, '');
  const apiKey = process.env.PUBLIC_LEADS_API_KEY;
  if (!adminUrl || !apiKey) {
    console.error('[enquiry] ADMIN_API_URL / PUBLIC_LEADS_API_KEY are not configured — enquiry was NOT saved');
    return fail(503, 'Online enquiries are not switched on yet. Please contact the studio directly.');
  }

  const programme = allProgrammes.find((p) => p.slug === input.interest);
  const message = [
    programme ? `Interested in: ${programme.name}` : null,
    input.mode !== 'No preference' ? `Preferred format: ${input.mode}` : null,
    input.message || null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const upstream = await fetch(`${adminUrl}/api/public/leads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        name: input.name,
        phone: normalizeMobile(input.mobile),
        email: input.email,
        message,
        source: 'WEBSITE',
        sourceDetail: {
          form: 'website-enquiry',
          interest: programme?.name ?? null,
          interestSlug: programme?.slug ?? null,
          preferredMode: input.mode,
        },
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!upstream.ok) {
      // Log the status only — never the key or the visitor's details.
      console.error(`[enquiry] admin API answered ${upstream.status}`);
      return fail(502, 'We could not save your enquiry just now. Please try again in a minute.');
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[enquiry] admin API unreachable:', (err as Error).name);
    return fail(502, 'We could not reach our system just now. Please try again in a minute.');
  }
}
