// Browser checks for the built site: accessibility (axe-core), layout, links, images and
// full-page screenshots for visual review, on a phone and a desktop, in light and dark.
// Uses the installed Google Chrome, which GitHub's Ubuntu runners also have. The first-screen
// check also runs on an iPhone in Playwright's WebKit (npx playwright install webkit).
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: { command: `node scripts/serve.mjs`, env: { PORT: String(PORT) }, url: `http://127.0.0.1:${PORT}/`, reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, channel: 'chrome' }, testIgnore: 'first-viewport.spec.mjs' },
    { name: 'iphone', use: { ...devices['iPhone 15'] }, testMatch: 'first-viewport.spec.mjs' },
  ],
});
