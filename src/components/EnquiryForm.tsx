'use client';

import { useRef, useState, type FormEvent } from 'react';
import { enquirySchema, MODES, type EnquiryInput } from '@/content/enquiry';

export interface ProgrammeOption {
  slug: string;
  name: string;
  mode?: string;
  category: 'REGULAR' | 'TEACHER_TRAINING';
}

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldErrors = Partial<Record<keyof EnquiryInput, string>>;

const empty = (interest: string): EnquiryInput => ({
  name: '',
  mobile: '',
  email: '',
  interest,
  mode: 'No preference',
  message: '',
  company: '',
});

export default function EnquiryForm({ initialInterest = '', programmes }: { initialInterest?: string; programmes: ProgrammeOption[] }) {
  const regularClasses = programmes.filter((p) => p.category === 'REGULAR');
  const teacherTraining = programmes.filter((p) => p.category === 'TEACHER_TRAINING');
  const [values, setValues] = useState<EnquiryInput>(() => empty(initialInterest));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [notice, setNotice] = useState('');
  // Synchronous guard: a double click cannot send the enquiry twice.
  const sending = useRef(false);

  const set = <K extends keyof EnquiryInput>(key: K, value: EnquiryInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (status === 'error') setStatus('idle');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending.current) return;

    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof EnquiryInput;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus('error');
      setNotice('Please check the highlighted fields.');
      return;
    }

    sending.current = true;
    setStatus('sending');
    setNotice('');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; fields?: FieldErrors } | null;
      if (res.ok && data?.ok) {
        setStatus('sent');
        setValues(empty(''));
      } else {
        setErrors(data?.fields ?? {});
        setStatus('error');
        setNotice(data?.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setNotice('You seem to be offline. Check your connection and try again — your details are still here.');
    } finally {
      sending.current = false;
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-3xl border border-brand/30 bg-white p-8 text-center sm:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/15 text-2xl text-forest">✓</div>
        <h3 className="mt-5 text-3xl font-medium">Thank you — we have your enquiry.</h3>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/70">
          Someone from the studio will get back to you on the number you shared.
        </p>
        <button type="button" className="btn-ghost mt-7" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const label = 'mb-1.5 block text-sm font-semibold text-forest';
  const err = (key: keyof EnquiryInput) =>
    errors[key] ? (
      <p id={`${key}-error`} className="mt-1.5 text-sm text-red-700">
        {errors[key]}
      </p>
    ) : null;
  const aria = (key: keyof EnquiryInput) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-forest/10 bg-white/80 p-6 shadow-[0_30px_80px_-40px_rgb(var(--forest)/0.4)] sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            Your name
          </label>
          <input id="name" className="field" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} {...aria('name')} />
          {err('name')}
        </div>
        <div>
          <label htmlFor="mobile" className={label}>
            Mobile number
          </label>
          <input
            id="mobile"
            className="field"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile"
            value={values.mobile}
            onChange={(e) => set('mobile', e.target.value)}
            {...aria('mobile')}
          />
          {err('mobile')}
        </div>
        <div>
          <label htmlFor="email" className={label}>
            Email <span className="font-normal text-ink/50">(optional)</span>
          </label>
          <input id="email" className="field" type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} {...aria('email')} />
          {err('email')}
        </div>
        <div>
          <label htmlFor="interest" className={label}>
            I am interested in
          </label>
          <select id="interest" className="field" value={values.interest} onChange={(e) => set('interest', e.target.value)} {...aria('interest')}>
            <option value="">Not sure yet — help me choose</option>
            <optgroup label="Regular classes">
              {regularClasses.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                  {p.mode ? ` — ${p.mode}` : ''}
                </option>
              ))}
            </optgroup>
            <optgroup label="Teacher training">
              {teacherTraining.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                  {p.mode ? ` — ${p.mode}` : ''}
                </option>
              ))}
            </optgroup>
          </select>
          {err('interest')}
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className={label}>How would you like to practise?</legend>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <label
              key={m}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                values.mode === m ? 'border-forest bg-forest text-cream' : 'border-forest/20 text-ink/75 hover:border-forest/50'
              }`}
            >
              <input type="radio" name="mode" value={m} checked={values.mode === m} onChange={() => set('mode', m)} className="sr-only" />
              {m}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="message" className={label}>
          Anything we should know? <span className="font-normal text-ink/50">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={4}
          className="field resize-y"
          placeholder="Your experience, preferred timings, any questions…"
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          {...aria('message')}
        />
        {err('message')}
      </div>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" value={values.company ?? ''} onChange={(e) => set('company', e.target.value)} />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>
        <p className="text-xs leading-relaxed text-ink/55">We use your details only to reply to this enquiry.</p>
      </div>
      <p role="alert" aria-live="assertive" className={`mt-4 text-sm text-red-700 ${status === 'error' && notice ? '' : 'hidden'}`}>
        {notice}
      </p>
      {status === 'sending' && <p className="mt-4 text-sm text-ink/60">This can take a few seconds…</p>}
    </form>
  );
}
