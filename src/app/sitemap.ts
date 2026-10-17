import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { getSite } from '@/lib/content';

// Public pages only; Team, Stories, Gallery and policy pages are listed once they have content.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSite();
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
  return paths.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : ['/privacy', '/terms', '/refund-policy'].includes(path) ? 0.3 : 0.7,
  }));
}
