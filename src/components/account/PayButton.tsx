'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };
  }
}

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Starts Razorpay Checkout for an order created on the server. The amount is
 * decided by the server; the browser's "success" is only a hint that the server
 * verifies with Razorpay before anything is marked as paid.
 */
export default function PayButton({
  request,
  label,
  needsStartDate,
  minDate,
  maxDate,
}: {
  request: { invoiceId: string } | { coursePlanId: string };
  label: string;
  needsStartDate?: boolean;
  minDate?: string;
  maxDate?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(minDate ?? '');

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const [ready, res] = await Promise.all([
        loadCheckout(),
        fetch('/api/account/payments/order', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(needsStartDate ? { ...request, startDate } : request),
        }),
      ]);
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      if (!res.ok) throw new Error(json.error ?? 'Could not start the payment. Please try again.');
      if (!ready || !window.Razorpay) throw new Error('The payment window could not load. Check your connection or disable content blockers, then try again.');

      const { order, checkout } = json;
      const rzp = new window.Razorpay({
        key: checkout.keyId,
        order_id: order.gatewayOrderId,
        amount: Number(order.amountPaise),
        currency: order.currency,
        name: 'Moksha Wellness',
        description: order.description,
        image: `${window.location.origin}/logo-mark.png?v=2025-2`,
        prefill: { name: checkout.name, contact: `+91${checkout.mobile}`, email: checkout.email ?? undefined },
        notes: { order: order.id },
        theme: { color: '#093a18' },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Verified on the server (signature + Razorpay's own record) before the status page shows "paid".
          await fetch('/api/account/payments/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(r) }).catch(() => undefined);
          router.push(`/payment/${order.id}`);
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setError('Payment window closed. No money was taken unless you completed the payment — you can try again.');
          },
        },
      });
      rzp.on('payment.failed', (r) => setError(r.error?.description ? `Payment failed: ${r.error.description}. You can try again.` : 'Payment failed. You can try again.'));
      rzp.open();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {needsStartDate && (
        <div>
          <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-ink/80">
            When would you like to start?
          </label>
          <input id="startDate" type="date" className="field" min={minDate} max={maxDate} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
      )}
      <button type="button" className="btn-primary w-full !py-4 text-base" onClick={pay} disabled={busy || (needsStartDate && !startDate)}>
        {busy ? 'Opening secure payment…' : label}
      </button>
      {error && (
        <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}
      <p className="flex items-center justify-center gap-2 text-xs text-ink/50">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M6 10V7a6 6 0 1 1 12 0v3M5 10h14v11H5z" strokeLinejoin="round" />
        </svg>
        Secure payment by Razorpay · UPI, cards, netbanking, wallets
      </p>
    </div>
  );
}
