'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';

export const WHATSAPP_CONSENT_TEXT =
  'I agree to receive class reminders, payment updates and studio announcements from Moksha Wellness on WhatsApp. I can opt out at any time by replying STOP or from my account settings.';

type Fields = Record<string, string>;

/** POST JSON to one of this site's routes and follow `next` on success. */
function useSubmit(endpoint: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Fields>({});
  const [slow, setSlow] = useState(false);

  async function submit(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const slowTimer = setTimeout(() => setSlow(true), 6000);
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.');
        if (json.fields) setFieldErrors(json.fields);
        return json;
      }
      router.replace(json.next ?? '/account');
      router.refresh();
      return json;
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setBusy(false);
    }
  }
  return { submit, busy, error, fieldErrors, slow };
}

export function FormField({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-clay">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>
      )}
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, invalid }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className="field pr-16"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        aria-invalid={invalid || undefined}
      />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-forest" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

function FormError({ error, slow }: { error: string | null; slow: boolean }) {
  return (
    <>
      {error && (
        <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}
      {slow && !error && <p className="text-sm text-ink/60">Still working — the first request after a quiet spell can take up to a minute…</p>}
    </>
  );
}

function WhatsAppOptIn({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 rounded-xl bg-sage/40 p-3 text-sm text-ink/80">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-forest" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="font-medium text-forest">WhatsApp updates (optional).</span> {WHATSAPP_CONSENT_TEXT}
      </span>
    </label>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const { submit, busy, error, fieldErrors, slow } = useSubmit('/api/auth/login');
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit({ mobile, password, next });
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField id="mobile" label="Mobile number" error={fieldErrors.mobile}>
        <input id="mobile" className="field" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
      </FormField>
      <FormField id="password" label="Password" error={fieldErrors.password}>
        <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
      </FormField>
      <FormError error={error} slow={slow} />
      <button type="submit" className="btn-primary w-full" disabled={busy || !mobile || !password}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-center text-xs text-ink/50">Forgot your password? Contact the studio and we will reset it for you.</p>
    </form>
  );
}

export function SignupForm({ next, policies }: { next: string; policies: { terms: boolean; privacy: boolean } }) {
  const [f, setF] = useState({ fullName: '', mobile: '', email: '', password: '', confirm: '', whatsappOptIn: false, company: '' });
  const [localError, setLocalError] = useState<string | null>(null);
  const { submit, busy, error, fieldErrors, slow } = useSubmit('/api/auth/signup');
  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setLocalError('The two passwords do not match.');
    setLocalError(null);
    submit({ ...f, next });
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField id="fullName" label="Full name" error={fieldErrors.fullName}>
        <input id="fullName" className="field" autoComplete="name" value={f.fullName} onChange={(e) => set('fullName', e.target.value)} required />
      </FormField>
      <FormField id="mobile" label="Mobile number" error={fieldErrors.mobile} hint="You will use this number to sign in.">
        <input id="mobile" className="field" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={f.mobile} onChange={(e) => set('mobile', e.target.value)} required />
      </FormField>
      <FormField id="email" label="Email (optional)" error={fieldErrors.email}>
        <input id="email" type="email" className="field" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
      </FormField>
      <FormField id="password" label="Password" error={fieldErrors.password} hint="At least 8 characters, with a letter and a number.">
        <PasswordInput id="password" value={f.password} onChange={(v) => set('password', v)} autoComplete="new-password" />
      </FormField>
      <FormField id="confirm" label="Confirm password">
        <PasswordInput id="confirm" value={f.confirm} onChange={(v) => set('confirm', v)} autoComplete="new-password" invalid={!!f.confirm && f.confirm !== f.password} />
      </FormField>
      <WhatsAppOptIn checked={f.whatsappOptIn} onChange={(v) => set('whatsappOptIn', v)} />
      {/* Honeypot for bots — hidden from people and screen readers. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={f.company} onChange={(e) => set('company', e.target.value)} />
      <FormError error={localError ?? error} slow={slow} />
      <button type="submit" className="btn-primary w-full" disabled={busy || !f.fullName || !f.mobile || !f.password}>
        {busy ? 'Creating your account…' : 'Create account'}
      </button>
      {/* Only link to policy pages the studio has published (they 404 until then). */}
      {(policies.terms || policies.privacy) && (
        <p className="text-center text-xs text-ink/50">
          By creating an account you agree to our{' '}
          {policies.terms && (
            <Link href="/terms" className="underline">
              terms
            </Link>
          )}
          {policies.terms && policies.privacy && ' and '}
          {policies.privacy && (
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
          )}
          .
        </p>
      )}
    </form>
  );
}

export function GoogleMobileForm({ name, email }: { name: string; email: string }) {
  const [f, setF] = useState({ fullName: name, mobile: '', whatsappOptIn: false });
  const { submit, busy, error, fieldErrors, slow } = useSubmit('/api/auth/google/complete');
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(f);
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {email && (
        <p className="rounded-xl bg-sage/40 px-4 py-3 text-sm text-ink/80">
          Signed in with Google as <strong>{email}</strong>
        </p>
      )}
      <FormField id="fullName" label="Full name" error={fieldErrors.fullName}>
        <input id="fullName" className="field" autoComplete="name" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} required />
      </FormField>
      <FormField id="mobile" label="Mobile number" error={fieldErrors.mobile} hint="Required — the studio uses it for your classes, receipts and reminders.">
        <input id="mobile" className="field" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} required autoFocus />
      </FormField>
      <WhatsAppOptIn checked={f.whatsappOptIn} onChange={(v) => setF({ ...f, whatsappOptIn: v })} />
      <FormError error={error} slow={slow} />
      <button type="submit" className="btn-primary w-full" disabled={busy || !f.fullName || !f.mobile}>
        {busy ? 'Finishing…' : 'Finish creating my account'}
      </button>
    </form>
  );
}
