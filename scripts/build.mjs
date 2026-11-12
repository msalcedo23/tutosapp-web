// Generates every page of the site, plus sitemap.xml, robots.txt and CNAME, in site/ from the data below.
// The output is committed, so GitHub Pages publishes site/ as is.
//   node scripts/build.mjs          write the files
//   node scripts/build.mjs --check  fail if a committed file differs from what this script writes,
//                                   if a relative link is broken, if an app lacks its legal pages,
//                                   or if any page links to github.io
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Public address of the site. GitHub Pages serves it with the custom domain set in the repo settings;
// the old https://msalcedo23.github.io/tutosapp-web/ addresses redirect here.
const DOMAIN = 'tutosapp.co';
const SITE_URL = `https://${DOMAIN}/`;

// Company contact address (info@tutosapp.co is an alias). No personal or Gmail address may appear on the site.
const EMAIL = 'hola@tutosapp.co';
const COMPANY = { name: 'TUTOS APP S.A.S.', nit: '902.125.524-7', city: 'Medellín, Colombia' };
const YEAR = 2026;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');

const PLAY = (id) => `https://play.google.com/store/apps/details?id=${id}`;
const mailto = (subject, body) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
const whatsapp = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Escapes text and turns *words* into <em>words</em> (shown in the serif italic accent). Punctuation
// right after the closing * goes inside, so the period does not float away from the italic word.
const rich = (s) => esc(s).replace(/\*([^*]+)\*([.,!?]?)/g, '<em>$1$2</em>');

// Legal pages. This repo is the single source of truth for every app's privacy policy, terms and
// support page: the text of each lives in legal/<app>/<lang>-<doc>.html and the build wraps it in
// the site's design at <app path><slug>/ (for example ojito/privacidad/ and ojito/en/privacy/).
// A file starts with its <h1> title; the rest is the document as published. Links between
// documents are written as legal:<app>/<doc>/<lang>[#id] and become relative links here.
const LEGAL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'legal');
const LEGAL_DOCS = ['privacy', 'terms', 'support'];
const LEGAL_SLUGS = {
  es: { privacy: 'privacidad', terms: 'terminos', support: 'soporte' },
  en: { privacy: 'privacy', terms: 'terms', support: 'support' },
};

// The apps, in the order they are shown. Adding an app is one more entry here (plus its images):
// the home marquee, the home sections, the menus, the footers, the sitemap and its own page follow.
// paths: the first language is the app's main one (hreflang x-default).
// bg: the browser theme color, matching the top of the app's page; light: the same for its legal pages,
// which use the light page background of its theme (--bg in style.css). fonts: extra fonts its page preloads.
// status: 'live' (in a store), 'test' (closed testing) or 'soon'.
// stores: 'live' links to the listing; 'soon' shows a "coming soon" badge.
// legal: the date each of its legal documents last changed, shown as "last updated" on the page.
// A privacy policy and terms are required for every app (checked by --check); support is optional.
const apps = [
  {
    id: 'ojito',
    name: 'Ojito',
    theme: 't-ojito',
    color: '#1f56d6',
    bg: '#eef3ff',
    light: '#f4f7fd',
    fonts: ['instrument-serif-latin-italic'],
    icon: 'assets/img/ojito/icon.png',
    paths: { es: 'ojito/', en: 'ojito/en/' },
    status: 'test',
    stores: { play: { status: 'soon', url: PLAY('co.ojito.ojito') }, appStore: { status: 'soon' } },
    category: 'FoodAndDrinkApplication',
    legal: { privacy: '2026-11-11', terms: '2026-11-11', support: '2026-11-11' },
    look: 'panels',
    shotSize: [540, 960],
    shots: (lang) =>
      ['01-en-el-mercado', '05-alergias', '03-cuidado-personal', '06-otras-opciones'].map((f) => `assets/img/ojito/${lang}-${f}.jpg`),
    decor: 'scan',
    // Real screens from the app, shown in a phone frame. The first is the hero's default; the
    // hero tabs (tabs in each language) switch between them. feature illustrates the first benefit.
    screenSize: [600, 1300],
    screens: (lang) => ['01-gancho', '03-crema', '05-mani'].map((f) => `assets/img/ojito/screens/${lang}-${f}.webp`),
    feature: (lang) => `assets/img/ojito/screens/${lang}-08-familia.webp`,
    es: {
      category: 'Escáner de etiquetas para familias',
      for: 'Para mamás, papás y familias en Colombia',
      title: 'Ojito: escáner de alimentos y cuidado personal',
      description:
        'Escanea comida y cuidado personal en Colombia: una respuesta para tu bebé y otra para ti. Sellos de advertencia, aditivos y alergias en segundos.',
      headline: '¿Y esto sí se lo *puedo dar*?',
      lead:
        'Apunta la cámara al código de barras y Ojito te dice Bueno, Regular o Evítalo, con tu resultado y, debajo, el de cada persona de tu casa.',
      pitch: 'Escanea un producto y descubre si es bueno para ti y para tu bebé.',
      highlights: ['Bueno, Regular o Evítalo en segundos', 'Alertas de alergias y cuidados de tu familia', 'Sin cuenta y sin marcas pagando'],
      floats: [['Bueno', 'var(--good)'], ['Regular', 'var(--fair)'], ['Evítalo', 'var(--avoid)']],
      tabs: [
        ['Galletas de avena', 'good', 'Ojito dice Bueno, 70 de 100, para unas galletas de avena, y para tu bebé, todavía no: trae azúcar añadida.'],
        ['Crema humectante', 'good', 'Ojito dice Bueno, 94 de 100, para una crema humectante.'],
        ['Producto con maní', 'avoid', 'Ojito avisa "Cuidado: tiene maní", por lo que marcaste para ti.'],
      ],
      featureAlt: 'La pantalla Mi familia de Ojito: un bebé de 8 meses, sin nombres ni fotos de niños.',
      ask: {
        chip: '¿Se lo doy a mi bebé?',
        q: '¿Estas galletas de avena se las puedo dar a mi bebé?',
        verdict: 'Bueno para ti · 70 de 100',
        note: 'Tu bebé: todavía no. Trae azúcar añadida.',
        tone: 'good',
      },
      navCta: 'Quiero probarla',
      shotAlt: ['Resultado Bueno para unas galletas, con la línea del bebé', 'Alerta de maní', 'Producto de cuidado personal', 'Otras opciones con mejor puntaje'],
      benefits: [
        ['family', 'Una respuesta para cada quien', 'Lo que te sirve a ti no siempre le sirve a tu bebé. Ojito te da tu resultado y, debajo, el de cada persona de tu casa según su edad.'],
        ['alert', 'Alergias y cuidados', 'Marca maní, lácteos, gluten, diabetes o presión alta, entre otros, y Ojito te avisa si lo ve en la etiqueta.'],
        ['pin', 'Hecho para Colombia', 'El puntaje mira los sellos de advertencia colombianos, los aditivos y qué tan procesado está el producto. En cuidado personal revisa los ingredientes con las listas de la Comunidad Andina y la Unión Europea.'],
        ['shield', 'Sin cuenta y sin marcas pagando', 'No tienes que registrarte ni darnos nombres o fotos de tus hijos. Ninguna marca paga por aparecer ni por mejorar su puntaje.'],
      ],
      steps: [
        ['Apunta al código de barras', 'Ojito lo lee solo, sin tomar foto. Si prefieres, escribes el código.'],
        ['Mira el resultado de tu casa', 'Bueno, Regular o Evítalo con un puntaje de 0 a 100 para ti, y una línea para tu bebé o para otra persona de tu familia.'],
        ['Entiende el porqué', 'Toca "Ver por qué" para ver qué pesó en el puntaje, y mira otras opciones parecidas con mejor puntaje.'],
      ],
      faq: [
        ['¿Para qué productos sirve?', 'Para comida empacada y productos de cuidado personal con código de barras. Si un producto no aparece, le tomas una foto a la tabla nutricional y a los ingredientes, y la inteligencia artificial de Ojito los lee.'],
        ['¿Cómo sabe si es bueno para mi bebé?', 'Solo te pide la edad, nunca el nombre ni fotos. Con eso, debajo de tu resultado ves una línea para tu bebé, para el embarazo o la lactancia, o para otro adulto de tu casa, con la razón en pocas palabras.'],
        ['¿Ojito reemplaza al pediatra o al médico?', 'No. Ojito no es un dispositivo médico y no diagnostica, trata, cura ni previene ninguna enfermedad. Te ayuda a leer la etiqueta. Si no ves una alerta, no quiere decir que el producto no tenga ese alérgeno: revisa siempre el empaque.'],
        ['¿Necesito crear una cuenta?', 'No. Abres la app y escaneas. Los datos de tu familia se quedan en tu celular.'],
        ['¿Cuánto cuesta?', 'Escanear, ver el resultado, el porqué, las alertas de tu familia y otras opciones no tiene costo. Más adelante habrá una suscripción opcional, Ojito Familia, con el historial completo y la lista de compras.'],
        ['¿Cuándo sale?', 'Ojito está en pruebas y muy pronto estará en Google Play y en App Store. Si quieres probarla antes en Android, escríbenos y te sumamos al grupo de prueba.'],
      ],
      cta: {
        label: 'Quiero probarla',
        href: mailto(
          'Quiero probar Ojito',
          'Hola, quiero entrar al grupo de prueba de Ojito.\n\nMi correo de Google Play (Gmail) es: \nMi teléfono es Android / iPhone: '
        ),
        note: 'Se abre tu correo con el mensaje listo: agrega tu Gmail de Google Play y te sumamos al grupo de prueba de Android.',
      },
      disclaimer: 'Ojito no es un dispositivo médico y no diagnostica, trata, cura ni previene ninguna enfermedad.',
      closing: ['Haz el mercado *con calma*.', 'Súmate al grupo de prueba de Android, o escríbenos y te avisamos cuando Ojito llegue a tu tienda.'],
      share: 'Mira Ojito: escaneas un producto y te dice si es bueno para ti y para tu bebé.',
    },
    en: {
      category: 'Label scanner for families',
      for: 'For parents and families in Colombia',
      title: 'Ojito: food and personal-care label scanner',
      description:
        'Scan food and personal-care products in Colombia: one answer for your baby and another for you. Warning labels, additives and allergies in seconds.',
      headline: 'Can I give this *to my baby*?',
      lead:
        'Point your camera at the barcode and Ojito says Good, Fair or Avoid, with your result and, below it, one for each person in your home. Made for products sold in Colombia.',
      pitch: 'Scan a product and see if it’s good for you and your baby.',
      highlights: ['Good, Fair or Avoid in seconds', 'Alerts for your family’s allergies and conditions', 'No account, no paid placement'],
      floats: [['Good', 'var(--good)'], ['Fair', 'var(--fair)'], ['Avoid', 'var(--avoid)']],
      tabs: [
        ['Oat cookies', 'good', 'Ojito says Good, 70 out of 100, for oat cookies, and for your baby, not yet: they contain added sugar.'],
        ['Moisturizing cream', 'good', 'Ojito says Good, 94 out of 100, for a moisturizing cream.'],
        ['A product with peanuts', 'avoid', 'Ojito warns "Careful: contains peanuts", based on what you marked for yourself.'],
      ],
      featureAlt: 'Ojito’s My family screen: a baby of 8 months, with no names or photos of children.',
      ask: {
        chip: 'OK for my baby?',
        q: 'Can my baby have these oat cookies?',
        verdict: 'Good for you · 70 out of 100',
        note: 'Your baby: not yet. Contains added sugar.',
        tone: 'good',
      },
      navCta: 'Try it',
      shotAlt: ['A Good result for some cookies, with the line for the baby', 'A peanut alert', 'A personal-care product', 'Other options with a better score'],
      benefits: [
        ['family', 'An answer for everyone', 'What works for you may not work for your baby. Ojito gives you your result and, below it, one for each person in your home by age.'],
        ['alert', 'Allergies and conditions', 'Flag peanuts, dairy, gluten, diabetes or high blood pressure, among others, and Ojito warns you when it sees them on the label.'],
        ['pin', 'Built for Colombia', 'The score looks at Colombian warning labels, additives and how processed the product is. For personal care it checks ingredients against Andean Community and European Union lists.'],
        ['shield', 'No account, no paid placement', 'No sign-up, and no names or photos of your children. No brand pays to appear or to improve its score.'],
      ],
      steps: [
        ['Point at the barcode', 'Ojito reads it on its own, no photo needed. You can also type the code.'],
        ['See your home’s result', 'Good, Fair or Avoid with a score from 0 to 100 for you, plus a line for your baby or another person in your family.'],
        ['Understand why', 'Tap "See why" to learn what drove the score, and see similar options with a better score.'],
      ],
      faq: [
        ['Which products does it work with?', 'Packaged food and personal-care products with a barcode. If a product is missing, take a photo of the nutrition table and the ingredients, and Ojito’s AI reads them.'],
        ['How does it know what’s good for my baby?', 'It only asks for their age, never a name or photos. Below your result you then see a line for your baby, for pregnancy or breastfeeding, or for another adult at home, with the reason in a few words.'],
        ['Does Ojito replace a pediatrician or doctor?', 'No. Ojito is not a medical device and does not diagnose, treat, cure or prevent any disease. It helps you read the label. No alert doesn’t mean the product is free of that allergen: always check the package.'],
        ['Do I need an account?', 'No. Open the app and scan. Your family’s details stay on your phone.'],
        ['How much does it cost?', 'Scanning, the result, the reasons, your family’s alerts and other options cost nothing. An optional subscription, Ojito Familia, will later add full history and a shopping list.'],
        ['When does it launch?', 'Ojito is in testing and coming soon to Google Play and the App Store. To try it early on Android, email us and we’ll add you to the testing group.'],
      ],
      cta: {
        label: 'I want to try it',
        href: mailto('I want to try Ojito', 'Hi, I would like to join the Ojito testing group.\n\nMy Google Play (Gmail) address is: \nMy phone is Android / iPhone: '),
        note: 'This opens your email with the message ready: add your Google Play Gmail address and we’ll add you to the Android testing group.',
      },
      disclaimer: 'Ojito is not a medical device and does not diagnose, treat, cure or prevent any disease.',
      closing: ['Shop *with peace of mind*.', 'Join the Android testing group, or email us to hear when Ojito reaches your store.'],
      share: 'Check out Ojito: scan a product and see if it is good for you and your baby.',
    },
  },
  {
    id: 'resume-roast',
    name: 'Resume Roast',
    theme: 't-rr',
    color: '#ff6a2b',
    bg: '#120b08',
    light: '#fbf7f3',
    fonts: ['anton-latin'],
    icon: 'assets/img/resume-roast/icon.png',
    paths: { en: 'resume-roast/', es: 'resume-roast/es/' },
    status: 'live',
    stores: { play: { status: 'live', url: PLAY('com.resumeroast.app') }, appStore: { status: 'soon' } },
    category: 'BusinessApplication',
    legal: { privacy: '2026-11-11', terms: '2026-11-11', support: '2026-11-11' },
    look: 'panels',
    shotSize: [540, 960],
    shots: (lang) => ['01-result', '02-match', '04-rewrite', '06-share'].map((f) => `assets/img/resume-roast/${lang}-${f}.jpg`),
    decor: 'embers',
    screenSize: [600, 1299],
    screens: (lang) => ['result-dark', 'match', 'flags', 'rewrite'].map((f) => `assets/img/resume-roast/screens/${lang}-${f}.webp`),
    feature: (lang) => `assets/img/resume-roast/screens/${lang}-flags.webp`,
    en: {
      category: 'AI resume review',
      for: 'For job seekers who want the truth about their resume',
      title: 'Resume Roast: AI resume review',
      description:
        'Brutally honest AI resume review. Get a score out of 100, match your resume to a real job, fix it and export an ATS-friendly PDF.',
      headline: 'Your resume, *unfiltered*.',
      lead:
        'The AI that tells you what recruiters only think. Paste your resume, or upload a PDF, Word file or photo, and get an honest verdict in seconds. Funny where it helps, never cruel, always useful.',
      pitch: 'The AI that tells you what recruiters only think.',
      highlights: ['A score out of 100 and the red flags', 'Match it to a real job and rewrite it', 'Export a PDF that applicant tracking systems read'],
      floats: [['Score out of 100'], ['Red flags'], ['ATS-ready PDF']],
      tabs: [
        ['Verdict', 'fair', 'Resume Roast gives a resume 64 out of 100, with the verdict: “Real launch experience, hiding behind ‘responsible for’.”'],
        ['Job match', 'good', 'Match with the job: 72%, 3 of 5 must-haves, with what lands and what is missing.'],
        ['Red flags', 'avoid', 'Red flags: no measurable results anywhere in four years of work, and no LinkedIn or portfolio link.'],
        ['Rewrite', 'good', 'The resume rewritten for the job, ready to copy or export as a PDF.'],
      ],
      featureAlt: 'The red flags Resume Roast found in a resume, with the button to rewrite it.',
      ask: {
        chip: 'Will my resume pass?',
        q: 'Will my resume get past the filters?',
        verdict: '64 out of 100',
        note: '“Real launch experience, hiding behind ‘responsible for’.”',
        tone: 'fair',
      },
      navCta: 'Get the app',
      ticker: ['Unfiltered', 'Score out of 100', 'Red flags', 'Job match', 'ATS-ready PDF', 'No subscription'],
      shotAlt: ['An honest score with the verdict', 'How well the resume matches a job posting', 'The resume rewritten for the job', 'A share card without personal details'],
      benefits: [
        ['gauge', 'An honest score', 'A score out of 100 with a section-by-section breakdown, plus the red flags recruiters spot in seconds.'],
        ['target', 'Match it to a real job', 'Paste the job posting and see what already fits, what’s missing, and rewrite your resume around it. It never invents experience.'],
        ['file', 'A PDF that passes the filters', 'Export a selectable-text PDF that applicant tracking systems can read, in three modern templates.'],
        ['coin', 'No subscription', 'Your first 3 credits are free. One credit is one roast or one rewrite. Need more? Buy a pack once, no account needed.'],
      ],
      steps: [
        ['Paste or upload your resume', 'Text, PDF, Word or a photo. Add the job posting if you have one.'],
        ['Get the verdict', 'A score out of 100, a breakdown by section and the red flags. With a posting, you also see how well you match.'],
        ['Fix it and export it', 'Rewrite your resume for that job, without inventing anything, and download a PDF that the filters can read.'],
      ],
      faq: [
        ['How much does it cost?', 'You start with 3 free credits. One credit is one roast or one rewrite, and if the AI fails you get the credit back. Need more? Buy a pack once: no subscription, no ads and no account.'],
        ['Does the AI invent experience?', 'No. The rewrite reorganizes and sharpens what you already have for the job, but it never invents jobs, titles or experience.'],
        ['What happens to my resume?', 'To analyze it, your resume text goes through our server and an AI provider, and it isn’t stored. Your history, photo and PDFs stay on your phone. The privacy policy has the details.'],
        ['Which languages does it support?', 'The app is in English and Spanish, and your resume can come out in English, Spanish, Portuguese, French, Italian or German.'],
        ['What is an ATS-friendly PDF?', 'Many companies use software that reads your resume before a person does. Resume Roast exports a PDF with selectable text that those systems can read, in three modern templates.'],
        ['Is it on iPhone?', 'It’s on Google Play today. The iPhone version is coming soon: email us and we’ll let you know.'],
      ],
      notifyLabel: 'On iPhone? Get notified',
      notify: mailto('Resume Roast for iPhone', 'Hi, please let me know when Resume Roast is on the App Store.'),
      closing: ['Stop guessing *what your resume is missing*.', 'Get Resume Roast on Google Play and see your first verdict in seconds.'],
      share: 'Resume Roast gives your resume an honest score and tells you how to fix it.',
    },
    es: {
      category: 'Análisis de CV con IA',
      for: 'Para quienes buscan trabajo y quieren la verdad sobre su CV',
      title: 'Resume Roast: análisis de CV con IA',
      description:
        'Análisis de CV con IA, sin filtros. Puntaje de 0 a 100, compáralo con la vacante, arréglalo y expórtalo en un PDF que leen los filtros (ATS).',
      headline: 'Tu CV, *sin filtros*.',
      lead:
        'La IA que te dice lo que los reclutadores solo piensan. Pega tu CV, o sube un PDF, un Word o una foto, y recibe un veredicto honesto en segundos. Con humor cuando ayuda, nunca cruel, siempre útil.',
      pitch: 'La IA que te dice lo que los reclutadores solo piensan.',
      highlights: ['Puntaje sobre 100 y las red flags', 'Compáralo con una vacante real y reescríbelo', 'Exporta un PDF que leen los filtros (ATS)'],
      floats: [['Puntaje sobre 100'], ['Red flags'], ['PDF para ATS']],
      tabs: [
        ['Veredicto', 'fair', 'Resume Roast le da 64 de 100 a un CV, con el veredicto: “Experiencia real de lanzamiento, escondida tras un ‘encargada de’.”'],
        ['Match', 'good', 'Match con la oferta: 72 %, 3 de 5 requisitos, con lo que encaja y lo que falta.'],
        ['Red flags', 'avoid', 'Señales de alerta: ningún resultado medible en cuatro años de trabajo, y sin enlace a LinkedIn ni portafolio.'],
        ['Reescritura', 'good', 'El CV reescrito para la vacante, listo para copiar o exportar en PDF.'],
      ],
      featureAlt: 'Las señales de alerta que Resume Roast encontró en un CV, con el botón para reescribirlo.',
      ask: {
        chip: '¿Mi CV pasa el filtro?',
        q: '¿Mi CV sí pasa el filtro de la vacante?',
        verdict: '64 de 100',
        note: '“Experiencia real de lanzamiento, escondida tras un ‘encargada de’.”',
        tone: 'fair',
      },
      navCta: 'Descargar',
      ticker: ['Sin filtros', 'Puntaje sobre 100', 'Red flags', 'Match con la vacante', 'PDF para ATS', 'Sin suscripción'],
      shotAlt: ['Un puntaje honesto con el veredicto', 'Qué tanto encaja el CV con la vacante', 'El CV reescrito para la vacante', 'Una tarjeta para compartir sin datos personales'],
      benefits: [
        ['gauge', 'Un puntaje honesto', 'Puntaje sobre 100 con detalle por sección, y las red flags que un reclutador ve en segundos.'],
        ['target', 'Compáralo con una vacante real', 'Pega la oferta y mira qué encaja, qué falta, y reescribe tu CV para esa vacante. Nunca inventa experiencia.'],
        ['file', 'Un PDF que pasa los filtros', 'Exporta un PDF con texto seleccionable que leen los sistemas de selección (ATS), con tres plantillas modernas.'],
        ['coin', 'Sin suscripción', 'Tus primeros 3 créditos son gratis. Un crédito es un análisis o una reescritura. ¿Necesitas más? Compras un paquete una vez, sin cuenta.'],
      ],
      steps: [
        ['Pega o sube tu CV', 'Texto, PDF, Word o una foto. Si tienes la oferta, agrégala.'],
        ['Recibe el veredicto', 'Puntaje sobre 100, detalle por sección y las red flags. Con la oferta, ves también qué tanto encajas.'],
        ['Arréglalo y expórtalo', 'Reescribe tu CV para esa vacante, sin inventar nada, y descárgalo en un PDF que leen los filtros.'],
      ],
      faq: [
        ['¿Cuánto cuesta?', 'Empiezas con 3 créditos gratis. Un crédito es un análisis o una reescritura, y si la IA falla te lo devolvemos. ¿Necesitas más? Compras un paquete una sola vez: sin suscripción, sin anuncios y sin cuenta.'],
        ['¿La IA inventa experiencia?', 'No. La reescritura ordena y mejora lo que ya tienes para esa vacante, pero nunca inventa trabajos, cargos ni experiencia.'],
        ['¿Qué pasa con mi CV?', 'Para analizarlo, el texto de tu CV pasa por nuestro servidor y por un proveedor de inteligencia artificial, y no se guarda. Tu historial, tu foto y tus PDF se quedan en tu celular. Los detalles están en la política de privacidad.'],
        ['¿En qué idiomas funciona?', 'La app está en español y en inglés, y tu CV puede salir en español, inglés, portugués, francés, italiano o alemán.'],
        ['¿Qué es un PDF que pasa los filtros (ATS)?', 'Muchas empresas usan programas que leen tu CV antes que una persona. Resume Roast exporta un PDF con texto seleccionable que esos programas pueden leer, con tres plantillas modernas.'],
        ['¿Está en iPhone?', 'Hoy está en Google Play. La versión para iPhone viene pronto: escríbenos y te avisamos.'],
      ],
      notifyLabel: '¿Tienes iPhone? Te avisamos',
      notify: mailto('Resume Roast para iPhone', 'Hola, avísenme cuando Resume Roast esté en App Store.'),
      closing: ['Deja de adivinar *qué le falta a tu CV*.', 'Descarga Resume Roast en Google Play y recibe tu primer veredicto en segundos.'],
      share: 'Resume Roast le pone un puntaje honesto a tu CV y te dice cómo mejorarlo.',
    },
  },
  {
    id: 'roast-interview',
    name: 'Roast Interview',
    theme: 't-ri',
    color: '#3b7bff',
    bg: '#060a16',
    light: '#f5f7fb',
    fonts: [],
    icon: 'assets/img/roast-interview/icon.png',
    paths: { en: 'roast-interview/', es: 'roast-interview/es/' },
    status: 'soon',
    stores: { play: { status: 'soon' }, appStore: { status: 'soon' } },
    category: 'EducationalApplication',
    legal: { privacy: '2026-11-11', terms: '2026-11-11' },
    look: 'phone',
    shotSize: [441, 960],
    shots: (lang) =>
      (lang === 'en'
        ? ['phase1-en-19-report-top', 'phase1-en-09-room-question']
        : ['phase1-es-dark-19-report-top', 'phase1-es-dark-12-room-second-question', 'phase1-es-dark-22-report-end']
      ).map((f) => `assets/img/roast-interview/${f}.jpg`),
    decor: 'wave',
    screenSize: [552, 1200],
    screens: (lang) =>
      (lang === 'en'
        ? ['en-16-room-last-question', 'en-19-report-top', 'en-21-report-locked']
        : ['es-dark-12-room-second-question', 'es-dark-19-report-top', 'es-dark-22-report-end']
      ).map((f) => `assets/img/roast-interview/screens/${f}.webp`),
    feature: (lang) => `assets/img/roast-interview/screens/${lang === 'en' ? 'en-09-room-question' : 'es-dark-16-room-last-question'}.webp`,
    en: {
      category: 'AI interview practice',
      for: 'For candidates getting ready for a job interview',
      title: 'Roast Interview: AI interview practice',
      description:
        'Practice job interviews with an AI interviewer that asks the questions hiding in your resume. Answer by typing or out loud, and get a score and an honest verdict.',
      headline: 'Practice with an interviewer that *tells you the truth*.',
      lead:
        'Upload your resume and the role you want. An AI interviewer asks the questions you will really get, you answer by typing or out loud, and at the end you get your score and an honest verdict.',
      pitch: 'Rehearse the interview before it counts.',
      highlights: ['Questions that come from your resume', 'Answer by typing or out loud', 'A score and a verdict for that role'],
      floats: [['Answer out loud', 'wave'], ['Score and verdict'], ['Questions from your resume']],
      tabs: [
        ['The question', 'ask', 'The interviewer asks: “Your CV says you cut p95 latency by 40%. Measured where, against what baseline, and how do you know it wasn’t the new hardware?”'],
        ['Your verdict', 'fair', 'Your verdict: 64 out of 100, hireable with reservations, with the level you claimed and your real level.'],
        ['In one line', 'good', 'The report sums up the interview in one line: “Knows more than they sell, and sells more than they measured.”'],
      ],
      featureAlt: 'The interviewer opens: “Hi, I’m Valeria and I’ll be your interviewer today. To start: walk me through your last two years as a backend engineer, in two minutes.”',
      ask: {
        chip: 'Am I interview-ready?',
        q: 'Am I ready for my interview?',
        verdict: 'First, a question',
        note: '“Your CV says you cut p95 latency by 40%. Measured where, against what baseline?”',
        tone: 'ask',
      },
      navCta: 'Notify me',
      shotAlt: ['The report with the score and the verdict', 'The interviewer asks the first question'],
      benefits: [
        ['spark', 'Questions from your resume', 'Not a generic list: it spots inconsistencies and asks about them, like a real interviewer.'],
        ['bolt', 'Adaptive pressure', 'Strong answers raise the bar. If you stumble, it helps you get back on track.'],
        ['gauge', 'A score for that job', 'At the end you get your score, your detected level and what you did well, calibrated to the role.'],
        ['repeat', 'Track your progress', 'Retake the interview with new questions on the same core topics and compare your scores.'],
      ],
      steps: [
        ['Load your resume', 'Paste it or upload a PDF, Word file or photo. Add the job posting if you have it.'],
        ['Take the interview', 'Answer by typing or out loud, with a clock per answer. The pressure adapts to how you are doing.'],
        ['Get your verdict', 'Your score, detected level and what you did well. The full report adds red flags, your weakest moment with a better answer, and a plan to improve.'],
      ],
      faq: [
        ['When does it launch?', 'We’re finishing testing. It’s coming soon to Google Play and the App Store: email us and we’ll tell you the day it launches.'],
        ['How much will it cost?', 'Every day you get one free mini interview of 8 questions, with a score and a verdict. Full interviews with the full report are bought with credits, once, with no subscription.'],
        ['Which language is the interview in?', 'Spanish or English. By default it follows the language of your resume, and you can change it before you start.'],
        ['Can I answer out loud?', 'Yes. Answer by typing or with your voice; your voice is turned into text and the audio is not kept.'],
        ['Do I need internet or an account?', 'You need internet during the interview. You don’t need to create an account.'],
        ['What happens to my data?', 'Interview sessions are deleted after 24 hours, and you can delete your data from Settings. The privacy policy has the details.'],
      ],
      notify: mailto('Roast Interview: tell me when it launches', 'Hi, please let me know when Roast Interview launches.\n\nMy phone is Android / iPhone: '),
      closing: ['Walk into your next interview *already practiced*.', 'Roast Interview is coming soon. Email us and we’ll let you know when it launches.'],
      share: 'Roast Interview: practice job interviews with an AI that tells you the truth. Coming soon.',
    },
    es: {
      category: 'Entrevistas de práctica con IA',
      for: 'Para quienes se preparan para una entrevista de trabajo',
      title: 'Roast Interview: practica entrevistas con IA',
      description:
        'Practica entrevistas de trabajo con una IA que te pregunta lo que esconde tu CV. Responde por escrito o en voz alta, y recibe un puntaje y un veredicto honesto.',
      headline: 'Practica con una entrevistadora que *te dice la verdad*.',
      lead:
        'Sube tu CV y el cargo al que aplicas. Una IA entrevistadora te hace las preguntas que te van a hacer de verdad, respondes por escrito o en voz alta, y al final recibes tu puntaje y un veredicto honesto.',
      pitch: 'Ensaya la entrevista antes de que cuente.',
      highlights: ['Preguntas que salen de tu CV', 'Responde por escrito o en voz alta', 'Un puntaje y un veredicto para ese cargo'],
      floats: [['Responde en voz alta', 'wave'], ['Puntaje y veredicto'], ['Preguntas desde tu CV']],
      tabs: [
        ['La pregunta', 'ask', 'La entrevistadora pregunta: “Dices que lideraste la migración a Kubernetes. ¿Qué se rompió exactamente la primera semana y qué cambiaste por eso?”'],
        ['Tu veredicto', 'fair', 'Tu veredicto: 64 de 100, contratable con reservas, con el nivel que declaraste y tu nivel real.'],
        ['En una frase', 'good', 'El informe resume la entrevista en una frase: “Sabe más de lo que vende… y vende más de lo que midió.”'],
      ],
      featureAlt: 'La entrevistadora pregunta por un dato del CV: “Tu CV dice que bajaste la latencia p95 un 40 %. ¿Medida dónde, contra qué línea base, y cómo sabes que no fue el hardware nuevo?”',
      ask: {
        chip: '¿Me irá bien en la entrevista?',
        q: '¿Me va a ir bien en la entrevista?',
        verdict: 'Antes, una pregunta',
        note: '“Dices que lideraste la migración a Kubernetes. ¿Qué se rompió exactamente la primera semana?”',
        tone: 'ask',
      },
      navCta: 'Avísame',
      shotAlt: ['El informe con el puntaje y el veredicto', 'La entrevistadora hace una pregunta sobre tu CV', 'El final del informe'],
      benefits: [
        ['spark', 'Preguntas que salen de tu CV', 'No es una lista genérica: detecta inconsistencias y te pregunta por ellas, como en una entrevista real.'],
        ['bolt', 'Presión que se adapta', 'Si respondes bien, sube la exigencia. Si te trabas, te ayuda a retomar.'],
        ['gauge', 'Un puntaje para ese cargo', 'Al final recibes tu puntaje, tu nivel detectado y lo que hiciste bien, medido para ese puesto.'],
        ['repeat', 'Mide tu progreso', 'Repite la entrevista con preguntas nuevas sobre los mismos temas y compara tus puntajes.'],
      ],
      steps: [
        ['Sube tu CV', 'Pégalo o sube un PDF, un Word o una foto. Si tienes la oferta, agrégala.'],
        ['Haz la entrevista', 'Responde por escrito o en voz alta, con tiempo por respuesta. La presión se ajusta a cómo te va.'],
        ['Recibe tu veredicto', 'Tu puntaje, tu nivel detectado y lo que hiciste bien. El informe completo suma las red flags, tu peor momento con una mejor respuesta y un plan de mejora.'],
      ],
      faq: [
        ['¿Cuándo sale?', 'Estamos terminando las pruebas. Muy pronto estará en Google Play y en App Store: escríbenos y te avisamos el día que salga.'],
        ['¿Cuánto va a costar?', 'Cada día tienes una mini entrevista gratis de 8 preguntas, con puntaje y veredicto. Las entrevistas completas, con el informe completo, se compran con créditos, una sola vez y sin suscripción.'],
        ['¿En qué idioma es la entrevista?', 'En español o en inglés. Por defecto sigue el idioma de tu CV, y puedes cambiarlo antes de empezar.'],
        ['¿Puedo responder hablando?', 'Sí. Respondes por escrito o con tu voz; tu voz se convierte en texto y el audio no se guarda.'],
        ['¿Necesito internet o una cuenta?', 'Necesitas internet durante la entrevista. No tienes que crear una cuenta.'],
        ['¿Qué pasa con mis datos?', 'Las sesiones de entrevista se borran a las 24 horas y puedes eliminar tus datos desde Ajustes. Los detalles están en la política de privacidad.'],
      ],
      notify: mailto('Roast Interview: avísame cuando salga', 'Hola, avísenme cuando salga Roast Interview.\n\nMi teléfono es Android / iPhone: '),
      closing: ['Llega a tu próxima entrevista *con práctica*.', 'Roast Interview sale muy pronto. Escríbenos y te avisamos cuando esté lista.'],
      share: 'Roast Interview: practica entrevistas de trabajo con una IA que te dice la verdad. Muy pronto.',
    },
  },
];

const ui = {
  es: {
    apps: 'Apps',
    ourApps: 'Nuestras apps',
    how: 'Cómo funciona',
    benefits: 'Lo que hace por ti',
    screens: 'Así se ve',
    faq: 'Preguntas frecuentes',
    getOn: 'Disponible en',
    soonOn: 'Próximamente en',
    share: 'Compartir por WhatsApp',
    notify: 'Avísame cuando salga',
    legal: 'Legal',
    privacy: 'Política de privacidad',
    terms: 'Términos y condiciones',
    support: 'Soporte',
    contact: 'Contacto',
    switchTo: 'English',
    switchShort: 'EN',
    skip: 'Saltar al contenido',
    screenshotOf: 'Pantalla de',
    see: 'Ver',
    menu: 'Menú principal',
    allApps: 'Todas las apps de Tutos App',
    switcher: 'ver todas las apps',
    switcherMenu: 'Ir a otra app',
    homeOf: 'Inicio de Tutos App',
    status: { live: 'Disponible', test: 'En pruebas', soon: 'Próximamente' },
    pause: 'Pausar animación',
    resume: 'Reanudar animación',
    brandOf: `Tutos App es una marca de ${COMPANY.name}`,
    mailFallback: '¿No se abre tu correo? Escríbenos a',
    noCookies: 'Este sitio no usa cookies ni analítica.',
    rights: 'Todos los derechos reservados.',
    notFound: 'Esta página no existe.',
    backHome: 'Volver al inicio',
    faqPrivacy: 'Lee la política de privacidad',
    updated: 'Última actualización',
    toc: 'En esta página',
    legalAbout: {
      privacy: (name) => `Política de privacidad de ${name}: qué datos usa la app, para qué, con quién se comparten, cuánto tiempo se guardan y cómo ejercer tus derechos.`,
      terms: (name) => `Términos y condiciones de ${name}: las reglas para usar la app, las compras y tus derechos.`,
      support: (name) => `Soporte de ${name}: cómo escribirnos, ayuda con la app y cómo borrar tus datos.`,
    },
    seeExample: 'Mira un ejemplo',
    askTitle: 'Pregúntale a nuestras apps',
    askLegend: 'Elige una pregunta',
    askNote: 'Respuestas de ejemplo, tomadas de las apps',
    question: 'Pregunta',
    example: 'Ejemplo real',
    swipe: 'Desliza para ver más pantallas',
    shotsKicker: 'Capturas de la app',
    faqKicker: 'Dudas',
    // Each app page's own menu: links to its sections.
    sections: { benefits: ['beneficios', 'Beneficios'], how: ['como-funciona', 'Cómo funciona'], shots: ['capturas', 'Capturas'], faq: ['preguntas', 'Preguntas'] },
    appBy: (name) => `${name} es una app de Tutos App, estudio de apps con IA de Medellín, Colombia.`,
  },
  en: {
    apps: 'Apps',
    ourApps: 'Our apps',
    how: 'How it works',
    benefits: 'What it does for you',
    screens: 'Take a look',
    faq: 'Frequently asked questions',
    getOn: 'Get it on',
    soonOn: 'Coming soon to',
    share: 'Share on WhatsApp',
    notify: 'Notify me when it launches',
    legal: 'Legal',
    privacy: 'Privacy policy',
    terms: 'Terms and conditions',
    support: 'Support',
    contact: 'Contact',
    switchTo: 'Español',
    switchShort: 'ES',
    skip: 'Skip to content',
    screenshotOf: 'Screen from',
    see: 'See',
    menu: 'Main menu',
    allApps: 'All Tutos App apps',
    switcher: 'see all apps',
    switcherMenu: 'Go to another app',
    homeOf: 'Tutos App home',
    status: { live: 'Available', test: 'In testing', soon: 'Coming soon' },
    pause: 'Pause animation',
    resume: 'Resume animation',
    brandOf: `Tutos App is a brand of ${COMPANY.name}`,
    mailFallback: 'Email app didn’t open? Write to',
    noCookies: 'This site uses no cookies and no analytics.',
    rights: 'All rights reserved.',
    notFound: 'This page does not exist.',
    backHome: 'Back to home',
    faqPrivacy: 'Read the privacy policy',
    updated: 'Last updated',
    toc: 'On this page',
    legalAbout: {
      privacy: (name) => `${name} privacy policy: what data the app uses, what for, who it is shared with, how long it is kept and how to exercise your rights.`,
      terms: (name) => `${name} terms and conditions: the rules for using the app, purchases and your rights.`,
      support: (name) => `${name} support: how to reach us, help with the app and how to delete your data.`,
    },
    seeExample: 'See an example',
    askTitle: 'Ask our apps',
    askLegend: 'Pick a question',
    askNote: 'Sample answers, taken from the apps',
    question: 'Question',
    example: 'Real example',
    swipe: 'Swipe to see more screens',
    shotsKicker: 'App screenshots',
    faqKicker: 'Questions',
    sections: { benefits: ['benefits', 'Benefits'], how: ['how-it-works', 'How it works'], shots: ['screens', 'Screens'], faq: ['faq', 'FAQ'] },
    appBy: (name) => `${name} is an app by Tutos App, an AI app studio from Medellín, Colombia.`,
  },
};

// Copy that depends on the app list, so it stays true when an app is added.
const countWords = {
  es: ['ninguna', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'],
  en: ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
};
const appCount = (lang) => {
  const word = countWords[lang][apps.length] ?? String(apps.length);
  return `${word[0].toUpperCase()}${word.slice(1)} ${apps.length === 1 ? 'app' : 'apps'}`;
};
const appNames = (lang) => new Intl.ListFormat(lang, { type: 'conjunction' }).format(apps.map((a) => a.name));

// Home page copy. The hero states the studio's mission and lets each app answer one real
// question in the demo card, so the hero never has to summarize every app.
const home = {
  paths: { es: '', en: 'en/' },
  bg: '#f6f6f8',
  es: {
    title: 'Tutos App: apps con IA para las decisiones de cada día',
    description: `Tutos App es un estudio de Medellín que crea apps con inteligencia artificial para las decisiones de cada día: ${appNames('es')}.`,
    eyebrow: 'Estudio de apps con IA · Medellín, Colombia',
    headline: 'Decisiones de todos los días, *más simples*.',
    lead:
      'Tutos App crea apps con inteligencia artificial que te dan una respuesta clara, te explican el porqué y no te piden más de lo necesario.',
    primary: 'Conoce las apps',
    write: 'Escríbenos',
    appsEyebrow: 'Nuestras apps',
    appsTitle: 'Cada app resuelve *una cosa*, y la resuelve bien.',
    appsLead: 'Apps pequeñas y honestas, en español y en inglés.',
    nav: [['#apps', 'Apps'], ['#principios', 'Cómo trabajamos'], ['#contacto', 'Contacto']],
    principlesId: 'principios',
    principlesEyebrow: 'Cómo trabajamos',
    principlesTitle: 'Tecnología útil, *sin letra pequeña*.',
    principles: [
      ['eye', 'La IA explica, no adivina', 'Cada resultado viene con el porqué, en palabras simples, para que la decisión sea tuya y no de la app.'],
      ['shield', 'Honestas contigo', 'Te decimos lo que vemos, aunque no sea lo que quieres oír. Nadie paga por un mejor resultado y la IA no inventa datos.'],
      ['lock', 'Sin registro para empezar', 'Abres la app y la usas, sin crear una cuenta. Lo que se paga se dice claro, antes de pagar.'],
      ['pin', 'Hechas en Colombia', 'Diseñamos en Medellín pensando en cómo se compra, se busca trabajo y se habla aquí, en español y en inglés.'],
    ],
    // Small illustrations for the principles, taken from what the apps really show.
    visuals: {
      eye: {
        label: 'Ejemplo de Ojito',
        title: 'Por qué este puntaje',
        rows: [['Azúcar, sal y grasas en exceso', 34, 55], ['Procesamiento: ultraprocesado', 0, 25], ['Aditivos: pocos', 17, 20]],
        of: 'de',
      },
      shield: { label: 'Una red flag de Resume Roast', quote: '“Ningún resultado medible en cuatro años de trabajo.”' },
      lock: { yes: ['Abres la app', 'La usas'], no: 'Crear una cuenta' },
      pin: { place: 'Medellín, Colombia', coords: '6.24° N · 75.58° W', langs: ['Español', 'English'] },
    },
    contactEyebrow: 'Hablemos',
    nextTitle: `${appCount('es')} hoy. *Vienen más.*`,
    nextLead:
      'Cada app nace de una pregunta real del día a día. ¿Tienes una idea, quieres probar nuestras apps antes que nadie o trabajar con nosotros? Escríbenos.',
    share: 'Mira las apps de Tutos App:',
    about: 'Estudio de apps con IA de Medellín, Colombia. Decisiones de todos los días, más simples.',
  },
  en: {
    title: 'Tutos App: AI apps for everyday decisions',
    description: `Tutos App is a studio from Medellín, Colombia, that builds AI apps for everyday decisions: ${appNames('en')}.`,
    eyebrow: 'AI app studio · Medellín, Colombia',
    headline: 'Everyday decisions, *made simpler*.',
    lead: 'Tutos App builds AI apps that give you a clear answer, explain the reason behind it and ask for nothing more than they need.',
    primary: 'Meet the apps',
    write: 'Email us',
    appsEyebrow: 'Our apps',
    appsTitle: 'Each app does *one thing*, and does it well.',
    appsLead: 'Small, honest apps in Spanish and English.',
    nav: [['#apps', 'Apps'], ['#principles', 'How we work'], ['#contact', 'Contact']],
    principlesId: 'principles',
    principlesEyebrow: 'How we work',
    principlesTitle: 'Useful technology, *no fine print*.',
    principles: [
      ['eye', 'AI that explains', 'Every result comes with the reason, in plain words, so the decision stays yours and not the app’s.'],
      ['shield', 'Honest with you', 'We tell you what we see, even when it is not what you want to hear. Nobody pays for a better result, and the AI does not make things up.'],
      ['lock', 'No sign-up to start', 'Open the app and use it, no account needed. What costs money is said clearly, before you pay.'],
      ['pin', 'Made in Colombia', 'We design in Medellín around how people here shop, look for work and talk, in Spanish and English.'],
    ],
    visuals: {
      eye: {
        label: 'Example from Ojito',
        title: 'Why this score',
        rows: [['Sugar, salt and fats in excess', 34, 55], ['Processing: ultra-processed', 0, 25], ['Additives: few', 17, 20]],
        of: 'of',
      },
      shield: { label: 'A Resume Roast red flag', quote: '“No measurable results anywhere in four years of work.”' },
      lock: { yes: ['Open the app', 'Use it'], no: 'Create an account' },
      pin: { place: 'Medellín, Colombia', coords: '6.24° N · 75.58° W', langs: ['Español', 'English'] },
    },
    contactEyebrow: 'Let’s talk',
    nextTitle: `${appCount('en')} today. *More on the way.*`,
    nextLead:
      'Each app starts from a real everyday question. Have an idea, want to try our apps before anyone else, or want to work with us? Email us.',
    share: 'Check out the Tutos App apps:',
    about: 'AI app studio from Medellín, Colombia. Everyday decisions, made simpler.',
  },
};

const langs = ['es', 'en'];

const rel = (from, to) => '../'.repeat(from.split('/').filter(Boolean).length) + to || './';

// Where an app's legal document lives in a language, and which documents it has, in menu order.
const legalPath = (app, lang, doc) => `${app.paths[lang]}${LEGAL_SLUGS[lang][doc]}/`;
const legalDocs = (app) => LEGAL_DOCS.filter((doc) => app.legal[doc]);
const legalAlternates = (app, doc) => Object.fromEntries(Object.keys(app.paths).map((l) => [l, legalPath(app, l, doc)]));

// The stylesheet URL carries a hash of its content. A browser or CDN that still holds an older
// style.css then never pairs it with newer pages, which would leave them half unstyled.
const CSS_PATH = 'assets/style.css';
const CSS_VERSION = createHash('sha256').update(readFileSync(join(ROOT, CSS_PATH))).digest('hex').slice(0, 10);
const stylesheet = (path) => `${rel(path, CSS_PATH)}?v=${CSS_VERSION}`;

// The interactive demos (the home question card and each app's hero) switch panes with CSS only,
// one radio per pane. style.css handles up to this many panes per demo.
const MAX_PANES = 8;

const svg = (d, size = 22, stroke = 1.8) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const glyphs = {
  family: '<circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 20c.2-2.5 1.5-4.5 3.5-4.5s3.3 2 3.5 4.5"/>',
  alert: '<path d="M12 3.5 2.5 20h19L12 3.5z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.4 3.2 8.1 7.5 9 4.3-.9 7.5-4.6 7.5-9V6L12 3z"/><path d="m9 12 2 2 4-4"/>',
  gauge: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.4-.9-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 1.9 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2.1-.6-2.5-1.5M12 6v1.7M12 16.3V18"/>',
  spark: '<path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z"/><path d="M19 15.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5z"/>',
  bolt: '<path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12l1-7.5z"/>',
  repeat: '<path d="M17 3l3.5 3.5L17 10"/><path d="M4 11.5V10a3.5 3.5 0 0 1 3.5-3.5h13M7 21l-3.5-3.5L7 14"/><path d="M20 12.5V14a3.5 3.5 0 0 1-3.5 3.5h-13"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
};

const icons = {
  play: '<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26"><path fill="#00d17f" d="M4.6 2.3c-.3.3-.4.7-.4 1.2v17c0 .5.1.9.4 1.2l9.5-9.7z"/><path fill="#ffce00" d="m19.9 9-3-1.7-3.3 3.3 3.3 3.3 3-1.7c.9-.5.9-1.9 0-2.4z"/><path fill="#00a0ff" d="M15.5 10.6 18.4 7.6 6.5 1c-.5-.3-1-.4-1.4-.3z" opacity=".95"/><path fill="#ff3a44" d="M15.5 13.4 5.1 23.3c.4.1.9 0 1.4-.3l11.9-6.6z"/></svg>',
  apple: '<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-4.2zM13.9 5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"/></svg>',
  whatsapp: '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.5-.7-2.3-1.5-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
  mail: svg('<path d="M3.5 6h17v12h-17zM3.5 7l8.5 6 8.5-6"/>', 20),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 18),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 18, 2.2),
  pause: svg('<path d="M9 5v14M15 5v14"/>', 14, 2.4),
  playSmall: svg('<path d="M7 4.5v15l12-7.5z"/>', 14),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 18, 2),
  chevron: svg('<path d="m6 9 6 6 6-6"/>', 14, 2.4),
};

const wave = '<span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
const pad = (n) => String(n).padStart(2, '0');
const kicker = (n, label) => `<p class="kicker"><span class="num">${pad(n)}</span><span>${esc(label)}</span></p>`;

// JSON-LD for search engines. "<" is escaped so the data can never close the script tag.
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const organization = {
  '@type': 'Organization',
  name: 'Tutos App',
  legalName: COMPANY.name,
  taxID: COMPANY.nit,
  url: SITE_URL,
  logo: `${SITE_URL}apple-touch-icon.png`,
  email: EMAIL,
  address: { '@type': 'PostalAddress', addressLocality: 'Medellín', addressRegion: 'Antioquia', addressCountry: 'CO' },
};

function head({ lang, title, description, path, alternates, og, bg, ld, fonts = [] }) {
  const url = SITE_URL + path;
  const alt = Object.entries(alternates)
    .map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL + p}">`)
    .join('\n    ');
  const preload = ['geist-latin-wght', ...fonts]
    .map((f) => `<link rel="preload" href="${rel(path, `assets/fonts/${f}.woff2`)}" as="font" type="font/woff2" crossorigin>`)
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
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="${bg}">
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
    ${preload}
    <link rel="stylesheet" href="${stylesheet(path)}">
    ${jsonLd({ '@context': 'https://schema.org', ...ld })}
  </head>`;
}

// The app switcher: one small button (the Tutos App logo and a chevron) that opens a short list
// of every app, with its icon, name and one line, and a link to the Tutos App home. The names stay
// out of the menu bar until it is opened, so each app page keeps its own space. It is a native
// popover, so it needs no JavaScript: the browser opens and closes it, closes it on Esc or a tap
// outside, returns the focus to the button and tells screen readers whether it is open. Its icons
// load lazily, so a closed list costs no downloads.
function switcher(lang, path, app, current = 'page') {
  const t = ui[lang];
  const item = (href, img, name, line, here) =>
    `<li><a href="${href}"${here ? ` aria-current="${current}"` : ''}><img src="${img}" alt="" width="36" height="36" loading="lazy"><span class="apps-name"><b>${esc(name)}</b>${line ? `<span>${esc(line)}</span>` : ''}</span>${here ? icons.check : ''}</a></li>`;
  const logo = rel(path, 'favicon.svg');
  return `<button class="apps-toggle" type="button" popovertarget="apps-menu" aria-controls="apps-menu" aria-label="Tutos App: ${t.switcher}"><img src="${logo}" alt="" width="${app ? 24 : 28}" height="${app ? 24 : 28}">${app ? '' : '<span>Tutos App</span>'}${icons.chevron}</button>
        <nav class="apps-menu" id="apps-menu" popover aria-label="${t.switcherMenu}">
          <ul>${apps.map((a) => item(rel(path, a.paths[lang]), rel(path, a.icon), a.name, a[lang].category, a === app)).join('')}</ul>
          <ul class="apps-home">${item(rel(path, home.paths[lang]), logo, t.homeOf, '', !app)}</ul>
        </nav>`;
}

// The floating pill navigation: the app switcher, page links, language switch and the page's main
// action. An app page stands on its own: its brand and its own sections; the other apps and the
// Tutos App home are one tap away in the switcher, behind the small Tutos App logo.
// current: 'page' on the app's own page; 'true' on its legal pages, which belong to the app.
function nav({ lang, path, theme, items, other, cta, app, current = 'page' }) {
  const t = ui[lang];
  const brand = app
    ? `${switcher(lang, path, app, current)}
        <span class="nav-sep" aria-hidden="true"></span>
        <a class="brand" href="${rel(path, app.paths[lang])}"${current === 'page' ? ' aria-current="page"' : ''}><img src="${rel(path, app.icon)}" alt="" width="28" height="28"><span>${esc(app.name)}</span></a>`
    : switcher(lang, path);
  return `
  <body class="${theme}">
    <a class="skip" href="#main">${t.skip}</a>
    <header class="nav">
      <div class="nav-bar">
        ${brand}
        <nav class="nav-menu" aria-label="${t.menu}">
          <ul class="nav-links">${items
            .map(([href, label, current]) => `<li><a href="${href}"${current ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`)
            .join('')}</ul>
        </nav>
        <a class="lang" href="${rel(path, other.path)}" hreflang="${other.lang}" lang="${other.lang}"><span class="lang-long">${t.switchTo}</span><span class="lang-short" aria-hidden="true">${t.switchShort}</span></a>
        <a class="nav-cta" href="${cta.href}">${esc(cta.label)}</a>
      </div>
    </header>`;
}

function legalLinks(app, lang, path) {
  const t = ui[lang];
  return legalDocs(app)
    .map((doc) => {
      const href = legalPath(app, lang, doc);
      return `<li><a href="${rel(path, href)}"${href === path ? ' aria-current="page"' : ''}>${t[doc]}</a></li>`;
    })
    .join('');
}

function footer({ lang, path, only }) {
  const t = ui[lang];
  const h = home[lang];
  // The home footer lists every app; an app page's footer is about that app alone.
  const appLinks = only
    ? ''
    : `<nav aria-label="${t.allApps}"><h2>${t.ourApps}</h2><ul>${apps.map((a) => `<li><a href="${rel(path, a.paths[lang])}">${esc(a.name)}</a></li>`).join('')}</ul></nav>`;
  const legal = only
    ? `<ul>${legalLinks(only, lang, path)}</ul>`
    : apps.map((a) => `<div class="legal-group"><b>${esc(a.name)}</b><ul>${legalLinks(a, lang, path)}</ul></div>`).join('');
  return `
    <footer class="foot">
      <div class="wrap">
        <div class="foot-grid${only ? ' three' : ''}">
          <div class="about">
            <a class="brand" href="${rel(path, home.paths[lang])}"><img src="${rel(path, 'favicon.svg')}" alt="" width="28" height="28"><span>Tutos App</span></a>
            <p>${esc(only ? t.appBy(only.name) : h.about)}</p>
            <p>${t.noCookies}</p>
          </div>
          ${appLinks}
          <nav aria-label="${only ? `${t.legal}: ${esc(only.name)}` : t.legal}"><h2>${only ? `${t.legal} · ${esc(only.name)}` : t.legal}</h2>${legal}</nav>
          <div><h2>${t.contact}</h2><ul><li><a href="mailto:${EMAIL}">${EMAIL}</a></li><li><p>${COMPANY.city}</p></li></ul></div>
        </div>
        <div class="company">
          <p>© ${YEAR} ${COMPANY.name} · NIT ${COMPANY.nit} · ${COMPANY.city}. ${t.rights}</p>
          <p>${t.brandOf}</p>
        </div>
      </div>
      <p class="wordmark" aria-hidden="true">Tutos App</p>
    </footer>
  </body>
</html>
`;
}

// Stores where the app is live get real badges, the page's main action. Stores still to come
// share one quiet line, so placeholders never compete with what a visitor can do today.
function availability(app, lang, extra = '') {
  const t = ui[lang];
  const stores = [
    { name: 'Google Play', inLine: 'Google Play', icon: icons.play, ...app.stores.play },
    { name: 'App Store', inLine: lang === 'en' ? 'the App Store' : 'App Store', icon: icons.apple, ...app.stores.appStore },
  ];
  const live = stores.filter((s) => s.status === 'live');
  const soon = stores.filter((s) => s.status !== 'live');
  const badges = live.length
    ? `<div class="stores">${live.map((s) => `<a class="store" href="${s.url}">${s.icon}<span><small>${t.getOn}</small><b>${s.name}</b></span></a>`).join('')}</div>`
    : '';
  const names = new Intl.ListFormat(lang, { type: 'conjunction' }).format(soon.map((s) => s.inLine));
  const line = soon.length
    ? `<p class="soon-line"><span class="soon-icons">${soon.map((s) => s.icon).join('')}</span><span>${t.soonOn} ${names}${extra ? ` · ${extra}` : ''}</span></p>`
    : '';
  return badges + line;
}

const hasLiveStore = (app) => Object.values(app.stores).some((s) => s.status === 'live');

const statusChip = (app, lang) => `<span class="status ${app.status}">${ui[lang].status[app.status]}</span>`;

// The page's main action: the store when the app is live somewhere, otherwise the email call to action.
function mainAction(app, lang) {
  const p = app[lang];
  if (p.cta) return { href: p.cta.href, label: p.navCta };
  if (hasLiveStore(app)) return { href: Object.values(app.stores).find((s) => s.status === 'live').url, label: p.navCta };
  return { href: p.notify, label: p.navCta };
}

// A phone frame around real screens from the app. With several screens, they are the panes of a
// demo: one shows at a time and the tabs next to it switch them.
function phone(app, path, screens, { eager = false } = {}) {
  const [w, h] = app.screenSize;
  return `<div class="phone"><div class="screen panes">${screens
    .map(
      (s, i) =>
        `<img src="${rel(path, s.src)}" alt="${esc(s.alt)}" width="${w}" height="${h}"${eager && i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`
    )
    .join('')}</div></div>`;
}

// Radio buttons styled as chips. The selected one shows the matching pane (see .switch in style.css).
function tabs(name, legend, options) {
  return `<fieldset class="tabs"><legend class="sr-only">${esc(legend)}</legend>${options
    .map(
      (o, i) =>
        `<input type="radio" name="${name}" id="${name}-${i + 1}"${i === 0 ? ' checked' : ''}><label for="${name}-${i + 1}">${o.dot ? `<span class="dot ${o.dot}" aria-hidden="true"></span>` : ''}${esc(o.label)}</label>`
    )
    .join('')}</fieldset>`;
}

function stickers(app, lang) {
  return app[lang].floats
    .map(([label, sw], i) => {
      const lead = sw === 'wave' ? wave : `<span class="swatch"${sw ? ` style="--sw: ${sw}"` : ''}></span>`;
      return `<span class="sticker s${i + 1}" aria-hidden="true">${lead}${esc(label)}</span>`;
    })
    .join('');
}

const decor = {
  scan: '<span class="viewfinder" aria-hidden="true"><i></i><i></i><i></i><i></i></span>',
  embers: '<span class="embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>',
  wave: '<span class="rings" aria-hidden="true"><i></i><i></i><i></i><i></i></span>',
};

const screensFor = (app, lang) =>
  app.screens(lang).map((src, i) => ({ src, alt: `${ui[lang].screenshotOf} ${app.name}: ${app[lang].tabs[i][2]}` }));

function heroDemo(app, lang, path) {
  const p = app[lang];
  return `<div class="hero-demo switch">
          <div class="stage">
            ${decor[app.decor] || ''}
            ${phone(app, path, screensFor(app, lang), { eager: true })}
            ${stickers(app, lang)}
          </div>
          ${tabs(`${app.id}-demo`, ui[lang].seeExample, p.tabs.map(([label, dot]) => ({ label, dot })))}
        </div>`;
}

// A scrolling band of keywords under the hero. Decorative: every word is also in the page copy.
function ticker(words) {
  const run = words.map((w) => `<span>${esc(w)}</span>`).join('<i></i>');
  return `<div class="ticker-wrap" aria-hidden="true"><div class="ticker"><div class="ticker-track"><p>${run}<i></i></p><p>${run}<i></i></p></div></div></div>`;
}

function appPage(app, lang) {
  const p = app[lang];
  const t = ui[lang];
  const path = app.paths[lang];
  const otherLang = lang === 'es' ? 'en' : 'es';
  const url = SITE_URL + path;
  const [w, h] = app.shotSize;

  // Live in a store: the badges are the main action and "notify me" for the missing store is a
  // link on the availability line. Not live anywhere yet: the email button is the main action.
  const live = hasLiveStore(app);
  const allLive = Object.values(app.stores).every((s) => s.status === 'live');
  const notifyLink = live && !allLive && p.notify ? `<a class="inline-link" href="${p.notify}">${esc(p.notifyLabel)}</a>` : '';
  const primary = p.cta
    ? `<a class="btn primary" href="${p.cta.href}">${icons.mail}${esc(p.cta.label)}</a>`
    : live
      ? ''
      : `<a class="btn primary" href="${p.notify}">${icons.mail}${esc(p.notifyLabel || t.notify)}</a>`;
  const action = primary ? `<div class="actions">${primary}</div>` : '';
  const offer = live ? availability(app, lang, notifyLink) + action : action + availability(app, lang);
  const fine = [p.cta?.note, p.disclaimer].filter(Boolean).map((n) => `<p>${esc(n)}</p>`);
  if (primary) fine.push(`<p>${t.mailFallback} <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`);
  const share = `<a class="share-link" href="${whatsapp(`${p.share} ${url}`)}">${icons.whatsapp}${t.share}</a>`;

  const sec = t.sections;
  const items = [sec.benefits, sec.how, sec.shots, sec.faq].map(([id, label]) => [`#${id}`, label]);
  const featureShot = [{ src: app.feature(lang), alt: `${t.screenshotOf} ${app.name}: ${p.featureAlt}` }];

  return (
    head({
      lang,
      title: p.title,
      description: p.description,
      path,
      alternates: app.paths,
      og: `${app.id}-${lang}`,
      bg: app.bg,
      fonts: app.fonts,
      ld: {
        '@type': 'MobileApplication',
        name: app.name,
        description: p.description,
        url,
        inLanguage: lang,
        operatingSystem: 'Android, iOS',
        applicationCategory: app.category,
        image: `${SITE_URL}${app.icon}`,
        publisher: organization,
        ...(app.stores.play.status === 'live' ? { installUrl: app.stores.play.url } : {}),
      },
    }) +
    nav({
      lang,
      path,
      theme: `page-app ${app.theme}`,
      items,
      other: { lang: otherLang, path: app.paths[otherLang] },
      cta: mainAction(app, lang),
      app,
    }) +
    `
    <main id="main">
      <section class="app-hero">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <p class="app-mark"><img class="app-icon" src="${rel(path, app.icon)}" alt="" width="56" height="56"><span>${esc(app.name)}</span>${statusChip(app, lang)}</p>
            <p class="for-line">${esc(p.for)}</p>
            <h1>${rich(p.headline)}</h1>
            <p class="lead">${esc(p.lead)}</p>
            ${offer}
            <div class="fine">${fine.join('')}</div>
            ${share}
          </div>
          ${heroDemo(app, lang, path)}
        </div>
      </section>
      ${p.ticker ? ticker(p.ticker) : ''}

      <section class="section wrap" id="${sec.benefits[0]}" aria-labelledby="benefits-h">
        <div class="section-head reveal">
          ${kicker(1, app.name)}
          <h2 id="benefits-h">${t.benefits}</h2>
        </div>
        <ul class="bento">${p.benefits
          .map(([g, b, d], i) =>
            i === 0
              ? `
          <li class="tile feature reveal"><div class="tile-copy"><span class="glyph">${svg(glyphs[g])}</span><h3>${esc(b)}</h3><p>${esc(d)}</p></div><div class="tile-shot">${phone(app, path, featureShot)}</div></li>`
              : `
          <li class="tile reveal"><span class="glyph">${svg(glyphs[g])}</span><h3>${esc(b)}</h3><p>${esc(d)}</p></li>`
          )
          .join('')}
        </ul>
      </section>

      <section class="section wrap" id="${sec.how[0]}" aria-labelledby="how-h">
        <div class="section-head reveal">
          ${kicker(2, t.how)}
          <h2 id="how-h">${esc(p.pitch)}</h2>
        </div>
        <ol class="steps">${p.steps
          .map(
            ([s, d], i) => `
          <li class="step reveal"><span class="step-num" aria-hidden="true">${pad(i + 1)}</span><h3>${esc(s)}</h3><p>${esc(d)}</p></li>`
          )
          .join('')}
        </ol>
      </section>

      <section class="section shots-section" id="${sec.shots[0]}" aria-labelledby="shots-h">
        <div class="wrap section-head reveal">
          ${kicker(3, t.shotsKicker)}
          <h2 id="shots-h">${t.screens}</h2>
          <p class="swipe">${t.swipe} ${icons.arrow}</p>
        </div>
        <ul class="gallery${app.look === 'phone' ? ' framed' : ''}" tabindex="0" aria-labelledby="shots-h">${app
          .shots(lang)
          .map(
            (s, i) => `
          <li><img src="${rel(path, s)}" alt="${t.screenshotOf} ${esc(app.name)}: ${esc(p.shotAlt[i])}" width="${w}" height="${h}" loading="lazy" decoding="async"></li>`
          )
          .join('')}
        </ul>
      </section>

      <section class="section wrap faq-section" id="${sec.faq[0]}" aria-labelledby="faq-h">
        <div class="faq-head reveal">
          ${kicker(4, t.faqKicker)}
          <h2 id="faq-h">${t.faq}</h2>
          <p><a href="${rel(path, legalPath(app, lang, 'privacy'))}">${t.faqPrivacy}</a><br><a href="${rel(path, legalPath(app, lang, 'terms'))}">${t.terms}</a><br><a href="mailto:${EMAIL}">${EMAIL}</a></p>
        </div>
        <div class="faq">${p.faq
          .map(
            ([q, a]) => `
          <details class="reveal"><summary>${esc(q)}<span class="plus" aria-hidden="true">${icons.plus}</span></summary><p>${esc(a)}</p></details>`
          )
          .join('')}
        </div>
      </section>

      <section class="section wrap closing" aria-labelledby="closing-h">
        <div class="cta-band reveal">
          <img class="app-icon" src="${rel(path, app.icon)}" alt="" width="84" height="84" loading="lazy">
          <h2 id="closing-h">${rich(p.closing[0])}</h2>
          <p class="lead">${esc(p.closing[1])}</p>
          ${offer}
        </div>
      </section>
    </main>` +
    footer({ lang, path, only: app })
  );
}

// Plain text of a bit of HTML, for titles, labels and ids.
const plain = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// The text of a legal document: its <h1> title and the rest, exactly as written in legal/.
function legalSource(app, lang, doc) {
  const file = join(LEGAL_DIR, app.id, `${lang}-${doc}.html`);
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^<h1>([\s\S]*?)<\/h1>\n/);
  if (!m) throw new Error(`${relative(process.cwd(), file)} must start with its <h1> title`);
  return { title: m[1], body: raw.slice(m[0].length) };
}

// A legal page: the document's own text, unchanged, in a readable column with a table of
// contents built from its sections and the date it last changed. Only markup changes: each section
// gets an id if it lacks one, a wide table that scrolls sideways becomes a labeled region that the
// keyboard can reach, and phone numbers in links keep their digits on one line.
function legalPage(app, lang, doc) {
  const t = ui[lang];
  const path = legalPath(app, lang, doc);
  const otherLang = lang === 'es' ? 'en' : 'es';
  const url = SITE_URL + path;
  const { title, body: source } = legalSource(app, lang, doc);

  const toc = [];
  const ids = new Set(['main', 'apps-menu', 'toc-h']);
  let section = plain(title);
  const body = source
    .replace(/<h2(?: id="([^"]+)")?>([\s\S]*?)<\/h2>|<div class="tabla">([\s\S]*?)<\/div>/g, (all, id, inner, table) => {
      if (table) return `<section class="tabla" tabindex="0" aria-label="${esc(section)}">${table}</section>`;
      section = plain(inner);
      let key = id || slugify(section);
      for (let n = 2; ids.has(key); n++) key = `${id || slugify(section)}-${n}`;
      ids.add(key);
      toc.push([key, inner]);
      return `<h2 id="${key}">${inner}</h2>`;
    })
    .replace(/href="legal:([a-z0-9-]+)\/([a-z]+)\/([a-z]{2})(#[^"]*)?"/g, (all, id, d, l, frag = '') => {
      const target = apps.find((a) => a.id === id);
      // An unknown target stays as written, and the link check in run() reports it.
      return target?.legal[d] && target.paths[l] ? `href="${rel(path, legalPath(target, l, d))}${frag}"` : all;
    })
    .replace(/(<a href="tel:[^"]+">)([^<]+)<\/a>/g, (all, open, number) => `${open}${number.replace(/ /g, '&nbsp;')}</a>`);

  const date = app.legal[doc];
  const updated = new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`)
  );
  const items = legalDocs(app).map((d) => [rel(path, legalPath(app, lang, d)), t[d], d === doc]);
  const contents =
    toc.length > 1
      ? `
        <nav class="toc" aria-labelledby="toc-h">
          <h2 id="toc-h">${t.toc}</h2>
          <ol>${toc.map(([id, inner]) => `<li><a href="#${id}">${inner}</a></li>`).join('')}</ol>
        </nav>`
      : '';

  return (
    head({
      lang,
      title: `${plain(title)} · Tutos App`,
      description: t.legalAbout[doc](app.name),
      path,
      alternates: legalAlternates(app, doc),
      og: `${app.id}-${lang}`,
      bg: app.light,
      ld: {
        '@type': 'WebPage',
        name: plain(title),
        url,
        inLanguage: lang,
        dateModified: date,
        isPartOf: { '@type': 'WebSite', name: 'Tutos App', url: SITE_URL },
        about: { '@type': 'MobileApplication', name: app.name, url: SITE_URL + app.paths[lang] },
        publisher: organization,
      },
    }) +
    nav({
      lang,
      path,
      theme: `page-app page-legal ${app.theme}`,
      items,
      other: { lang: otherLang, path: legalPath(app, otherLang, doc) },
      cta: mainAction(app, lang),
      app,
      current: 'true',
    }) +
    `
    <main id="main" class="legal">
      <header class="wrap legal-head">
        <p class="kicker"><span class="num">${t.legal}</span><span>${esc(app.name)}</span></p>
        <h1>${title}</h1>
        <p class="legal-updated">${t.updated}: <time datetime="${date}">${updated}</time></p>
      </header>
      <div class="wrap legal-grid${contents ? '' : ' single'}">${contents}
        <article class="legal-body">
${body.trim()}
        </article>
      </div>
    </main>` +
    footer({ lang, path, only: app })
  );
}

// The marquee repeats the app list until each half of the track holds at least 8 tiles, so it
// fills wide screens whether there are 3 apps or 12. The first copy is the accessible one; the
// repeats are hidden from assistive technology and from keyboard focus. The icons stay muted so
// the band never competes with the hero, and take their color on hover or focus.
function marquee(lang, path) {
  const t = ui[lang];
  const copies = Math.max(1, Math.ceil(8 / apps.length));
  const tile = (a, hidden) =>
    `<li${hidden ? ' aria-hidden="true"' : ''}><a class="tile" href="${rel(path, a.paths[lang])}"${hidden ? ' tabindex="-1"' : ''}><img src="${rel(path, a.icon)}" alt="" width="44" height="44"><span><b>${esc(a.name)}</b><span>${esc(a[lang].category)}</span></span></a></li>`;
  // The track holds two identical halves; the animation slides it by one half and starts over.
  const half = (repeat) => Array.from({ length: copies }, (_, c) => apps.map((a) => tile(a, repeat || c > 0))).flat();
  const first = half(false);
  return `<section class="marquee-section" aria-labelledby="marquee-h">
        <h2 id="marquee-h" class="sr-only">${t.ourApps}</h2>
        <input class="pause-toggle" type="checkbox" id="pause-marquee">
        <div class="marquee">
          <ul class="track" style="--n: ${first.length}">
            ${[...first, ...half(true)].join('\n            ')}
          </ul>
        </div>
        <label class="pause-label" for="pause-marquee"><span class="sr-only">${t.pause}</span><span class="when-playing" aria-hidden="true">${icons.pause}</span><span class="when-paused" aria-hidden="true">${icons.playSmall}</span></label>
      </section>`;
}

// The orb is drawn from the Tutos App violet and the apps' own colors, so it changes when an app
// is added.
const BRAND_VIOLET = '#6a45ff';
const orbStyle = () => {
  const colors = [BRAND_VIOLET, ...apps.map((a) => a.color), BRAND_VIOLET];
  return `--orb: conic-gradient(from 90deg, ${colors.join(', ')}); --n: ${apps.length}`;
};

// The home hero's card: one question per app, answered with what that app really shows.
function askDemo(lang, path) {
  const t = ui[lang];
  const list = apps.filter((a) => a[lang].ask);
  const orbit = apps
    .map((a, i) => `<img src="${rel(path, a.icon)}" alt="" width="40" height="40" style="--i: ${i}">`)
    .join('');
  const answers = list
    .map((a) => {
      const x = a[lang].ask;
      return `<div class="answer" style="--app: ${a.color}">
              <p class="bubble"><span class="sr-only">${t.question}: </span>${esc(x.q)}</p>
              <span class="thinking" aria-hidden="true"><i></i><i></i><i></i></span>
              <div class="reply">
                <p class="reply-head"><img src="${rel(path, a.icon)}" alt="" width="28" height="28"><b>${esc(a.name)}</b><span class="tag">${t.example}</span></p>
                <p class="verdict"><span class="dot ${x.tone}" aria-hidden="true"></span>${esc(x.verdict)}</p>
                <p class="reply-note">${esc(x.note)}</p>
                <a class="reply-link" href="${rel(path, a.paths[lang])}">${t.see} ${esc(a.name)} ${icons.arrow}</a>
              </div>
            </div>`;
    })
    .join('\n            ');
  return `<div class="ask-card switch">
          <div class="ask-top">
            <div class="orb-wrap" aria-hidden="true" style="${orbStyle()}"><span class="orb"></span><span class="orbit">${orbit}</span></div>
            <div class="ask-title">
              <p>${t.askTitle}</p>
              <p class="mono">${t.askNote}</p>
            </div>
          </div>
          ${tabs('ask', t.askLegend, list.map((a) => ({ label: a[lang].ask.chip })))}
          <div class="panes answers">
            ${answers}
          </div>
        </div>`;
}

function appCard(app, lang, path, i) {
  const p = app[lang];
  const t = ui[lang];
  const shot = [{ src: app.screens(lang)[0], alt: `${t.screenshotOf} ${app.name}: ${p.tabs[0][2]}` }];
  return `
          <article class="app-card ${app.theme}" style="--i: ${i}" aria-labelledby="card-${app.id}">
            <div class="card-copy">
              <p class="app-mark"><img class="app-icon" src="${rel(path, app.icon)}" alt="" width="52" height="52" loading="lazy"><span>${esc(app.name)}</span>${statusChip(app, lang)}</p>
              <p class="card-cat">${esc(p.category)}</p>
              <h3 id="card-${app.id}">${esc(p.pitch)}</h3>
              <p class="for">${esc(p.for)}</p>
              <ul class="ticks">${p.highlights.map((x) => `<li>${icons.check}<span>${esc(x)}</span></li>`).join('')}</ul>
              ${availability(app, lang)}
              <a class="more" href="${rel(path, app.paths[lang])}">${t.see} ${esc(app.name)} ${icons.arrow}</a>
            </div>
            <div class="card-visual">
              ${decor[app.decor] || ''}
              ${phone(app, path, shot)}
              ${stickers(app, lang)}
            </div>
          </article>`;
}

function principleVisual(g, v) {
  if (!v) return '';
  if (g === 'eye')
    return `<div class="mini why" aria-hidden="true"><p class="mini-label">${esc(v.label)}</p><p class="mini-title">${esc(v.title)}</p>${v.rows
      .map(
        ([label, n, max]) =>
          `<p class="row"><span>${esc(label)}</span><b>${n} ${v.of} ${max}</b><i style="--v: ${n / max}"></i></p>`
      )
      .join('')}</div>`;
  if (g === 'shield')
    return `<div class="mini flag" aria-hidden="true"><p class="mini-label">${esc(v.label)}</p><p class="quote">${esc(v.quote)}</p></div>`;
  if (g === 'lock')
    return `<div class="mini steps-mini" aria-hidden="true">${v.yes.map((x) => `<span class="yes">${icons.check}${esc(x)}</span>`).join('')}<span class="no">${esc(v.no)}</span></div>`;
  if (g === 'pin')
    return `<div class="mini place" aria-hidden="true"><p class="coords">${esc(v.coords)}</p><p class="mini-title">${esc(v.place)}</p><p>${v.langs.map((x) => `<span>${esc(x)}</span>`).join('')}</p></div>`;
  return '';
}

function homePage(lang) {
  const t = ui[lang];
  const h = home[lang];
  const path = home.paths[lang];
  const otherLang = lang === 'es' ? 'en' : 'es';
  const contactId = lang === 'es' ? 'contacto' : 'contact';
  return (
    head({
      lang,
      title: h.title,
      description: h.description,
      path,
      alternates: home.paths,
      og: `home-${lang}`,
      bg: home.bg,
      ld: { ...organization, description: h.description },
    }) +
    nav({
      lang,
      path,
      theme: 't-home',
      items: h.nav,
      other: { lang: otherLang, path: home.paths[otherLang] },
      cta: { href: `mailto:${EMAIL}`, label: h.write },
    }) +
    `
    <main id="main">
      <section class="home-hero">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <p class="eyebrow"><span class="pulse" aria-hidden="true"></span>${esc(h.eyebrow)}</p>
            <h1>${rich(h.headline)}</h1>
            <p class="lead">${esc(h.lead)}</p>
            <div class="actions">
              <a class="btn primary" href="#apps">${esc(h.primary)} ${icons.arrow}</a>
              <a class="btn ghost" href="mailto:${EMAIL}">${icons.mail}${esc(h.write)}</a>
            </div>
          </div>
          ${askDemo(lang, path)}
        </div>
      </section>

      ${marquee(lang, path)}

      <section class="section wrap" id="apps" aria-labelledby="apps-h">
        <div class="section-head reveal">
          ${kicker(1, h.appsEyebrow)}
          <h2 id="apps-h">${rich(h.appsTitle)}</h2>
          <p class="lead">${esc(h.appsLead)}</p>
        </div>
        <div class="app-stack">${apps.map((a, i) => appCard(a, lang, path, i)).join('')}
        </div>
      </section>

      <section class="section wrap" id="${h.principlesId}" aria-labelledby="principles-h">
        <div class="section-head reveal">
          ${kicker(2, h.principlesEyebrow)}
          <h2 id="principles-h">${rich(h.principlesTitle)}</h2>
        </div>
        <ul class="bento principles">${h.principles
          .map(
            ([g, b, d]) => `
          <li class="tile p-${g} reveal"><div class="tile-copy"><span class="glyph">${svg(glyphs[g])}</span><h3>${esc(b)}</h3><p>${esc(d)}</p></div>${principleVisual(g, h.visuals?.[g])}</li>`
          )
          .join('')}
        </ul>
      </section>

      <section class="section wrap contact" id="${contactId}" aria-labelledby="contact-h">
        <div class="contact-panel reveal">
          <div class="orb-wrap" aria-hidden="true" style="${orbStyle()}"><span class="orb"></span></div>
          ${kicker(3, h.contactEyebrow)}
          <h2 id="contact-h">${rich(h.nextTitle)}</h2>
          <p class="lead">${esc(h.nextLead)}</p>
          <div class="actions">
            <a class="btn primary" href="mailto:${EMAIL}">${icons.mail}${esc(h.write)}</a>
            <a class="btn ghost" href="${whatsapp(`${h.share} ${SITE_URL + path}`)}">${icons.whatsapp}${t.share}</a>
          </div>
          <p class="big-mail"><a href="mailto:${EMAIL}">${EMAIL}</a><span>${COMPANY.city}</span></p>
        </div>
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
    <meta name="color-scheme" content="light">
    <link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}${CSS_PATH}?v=${CSS_VERSION}">
  </head>
  <body class="t-home">
    <header class="nav"><div class="nav-bar"><a class="brand" href="${base}"><img src="${base}favicon.svg" alt="" width="28" height="28"><span>Tutos App</span></a><a class="lang" href="${base}en/" hreflang="en" lang="en">English</a></div></header>
    <main id="main" class="notfound">
      <div class="orb-wrap" aria-hidden="true" style="${orbStyle()}"><span class="orb"></span></div>
      <h1>404</h1>
      <p class="lead">${t.notFound} <span lang="en">${ui.en.notFound}</span></p>
      <div class="actions"><a class="btn primary" href="${base}">${t.backHome}</a><a class="btn ghost" href="${base}en/" lang="en">${ui.en.backHome}</a></div>
    </main>
  </body>
</html>
`;
}

const files = {};
for (const lang of langs) files[home.paths[lang] + 'index.html'] = homePage(lang);
for (const app of apps) for (const lang of langs) files[app.paths[lang] + 'index.html'] = appPage(app, lang);
for (const app of apps) {
  for (const doc of legalDocs(app)) for (const lang of langs) files[legalPath(app, lang, doc) + 'index.html'] = legalPage(app, lang, doc);
}
files['404.html'] = notFoundPage();
// GitHub ignores CNAME when publishing with Actions (the domain lives in the repo settings),
// but it keeps the domain on record and works if the site is ever published from a branch.
files['CNAME'] = `${DOMAIN}\n`;
const allPaths = [home.paths, ...apps.map((a) => a.paths), ...apps.flatMap((a) => legalDocs(a).map((doc) => legalAlternates(a, doc)))];
files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPaths
  .flatMap((paths) =>
    Object.values(paths).map(
      (p) => `  <url>
    <loc>${SITE_URL + p}</loc>
${Object.entries(paths)
  .map(([l, q]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL + q}"/>`)
  .join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL + Object.values(paths)[0]}"/>
  </url>`
    )
  )
  .join('\n')}
</urlset>
`;
files['robots.txt'] = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`;

// Writes (or, with --check, verifies) the files. Runs only when this file is the script being
// run, so scripts/og.mjs can import the app data without writing anything.
function run() {
  const check = process.argv.includes('--check');
  const problems = [];

  // Every app needs its own privacy policy and terms (its text in legal/, in every language, which
  // the build reads), the date each legal document last changed, and every piece of copy.
  for (const app of apps) {
    for (const doc of ['privacy', 'terms']) if (!app.legal?.[doc]) problems.push(`${app.id}: missing legal.${doc}`);
    for (const doc of legalDocs(app)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(app.legal[doc])) problems.push(`${app.id}: legal.${doc} must be a YYYY-MM-DD date`);
    }
    for (const lang of langs) {
      for (const k of ['category', 'for', 'title', 'description', 'headline', 'lead', 'pitch', 'share', 'navCta', 'featureAlt']) {
        if (!app[lang]?.[k]) problems.push(`${app.id}: missing ${lang} ${k}`);
      }
      if (app[lang]?.shotAlt?.length !== app.shots(lang).length) problems.push(`${app.id}: ${lang} shotAlt must describe every screenshot`);
      if (app[lang]?.tabs?.length !== app.screens(lang).length) problems.push(`${app.id}: ${lang} tabs must describe every hero screen`);
      if (app.screens(lang).length > MAX_PANES) problems.push(`${app.id}: at most ${MAX_PANES} hero screens`);
    }
  }
  for (const lang of langs) {
    if (apps.filter((a) => a[lang].ask).length > MAX_PANES) problems.push(`home: at most ${MAX_PANES} apps in the question card`);
  }

  for (const [name, body] of Object.entries(files)) {
    if (/@gmail\.com/i.test(body)) problems.push(`${name}: contains a Gmail address; use ${EMAIL}`);
  }

  // Nothing published may point at GitHub Pages: the legal pages live on this domain now. Checks
  // every page this script writes and every other text file in site/.
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
  const published = new Set([...Object.keys(files), ...walk(ROOT).map((f) => relative(ROOT, f).split('\\').join('/'))]);
  for (const name of published) {
    if (!/\.(html|xml|txt|css|js|json|svg|webmanifest)$|^CNAME$/.test(name)) continue;
    const body = files[name] ?? readFileSync(join(ROOT, name), 'utf8');
    if (/github\.io/i.test(body)) problems.push(`${name}: links to github.io; publish it on ${SITE_URL} instead`);
  }

  // Templates leave indentation behind where an optional block is empty; drop it.
  for (const name of Object.keys(files)) files[name] = files[name].replace(/[ \t]+$/gm, '');

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
  // Every relative href and src in the pages must point at a file in site/, and every in-page
  // anchor must point at an id on that page.
  for (const [name, body] of Object.entries(files)) {
    if (!name.endsWith('.html')) continue;
    for (const [, ref] of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:)/.test(ref)) continue;
      if (ref.startsWith('#')) {
        if (!body.includes(`id="${ref.slice(1)}"`)) problems.push(`${name} -> ${ref} (no such id)`);
        continue;
      }
      const file = ref.split(/[?#]/)[0];
      const target = join(ROOT, dirname(name), file.endsWith('/') ? file + 'index.html' : file);
      if (!existsSync(target)) problems.push(`${name} -> ${ref}`);
    }
  }
  if (problems.length) {
    console.error(`Problems:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  if (check && stale.length) {
    console.error(`Out of date, run node scripts/build.mjs: ${stale.join(', ')}`);
    process.exit(1);
  }
  console.log(check ? `${Object.keys(files).length} files up to date` : `Wrote ${Object.keys(files).length} files to site/`);
}

// Every legal page, for the tests: its path, language, app and document.
const legalPages = apps.flatMap((app) => legalDocs(app).flatMap((doc) => langs.map((lang) => ({ path: legalPath(app, lang, doc), lang, app, doc }))));

export { apps, home, legalPages, COMPANY, DOMAIN, SITE_URL };

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
