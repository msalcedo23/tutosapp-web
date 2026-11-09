// Generates the HTML pages, sitemap.xml and robots.txt in site/ from the data below.
// The output is committed, so GitHub Pages publishes site/ as is.
//   node scripts/build.mjs          write the files
//   node scripts/build.mjs --check  fail if a committed file differs from what this script writes
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Public address of the site. When the custom domain is bought, change this
// (for example to 'https://tutosapp.com/'), run the script and commit. See README.
const SITE_URL = 'https://msalcedo23.github.io/tutosapp-web/';

const EMAIL = 'castores.app@gmail.com';
const YEAR = 2026;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');

const PLAY = (id) => `https://play.google.com/store/apps/details?id=${id}`;
const mailto = (subject, body) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
const whatsapp = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Store availability. 'live' links to the listing; 'soon' shows a "coming soon" chip.
const apps = {
  ojito: {
    name: 'Ojito',
    accent: '#1f56d6',
    icon: 'assets/img/ojito/icon.png',
    stores: { play: { status: 'soon', url: PLAY('co.ojito.ojito') }, appStore: { status: 'soon' } },
    legal: [
      { es: 'Privacidad', en: 'Privacy', url: 'https://msalcedo23.github.io/ojito-legal/privacidad.html' },
      { es: 'Términos', en: 'Terms', url: 'https://msalcedo23.github.io/ojito-legal/terminos.html' },
      { es: 'Soporte', en: 'Support', url: 'https://msalcedo23.github.io/ojito-legal/soporte.html' },
    ],
  },
  'resume-roast': {
    name: 'Resume Roast',
    accent: '#c4501f',
    icon: 'assets/img/resume-roast/icon.png',
    stores: { play: { status: 'live', url: PLAY('com.resumeroast.app') }, appStore: { status: 'soon' } },
    legal: [
      { es: 'Privacidad', en: 'Privacy', url: 'https://msalcedo23.github.io/daily-quest-privacy-policy/resume-roast/' },
      { es: 'Soporte', en: 'Support', urlEs: 'https://msalcedo23.github.io/resumeroast-support/es/', url: 'https://msalcedo23.github.io/resumeroast-support/' },
    ],
  },
  'roast-interview': {
    name: 'Roast Interview',
    accent: '#2f63e0',
    icon: 'assets/img/roast-interview/icon.png',
    stores: { play: { status: 'soon' }, appStore: { status: 'soon' } },
    legal: [],
  },
};

const ui = {
  es: {
    tagline: 'Apps pequeñas y honestas que te ayudan en el día a día.',
    apps: 'Nuestras apps',
    benefits: 'Lo que hace por ti',
    screens: 'Así se ve',
    playSoon: 'Muy pronto en Google Play',
    appStoreSoon: 'Muy pronto en App Store',
    getPlay: 'Disponible en',
    share: 'Compartir por WhatsApp',
    notify: 'Avísame cuando salga',
    legal: 'Legal y soporte',
    allApps: 'Todas las apps de Tutos App',
    contact: 'Contacto',
    switchTo: 'English',
    skip: 'Saltar al contenido',
    screenshotOf: 'Pantalla de',
    notFound: 'Esta página no existe.',
    backHome: 'Volver al inicio',
    status: { live: 'Disponible', test: 'Prueba cerrada', soon: 'Muy pronto' },
  },
  en: {
    tagline: 'Small, honest apps that help you every day.',
    apps: 'Our apps',
    benefits: 'What it does for you',
    screens: 'Take a look',
    playSoon: 'Coming soon to Google Play',
    appStoreSoon: 'Coming soon to the App Store',
    getPlay: 'Get it on',
    share: 'Share on WhatsApp',
    notify: 'Tell me when it launches',
    legal: 'Legal and support',
    allApps: 'All Tutos App apps',
    contact: 'Contact',
    switchTo: 'Español',
    skip: 'Skip to content',
    screenshotOf: 'Screen from',
    notFound: 'This page does not exist.',
    backHome: 'Back to home',
    status: { live: 'Available', test: 'Closed testing', soon: 'Coming soon' },
  },
};

// Page content per app and language.
const content = {
  ojito: {
    status: 'test',
    es: {
      title: 'Ojito: escáner de alimentos y cuidado personal',
      description:
        'Escanea comida y cuidado personal en Colombia: una respuesta para tu bebé y otra para ti. Sellos de advertencia, aditivos y alergias en segundos.',
      headline: '¿Y esto sí se lo puedo dar?',
      lead:
        'Apunta la cámara al código de barras y Ojito te dice Bueno, Regular o Evítalo, con una respuesta para cada persona de tu casa.',
      card: 'Escanea comida y cuidado personal: una respuesta para tu bebé y otra para ti.',
      benefits: [
        ['Una respuesta para cada quien', 'Lo que te sirve a ti no siempre le sirve a tu bebé. Ojito te da tu resultado y, debajo, el de cada persona de tu casa según su edad.'],
        ['Alergias y cuidados', 'Marca maní, lácteos, gluten, diabetes o presión alta, entre otros, y Ojito te avisa si lo ve en la etiqueta.'],
        ['Hecho para Colombia', 'El puntaje mira los sellos de advertencia colombianos, los aditivos y qué tan procesado está el producto. Tocas "Ver por qué" y te explica.'],
        ['Sin cuenta y sin marcas pagando', 'No tienes que registrarte. Ninguna marca paga por aparecer ni por mejorar su puntaje.'],
      ],
      cta: {
        label: 'Quiero probarla',
        href: mailto(
          'Quiero probar Ojito',
          'Hola, quiero entrar al grupo de prueba de Ojito.\n\nMi correo de Google Play (Gmail) es: \nMi teléfono es Android / iPhone: '
        ),
        note: 'Te escribimos para sumarte al grupo de prueba de Android.',
      },
      share: 'Mira Ojito: escaneas un producto y te dice si es bueno para ti y para tu bebé.',
    },
    en: {
      title: 'Ojito: food and personal-care label scanner',
      description:
        'Scan food and personal-care products in Colombia: one answer for your baby and another for you. Warning labels, additives and allergies in seconds.',
      headline: 'Is this OK to give them?',
      lead:
        'Point your camera at the barcode and Ojito says Good, Fair or Avoid, with an answer for each person in your home. The app is in Spanish.',
      card: 'Scan food and personal care: one answer for your baby and another for you.',
      benefits: [
        ['An answer for everyone', 'What works for you may not work for your baby. Ojito gives you your result and, below it, one for each person in your home by age.'],
        ['Allergies and conditions', 'Flag peanuts, dairy, gluten, diabetes or high blood pressure, among others, and Ojito warns you when it sees them on the label.'],
        ['Built for Colombia', 'The score looks at Colombian warning labels, additives and how processed the product is. Tap "See why" for the reasons.'],
        ['No account, no paid placement', 'No sign-up needed. No brand pays to appear or to improve its score.'],
      ],
      cta: {
        label: 'I want to try it',
        href: mailto('I want to try Ojito', 'Hi, I would like to join the Ojito testing group.\n\nMy Google Play (Gmail) address is: \nMy phone is Android / iPhone: '),
        note: 'We will email you to join the Android testing group.',
      },
      share: 'Check out Ojito: scan a product and see if it is good for you and your baby.',
    },
    shots: (lang) =>
      ['01-en-el-mercado', '03-cuidado-personal', '05-alergias', '06-otras-opciones'].map((f) => `assets/img/ojito/${lang}-${f}.jpg`),
    shotSize: [540, 960],
  },
  'resume-roast': {
    status: 'live',
    en: {
      title: 'Resume Roast: AI CV Review',
      description:
        'Brutally honest AI resume review. Get a score out of 100, match your CV to a real job, fix it and export an ATS-friendly PDF.',
      headline: 'Your CV, with no filters.',
      lead:
        'The AI that tells you what recruiters only think. Paste your CV, or upload a PDF, Word file or photo, and get an honest verdict in seconds.',
      card: 'Brutally honest AI resume review. Match it to a job, fix it, export a PDF.',
      benefits: [
        ['An honest score', 'A score out of 100 with a section-by-section breakdown, plus the red flags recruiters spot in seconds.'],
        ['Match it to a real job', 'Paste the job posting and see what already fits, what is missing, and rewrite your CV around it. It never invents experience.'],
        ['A PDF that passes the filters', 'Export a selectable-text PDF that applicant tracking systems can read, in three modern templates.'],
        ['No subscription', 'Your first 3 credits are free. One credit is one roast or one rewrite. Need more? Buy a pack once, no account needed.'],
      ],
      notifyLabel: 'Tell me when it is on iPhone',
      notify: mailto('Resume Roast for iPhone', 'Hi, please let me know when Resume Roast is on the App Store.'),
      share: 'Resume Roast gives your CV an honest score and tells you how to fix it.',
    },
    es: {
      title: 'Resume Roast: análisis de CV con IA',
      description:
        'Análisis de CV con IA, sin filtros. Puntaje de 0 a 100, compáralo con la vacante, arréglalo y expórtalo en un PDF que leen los filtros (ATS).',
      headline: 'Tu CV, sin filtros.',
      lead:
        'La IA que te dice lo que los reclutadores solo piensan. Pega tu CV, o sube un PDF, un Word o una foto, y recibe un veredicto honesto en segundos.',
      card: 'Análisis de CV con IA, sin filtros. Compáralo con la vacante y expórtalo en PDF.',
      benefits: [
        ['Un puntaje honesto', 'Puntaje sobre 100 con detalle por sección, y las red flags que un reclutador ve en segundos.'],
        ['Compáralo con una vacante real', 'Pega la oferta y mira qué encaja, qué falta, y reescribe tu CV para esa vacante. Nunca inventa experiencia.'],
        ['Un PDF que pasa los filtros', 'Exporta un PDF con texto seleccionable que leen los sistemas de selección (ATS), con tres plantillas modernas.'],
        ['Sin suscripción', 'Tus primeros 3 créditos son gratis. Un crédito es un análisis o una reescritura. ¿Necesitas más? Compras un paquete una vez, sin cuenta.'],
      ],
      notifyLabel: 'Avísame cuando esté en iPhone',
      notify: mailto('Resume Roast para iPhone', 'Hola, avísenme cuando Resume Roast esté en App Store.'),
      share: 'Resume Roast le pone un puntaje honesto a tu CV y te dice cómo mejorarlo.',
    },
    shots: (lang) => ['01-result', '02-match', '04-rewrite', '06-share'].map((f) => `assets/img/resume-roast/${lang}-${f}.jpg`),
    shotSize: [540, 960],
  },
  'roast-interview': {
    status: 'soon',
    en: {
      title: 'Roast Interview: AI interview practice',
      description:
        'Practice job interviews out loud with an AI interviewer that asks the questions hiding in your resume. Get a score and a plan to improve.',
      headline: 'Practice with an interviewer that tells you the truth.',
      lead:
        'Upload your resume and the role you want. An AI interviewer asks you, out loud, the questions you will really get, and tells you how ready you are.',
      card: 'Practice interviews out loud with an AI that tells you the truth. Coming soon.',
      benefits: [
        ['Questions from your resume', 'Not a generic list: it spots inconsistencies and asks about them, like a real interviewer.'],
        ['Adaptive pressure', 'Strong answers raise the bar. If you stumble, it helps you get back on track.'],
        ['A score for that job', 'At the end you get your score, your detected level and what you did well, calibrated to the role.'],
        ['Track your progress', 'Retake the interview with new questions on the same core topics and compare your scores.'],
      ],
      notify: mailto('Roast Interview: tell me when it launches', 'Hi, please let me know when Roast Interview launches.\n\nMy phone is Android / iPhone: '),
      share: 'Roast Interview: practice job interviews out loud with an AI. Coming soon.',
    },
    es: {
      title: 'Roast Interview: practica entrevistas con IA',
      description:
        'Practica entrevistas de trabajo en voz alta con una IA que te pregunta lo que esconde tu CV. Recibe un puntaje y un plan de mejora.',
      headline: 'Practica con un entrevistador que te dice la verdad.',
      lead:
        'Sube tu CV y el cargo al que aplicas. Una IA entrevistadora te hace, en voz alta, las preguntas que te van a hacer de verdad, y te dice qué tan listo estás.',
      card: 'Practica entrevistas en voz alta con una IA que te dice la verdad. Muy pronto.',
      benefits: [
        ['Preguntas que salen de tu CV', 'No es una lista genérica: detecta inconsistencias y te pregunta por ellas, como un entrevistador real.'],
        ['Presión que se adapta', 'Si respondes bien, sube la exigencia. Si te trabas, te ayuda a retomar.'],
        ['Un puntaje para ese cargo', 'Al final recibes tu puntaje, tu nivel detectado y lo que hiciste bien, medido para ese puesto.'],
        ['Mide tu progreso', 'Repite la entrevista con preguntas nuevas sobre los mismos temas y compara tus puntajes.'],
      ],
      notify: mailto('Roast Interview: avísame cuando salga', 'Hola, avísenme cuando salga Roast Interview.\n\nMi teléfono es Android / iPhone: '),
      share: 'Roast Interview: practica entrevistas en voz alta con IA. Muy pronto.',
    },
    shots: (lang) =>
      (lang === 'en'
        ? ['phase1-en-08-setup-ready', 'phase1-en-09-room-question', 'phase1-en-19-report-top', 'phase1-en-03-home']
        : ['phase1-es-dark-06-setup', 'phase1-es-dark-12-room-second-question', 'phase1-es-dark-19-report-top', 'phase1-es-dark-22-report-end']
      ).map((f) => `assets/img/roast-interview/${f}.jpg`),
    shotSize: [552, 1200],
  },
};

// Path of each page, relative to the site root, per app and language.
// Ojito leads in Spanish; the English-first apps lead in English.
const paths = {
  home: { es: '', en: 'en/' },
  ojito: { es: 'ojito/', en: 'ojito/en/' },
  'resume-roast': { en: 'resume-roast/', es: 'resume-roast/es/' },
  'roast-interview': { en: 'roast-interview/', es: 'roast-interview/es/' },
};
const order = ['ojito', 'resume-roast', 'roast-interview'];

const rel = (from, to) => '../'.repeat(from.split('/').filter(Boolean).length) + to || './';

const icons = {
  play: '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M4.6 2.3c-.3.3-.4.7-.4 1.2v17c0 .5.1.9.4 1.2l9.5-9.7zm10.9 8.3 2.9-3L6.5 1c-.5-.3-1-.4-1.4-.3zm0 2.8L5.1 23.3c.4.1.9 0 1.4-.3l11.9-6.6zm4.4-4.4-3 1.7-3.1 3.3 3.1 3.1 3-1.7c.9-.5.9-1.9 0-2.4z"/></svg>',
  apple: '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-4.2zM13.9 5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"/></svg>',
  whatsapp: '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.5-.7-2.3-1.5-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
  mail: '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18v12H3zM3 7l9 6 9-6"/></svg>',
};

function head({ lang, title, description, path, alternates, og, accent }) {
  const url = SITE_URL + path;
  const alt = Object.entries(alternates)
    .map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL + p}">`)
    .join('\n    ');
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${url}">
    ${alt}
    <link rel="alternate" hreflang="x-default" href="${SITE_URL + Object.values(alternates)[0]}">
    <meta name="color-scheme" content="light dark">
    <meta name="theme-color" content="${accent || '#5b3df5'}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Tutos App">
    <meta property="og:locale" content="${lang === 'es' ? 'es_CO' : 'en_US'}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${SITE_URL}assets/img/og/${og}.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="${rel(path, 'favicon.svg')}" type="image/svg+xml">
    <link rel="icon" href="${rel(path, 'favicon.png')}" type="image/png" sizes="64x64">
    <link rel="apple-touch-icon" href="${rel(path, 'apple-touch-icon.png')}">
    <link rel="stylesheet" href="${rel(path, 'assets/style.css')}">
  </head>`;
}

function header({ lang, path, other }) {
  const t = ui[lang];
  const home = rel(path, paths.home[lang]);
  const switcher = other
    ? `<a class="lang" href="${rel(path, other.path)}" hreflang="${other.lang}" lang="${other.lang}">${t.switchTo}</a>`
    : '';
  return `
  <body>
    <a class="skip" href="#main">${t.skip}</a>
    <header class="top">
      <a class="brand" href="${home}"><img src="${rel(path, 'favicon.svg')}" alt="" width="28" height="28"> Tutos App</a>
      ${switcher}
    </header>`;
}

function footer({ lang, path, legal }) {
  const t = ui[lang];
  const links = order
    .map((id) => `<li><a href="${rel(path, paths[id][lang])}">${apps[id].name}</a></li>`)
    .join('');
  const legalBlock = legal && legal.length
    ? `<nav aria-label="${t.legal}"><h2>${t.legal}</h2><ul>${legal
        .map((l) => `<li><a href="${lang === 'es' && l.urlEs ? l.urlEs : l.url}">${l[lang]}</a></li>`)
        .join('')}</ul></nav>`
    : '';
  return `
    <footer class="foot">
      <div class="wrap foot-grid">
        <nav aria-label="${t.allApps}"><h2>${t.apps}</h2><ul>${links}</ul></nav>
        ${legalBlock}
        <div><h2>${t.contact}</h2><p><a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
      </div>
      <p class="wrap copy">© ${YEAR} Tutos App</p>
    </footer>
  </body>
</html>
`;
}

function storeButtons(id, lang) {
  const t = ui[lang];
  const { play, appStore } = apps[id].stores;
  const out = [];
  if (play.status === 'live') {
    out.push(`<a class="store" href="${play.url}">${icons.play}<span><small>${t.getPlay}</small>Google Play</span></a>`);
  } else {
    out.push(`<span class="store soon">${icons.play}<span>${t.playSoon}</span></span>`);
  }
  if (appStore.status === 'live') {
    out.push(`<a class="store" href="${appStore.url}">${icons.apple}<span><small>${t.getPlay}</small>App Store</span></a>`);
  } else {
    out.push(`<span class="store soon">${icons.apple}<span>${t.appStoreSoon}</span></span>`);
  }
  return `<div class="stores">${out.join('')}</div>`;
}

function appPage(id, lang) {
  const app = apps[id];
  const c = content[id];
  const p = c[lang];
  const t = ui[lang];
  const path = paths[id][lang];
  const otherLang = lang === 'es' ? 'en' : 'es';
  const url = SITE_URL + path;
  const [w, h] = c.shotSize;

  const primary = p.cta
    ? `<a class="btn primary" href="${p.cta.href}">${icons.mail}${esc(p.cta.label)}</a>`
    : app.stores.play.status === 'live' && app.stores.appStore.status === 'live'
      ? ''
      : `<a class="btn primary" href="${p.notify}">${icons.mail}${esc(p.notifyLabel || t.notify)}</a>`;
  const note = p.cta ? `<p class="note">${esc(p.cta.note)}</p>` : '';
  const shareBtn = `<a class="btn ghost" href="${whatsapp(`${p.share} ${url}`)}">${icons.whatsapp}${t.share}</a>`;

  return (
    head({
      lang,
      title: p.title,
      description: p.description,
      path,
      alternates: paths[id],
      og: `${id}-${lang}`,
      accent: app.accent,
    }) +
    header({ lang, path, other: { lang: otherLang, path: paths[id][otherLang] } }) +
    `
    <main id="main" style="--accent: ${app.accent}">
      <section class="hero wrap">
        <div class="hero-text">
          <p class="kicker"><img src="${rel(path, app.icon)}" alt="" width="44" height="44" class="app-icon"> ${esc(app.name)} · <span class="status ${c.status}">${t.status[c.status]}</span></p>
          <h1>${esc(p.headline)}</h1>
          <p class="lead">${esc(p.lead)}</p>
          ${storeButtons(id, lang)}
          <div class="actions">${primary}${shareBtn}</div>
          ${note}
        </div>
        <img class="hero-shot" src="${rel(path, c.shots(lang)[0])}" alt="${t.screenshotOf} ${esc(app.name)}" width="${w}" height="${h}" fetchpriority="high">
      </section>
      <section class="wrap benefits" aria-labelledby="benefits-h">
        <h2 id="benefits-h">${t.benefits}</h2>
        <ul>${p.benefits.map(([b, d]) => `
          <li><h3>${esc(b)}</h3><p>${esc(d)}</p></li>`).join('')}
        </ul>
      </section>
      <section class="wrap shots" aria-labelledby="shots-h">
        <h2 id="shots-h">${t.screens}</h2>
        <ul>${c
          .shots(lang)
          .slice(1)
          .map((s) => `
          <li><img src="${rel(path, s)}" alt="${t.screenshotOf} ${esc(app.name)}" width="${w}" height="${h}" loading="lazy"></li>`)
          .join('')}
        </ul>
      </section>
    </main>` +
    footer({ lang, path, legal: app.legal })
  );
}

function homePage(lang) {
  const t = ui[lang];
  const path = paths.home[lang];
  const otherLang = lang === 'es' ? 'en' : 'es';
  const title = lang === 'es' ? 'Tutos App: Ojito, Resume Roast y Roast Interview' : 'Tutos App: Ojito, Resume Roast and Roast Interview';
  const description =
    lang === 'es'
      ? 'Tutos App hace apps pequeñas y honestas: Ojito, el escáner de etiquetas para familias en Colombia; Resume Roast, el análisis de CV con IA; y Roast Interview, para practicar entrevistas.'
      : 'Tutos App makes small, honest apps: Ojito, the label scanner for Colombian families; Resume Roast, the AI CV review; and Roast Interview, for interview practice.';
  const cards = order
    .map((id) => {
      const app = apps[id];
      const c = content[id];
      const p = c[lang];
      return `
        <li class="card" style="--accent: ${app.accent}">
          <img src="${rel(path, app.icon)}" alt="" width="64" height="64" class="app-icon">
          <div>
            <h3><a href="${rel(path, paths[id][lang])}">${esc(app.name)}</a></h3>
            <p class="status ${c.status}">${t.status[c.status]}</p>
            <p>${esc(p.card)}</p>
          </div>
        </li>`;
    })
    .join('');
  const share = lang === 'es' ? 'Mira las apps de Tutos App:' : 'Check out the Tutos App apps:';
  return (
    head({ lang, title, description, path, alternates: paths.home, og: `home-${lang}` }) +
    header({ lang, path, other: { lang: otherLang, path: paths.home[otherLang] } }) +
    `
    <main id="main">
      <section class="hero home wrap">
        <div class="hero-text">
          <h1>Tutos App</h1>
          <p class="lead">${t.tagline}</p>
          <div class="actions"><a class="btn ghost" href="${whatsapp(`${share} ${SITE_URL + path}`)}">${icons.whatsapp}${t.share}</a></div>
        </div>
      </section>
      <section class="wrap" aria-labelledby="apps-h">
        <h2 id="apps-h">${t.apps}</h2>
        <ul class="cards">${cards}
        </ul>
      </section>
    </main>` +
    footer({ lang, path })
  );
}

function notFoundPage() {
  // Served for any missing path, so it uses absolute URLs and cannot use relative ones.
  const base = SITE_URL;
  const t = ui.es;
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Página no encontrada · Tutos App</title>
    <meta name="robots" content="noindex">
    <meta name="color-scheme" content="light dark">
    <link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/style.css">
  </head>
  <body>
    <header class="top"><a class="brand" href="${base}"><img src="${base}favicon.svg" alt="" width="28" height="28"> Tutos App</a></header>
    <main id="main" class="wrap notfound">
      <h1>404</h1>
      <p class="lead">${t.notFound}</p>
      <p><a class="btn primary" href="${base}">${t.backHome}</a></p>
    </main>
  </body>
</html>
`;
}

const files = {};
for (const lang of ['es', 'en']) files[paths.home[lang] + 'index.html'] = homePage(lang);
for (const id of order) for (const lang of ['es', 'en']) files[paths[id][lang] + 'index.html'] = appPage(id, lang);
files['404.html'] = notFoundPage();
files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['home', ...order]
  .flatMap((id) =>
    Object.values(paths[id]).map(
      (p) => `  <url>
    <loc>${SITE_URL + p}</loc>
${Object.entries(paths[id])
  .map(([l, q]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL + q}"/>`)
  .join('\n')}
  </url>`
    )
  )
  .join('\n')}
</urlset>
`;
files['robots.txt'] = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`;

const check = process.argv.includes('--check');
const stale = [];
for (const [name, body] of Object.entries(files)) {
  const target = join(ROOT, name);
  if (check) {
    if (!existsSync(target) || readFileSync(target, 'utf8') !== body) stale.push(name);
  } else {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, body);
  }
}
// In check mode, every relative href and src in the pages must point at a file in site/.
const broken = [];
if (check) {
  for (const [name, body] of Object.entries(files)) {
    if (!name.endsWith('.html')) continue;
    for (const [, ref] of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|#)/.test(ref)) continue;
      const target = join(ROOT, dirname(name), ref.endsWith('/') ? ref + 'index.html' : ref);
      if (!existsSync(target)) broken.push(`${name} -> ${ref}`);
    }
  }
}
if (broken.length) {
  console.error(`Broken links:\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
if (stale.length) {
  console.error(`Out of date, run node scripts/build.mjs: ${stale.join(', ')}`);
  process.exit(1);
}
console.log(check ? `${Object.keys(files).length} files up to date` : `Wrote ${Object.keys(files).length} files to site/`);
