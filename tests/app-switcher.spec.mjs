// The app switcher in the menu bar: on the home page and on every app page, one small button opens
// a short list of every app and the Tutos App home. Closed, no app name shows in the menu bar.
// Runs on a desktop and an Android phone in Chrome and on an iPhone in WebKit (Safari's engine),
// with taps on the phones. The list comes from the same app data as the home marquee.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { apps, home } from '../scripts/build.mjs';

const pages = [
  ...Object.entries(home.paths).map(([lang, path]) => ({ path: '/' + path, lang, app: null })),
  ...apps.flatMap((app) => Object.entries(app.paths).map(([lang, path]) => ({ path: '/' + path, lang, app }))),
];
const homeName = { es: 'Inicio de Tutos App', en: 'Tutos App home' };

const press = async (locator, info) => (info.project.use.hasTouch ? locator.tap() : locator.click());

for (const { path, lang, app } of pages) {
  test(`${path} switcher lists every app and marks this page`, async ({ page }, info) => {
    await page.goto(path);
    const toggle = page.locator('.apps-toggle');
    const menu = page.locator('#apps-menu');
    await expect(toggle).toHaveAccessibleName(/^Tutos App: (ver todas las apps|see all apps)$/);
    await expect(toggle).toHaveAttribute('aria-controls', 'apps-menu');

    // Closed: no app name anywhere in the menu bar except this page's own brand.
    await expect(menu).toBeHidden();
    const barText = await page.locator('.nav-bar').evaluate((n) => n.innerText);
    for (const a of apps.filter((x) => x !== app)) expect(barText, `${a.name} shown in the closed menu bar`).not.toContain(a.name);

    await press(toggle, info);
    await expect(menu).toBeVisible();
    expect(await menu.evaluate((m) => m.matches(':popover-open'))).toBe(true);

    const links = menu.locator('a');
    await expect(links).toHaveCount(apps.length + 1);
    for (const [i, a] of apps.entries()) {
      const link = links.nth(i);
      await expect(link).toContainText(a.name);
      await expect(link).toContainText(a[lang].category);
      expect(new URL(await link.evaluate((l) => l.href)).pathname).toBe('/' + a.paths[lang]);
      if (a === app) await expect(link).toHaveAttribute('aria-current', 'page');
      else await expect(link).not.toHaveAttribute('aria-current');
    }
    const homeLink = links.last();
    await expect(homeLink).toHaveText(homeName[lang]);
    expect(new URL(await homeLink.evaluate((l) => l.href)).pathname).toBe('/' + home.paths[lang]);
    if (app) await expect(homeLink).not.toHaveAttribute('aria-current');
    else await expect(homeLink).toHaveAttribute('aria-current', 'page');

    // Its icons load once it opens.
    await expect.poll(() => menu.locator('img').evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0))).toBe(true);

    // Whole on screen, without sideways scroll, and no accessibility problems while open.
    await expect(menu).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    if (info.project.name !== 'iphone') {
      const axe = await new AxeBuilder({ page }).include('.nav').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    }

    // A tap or click outside closes it, and the names are gone again.
    const vp = page.viewportSize();
    if (info.project.use.hasTouch) await page.touchscreen.tap(vp.width / 2, vp.height - 40);
    else await page.mouse.click(vp.width / 2, vp.height - 40);
    await expect(menu).toBeHidden();
  });
}

test('picking an app in the switcher opens its page, in the same language', async ({ page }, info) => {
  const [first, second] = apps;
  await page.goto('/' + first.paths.es);
  await press(page.locator('.apps-toggle'), info);
  await press(page.locator('#apps-menu a', { hasText: second.name }), info);
  await expect(page).toHaveURL('/' + second.paths.es);
  await expect(page.locator('.nav-bar .brand')).toContainText(second.name);

  await press(page.locator('.apps-toggle'), info);
  await press(page.locator('#apps-menu a', { hasText: homeName.es }), info);
  await expect(page).toHaveURL('/' + home.paths.es);

  await press(page.locator('.apps-toggle'), info);
  await press(page.locator('#apps-menu a', { hasText: first.name }), info);
  await expect(page).toHaveURL('/' + first.paths.es);
});

test('the switcher works with the keyboard: Enter or Space opens, Tab enters, Esc closes', async ({ page, browserName }) => {
  // Safari moves Tab only between form controls unless its "Press Tab to highlight each item"
  // setting is on, so the links in the list are reached with Option-Tab there; Chrome covers this.
  test.skip(browserName === 'webkit', 'Safari skips links on Tab by default');
  await page.goto('/' + apps[0].paths.en);
  const toggle = page.locator('.apps-toggle');
  const menu = page.locator('#apps-menu');
  await toggle.focus();

  await page.keyboard.press('Enter');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(menu.locator('a').first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(menu.locator('a').nth(1)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();

  await page.keyboard.press('Space');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('screen readers hear whether the switcher is open', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'reads the Chrome accessibility tree');
  await page.goto('/');
  const cdp = await page.context().newCDPSession(page);
  const state = async () => {
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const button = nodes.find((n) => n.role?.value === 'button' && n.name?.value === 'Tutos App: ver todas las apps');
    return Object.fromEntries(button.properties.map((p) => [p.name, p.value.value]));
  };
  expect((await state()).expanded).toBe(false);
  await page.locator('.apps-toggle').click();
  const open = await state();
  expect(open.expanded).toBe(true);
  expect(open.controls).toBe('apps-menu');
});

test('with reduced motion the switcher opens without animating', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/' + apps[0].paths.es);
  await press(page.locator('.apps-toggle'), info);
  const menu = page.locator('#apps-menu');
  await expect(menu).toBeVisible();
  const motion = await menu.evaluate((m) => {
    const s = getComputedStyle(m);
    return { duration: s.transitionDuration, opacity: s.opacity };
  });
  expect(motion.duration).toBe('0s');
  expect(motion.opacity).toBe('1');
});
