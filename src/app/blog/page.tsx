import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogCard, FeaturedPost } from '@/components/BlogCard';
import { CtaBand, PageHero } from '@/components/ui';
import { getBlogPosts, getSite } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles from the Moksha Wellness teachers on yoga, Pilates, breathing and everyday wellbeing.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const [s, posts, { tag }] = await Promise.all([getSite(), getBlogPosts(), searchParams]);
  if (!posts.length) notFound();
  const page = s.block('blog.page');

  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
  const active = tag && tags.includes(tag) ? tag : null;
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts;
  const [featured, ...rest] = active ? [null, ...shown] : shown;

  const chip = (selected: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${selected ? 'bg-forest text-cream' : 'border border-forest/15 text-forest hover:border-forest/40'}`;

  return (
    <>
      <PageHero eyebrow={page.heroEyebrow} title={page.heroTitle}>
        {page.heroBody && <p>{page.heroBody}</p>}
      </PageHero>
      <section className="container-page space-y-10 pb-16 sm:pb-24">
        {tags.length > 1 && (
          <nav aria-label="Topics" className="flex flex-wrap gap-2">
            <Link href="/blog" scroll={false} className={chip(!active)} aria-current={!active ? 'page' : undefined}>
              All articles
            </Link>
            {tags.map((t) => (
              <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} scroll={false} className={chip(t === active)} aria-current={t === active ? 'page' : undefined}>
                {t}
              </Link>
            ))}
          </nav>
        )}
        {featured && <FeaturedPost post={featured} />}
        {rest.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => p && <BlogCard key={p.id} post={p} index={i} />)}
          </div>
        )}
      </section>
      <CtaBand title="Ready to roll out your mat?">
        <p>Send an enquiry and we will help you find the right class, format and plan.</p>
      </CtaBand>
    </>
  );
}
