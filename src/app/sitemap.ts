import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { getBlogPosts, getSite } from '@/lib/content';

// Public pages only; Team, Stories, Gallery, Blog and policy pages are listed once they have content.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [s, posts] = await Promise.all([getSite(), getBlogPosts()]);
  const paths = [
    '',
    '/classes',
    '/teacher-training',
    '/about',
    '/contact',
    ...(s.team.length ? ['/team'] : []),
    ...(s.testimonials.length ? ['/testimonials'] : []),
    ...(s.gallery.length ? ['/gallery'] : []),
    ...(s.legal('legal.privacy') ? ['/privacy'] : []),
    ...(s.legal('legal.terms') ? ['/terms'] : []),
    ...(s.legal('legal.refunds') ? ['/refund-policy'] : []),
  ];
  const pages: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : ['/privacy', '/terms', '/refund-policy'].includes(path) ? 0.3 : 0.7,
  }));
  if (!posts.length) return pages;
  return [
    ...pages,
    { url: `${site.url}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      ...(p.publishedAt ? { lastModified: p.publishedAt } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
