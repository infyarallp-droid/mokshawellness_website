import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryGrid from '@/components/GalleryGrid';
import { PageHero } from '@/components/ui';
import { getSite } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos and videos from the Moksha Wellness studio, classes and workshops.',
  alternates: { canonical: '/gallery' },
};

export default async function GalleryPage() {
  const s = await getSite();
  if (!s.gallery.length) notFound();
  const page = s.block('gallery.page');
  return (
    <>
      <PageHero eyebrow={page.heroEyebrow} title={page.heroTitle}>
        {page.heroBody && <p>{page.heroBody}</p>}
      </PageHero>
      <section className="container-page pb-20 sm:pb-28">
        <GalleryGrid items={s.gallery} />
      </section>
    </>
  );
}
