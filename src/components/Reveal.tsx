'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fade-and-rise on scroll. The hidden state is applied only after hydration,
 * so the content is fully visible without JavaScript and to search engines.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    // Anything already on screen stays as it is — only content below the fold animates in.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.style.setProperty('--reveal-delay', `${delay}ms`);
    el.classList.add('reveal-ready');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
