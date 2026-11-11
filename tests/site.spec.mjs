// Every page in the sitemap, on each project (phone and desktop), in light and dark:
// no axe-core violations (WCAG 2.2 A/AA plus best practices), no sideways scroll, no broken
// images or requests, no console errors, and the SEO basics point at https://tutosapp.co.
// Full-page screenshots land in test-results/screens/ for visual review.
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SITE = 'https://tutosapp.co/';
const pages = [...readFileSync(new URL('../site/sitemap.xml', import.meta.url), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, loc]) => '/' + loc.slice(SITE.length)
);
const name = (path) => path.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
const STILL = '.reveal, .showcase { animation: none !important; }';

for (const path of pages) {
  for (const scheme of ['light', 'dark']) {
    test(`${path} (${scheme})`, async ({ page }, info) => {
      const problems = [];
      page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
      page.on('requestfailed', (r) => problems.push(`failed: ${r.url()}`));
      page.on('response', (r) => r.url().startsWith('http://127.0.0.1') && r.status() >= 400 && problems.push(`${r.status()}: ${r.url()}`));

      await page.emulateMedia({ colorScheme: scheme });
      const res = await page.goto(path);
      expect(res.status()).toBe(200);

      // Scroll through so lazy images load and every scroll-driven reveal has finished.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 10_000 });

      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      const violations = axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(violations, 'axe-core violations').toEqual([]);

      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        brokenImages: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')),
        h1: document.querySelectorAll('h1').length,
        lang: document.documentElement.lang,
        canonical: document.querySelector('link[rel=canonical]')?.href,
        ogUrl: document.querySelector('meta[property="og:url"]')?.content,
        hreflang: document.querySelectorAll('link[rel=alternate][hreflang]').length,
        title: document.title,
        description: document.querySelector('meta[name=description]')?.content || '',
      }));
      expect(layout.overflow, 'page scrolls sideways').toBeLessThanOrEqual(0);
      expect(layout.brokenImages, 'images that did not load').toEqual([]);
      expect(layout.h1).toBe(1);
      expect(['es', 'en']).toContain(layout.lang);
      expect(layout.canonical).toBe(SITE + path.slice(1));
      expect(layout.ogUrl).toBe(layout.canonical);
      expect(layout.hreflang).toBe(3);
      expect(layout.title.length).toBeLessThanOrEqual(70);
      expect(layout.description.length).toBeGreaterThan(50);
      expect(problems).toEqual([]);

      // Screenshots show every section in its resting position.
      await page.addStyleTag({ content: STILL });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `test-results/screens/${name(path)}-${info.project.name}-${scheme}.png`, fullPage: true });
    });
  }
}

test.describe('home marquee', () => {
  for (const path of ['/', '/en/']) {
    test(`${path} tiles are links with names, pausable, and still with reduced motion`, async ({ page }) => {
      await page.goto(path);
      const tiles = page.locator('.track a.tile:not([tabindex="-1"])');
      const apps = await page.locator('.app-band').count();
      await expect(tiles).toHaveCount(apps);
      for (const tile of await tiles.all()) await expect(tile).toHaveAccessibleName(/\S/);
      // Repeated tiles are decoration only: hidden from screen readers and out of the tab order.
      const repeats = page.locator('.track li[aria-hidden="true"] a.tile');
      expect(await repeats.count()).toBeGreaterThan(0);
      for (const r of await repeats.all()) await expect(r).toHaveAttribute('tabindex', '-1');

      const track = page.locator('.track');
      await expect(track).toHaveCSS('animation-play-state', 'running');
      await page.locator('.pause-label').click();
      await expect(track).toHaveCSS('animation-play-state', 'paused');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(track).toHaveCSS('animation-name', 'none');
      await expect(page.locator('.track li[aria-hidden="true"]').first()).toBeHidden();
      await expect(page.locator('.pause-label')).toBeHidden();
    });
  }
});
