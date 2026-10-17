# Moksha Wellness — Website

Public website for Moksha Wellness (Yoga & Pilates): Next.js 16 (App Router) + TypeScript + Tailwind.
Content, student accounts, online payments and enquiries are powered by the Moksha **admin panel**
API (separate repo `infyara_admin_panel`) — this site holds no database and no secrets in the browser.

## What the studio manages without code

Everything below is edited in the admin panel and appears on the site within seconds of publishing
(cached pages are refreshed on demand; they also refresh every 5 minutes on their own):

| Website | Admin panel |
|---|---|
| Page text (home, about, classes, training, contact, team/stories/gallery headings) | Website → Page Content |
| Contact details, WhatsApp button, opening hours, social links, footer note | Page Content → Contact details & footer |
| Class and training cards, online plans with prices | Website → Programmes (from the course catalogue) |
| Team page | Website → Team |
| Student stories (video + written) | Website → Testimonials |
| FAQs (per page) | Website → FAQs |
| Announcement banner | Website → Announcements |
| Gallery page | Website → Gallery & Media |
| Privacy, terms, refund policy pages | Page Content → policy sections (shown once published) |

If the admin API cannot be reached, the site falls back to its built-in copy
(`src/content/defaults.ts`) so pages never break. Team, Stories, Gallery and policy pages appear in
the menu/footer only when they have published content.

## Student accounts and payments

- `/signup`, `/login`: mobile number + password, or **Continue with Google** (a mobile number is mandatory before the account is created).
- `/account`: classes, invoices (PDF), payments and receipts (PDF), online payments, plans to join online. `/account/settings`: profile, password, WhatsApp opt-in, connect Google, sign out other devices.
- `/checkout`: Razorpay Checkout for an invoice balance or an online plan; `/payment/[id]`: confirmation (waits for the server's verification).
- New accounts appear on the admin **Website Logins** page, where staff link them to the student record.

How it is secured: the browser only talks to this site's `/api/*` routes; those call the admin API
with a server-only service key. The session is an httpOnly, SameSite=Lax cookie; state-changing
routes also check the request comes from this site. Payment amounts are set by the API, and a payment
counts only after the API verifies it with Razorpay. See `next.config.ts` for the Content Security
Policy and security headers.

## Run locally

Requires Node 20+, pnpm 9+, and the admin API running (see the admin repo's DEPLOYMENT.md →
*Local development*).

```bash
pnpm install
cp .env.example .env.local     # fill in (see below)
pnpm dev                       # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` · `pnpm typecheck` | Code checks |
| `pnpm test:e2e` | Browser journeys — see [docs/TESTING.md](docs/TESTING.md) |

## Environment variables

`.env.local` locally; Vercel → Project → Settings → Environment Variables in production.
All are server-only except `NEXT_PUBLIC_SITE_URL`.

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public address, e.g. `https://www.mokshawellness.in` |
| `ADMIN_API_URL` | Admin API base URL |
| `PUBLIC_LEADS_API_KEY` | = `PUBLIC_LEADS_API_KEY` on the API (enquiry form → Leads) |
| `WEBSITE_SERVICE_KEY` | = `WEBSITE_SERVICE_KEY` on the API (accounts, payments, previews) |
| `REVALIDATE_SECRET` | = `WEBSITE_REVALIDATE_SECRET` on the API (instant refresh after publishing) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional — Google sign-in (admin repo: docs/SETUP_GOOGLE_AUTH.md) |

## Logo

Generated from the official vector logo (`moksha-logo-estd-2025-print.pdf`) without altering the
artwork: `public/logo.png` (full), `public/logo-white.png`, `public/logo-mark.png` (lotus mark),
`public/logo-mark-white.png`, plus `src/app/icon.png`, `apple-icon.png`, `opengraph-image.png` and
the manifest icons. Brand colours (`src/app/globals.css`): lotus green `#17643c`, bindu red `#d81e2c`.

## Deploy (Vercel)

1. Import the repository (framework: Next.js).
2. Set the environment variables above.
3. Deploy, then follow the admin repo's DEPLOYMENT.md → *Verify in production*.
4. Custom domain: add it in Vercel and update `NEXT_PUBLIC_SITE_URL`, the API's `WEBSITE_URL`, and the Google OAuth redirect URI.

Planning notes and the original audit: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).
