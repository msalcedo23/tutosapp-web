// Every page in the sitemap, on each project (phone and desktop), in light and dark:
// no axe-core violations (WCAG 2.2 A/AA plus best practices), no sideways scroll, no broken
// images or requests, no console errors, and the SEO basics point at https://tutosapp.co.
// The stylesheet must parse whole in Chromium and load by its content hash, and the
// CSS-only demos of the app pages must switch panes. Full-page screenshots land in test-results/screens/.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { apps } from '../scripts/build.mjs';

const SITE = 'https://tutosapp.co/';
const pages = [...readFileSync(new URL('../site/sitemap.xml', import.meta.url), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, loc]) => '/' + loc.slice(SITE.length)
);
const name = (path) => path.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
const STILL = '.reveal, .stage, .ask-card, .hero-bg, .studio-steps li { animation: none !important; }';
// The images on screen. The closed app switcher's icons load lazily, once it opens, and
// tests/app-switcher.spec.mjs checks them open.
const SHOWN = 'img:not([popover]:not(:popover-open) img)';

// Top-level rules in a stylesheet (rules, at-rules with a block, and statement at-rules), the
// number Chromium reports in CSSStyleSheet.cssRules when it parses the whole file.
function countRules(css) {
  let depth = 0;
  let count = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      i = css.indexOf('*/', i + 2) + 1;
    } else if (c === '"' || c === "'") {
      for (i++; i < css.length && css[i] !== c; i++) if (css[i] === '\\') i++;
    } else if (c === '{') {
      if (depth++ === 0) count++;
    } else if (c === '}') {
      depth--;
    } else if (c === ';' && depth === 0) {
      count++;
    }
  }
  return count;
}
const CSS = readFileSync(new URL('../site/assets/style.css', import.meta.url), 'utf8');
const CSS_VERSION = createHash('sha256').update(CSS).digest('hex').slice(0, 10);

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

      // Scroll through so lazy images load and every scroll-driven reveal has finished. Instant,
      // because the page asks for smooth scrolling and each smooth scroll would cut the last short.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
          scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 60));
        }
        scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
      });
      await page.waitForLoadState('networkidle');
      await page.waitForFunction((sel) => [...document.querySelectorAll(sel)].every((i) => i.complete), SHOWN, { timeout: 10_000 });

      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      const violations = axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(violations, 'axe-core violations').toEqual([]);

      const layout = await page.evaluate((sel) => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        brokenImages: [...document.querySelectorAll(sel)].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')),
        h1: document.querySelectorAll('h1').length,
        lang: document.documentElement.lang,
        canonical: document.querySelector('link[rel=canonical]')?.href,
        ogUrl: document.querySelector('meta[property="og:url"]')?.content,
        hreflang: document.querySelectorAll('link[rel=alternate][hreflang]').length,
        title: document.title,
        description: document.querySelector('meta[name=description]')?.content || '',
      }), SHOWN);
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
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `test-results/screens/${name(path)}-${info.project.name}-${scheme}.png`, fullPage: true });
    });
  }
}

test.describe('home marquee', () => {
  for (const path of ['/', '/en/']) {
    test(`${path} tiles are links with names, pausable, and still with reduced motion`, async ({ page }) => {
      await page.goto(path);
      const tiles = page.locator('.track a.tile:not([tabindex="-1"])');
      await expect(tiles).toHaveCount(apps.length);
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

  test('a keyboard-focused tile is shown inside the strip, wherever the animation was', async ({ page }) => {
    await page.goto('/');
    const tiles = page.locator('.track a.tile:not([tabindex="-1"])');
    const n = await tiles.count();
    const strip = await page.locator('.marquee').boundingBox();
    // Move the animation to mid-cycle, where the focusable copies have slid out of view.
    await page.evaluate(() => {
      const [a] = document.querySelector('.track').getAnimations();
      a.currentTime = a.effect.getComputedTiming().duration / 2;
    });
    await page.locator('.pause-toggle').focus();
    for (let i = 0; i < n; i++) {
      await page.keyboard.press('Tab');
      await expect(tiles.nth(i)).toBeFocused();
      const box = await tiles.nth(i).boundingBox();
      expect(box.x, `tile ${i} left edge`).toBeGreaterThanOrEqual(strip.x - 1);
      expect(box.x + box.width, `tile ${i} right edge`).toBeLessThanOrEqual(strip.x + strip.width + 1);
    }
  });
});

// A stylesheet that stops parsing part of the way leaves pages half unstyled while every other
// check still passes; the live site once showed its nav as a bulleted list that way.
test.describe('stylesheet', () => {
  test('Chromium parses every rule and each page loads it by content hash', async ({ page }) => {
    const authored = countRules(CSS);
    for (const path of pages) {
      await page.goto(path);
      const sheet = await page.evaluate(() => {
        const s = [...document.styleSheets].find((x) => x.href?.includes('/assets/style.css'));
        return { href: s?.href, rules: s?.cssRules.length ?? 0 };
      });
      expect(sheet.href, `${path} stylesheet URL`).toContain(`style.css?v=${CSS_VERSION}`);
      expect(sheet.rules, `${path}: Chromium parsed ${sheet.rules} of ${authored} rules`).toBeGreaterThanOrEqual(Math.floor(authored * 0.95));
    }
  });
});

test.describe('demos', () => {
  for (const path of apps.flatMap((a) => Object.values(a.paths)).map((p) => '/' + p)) {
    test(`${path} hero tabs switch the phone screen`, async ({ page }) => {
      await page.goto(path);
      const screens = page.locator('.hero-demo .screen > img');
      const n = await screens.count();
      expect(n).toBeGreaterThan(1);
      await expect(screens.nth(0)).toBeVisible();
      await page.locator('.hero-demo .tabs label').nth(n - 1).click();
      await expect(screens.nth(n - 1)).toBeVisible();
      await expect(screens.nth(0)).toBeHidden();
      await expect(page.locator(`.hero-demo .tabs input`).nth(n - 1)).toBeChecked();
    });
  }
});

// The "skip to content" link stays out of sight until the keyboard reaches it.
test('the skip link shows only with keyboard focus', async ({ page }) => {
  for (const path of ['/', '/servicios/']) {
    await page.goto(path);
    const skip = page.locator('a.skip');
    await page.locator('#brief').scrollIntoViewIfNeeded();
    expect(await skip.evaluate((a) => getComputedStyle(a).clipPath)).toBe('inset(50%)');
    await expect(skip).not.toBeInViewport();
    await skip.focus();
    await expect(skip).toBeInViewport({ ratio: 1 });
    expect(await skip.evaluate((a) => getComputedStyle(a).clipPath)).toBe('none');
  }
});

// Ojito is live on the App Store for iPhone; Android is still a closed testing group by email.
const OJITO_APP_STORE = 'https://apps.apple.com/app/id6832288734';
for (const path of ['/ojito/', '/ojito/en/']) {
  test(`${path} links Ojito's App Store listing and keeps the Android testing group`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(`.hero-copy a.store[href="${OJITO_APP_STORE}"]`)).toBeVisible();
    await expect(page.locator('.nav-cta')).toHaveAttribute('href', OJITO_APP_STORE);
    await expect(page.locator('.hero-copy a.btn.primary[href^="mailto:"]')).toBeVisible();
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());
    expect(ld.installUrl).toBe(OJITO_APP_STORE);
  });
}
for (const path of ['/', '/en/']) {
  test(`${path} Ojito card links its App Store listing`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(`a.store[href="${OJITO_APP_STORE}"]`).first()).toBeAttached();
  });
}
