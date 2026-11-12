// Draws the social-share images of the home and the services page (site/assets/img/og/home-es.jpg,
// home-en.jpg, services-es.jpg and services-en.jpg, 1200 × 630) from the same data as the site:
// each page's eyebrow and headline, and one icon per app.
// Run it after changing either headline or the app list:  npm run og
// Needs the dev dependencies (npm ci) and Google Chrome.
import { writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { apps, home, services, DOMAIN } from './build.mjs';

const SITE = fileURLToPath(new URL('../site/', import.meta.url));
const file = (p) => pathToFileURL(join(SITE, p)).href;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rich = (s) => esc(s).replace(/\*([^*]+)\*([.,!?]?)/g, '<em>$1$2</em>');

const page = (lang, copy) => `<!doctype html>
<html lang="${lang}">
<meta charset="utf-8">
<style>
  @font-face { font-family: "Geist"; font-weight: 100 900; src: url("${file('assets/fonts/geist-latin-wght.woff2')}") format("woff2"); }
  @font-face { font-family: "Instrument Serif"; font-style: italic; src: url("${file('assets/fonts/instrument-serif-latin-italic.woff2')}") format("woff2"); }
  body { margin: 0; width: 1200px; height: 630px; overflow: hidden; position: relative; background: #0b0a12; color: #f4f2fb; font-family: "Geist", sans-serif; }
  .blob { position: absolute; border-radius: 50%; }
  .b1 { width: 820px; height: 820px; left: -260px; top: -420px; background: radial-gradient(closest-side, #8a6dff, transparent); opacity: 0.8; }
  .b2 { width: 760px; height: 760px; right: -300px; top: -320px; background: radial-gradient(closest-side, #4d8dff, transparent); opacity: 0.7; }
  .b3 { width: 620px; height: 620px; left: 380px; top: 300px; background: radial-gradient(closest-side, #ff8a4c, transparent); opacity: 0.45; }
  .grid { position: absolute; inset: 0; background-image: linear-gradient(rgb(255 255 255 / 6%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 6%) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 70% at 30% 20%, #000, transparent 75%); }
  .wrap { position: absolute; inset: 60px 72px; display: flex; flex-direction: column; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; }
  .brand img { width: 48px; height: 48px; border-radius: 12px; }
  .eyebrow { margin: 0 0 18px; font-size: 19px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #b9b4cc; }
  h1 { margin: 0; max-width: 1000px; font-size: 80px; font-weight: 680; line-height: 1.02; letter-spacing: -0.04em; }
  h1 em { font-family: "Instrument Serif", serif; font-style: italic; font-weight: 400; letter-spacing: -0.01em; padding-right: 0.06em; background: linear-gradient(100deg, #a48bff, #ffc94d); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .foot { display: flex; align-items: center; justify-content: space-between; }
  .icons { display: flex; gap: 14px; }
  .icons img { width: 68px; height: 68px; border-radius: 16px; box-shadow: 0 0 0 1px rgb(255 255 255 / 14%), 0 14px 30px -12px rgb(0 0 0 / 60%); }
  .domain { font-size: 28px; font-weight: 550; color: #d6d2e6; }
</style>
<body>
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="grid"></div>
  <div class="wrap">
    <div class="brand"><img src="${file('favicon.svg')}" alt=""> Tutos App</div>
    <div><p class="eyebrow">${esc(copy.eyebrow)}</p><h1>${rich(copy.headline)}</h1></div>
    <div class="foot">
      <div class="icons">${apps.map((a) => `<img src="${file(a.icon)}" alt="">`).join('')}</div>
      <div class="domain">${DOMAIN}</div>
    </div>
  </div>
</body>
</html>
`;

const dir = mkdtempSync(join(tmpdir(), 'tutosapp-og-'));
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [name, source] of [['home', home], ['services', services]]) for (const lang of ['es', 'en']) {
    const html = join(dir, `${name}-${lang}.html`);
    writeFileSync(html, page(lang, source[lang]));
    await tab.goto(pathToFileURL(html).href);
    await tab.evaluate(() => document.fonts.ready);
    const out = join(SITE, `assets/img/og/${name}-${lang}.jpg`);
    await tab.screenshot({ path: out, type: 'jpeg', quality: 86 });
    console.log(`Wrote ${out}`);
  }
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}
