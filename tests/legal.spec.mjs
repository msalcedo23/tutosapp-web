// The legal pages (privacy policy, terms and support of each app), on a phone and a desktop.
// Each one has its title, the date it last changed and a table of contents that reaches every
// section; its menu, language switch and footer link to the app's other legal pages on this
// site; and no page links to the old GitHub Pages addresses. tests/site.spec.mjs also runs its
// accessibility and layout checks on every legal page, since they are all in the sitemap.
import { test, expect } from '@playwright/test';
import { apps, legalPages } from '../scripts/build.mjs';

const label = { es: { privacy: 'Política de privacidad', terms: 'Términos y condiciones', support: 'Soporte' }, en: { privacy: 'Privacy policy', terms: 'Terms and conditions', support: 'Support' } };

for (const { path, lang, app, doc } of legalPages) {
  test(`/${path} is ${app.name}'s ${doc} page, with its date and contents`, async ({ page }) => {
    await page.goto('/' + path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.legal-updated time')).toHaveAttribute('datetime', app.legal[doc]);

    // The table of contents lists every section of the document and each link lands on it.
    const sections = page.locator('.legal-body h2');
    const n = await sections.count();
    if (n > 1) {
      const links = page.locator('.toc a');
      await expect(links).toHaveCount(n);
      for (let i = 0; i < n; i++) {
        const id = await sections.nth(i).getAttribute('id');
        expect(id, `section ${i} has an id`).toBeTruthy();
        await expect(links.nth(i)).toHaveAttribute('href', `#${id}`);
      }
      await links.nth(n - 1).click();
      await expect(sections.nth(n - 1)).toBeInViewport();
    }

    // The footer lists this app's legal pages in this language and marks this one. (The menu has
    // the same links, but it folds away on phones.)
    for (const l of legalPages.filter((x) => x.app === app && x.lang === lang)) {
      const link = page.locator('.foot a', { hasText: label[lang][l.doc] });
      expect(new URL(await link.evaluate((a) => a.href)).pathname).toBe('/' + l.path);
    }
    await expect(page.locator('.foot a[aria-current="page"]')).toHaveText(label[lang][doc]);

    // The language switch goes to the same document in the other language.
    const other = legalPages.find((l) => l.app === app && l.doc === doc && l.lang !== lang);
    expect(new URL(await page.locator('.nav .lang').evaluate((a) => a.href)).pathname).toBe('/' + other.path);

    // Every link on the page stays off GitHub Pages, and links to other legal pages resolve here.
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.href));
    expect(hrefs.filter((h) => /github\.io/i.test(h))).toEqual([]);
    for (const href of hrefs.filter((h) => h.startsWith(new URL(page.url()).origin))) {
      const res = await page.request.get(href.split('#')[0]);
      expect(res.status(), href).toBe(200);
    }
  });
}

test('every app page links to its own privacy policy and terms on this site', async ({ page }) => {
  for (const app of apps) {
    for (const [lang, path] of Object.entries(app.paths)) {
      await page.goto('/' + path);
      for (const doc of ['privacy', 'terms']) {
        const target = legalPages.find((l) => l.app === app && l.lang === lang && l.doc === doc);
        const link = page.locator('.foot a', { hasText: label[lang][doc] });
        expect(new URL(await link.evaluate((a) => a.href)).pathname, `${path} ${doc}`).toBe('/' + target.path);
      }
    }
  }
});
