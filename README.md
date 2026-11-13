# tutosapp-web

Sitio de Tutos App (TUTOS APP S.A.S.): el inicio de la empresa, que vende el estudio a quien quiere que le hagamos una app, la página de servicios ("Hacemos tu app"), la política de privacidad de la empresa y una página para cada app (Ojito, Resume Roast y Roast Interview), en español y en inglés.

Se publica en **https://tutosapp.co** con GitHub Pages, cada vez que algo entra a `main`. Es HTML y CSS, sin analítica y sin cookies. El único JavaScript es el chat "Cuéntanos tu idea" (`site/assets/brief.js`), y sin él el formulario sigue funcionando por correo.

## Páginas

| Página | Idioma principal | Otro idioma |
|---|---|---|
| Inicio | `/` español | `/en/` |
| Hacemos tu app (servicios) | `/servicios/` español | `/en/services/` |
| Política de privacidad de la empresa | `/privacidad/` español | `/en/privacy/` |
| Ojito | `/ojito/` español | `/ojito/en/` |
| Resume Roast | `/resume-roast/` inglés | `/resume-roast/es/` |
| Roast Interview | `/roast-interview/` inglés | `/roast-interview/es/` |
| Páginas legales de cada app | dentro de la carpeta de la app, en cada idioma | ver [Páginas legales](#páginas-legales) |

El inicio está pensado para conseguir clientes: empresas, pymes y fundadores en Colombia y Latinoamérica, y empresas de Estados Unidos que buscan un equipo nearshore, que quieren una app nueva, nuevas funciones o IA para un producto que ya tienen, o acompañamiento mes a mes. Nuestras apps son la prueba. De arriba a abajo:

- **Titular y acciones.** "Hacemos tu app con IA, de la idea a las tiendas", con dos botones: "Cuéntanos tu idea", que lleva al chat, y "Ver nuestro trabajo".
- **Datos verificables.** Salen de la lista de apps: cuántas apps propias hay, cuántas están ya en tiendas, que respondemos en 2 días hábiles y que firmamos un NDA si lo piden.
- **Al lado del titular,** las pantallas reales de tres apps.
- **La fila de íconos** de las apps.
- **01 Nuestro trabajo:** una tarjeta por app con el problema, lo que construimos, la IA que usa, las plataformas, dos pantallas y el enlace a su página.
- **02 Qué hacemos:** las formas de trabajar, sin precios, y el enlace a la página de servicios.
- **03 Cómo trabajamos:** las seis etapas, y quién hace cada una, IA o personas.
- **04 Para quién.**
- **05 Contacto:** el chat, qué pasa después de escribirnos, la promesa de confidencialidad, WhatsApp y correo.

No hay logos de clientes, testimonios ni cifras que no podamos probar: solo lo que es verdad (TUTOS APP S.A.S., Medellín, las apps y su estado en tiendas, IA con revisión humana, NDA).

La página de servicios (`/servicios/`, `/en/services/`) cuenta lo mismo en detalle. Tiene el titular con su tarjeta del proceso, Nuestro trabajo, qué construimos (cada cosa con la app donde ya la usamos), el proceso, las formas de trabajar, las preguntas frecuentes (tiempos, propiedad del código, publicación en tiendas, privacidad y Ley 1581, idiomas, empresas de Estados Unidos, qué hace la IA y qué hacen las personas) y el contacto con el chat. El menú del inicio la enlaza ("Hacemos tu app"), y también el pie de las páginas de la empresa.

Cada app tiene su propia página, con su color, su tipografía y su estilo, y se sostiene sola: el menú lleva el ícono y el nombre de la app y sus propias secciones, y solo un logo pequeño de Tutos App con una flechita abre la lista de apps. Ojito es clara y amable (acentos en serif y un lector de código de barras), Resume Roast es oscura y contundente (letra condensada en mayúsculas, chispas y una franja de palabras que se mueve) y Roast Interview es oscura y segura (azul eléctrico y ondas de voz). Arriba están la propuesta de valor, los botones de tienda (o "Próximamente") y un teléfono con pantallas reales de la app que se cambian con botones. Siguen lo que hace por ti, cómo funciona, capturas, preguntas frecuentes, un cierre y un pie con los enlaces a **su** política de privacidad, **sus** términos y su soporte, que también están en este sitio (ver [Páginas legales](#páginas-legales)).

Para ir de una app a otra, en el menú de todas las páginas (el inicio y cada app) está el logo de Tutos App con una flechita. Al tocarlo se abre una lista pequeña con cada app (ícono, nombre y una línea), la app en la que estás marcada con su color, y abajo el inicio de Tutos App. Cerrada, en el menú no aparecen los nombres de las otras apps. Es un `popover` del navegador, sin JavaScript: se cierra con Esc o tocando afuera, se recorre con Tab y el lector de pantalla sabe si está abierta. En los navegadores que no tienen `popover` (por ejemplo Safari antes de iOS 17), el logo y la lista no se muestran, para que no aparezcan los nombres ni quede un botón que no hace nada; el resto del menú sigue igual.

Los botones que cambian la pantalla del teléfono de cada app son radios con CSS, sin JavaScript. Las animaciones (el orbe, las etiquetas que flotan, las apariciones al bajar) se apagan si el teléfono pide reducir el movimiento.

El sitio es claro, con paneles oscuros, y no cambia con el modo oscuro del teléfono. Todas las páginas tienen título, descripción, imagen para redes (Open Graph), datos estructurados (JSON-LD) y el pie con TUTOS APP S.A.S., NIT 902.125.524-7, Medellín. También están `sitemap.xml`, `robots.txt`, `404.html`, `CNAME` y los íconos.

## El chat "Cuéntanos tu idea"

Está en el contacto del inicio y de la página de servicios. Hace una pregunta a la vez y muestra las respuestas como en un chat: nombre, correo o WhatsApp, empresa (opcional), la idea, el tipo de proyecto, cuándo empezar, el presupuesto en dólares, si quiere un NDA y la autorización, que enlaza a la política de privacidad de la empresa. Al final envía las respuestas a la función `contacto-tutosapp` del backend y muestra "Te escribimos en menos de 2 días hábiles". Si la función responde 400 o 429 o si no hay red, ofrece el mismo mensaje ya escrito por correo a hola@tutosapp.co y por WhatsApp (+57 350 495 8312). Sin JavaScript es un formulario con todas las preguntas que abre el correo con las respuestas.

La dirección de la función es `CONTACT_ENDPOINT` en `scripts/build.mjs` (`https://teyhhauvvqxmwgzxpcey.supabase.co/functions/v1/contacto-tutosapp`); el build la pone en el formulario (`data-endpoint`). El contrato, que el backend también cumple:

- `POST` con JSON, sin JWT. CORS permite `https://tutosapp.co` y `http://localhost`.
- Cuerpo:
  - `nombre`: 1 a 120 caracteres.
  - `contacto`: correo o teléfono, de 3 a 160 caracteres.
  - `empresa`: de 0 a 160 caracteres.
  - `idea`: de 20 a 4000 caracteres.
  - `tipo`: `app_movil`, `app_con_ia`, `web`, `sumar_ia`, `feature` u `otro`.
  - `plazo`: `ya`, `1_3_meses`, `3_6_meses` o `explorando`.
  - `presupuesto`, en dólares: `no_se`, `menos_5k`, `5k_15k`, `15k_50k` o `mas_50k`.
  - `idioma`: `es` o `en`.
  - `nda`: booleano.
  - `consentimiento`: siempre `true`.
  - `sitio`: campo trampa para bots, siempre vacío.
- Respuestas:
  - 200 `{"ok":true}`, también, en silencio, cuando un bot llena `sitio`.
  - 400 `{"ok":false,"error":"datos"}`.
  - 429 si llegan más de 5 por IP en una hora.

Las preguntas y sus opciones están en `services.<idioma>.chat` de `scripts/build.mjs`; los valores de las opciones son los del contrato. `tests/brief.spec.mjs` simula la función y revisa el JSON exacto, el agradecimiento, los casos 400, 429 y sin red, y el formulario sin JavaScript.

## Nuestro trabajo: apps propias y proyectos de clientes

Las tarjetas de "Nuestro trabajo" salen de `workItems()` en `scripts/build.mjs`. Primero van las apps de la lista `apps`, cada una con su `work` en cada idioma (`shows`, `problem`, `built` y `ai`), y después los proyectos de clientes de la lista `projects`, que hoy está vacía; un comentario en el código muestra cómo es una entrada. Cada tarjeta dice si es "Producto propio" o "Proyecto para cliente". Un proyecto de cliente se publica solo con su permiso.

## Cómo cambiar algo

Todo sale de `scripts/build.mjs`: los textos, los enlaces, el estado de las tiendas y los enlaces legales. Las páginas de `site/` no se editan a mano. El diseño está en `site/assets/style.css`.

```sh
node scripts/build.mjs          # vuelve a escribir las páginas en site/
node scripts/build.mjs --check  # falla si site/ no está al día, si hay un enlace roto,
                                # si una app no tiene su privacidad y sus términos
                                # o si alguna página enlaza a github.io
```

Después se hace commit de `scripts/build.mjs` y de `site/` juntos. El flujo `.github/workflows/pages.yml` corre `--check` en cada PR y publica `site/` cuando entra a `main`.

Las páginas cargan `style.css` con un hash de su contenido en la dirección (`style.css?v=…`). Así un navegador que todavía tenga guardada una versión vieja de la hoja de estilos no la mezcla con páginas nuevas (eso dejó el sitio publicado sin estilos por un rato). Por eso, después de cambiar `style.css` también hay que correr `node scripts/build.mjs`; `--check` falla si no. Lo mismo vale para `brief.js`, que se carga como `brief.js?v=…`.

Para verlo en el computador:

```sh
node scripts/serve.mjs   # y abrir http://127.0.0.1:4173
```

## Calidad

Las herramientas son solo para revisar; el sitio publicado sigue sin dependencias. Se instalan con `npm ci` y `npx playwright install webkit` (necesita Node 24 y Google Chrome) y corren en cada PR en el trabajo `quality` de `.github/workflows/pages.yml`. Si falla, no se publica.

| Comando | Qué revisa |
|---|---|
| `npm run lint` | HTML válido ([html-validate](https://html-validate.org)) y CSS ([stylelint](https://stylelint.io) con `stylelint-config-standard`) |
| `npm run test:ui` | Con [Playwright](https://playwright.dev) abre cada página del sitemap en un teléfono y en un computador, con el sistema en tema claro y oscuro: cero problemas de accesibilidad de [axe-core](https://github.com/dequelabs/axe-core) (WCAG 2.2 A y AA y buenas prácticas), sin scroll de lado, sin imágenes rotas, sin errores en consola, un solo `h1`, canonical y `og:url` en `https://tutosapp.co`. Revisa que Chrome lea completa la hoja de estilos (cuenta sus reglas y falla si lee bastante menos de las que tiene el archivo) y que cada página la cargue con el hash de su contenido; que la fila de íconos tenga un enlace con nombre por app, se pueda pausar y quede quieta con "reducir movimiento"; y que los botones del teléfono de cada app cambien lo que se ve. Revisa el chat "Cuéntanos tu idea" con la función simulada: el JSON exacto del contrato, el agradecimiento, el correo y WhatsApp de respaldo ante un 400, un 429 o sin red, la validación de cada respuesta, que no envía nada sin autorización y el formulario sin JavaScript. En cada página revisa la lista de apps del menú: cerrada no muestra nombres; abierta tiene todas las apps y el inicio, marca la página actual, cabe en la pantalla, se cierra tocando afuera o con Esc, se maneja con el teclado y lleva a cada app (también en el iPhone). Deja capturas de página completa en `test-results/screens/`. En cada página legal revisa que tenga su título y su fecha, que la tabla de contenido lleve a cada sección, que el cambio de idioma lleve al mismo documento en el otro idioma, que el pie enlace los documentos de la app y que ningún enlace vaya a `github.io`; y que cada app enlace su privacidad y sus términos en este sitio. En un iPhone (WebKit, el motor de Safari) y en un Android (Chrome), revisa que cada página muestre su título y su botón principal en la primera pantalla, sin hacer scroll |
| `npm run lighthouse` | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) en el inicio, la página de servicios y las páginas de las apps, en los dos idiomas, y en cuatro páginas legales (una por app y la de la empresa): accesibilidad y SEO en 100, buenas prácticas en 95 o más, y aviso si el rendimiento baja de 90. Los informes quedan en `.lighthouseci/` |
| `npm run quality` | Todo lo anterior, más `node scripts/build.mjs --check` |

En GitHub, los informes y las capturas quedan como artefacto `quality-reports` de cada ejecución.

Las herramientas automáticas encuentran solo una parte de los problemas de accesibilidad. Antes de un cambio grande conviene probar con el teclado y con el lector de pantalla del teléfono.

### Agregar una app

Se agrega una entrada a la lista `apps` de `scripts/build.mjs` (copiando una de las que hay) y sus imágenes en `site/assets/img/<id>/`: ícono de 256 × 256, cuatro capturas de tienda por idioma, las pantallas reales para el teléfono (`screens/`, WebP de 600 px de ancho, sin marco: el marco lo pone el CSS) y dos imágenes para redes de 1200 × 630 (`site/assets/img/og/<id>-es.jpg` y `-en.jpg`). En cada idioma lleva `tabs` (nombre, color y descripción de cada pantalla del teléfono), `featureAlt`, `navCta` y `work` (su caso en "Nuestro trabajo": qué demuestra, el problema, lo que construimos y la IA que usa). Con eso aparece sola en el orbe, en la fila de íconos, en la lista de apps del menú, en "Nuestro trabajo" del inicio y de servicios, en el pie, en el sitemap y con su propia página. `--check` exige que tenga enlace a su política de privacidad y a sus términos en los dos idiomas, una descripción por cada pantalla y su `work`. El teléfono de cada app maneja hasta 8 pantallas.

Después se corre `npm run og`, que vuelve a dibujar las imágenes para redes del inicio y de servicios (`home-*.jpg` y `services-*.jpg`) con su titular y un ícono por app. También se corre si cambia uno de esos titulares.

Si la app trae un estilo nuevo, se le pone un `theme` (por ejemplo `t-nueva`) y se definen sus colores en `style.css`, como `.t-ojito`. Si usa otra fuente, se agrega en `site/assets/fonts/` y en `fonts` de la app, para que su página la precargue.

### Cuando una app salga en una tienda

Se cambia su `status` a `'live'` y el de la tienda (`stores.play` o `stores.appStore`) a `'live'` con su `url`. El botón pasa de "Próximamente" a enlace. Hoy:

| App | Google Play | App Store |
|---|---|---|
| Ojito | Próximamente (en prueba cerrada; "Probarla en Android" pide entrar por correo) | Enlace a `id6832288734` |
| Resume Roast | Enlace a `com.resumeroast.app` | Próximamente |
| Roast Interview | Próximamente | Próximamente |

## Páginas legales

**Este repositorio es la única fuente de los textos legales** de las apps: la política de privacidad, los términos y el soporte de cada una se publican aquí, en `tutosapp.co`, y en ningún otro lugar. Los repositorios viejos en GitHub Pages (`ojito-legal`, `daily-quest-privacy-policy`, `castores-legal` y `resumeroast-support`) ya no son la fuente: si un texto cambia, se cambia aquí.

La política de privacidad de la empresa (`/privacidad/`, `/en/privacy/`), para lo que llega por el chat, el correo o WhatsApp, está en `legal/tutosapp/<idioma>-privacy.html` y usa el mismo diseño. Su fecha es `companyPrivacy.date` en `scripts/build.mjs`.

| App | Español | Inglés |
|---|---|---|
| Ojito | `/ojito/privacidad/`, `/ojito/terminos/`, `/ojito/soporte/` | `/ojito/en/privacy/`, `/ojito/en/terms/`, `/ojito/en/support/` |
| Resume Roast | `/resume-roast/es/privacidad/`, `/resume-roast/es/terminos/`, `/resume-roast/es/soporte/` | `/resume-roast/privacy/`, `/resume-roast/terms/`, `/resume-roast/support/` |
| Roast Interview | `/roast-interview/es/privacidad/`, `/roast-interview/es/terminos/` | `/roast-interview/privacy/`, `/roast-interview/terms/` |

Cada página va dentro de la carpeta de su app y su idioma (la misma regla de las páginas de las apps), con la dirección en el idioma de la página.

El texto de cada documento está en `legal/<app>/<idioma>-<documento>.html` (por ejemplo `legal/ojito/es-privacy.html`): empieza con su `<h1>` y sigue con el documento tal como se publica, con su versión y su fecha de vigencia. `scripts/build.mjs` lo pone en el diseño del sitio: una columna fácil de leer, una tabla de contenido hecha con sus secciones (`h2`) y la fecha de la última actualización. No cambia el texto: solo le pone un `id` a cada sección que no lo tenga, deja que el teclado llegue a una tabla ancha que se mueve de lado y mantiene los teléfonos en una sola línea. Los enlaces entre documentos se escriben `legal:<app>/<documento>/<idioma>` (con `#id` si hace falta) y el build los cambia por la dirección relativa. Donde un texto dice en qué tiendas está la app se escribe `{{stores}}`: el build pone la frase según `stores` de la app (por ejemplo "Disponible para Android en Google Play y próximamente para iPhone en el App Store."), así coincide con la página de la app y cambia sola cuando una tienda sale.

Para cambiar un texto legal:

1. Se edita su archivo en `legal/`, en los dos idiomas si el cambio aplica a los dos.
2. Se cambia la fecha de ese documento en `legal` de la app en `scripts/build.mjs` (`YYYY-MM-DD`); es la "Última actualización" que muestra la página.
3. Se corre `node scripts/build.mjs` y se hace commit de `legal/`, `scripts/build.mjs` y `site/` juntos.

Una app nueva necesita al menos `privacy` y `terms` (`--check` falla si no); `support` es opcional. Ninguna página del sitio puede enlazar a `github.io`: `--check` revisa todas las páginas y archivos de `site/` y falla si aparece una.

## Dominio

`tutosapp.co` está comprado en GoDaddy y configurado así:

- **GoDaddy (DNS):** registro `A` de `@` a `185.199.108.153` y `CNAME` de `www` a `msalcedo23.github.io`. GitHub recomienda agregar también los `A` a `185.199.109.153`, `185.199.110.153` y `185.199.111.153` para que el sitio no dependa de una sola dirección.
- **GitHub, Settings → Pages:** dominio personalizado `tutosapp.co` y "Enforce HTTPS" activado (el certificado de Let's Encrypt ya está emitido). Con publicación por GitHub Actions el dominio se guarda en GitHub, no en el archivo `CNAME`; el `CNAME` de `site/` queda como referencia.
- **Redirecciones:** GitHub manda `www.tutosapp.co`, `http://` y las direcciones viejas `https://msalcedo23.github.io/tutosapp-web/...` a la misma página en `https://tutosapp.co/...`, así que los enlaces que ya se compartieron siguen funcionando.

Para cambiar de dominio: se cambia `DOMAIN` en `scripts/build.mjs`, se corre `node scripts/build.mjs` y se cambia el dominio en Settings → Pages (o `gh api -X PUT repos/msalcedo23/tutosapp-web/pages -f cname=<dominio>`).

## Imágenes y fuentes

Las capturas de tienda salen de los repos de cada app (`docs/tienda/capturas` de Ojito, `docs/store/graphics/play/screenshots` de Resume Roast, `docs/screenshots` de Roast Interview iOS), reducidas a 960 px de alto. Las pantallas del teléfono son pantallas reales sin marco: `tools/capturas/pantallas` (y `pantallas/en`) de Ojito, `docs/store/source/raw/<idioma>` de Resume Roast Android y `docs/screenshots` de Roast Interview iOS, pasadas a WebP de 600 px de ancho (552 px las de iOS).

Las fuentes son Geist, Geist Mono (las etiquetas numeradas), Instrument Serif itálica (Ojito) y Anton (los titulares de Resume Roast), con licencia SIL Open Font License (`site/assets/fonts/OFL-*.txt`). Se sirven desde el mismo sitio, solo con los caracteres latinos.
