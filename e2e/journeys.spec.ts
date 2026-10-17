import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

// Required environment (see docs/TESTING.md):
//   SITE_URL, ADMIN_URL, API_URL, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
// Optional: SHOT_DIR (where screenshots are written).
const SITE = process.env.SITE_URL ?? 'http://localhost:3000';
const ADMIN = process.env.ADMIN_URL ?? 'http://localhost:5173';
const API = process.env.API_URL ?? 'http://localhost:4000';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '';
const SHOTS = process.env.SHOT_DIR ?? path.join('test-results', 'screenshots');

const run = Date.now().toString().slice(-6);
const mobile = `9${run}${Math.floor(Math.random() * 900 + 100)}`; // 10 digits starting 9
const password = `Lotus${run}x`;
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });

/** Fail the test on browser console errors (e.g. a Content-Security-Policy block). */
function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    // Expected 4xx answers (e.g. a deliberately wrong password) are logged by Chrome but are not faults.
    if (m.type() === 'error' && !/favicon|Download the React DevTools|status of 4\d\d/.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function adminLogin(page: Page) {
  await page.goto(`${ADMIN}/login`);
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await shot(page, 'admin-login');
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
}

async function apiToken() {
  const r = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }) });
  return ((await r.json()) as { accessToken: string }).accessToken;
}

test.describe.configure({ mode: 'serial' });

test('public pages render with the new logo, no console errors, desktop and phone', async ({ page }) => {
  const errors = watchConsole(page);
  for (const p of ['/', '/classes', '/teacher-training', '/about', '/contact']) {
    const res = await page.goto(p);
    expect(res?.status(), p).toBe(200);
    await expect(page.getByRole('link', { name: 'Moksha Wellness — home' })).toBeVisible();
    const logo = page.locator('header img').first();
    await expect(logo).toHaveJSProperty('complete', true);
    expect(await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  }
  await page.goto('/');
  await shot(page, 'site-home-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await shot(page, 'site-home-phone');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
  await shot(page, 'site-menu-phone');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('account pages need a sign-in', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
});

test('sign up with mobile + password, sign out, sign back in', async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto('/signup');
  await shot(page, 'site-signup');
  await page.getByLabel('Full name').fill('Playwright Student');
  await page.getByLabel('Mobile number').fill(mobile);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: /Namaste, Playwright/ })).toBeVisible();
  await expect(page.getByText('Your studio record will appear here')).toBeVisible();
  await expect(page.locator('header').getByRole('link', { name: 'My account' })).toBeVisible();
  await shot(page, 'site-account-new');

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(SITE + '/');
  await expect(page.locator('header').getByRole('link', { name: 'Sign in' })).toBeVisible();

  await page.goto('/login');
  await page.getByLabel('Mobile number').fill(mobile);
  await page.getByLabel('Password', { exact: true }).fill('wrong-password-1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Mobile number or password is incorrect.')).toBeVisible();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/account$/);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('sign up with email (mobile still required) and sign in with the email', async ({ page }) => {
  const errors = watchConsole(page);
  const email = `e2e.${run}@example.com`;
  const emailMobile = `8${run}${Math.floor(Math.random() * 900 + 100)}`;
  await page.goto('/signup');
  await page.getByRole('radio', { name: 'Email' }).click();
  await page.getByLabel('Full name').fill('Playwright Student');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  // Without the mobile number the account cannot be created.
  await expect(page.getByRole('button', { name: 'Create account' })).toBeDisabled();
  await page.getByLabel('Mobile number').fill(emailMobile);
  await shot(page, 'site-signup-email');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(SITE + '/');

  await page.goto('/login');
  await page.getByRole('radio', { name: 'Email' }).click();
  await page.getByLabel('Email').fill(email.toUpperCase());
  await page.getByLabel('Password', { exact: true }).fill(password);
  await shot(page, 'site-login-email');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: /Namaste, Playwright/ })).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('the sign-up appears on the admin Website Logins page and can be linked to a student', async ({ page }) => {
  test.skip(!ADMIN_EMAIL, 'E2E_ADMIN_EMAIL not set');
  // A studio student with the same mobile, with an enrolment and invoice.
  const token = await apiToken();
  const auth = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  const st = await (await fetch(`${API}/api/students`, { method: 'POST', headers: auth, body: JSON.stringify({ fullName: 'Playwright Student', mobile, whatsappConsent: true }) })).json();
  const courses = await (await fetch(`${API}/api/courses`, { headers: auth })).json();
  const plan = (courses.courses ?? []).flatMap((c: { plans?: { id: string; pricePaise: string; isActive: boolean }[] }) => c.plans ?? []).find((p: { pricePaise: string; isActive: boolean }) => p.isActive && Number(p.pricePaise) > 0);
  if (plan) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    await fetch(`${API}/api/enrollments`, { method: 'POST', headers: auth, body: JSON.stringify({ studentId: st.student.id, coursePlanId: plan.id, startDate: today }) });
  }

  await adminLogin(page);
  await page.getByRole('link', { name: 'Website Logins' }).click();
  await page.getByPlaceholder('Search name, mobile or email').fill(mobile);
  const row = page.getByRole('row', { name: /Playwright Student/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText('Possible match');
  await shot(page, 'admin-website-logins');
  await row.click();
  await expect(page.getByRole('dialog')).toContainText('Sign-in history');
  await page.getByRole('button', { name: 'Link to this student' }).click();
  await page.getByRole('button', { name: 'Link account' }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: /Playwright Student/ })).toBeVisible();
  await shot(page, 'admin-website-login-detail');

  // The student now sees their own records on the website.
  await page.goto(`${SITE}/login`);
  await page.getByLabel('Mobile number').fill(mobile);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: 'My classes' })).toBeVisible();
  if (plan) await expect(page.getByRole('heading', { name: 'Payment due' })).toBeVisible();
  await shot(page, 'site-account-linked');
});

test('admin edits the home page headline; the website shows it after publishing', async ({ page, request }) => {
  test.skip(!ADMIN_EMAIL, 'E2E_ADMIN_EMAIL not set');
  const errors = watchConsole(page);
  await adminLogin(page);
  await page.getByRole('link', { name: 'Page Content' }).click();
  await page.getByRole('button', { name: 'Home — hero' }).click();
  const headline = page.getByLabel(/^Headline \*/);
  const original = await headline.inputValue();
  const changed = `Breathe in ${run}`;
  await headline.fill(changed);
  await shot(page, 'admin-page-content');
  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByText(/Published/)).toBeVisible();

  await expect(async () => {
    const html = await (await request.get(SITE + '/')).text();
    expect(html).toContain(changed);
  }).toPass({ timeout: 30_000, intervals: [1000, 2000, 3000] });

  // Put the original text back.
  await headline.fill(original);
  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(async () => {
    expect(await (await request.get(SITE + '/')).text()).not.toContain(changed);
  }).toPass({ timeout: 30_000, intervals: [1000, 2000, 3000] });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('admin adds a team member with a photo; it appears on the Team page', async ({ page }) => {
  test.skip(!ADMIN_EMAIL, 'E2E_ADMIN_EMAIL not set');
  const errors = watchConsole(page);
  await adminLogin(page);
  await page.getByRole('link', { name: 'Team' }).click();
  await page.getByRole('button', { name: '+ Add team member' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('input[type=file]').first().setInputFiles(path.join(process.cwd(), 'public', 'logo-mark.png'));
  await expect(dialog.getByText('Uploaded')).toBeVisible().catch(() => undefined);
  await dialog.getByLabel('Name *').fill(`Asha ${run}`);
  await dialog.getByLabel('Job title / designation *').fill('Senior Yoga Teacher');
  await dialog.getByLabel('Short description *').fill('Twelve years of Hatha practice and a gentle, precise teaching style.');
  await dialog.getByLabel('Visibility').selectOption('PUBLISHED');
  await shot(page, 'admin-team-form');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(`Asha ${run}`)).toBeVisible();

  await expect(async () => {
    const res = await page.goto(`${SITE}/team`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: `Asha ${run}` })).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000, intervals: [1000, 2000, 3000] });
  const photo = page.getByRole('img', { name: `Portrait of Asha ${run}` });
  await photo.scrollIntoViewIfNeeded(); // photos are lazy-loaded
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth), { timeout: 15_000 }).toBeGreaterThan(0);
  await shot(page, 'site-team');

  // Clean up: archive then delete.
  await page.goto(`${ADMIN}/website/team`);
  const item = page.getByRole('listitem').filter({ hasText: `Asha ${run}` });
  await item.getByRole('button', { name: 'Archive' }).click();
  await page.getByLabel('Show archived').check();
  await page.getByRole('listitem').filter({ hasText: `Asha ${run}` }).getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).last().click();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('admin panel works on a phone', async ({ page }) => {
  test.skip(!ADMIN_EMAIL, 'E2E_ADMIN_EMAIL not set');
  await page.setViewportSize({ width: 390, height: 844 });
  await adminLogin(page).catch(async () => {
    // On phones the nav lives in the drawer.
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });
  await page.goto(`${ADMIN}/whatsapp`);
  await expect(page.getByRole('heading', { name: 'WhatsApp Reminders' })).toBeVisible();
  await expect(page.getByText('Setup checklist')).toBeVisible();
  await shot(page, 'admin-whatsapp-phone');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Online Payments' })).toBeVisible();
  await shot(page, 'admin-menu-phone');
});
