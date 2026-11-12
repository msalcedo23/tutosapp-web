// The first screen on a phone, before any scroll: every page shows its title (h1) and its main
// button. Runs on an iPhone in WebKit (Safari's engine) and on an Android phone in Chrome, each
// page in a fresh context. iPhone Safari once showed app pages as an empty hero until the first
// scroll, because it painted the scroll-animated .hero-bg over the hero content.
// Legal pages (the apps' and the company's privacy policy) have no hero; tests/legal.spec.mjs covers them.
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { legalPages, companyPrivacy } from '../scripts/build.mjs';

const SITE = 'https://tutosapp.co/';
const legal = new Set([...legalPages.map((l) => '/' + l.path), ...Object.values(companyPrivacy.paths).map((p) => '/' + p)]);
const pages = [...readFileSync(new URL('../site/sitemap.xml', import.meta.url), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(([, loc]) => '/' + loc.slice(SITE.length))
  .filter((path) => !legal.has(path));

for (const path of pages) {
  test(`${path} shows its title and main button without scrolling`, async ({ page }) => {
    await page.goto(path);
    expect(await page.evaluate(() => scrollY)).toBe(0);

    const h1 = page.locator('.hero-copy h1');
    const cta = page.locator('.hero-copy :is(.actions, .stores) a').first();
    for (const [what, el] of [['h1', h1], ['main button', cta]]) {
      await expect(el, `${what} is shown`).toBeVisible();
      await expect(el, `${what} is whole in the first screen`).toBeInViewport({ ratio: 1 });
      const seen = await el.evaluate((node) => {
        // Nothing on the way up fades it out, and nothing sits on top of its middle.
        let opacity = 1;
        for (let n = node; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
        const r = node.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { opacity, onTop: node.contains(top) };
      });
      expect(seen.opacity, `${what} opacity`).toBeGreaterThan(0.99);
      expect(seen.onTop, `${what} is not covered`).toBe(true);
    }

    // The hero content is stacked above the animated background, not left to the browser's
    // compositing (Safari paints a composited z-index: -1 layer over plain content).
    const layers = await page.evaluate(() => {
      const z = (sel) => {
        const s = getComputedStyle(document.querySelector(sel));
        return { position: s.position, z: Number.parseInt(s.zIndex, 10) };
      };
      return { bg: z('.hero-bg'), content: z('.hero-grid') };
    });
    expect(layers.content.position, '.hero-grid is positioned').not.toBe('static');
    expect(layers.content.z, '.hero-grid sits above .hero-bg').toBeGreaterThan(layers.bg.z);
  });
}
