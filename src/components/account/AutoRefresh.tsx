'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Re-checks the server every few seconds (e.g. while a payment is being confirmed). */
export default function AutoRefresh({ everyMs = 4000, maxTries = 20 }: { everyMs?: number; maxTries?: number }) {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= maxTries) return;
    const t = setTimeout(() => {
      setTries((n) => n + 1);
      router.refresh();
    }, everyMs);
    return () => clearTimeout(t);
  }, [tries, everyMs, maxTries, router]);
  if (tries >= maxTries) return <p className="text-sm text-ink/60">This is taking longer than usual. You can safely leave this page — the payment will appear in your account once Razorpay confirms it.</p>;
  return null;
}
