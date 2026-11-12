// The "Tell us your idea" chat (site/assets/brief.js) on the home and the services page, on a phone
// and a desktop. The contact endpoint is stubbed: the chat must send exactly the JSON the backend
// expects, thank the visitor on 200, and on 400, 429 or a network error offer the same message by
// email and WhatsApp. Without JavaScript the same form shows every question and sends an email.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { home, services, CONTACT_ENDPOINT, EMAIL, WHATSAPP } from '../scripts/build.mjs';

// The real endpoint, from scripts/build.mjs. Every request to it is stubbed: no test sends a real
// submission.
const ENDPOINT = CONTACT_ENDPOINT;

const IDEA = 'Una app para que los clientes de mi tienda pidan a domicilio y paguen en línea.';

async function open(page, path, status) {
  const sent = [];
  await page.route(ENDPOINT, async (route) => {
    sent.push(route.request());
    if (status === 'offline') return route.abort('internetdisconnected');
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status === 200 ? { ok: true } : { ok: false, error: 'datos' }) });
  });
  await page.goto(path);
  await expect(page.locator('#brief form')).toHaveAttribute('data-endpoint', ENDPOINT);
  await page.locator('#brief').scrollIntoViewIfNeeded();
  return sent;
}

const active = (page) => page.locator('#brief .q.active');
const next = (page) => page.locator('#brief .chat-controls .chat-next');

// Picks an option, which moves the chat on by itself after a tap or click.
async function choose(page, key, label) {
  await expect(active(page)).toHaveAttribute('data-key', key);
  await active(page).locator('.choice', { hasText: label }).click();
  await expect(active(page)).not.toHaveAttribute('data-key', key);
}

async function answerAll(page, { lang = 'es', contact = 'ana@empresa.co' } = {}) {
  const es = lang === 'es';
  await page.locator('#brief-nombre').fill('Ana Gómez');
  await page.locator('#brief-nombre').press('Enter');
  await page.locator('#brief-contacto').fill(contact);
  await page.locator('#brief-contacto').press('Enter');
  await expect(active(page)).toHaveAttribute('data-key', 'empresa');
  await page.locator('#brief .chat-controls .chat-skip').click();
  await page.locator('#brief-idea').fill(IDEA);
  await next(page).click();
  await choose(page, 'tipo', es ? 'Nuevas funciones para un producto que ya existe' : 'New features for an existing product');
  await choose(page, 'plazo', es ? 'En 1 a 3 meses' : 'In 1 to 3 months');
  await choose(page, 'presupuesto', es ? 'USD 5.000 a 15.000' : 'USD 5,000 to 15,000');
  await choose(page, 'nda', es ? 'Sí, quiero un NDA' : 'Yes, I want an NDA');
  await expect(active(page)).toHaveAttribute('data-key', 'consentimiento');
  await page.locator('#brief-consentimiento').check();
  await next(page).click();
}

for (const path of ['/' + services.paths.es, '/' + home.paths.es]) {
  test(`${path} chat sends the contract's JSON and thanks the visitor`, async ({ page }) => {
    const sent = await open(page, path, 200);
    await expect(page.locator('#brief')).toHaveClass(/is-chat/);
    // One question at a time.
    await expect(page.locator('#brief .q:visible')).toHaveCount(1);
    await answerAll(page);

    await expect(page.locator('#brief .chat-done')).toBeVisible();
    await expect(page.locator('#brief .thanks-title')).toHaveText('¡Gracias, Ana!');
    await expect(page.locator('#brief .chat-done')).toContainText('2 días hábiles');
    expect(sent).toHaveLength(1);
    expect(sent[0].method()).toBe('POST');
    expect(sent[0].headers()['content-type']).toBe('application/json');
    expect(sent[0].postDataJSON()).toEqual({
      nombre: 'Ana Gómez',
      contacto: 'ana@empresa.co',
      empresa: '',
      idea: IDEA,
      tipo: 'feature',
      plazo: '1_3_meses',
      presupuesto: '5k_15k',
      idioma: 'es',
      nda: true,
      consentimiento: true,
      sitio: '',
    });
    const axe = await new AxeBuilder({ page }).include('#brief').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

for (const [status, why] of [
  [400, 'Something in the information could not be read.'],
  [429, 'We received many messages from your connection in the last hour.'],
  ['offline', 'We could not send your message.'],
]) {
  test(`a ${status} answer offers the message by email and WhatsApp, with the answers`, async ({ page }) => {
    const sent = await open(page, '/' + services.paths.en, status);
    await answerAll(page, { lang: 'en', contact: '+1 (555) 010-2030' });
    const fail = page.locator('#brief .chat-fail');
    await expect(fail).toBeVisible();
    await expect(fail).toContainText(why);
    expect(sent).toHaveLength(1);
    expect(sent[0].postDataJSON()).toMatchObject({ idioma: 'en', contacto: '+1 (555) 010-2030', tipo: 'feature', nda: true });

    const mail = decodeURIComponent(await fail.locator('.fail-mail').getAttribute('href'));
    expect(mail).toContain(`mailto:${EMAIL}?subject=`);
    for (const part of ['Name: Ana Gómez', 'Contact: +1 (555) 010-2030', `Idea: ${IDEA}`, 'NDA: Yes, I want an NDA']) expect(mail).toContain(part);
    const wa = decodeURIComponent(await fail.locator('.fail-wa').getAttribute('href'));
    expect(wa).toContain(`https://wa.me/${WHATSAPP}?text=`);
    expect(wa).toContain('Name: Ana Gómez');
  });
}

test('the chat checks each answer before moving on, and Back keeps what was typed', async ({ page }) => {
  const sent = await open(page, '/' + services.paths.es, 200);
  const error = () => active(page).locator('.q-error');

  await next(page).click();
  await expect(error()).toHaveText('Este dato nos hace falta para seguir.');
  await page.locator('#brief-nombre').fill('Ana');
  await next(page).click();

  await page.locator('#brief-contacto').fill('hola');
  await next(page).click();
  await expect(active(page)).toHaveAttribute('data-key', 'contacto');
  await expect(error()).toHaveText('Escribe un correo o un número de WhatsApp.');
  await expect(page.locator('#brief-contacto')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#brief-contacto').fill('+57 350 495 8312');
  await next(page).click();

  await page.locator('#brief .chat-controls .chat-back').click();
  await expect(page.locator('#brief-contacto')).toHaveValue('+57 350 495 8312');
  await expect(page.locator('#brief-contacto')).toBeFocused();
  await next(page).click();
  await next(page).click(); // the company is optional

  await page.locator('#brief-idea').fill('Una app');
  await next(page).click();
  await expect(error()).toHaveText('Cuéntanos un poco más: al menos 20 caracteres.');
  // The earlier answers show as the visitor's bubbles.
  await expect(page.locator('#brief .q.done .bubble.me')).toHaveText(['Ana', '+57 350 495 8312', '—']);
  expect(sent).toHaveLength(0);
});

test('nothing is sent without consent', async ({ page }) => {
  const sent = await open(page, '/' + services.paths.es, 200);
  await page.locator('#brief-nombre').fill('Ana');
  await next(page).click();
  await page.locator('#brief-contacto').fill('ana@empresa.co');
  await next(page).click();
  await next(page).click();
  await page.locator('#brief-idea').fill(IDEA);
  await next(page).click();
  for (const [key, label] of [['tipo', 'App móvil'], ['plazo', 'Lo antes posible'], ['presupuesto', 'Aún no lo sé'], ['nda', 'No hace falta']]) await choose(page, key, label);
  await next(page).click();
  await expect(active(page).locator('.q-error')).toHaveText('Necesitamos tu autorización para poder escribirte.');
  await expect(active(page).locator('.consent a')).toHaveAttribute('href', '../privacidad/');
  expect(sent).toHaveLength(0);
});

test('changing the option right after a tap moves on once, with the last choice', async ({ page }) => {
  await open(page, '/' + services.paths.es, 200);
  await page.locator('#brief-nombre').fill('Ana');
  await next(page).click();
  await page.locator('#brief-contacto').fill('ana@empresa.co');
  await next(page).click();
  await next(page).click();
  await page.locator('#brief-idea').fill(IDEA);
  await next(page).click();
  await expect(active(page)).toHaveAttribute('data-key', 'tipo');
  await active(page).locator('.choice', { hasText: 'App móvil' }).click();
  await active(page).locator('.choice', { hasText: 'Web o landing' }).click();
  await expect(active(page)).toHaveAttribute('data-key', 'plazo');
  await page.waitForTimeout(500);
  await expect(active(page)).toHaveAttribute('data-key', 'plazo');
  await expect(active(page).locator('.q-error')).toHaveText('');
  await expect(page.locator('#brief .q.done .bubble.me').last()).toHaveText('Web o landing');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the same form shows every question and sends an email', async ({ page }) => {
    await page.goto('/' + services.paths.es);
    const form = page.locator('#brief form');
    await expect(form).toHaveAttribute('action', new RegExp(`^mailto:${EMAIL}\\?subject=`));
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form).toHaveAttribute('enctype', 'text/plain');
    await expect(page.locator('#brief .q:visible')).toHaveCount(9);
    await expect(page.locator('#brief .chat-send button')).toBeVisible();
    await expect(page.locator('#brief-nombre')).toHaveAttribute('required', '');
    await expect(page.locator('#brief-consentimiento')).toHaveAttribute('required', '');
  });
});

test('the home leads to the chat and to the services page', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero-copy .btn.primary').click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('#contact-h')).toBeInViewport();
  await page.goto('/');
  const more = page.locator('.section-more a');
  await expect(more).toHaveAttribute('href', services.paths.es);
});
