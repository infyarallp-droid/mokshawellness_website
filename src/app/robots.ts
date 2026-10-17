import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/account', '/checkout', '/payment/', '/login', '/signup'] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
