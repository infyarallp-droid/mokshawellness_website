'use client';

import Link from 'next/link';
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

// Floating AI assistant (bottom-left; the contact buttons are bottom-right). Name, greeting and
// suggested questions come from the admin panel → Website → Page Content → "AI chatbot".
// The conversation is kept for this browser tab only.

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  /** Shown to the visitor but never sent back to the assistant. */
  kind?: 'error' | 'saved';
}

const STORAGE_KEY = 'mw-chat';

function load(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Msg[]) : [];
  } catch {
    return [];
  }
}
function store(messages: Msg[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  } catch {
    /* private mode: the chat simply isn't remembered */
  }
}

/** Turn site paths (/contact#enquire) and web links into links; everything else stays text. */
function linkify(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s)]+[^\s).,!?]|(?<![\w/.])\/[a-z][a-z0-9\-/]*(?:#[a-z0-9-]+)?)/gi);
  return parts.map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const cls = 'font-semibold text-brand underline underline-offset-2';
    return part.startsWith('/') ? (
      <Link key={i} href={part} className={cls}>
        {part}
      </Link>
    ) : (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={`${cls} break-all`}>
        {part.replace(/^https?:\/\/(www\.)?/, '')}
      </a>
    );
  });
}

export default function ChatWidget({ botName, greeting, suggestions }: { botName: string; greeting: string; suggestions: string[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const restored = useRef(false);

  function toggle() {
    // Bring back this tab's earlier conversation the first time the chat is opened.
    if (!restored.current) {
      restored.current = true;
      setMessages(load());
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const update = useCallback((fn: (m: Msg[]) => Msg[]) => {
    setMessages((prev) => {
      const next = fn(prev);
      store(next);
      return next;
    });
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setInput('');
    setBusy(true);
    const history = [...messages.filter((m) => !m.kind), { role: 'user' as const, content }];
    update((m) => [...m, { role: 'user', content }, { role: 'assistant', content: '' }]);

    const appendText = (v: string) =>
      update((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, content: last.content ? last.content + v : v.trimStart() };
        return next;
      });
    // Replace the empty reply placeholder (or add after a partial reply) with a notice.
    const notice = (content: string, kind: 'error' | 'saved') =>
      update((m) => {
        const last = m[m.length - 1];
        const trimmed = last?.role === 'assistant' && !last.kind && !last.content ? m.slice(0, -1) : m;
        const out: Msg[] = [...trimmed, { role: 'assistant', content, kind }];
        // Keep streaming into a fresh bubble after a "saved" notice.
        return kind === 'saved' ? [...out, { role: 'assistant', content: '' }] : out;
      });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-20).map(({ role, content }) => ({ role, content: content.slice(0, 2000) })) }),
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        notice(err.error ?? 'The assistant is not available just now. Please message us on WhatsApp.', 'error');
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { t: string; v?: string };
          if (event.t === 'text' && event.v) appendText(event.v);
          else if (event.t === 'saved') notice('✓ Your details were sent to the studio team.', 'saved');
          else if (event.t === 'error') notice(event.v ?? 'Something went wrong. Please try again.', 'error');
        }
      }
    } catch {
      notice('The connection dropped. Please try again.', 'error');
    } finally {
      // Drop an empty trailing placeholder (e.g. after "saved" with no follow-up text).
      update((m) => (m.length && m[m.length - 1].role === 'assistant' && !m[m.length - 1].content ? m.slice(0, -1) : m));
      setBusy(false);
    }
  }

  const started = messages.some((m) => m.role === 'user');

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={`Chat with ${botName}`}
          className="fixed inset-x-3 bottom-24 z-50 flex h-[min(34rem,calc(100dvh-8rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-forest/10 sm:inset-x-auto sm:left-5 sm:w-[23rem]"
        >
          <div className="flex items-center gap-3 bg-forest px-4 py-3 text-cream">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/15" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4L12 3Z" />
                <path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-semibold">{botName}</p>
              <p className="text-xs text-cream/70">AI assistant · usually replies instantly</p>
            </div>
            {started && (
              <button
                type="button"
                onClick={() => update(() => [])}
                className="rounded-full px-2 py-1 text-xs text-cream/80 hover:bg-cream/10 hover:text-cream"
                title="Start a new chat"
              >
                New chat
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 hover:bg-cream/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-cream/40 px-4 py-4 text-[0.94rem] leading-relaxed" aria-live="polite">
            <Bubble role="assistant">{linkify(greeting)}</Bubble>
            {messages.map((m, i) =>
              m.kind === 'saved' ? (
                <p key={i} className="mx-auto w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800 ring-1 ring-green-200">
                  {m.content}
                </p>
              ) : (
                <Bubble key={i} role={m.role} error={m.kind === 'error'}>
                  {m.content ? linkify(m.content) : <Typing />}
                </Bubble>
              ),
            )}
            {!started && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full bg-white px-3 py-1.5 text-left text-sm text-forest ring-1 ring-forest/20 transition hover:bg-forest hover:text-cream"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="border-t border-forest/10 bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="flex items-end gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Your message
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                maxLength={1000}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about classes, plans, timings…"
                className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-forest/15 bg-cream/30 px-3 py-2.5 text-[0.94rem] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest text-cream transition hover:bg-brand disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-ink/50">AI answers can be wrong — please confirm fees and timings with the studio.</p>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : `Chat with ${botName}`}
        className="fixed bottom-5 left-5 z-40 flex h-14 items-center gap-2 rounded-full bg-forest px-4 text-cream shadow-lg transition hover:scale-105 hover:bg-brand"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5v-9Z" />
            <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeLinecap="round" strokeWidth="2.6" />
          </svg>
        )}
        <span className="hidden pr-1 text-sm font-semibold sm:inline">{open ? 'Close' : 'Ask us'}</span>
      </button>
    </>
  );
}

function Bubble({ role, error, children }: { role: 'user' | 'assistant'; error?: boolean; children: ReactNode }) {
  const mine = role === 'user';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 ${
          mine ? 'rounded-br-md bg-forest text-cream' : error ? 'rounded-bl-md bg-red-50 text-red-800 ring-1 ring-red-200' : 'rounded-bl-md bg-white text-ink shadow-sm ring-1 ring-forest/5'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <span className="flex gap-1 py-1" aria-label="Typing">
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest/40" style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}
