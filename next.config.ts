import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
// HTTPS-only protections (HSTS, upgrading sub-requests) apply when the site itself is served over https.
const httpsSite = (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://');
// Admin API origin. A local API serves uploaded media over http (production uses https storage).
const apiOrigin = (() => {
  try {
    return process.env.ADMIN_API_URL ? new URL(process.env.ADMIN_API_URL).origin : '';
  } catch {
    return '';
  }
})();
const localMedia = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(apiOrigin) ? apiOrigin : '';

// Content Security Policy: only the third parties the site actually uses —
// Razorpay Checkout, YouTube/Vimeo players (loaded on click), and HTTPS media
// (Supabase storage, YouTube thumbnails).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:${localMedia ? ` ${localMedia}` : ''}`,
  `media-src 'self' blob: https:${localMedia ? ` ${localMedia}` : ''}`,
  "font-src 'self' data:",
  "connect-src 'self' https://*.razorpay.com",
  'frame-src https://*.razorpay.com https://www.youtube-nocookie.com https://player.vimeo.com',
  "form-action 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(httpsSite ? ['upgrade-insecure-requests'] : []),
].join('; ');

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      ...(localMedia ? [{ protocol: 'http' as const, hostname: new URL(localMedia).hostname, port: new URL(localMedia).port }] : []),
    ],
    // Only for local development, where uploads are served from the API on localhost.
    dangerouslyAllowLocalIP: !!localMedia,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")' },
          ...(!httpsSite ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
        ],
      },
      {
        source: '/(account|checkout|payment|login|signup)(.*)',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
    ];
  },
};

export default config;
