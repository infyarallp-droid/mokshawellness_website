import Link from 'next/link';
import type { Announcement } from '@/lib/content';

/** Studio announcements managed in the admin panel (scheduled start/end handled by the API). */
export default function AnnouncementBar({ items }: { items: Announcement[] }) {
  if (!items.length) return null;
  return (
    <div className="bg-forest text-cream" role="region" aria-label="Announcements">
      {items.slice(0, 2).map((a) => (
        <p key={a.id} className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bindu" aria-hidden="true" />
          <span>{a.message}</span>
          {a.linkUrl && (
            <Link href={a.linkUrl} className="font-semibold underline decoration-cream/40 underline-offset-4 hover:decoration-cream">
              {a.linkLabel || 'Learn more'}
            </Link>
          )}
        </p>
      ))}
    </div>
  );
}
