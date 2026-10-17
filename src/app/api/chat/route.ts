import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminApiError, adminFetch, clientIpFrom } from '@/lib/server/admin-api';

// AI chatbot → the admin API, which holds the Anthropic (Claude) key, knows the studio content and
// saves leads. This route only forwards the conversation and streams the reply back.

export const runtime = 'nodejs';
// The admin API is on a free tier that sleeps when idle; give it time to wake.
export const maxDuration = 60;

const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(60),
});

const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'The message could not be read. Please try again.');
  }
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) return fail(400, 'Please type a shorter message.');

  try {
    const upstream = await adminFetch('/api/public/chat', {
      method: 'POST',
      body: parsed.data,
      clientIp: clientIpFrom(request.headers),
      userAgent: request.headers.get('user-agent'),
    });
    if (!upstream.ok || !upstream.body) {
      const err = (await upstream.json().catch(() => ({}))) as { error?: string };
      return fail(upstream.status === 200 ? 502 : upstream.status, err.error ?? 'The assistant is not available just now.');
    }
    return new Response(upstream.body, {
      headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' },
    });
  } catch (err) {
    if (err instanceof AdminApiError) return fail(err.status, 'The assistant is not available just now. Please message us on WhatsApp.');
    throw err;
  }
}
