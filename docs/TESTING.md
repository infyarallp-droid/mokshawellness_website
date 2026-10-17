# Testing

## Automated checks

| Command | What it checks |
|---|---|
| `pnpm lint` | ESLint (Next.js + React hooks rules) |
| `pnpm typecheck` | TypeScript |
| `pnpm build` | Production build (pages, routes, config) |
| `pnpm test:e2e` | Browser journeys with Playwright (below) |

The admin API has its own suite (103 tests: accounts, Google sign-in, Website Logins, CMS, WhatsApp
consent/campaigns/rules/outbox, Razorpay orders/webhooks/refunds, access control, and the original
studio scenarios) — run `pnpm --filter @moksha/api test` in the admin repo.

## Browser journeys (Playwright)

`e2e/journeys.spec.ts` drives a real Chromium against a running website, admin panel and API:

1. Public pages render with the logo, no browser console errors (catches CSP mistakes), desktop and phone, mobile menu.
2. Account pages redirect signed-out visitors to sign-in.
3. Sign up with mobile + password (WhatsApp opt-in), sign out, wrong password, sign in.
4. Sign up with email (the mobile number is still required), sign out, sign in with the email in a different letter case.
5. The new account appears on the admin **Website Logins** page with a suggested student match; staff link it; the student then sees their classes and payment due.
6. An admin edits the home headline and publishes; the website shows it within seconds; then restores it.
7. An admin adds a team member with an uploaded photo; it appears on `/team` with the photo; then removes it.
8. The admin panel works at phone width (drawer navigation).

### Running them

1. Start the stack (see the admin repo's DEPLOYMENT.md → *Local development*): API, admin web, and this website (`pnpm build && pnpm start` is closest to production).
2. Create a staff user for the tests (a Super Admin) in the **local** database.
3. Install the browser once: `npx playwright install chromium`.
4. Run:
   ```bash
   SITE_URL=http://localhost:3000 ADMIN_URL=http://localhost:5173 API_URL=http://localhost:4000 \
   E2E_ADMIN_EMAIL=<staff email> E2E_ADMIN_PASSWORD=<password> pnpm test:e2e
   ```
   Add `SHOT_DIR=<folder>` to keep screenshots for review.

The journeys create a website account, a student (with enrolment/invoice when a priced plan exists)
and change content they then restore. Run them against a local or staging database, never production.

## Manual checks before a release

- [ ] Phone (≈390 px), tablet (≈768 px) and desktop: home, classes, team, stories, gallery, contact, sign-in, sign-up, account, checkout.
- [ ] Keyboard only: menu, forms, FAQ accordions, gallery lightbox (← → Esc), video play buttons.
- [ ] Razorpay test payment: success, failure, closing the window (docs in the admin repo: SETUP_RAZORPAY.md §6).
- [ ] Google sign-in (if configured): new user → mobile step; returning user.
- [ ] Preview from the admin panel shows drafts with the yellow bar; *Exit preview* returns to live content.
