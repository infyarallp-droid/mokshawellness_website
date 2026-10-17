import { defineConfig, devices } from '@playwright/test';

// End-to-end journeys across the website, the admin panel and the admin API.
// Start all three first (see docs/TESTING.md), then: pnpm test:e2e
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  use: {
    baseURL: process.env.SITE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
