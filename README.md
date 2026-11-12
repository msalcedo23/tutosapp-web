# tutosapp-web

Sitio de Tutos App (TUTOS APP S.A.S.): el inicio de la empresa y una página para cada app (Ojito, Resume Roast y Roast Interview), en español y en inglés.

Se publica en **https://tutosapp.co** con GitHub Pages, cada vez que algo entra a `main`. Es HTML y CSS, sin JavaScript, sin analítica y sin cookies.

## Páginas

| Página | Idioma principal | Otro idioma |
|---|---|---|
| Inicio | `/` español | `/en/` |
| Ojito | `/ojito/` español | `/ojito/en/` |
| Resume Roast | `/resume-roast/` inglés | `/resume-roast/es/` |
| Roast Interview | `/roast-interview/` inglés | `/roast-interview/es/` |
| Páginas legales de cada app | dentro de la carpeta de la app, en cada idioma | ver [Páginas legales](#páginas-legales) |

El inicio presenta a Tutos App como estudio de apps: un titular con la misión y, al lado, una tarjeta oscura con un orbe hecho con los colores de las apps, donde cada app responde una pregunta real con lo que de verdad muestra (se elige la pregunta tocando un botón). Debajo, una fila de íconos que se mueve sola, en gris hasta pasar el mouse o el foco para no competir con el titular (se puede pausar, se queda quieta si el teléfono pide reducir el movimiento y, con el teclado, se vuelve una fila quieta para que el ícono enfocado siempre se vea). Luego una tarjeta grande por app, que se apilan al bajar en pantallas grandes, con su pantalla real en un teléfono y su estado en tiendas; cómo trabajamos en una cuadrícula con ejemplos de las apps; y contacto. Las secciones van numeradas (01, 02, 03).

Cada app tiene su propia página, con su color, su tipografía y su estilo, y se sostiene sola: el menú lleva el ícono y el nombre de la app y sus propias secciones, y solo un logo pequeño de Tutos App con una flechita abre la lista de apps. Ojito es clara y amable (acentos en serif y un lector de código de barras), Resume Roast es oscura y contundente (letra condensada en mayúsculas, chispas y una franja de palabras que se mueve) y Roast Interview es oscura y segura (azul eléctrico y ondas de voz). Arriba están la propuesta de valor, los botones de tienda (o "Próximamente") y un teléfono con pantallas reales de la app que se cambian con botones. Siguen lo que hace por ti, cómo funciona, capturas, preguntas frecuentes, un cierre y un pie con los enlaces a **su** política de privacidad, **sus** términos y su soporte, que también están en este sitio (ver [Páginas legales](#páginas-legales)).

Para ir de una app a otra, en el menú de todas las páginas (el inicio y cada app) está el logo de Tutos App con una flechita. Al tocarlo se abre una lista pequeña con cada app (ícono, nombre y una línea), la app en la que estás marcada con su color, y abajo el inicio de Tutos App. Cerrada, en el menú no aparecen los nombres de las otras apps. Es un `popover` del navegador, sin JavaScript: se cierra con Esc o tocando afuera, se recorre con Tab y el lector de pantalla sabe si está abierta. En los navegadores que no tienen `popover` (por ejemplo Safari antes de iOS 17), el logo y la lista no se muestran, para que no aparezcan los nombres ni quede un botón que no hace nada; el resto del menú sigue igual.

Los botones que cambian la respuesta o la pantalla son radios con CSS, sin JavaScript. Las animaciones (el orbe, las etiquetas que flotan, las apariciones al bajar) se apagan si el teléfono pide reducir el movimiento.

El sitio es claro, con paneles oscuros, y no cambia con el modo oscuro del teléfono. Todas las páginas tienen título, descripción, imagen para redes (Open Graph), datos estructurados (JSON-LD) y el pie con TUTOS APP S.A.S., NIT 902.125.524-7, Medellín. También están `sitemap.xml`, `robots.txt`, `404.html`, `CNAME` y los íconos.

## Cómo cambiar algo

Todo sale de `scripts/build.mjs`: los textos, los enlaces, el estado de las tiendas y los enlaces legales. Las páginas de `site/` no se editan a mano. El diseño está en `site/assets/style.css`.

```sh
node scripts/build.mjs          # vuelve a escribir las páginas en site/
node scripts/build.mjs --check  # falla si site/ no está al día, si hay un enlace roto,
                                # si una app no tiene su privacidad y sus términos
                                # o si alguna página enlaza a github.io
```

Después se hace commit de `scripts/build.mjs` y de `site/` juntos. El flujo `.github/workflows/pages.yml` corre `--check` en cada PR y publica `site/` cuando entra a `main`.

Las páginas cargan `style.css` con un hash de su contenido en la dirección (`style.css?v=…`). Así un navegador que todavía tenga guardada una versión vieja de la hoja de estilos no la mezcla con páginas nuevas (eso dejó el sitio publicado sin estilos por un rato). Por eso, después de cambiar `style.css` también hay que correr `node scripts/build.mjs`; `--check` falla si no.

Para verlo en el computador:

```sh
node scripts/serve.mjs   # y abrir http://127.0.0.1:4173
```

## Calidad

Las herramientas son solo para revisar; el sitio publicado sigue sin dependencias. Se instalan con `npm ci` y `npx playwright install webkit` (necesita Node 24 y Google Chrome) y corren en cada PR en el trabajo `quality` de `.github/workflows/pages.yml`. Si falla, no se publica.

| Comando | Qué revisa |
|---|---|
| `npm run lint` | HTML válido ([html-validate](https://html-validate.org)) y CSS ([stylelint](https://stylelint.io) con `stylelint-config-standard`) |
| `npm run test:ui` | Con [Playwright](https://playwright.dev) abre cada página del sitemap en un teléfono y en un computador, con el sistema en tema claro y oscuro: cero problemas de accesibilidad de [axe-core](https://github.com/dequelabs/axe-core) (WCAG 2.2 A y AA y buenas prácticas), sin scroll de lado, sin imágenes rotas, sin errores en consola, un solo `h1`, canonical y `og:url` en `https://tutosapp.co`. Revisa que Chrome lea completa la hoja de estilos (cuenta sus reglas y falla si lee bastante menos de las que tiene el archivo) y que cada página la cargue con el hash de su contenido; que la fila de íconos tenga un enlace con nombre por app, se pueda pausar y quede quieta con "reducir movimiento"; y que los botones de la tarjeta de preguntas y del teléfono de cada app cambien lo que se ve. En cada página revisa la lista de apps del menú: cerrada no muestra nombres; abierta tiene todas las apps y el inicio, marca la página actual, cabe en la pantalla, se cierra tocando afuera o con Esc, se maneja con el teclado y lleva a cada app (también en el iPhone). Deja capturas de página completa en `test-results/screens/`. En cada página legal revisa que tenga su título y su fecha, que la tabla de contenido lleve a cada sección, que el cambio de idioma lleve al mismo documento en el otro idioma, que el pie enlace los documentos de la app y que ningún enlace vaya a `github.io`; y que cada app enlace su privacidad y sus términos en este sitio. En un iPhone (WebKit, el motor de Safari) y en un Android (Chrome), revisa que cada página muestre su título y su botón principal en la primera pantalla, sin hacer scroll |
| `npm run lighthouse` | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) en las 8 páginas de inicio y de las apps y en tres páginas legales (una por app): accesibilidad y SEO en 100, buenas prácticas en 95 o más, y aviso si el rendimiento baja de 90. Los informes quedan en `.lighthouseci/` |
| `npm run quality` | Todo lo anterior, más `node scripts/build.mjs --check` |

En GitHub, los informes y las capturas quedan como artefacto `quality-reports` de cada ejecución.

Las herramientas automáticas encuentran solo una parte de los problemas de accesibilidad. Antes de un cambio grande conviene probar con el teclado y con el lector de pantalla del teléfono.

### Agregar una app

Se agrega una entrada a la lista `apps` de `scripts/build.mjs` (copiando una de las que hay) y sus imágenes en `site/assets/img/<id>/`: ícono de 256 × 256, cuatro capturas de tienda por idioma, las pantallas reales para el teléfono (`screens/`, WebP de 600 px de ancho, sin marco: el marco lo pone el CSS) y dos imágenes para redes de 1200 × 630 (`site/assets/img/og/<id>-es.jpg` y `-en.jpg`). En cada idioma lleva `tabs` (nombre, color y descripción de cada pantalla del teléfono), `featureAlt`, `navCta` y `ask` (su pregunta y respuesta en la tarjeta del inicio). Con eso aparece sola en la tarjeta de preguntas y en el orbe, en la fila de íconos, en la lista de apps del menú, en las tarjetas del inicio, en el pie del inicio, en el sitemap y con su propia página. `--check` exige que tenga enlace a su política de privacidad y a sus términos en los dos idiomas, y una descripción por cada pantalla. La tarjeta de preguntas y el teléfono de cada app manejan hasta 8 opciones.

Después se corre `npm run og`, que vuelve a dibujar las imágenes para redes del inicio (`home-es.jpg` y `home-en.jpg`) con el titular del inicio y un ícono por app. También se corre si cambia el titular del inicio.

Si la app trae un estilo nuevo, se le pone un `theme` (por ejemplo `t-nueva`) y se definen sus colores en `style.css`, como `.t-ojito`. Si usa otra fuente, se agrega en `site/assets/fonts/` y en `fonts` de la app, para que su página la precargue.

### Cuando una app salga en una tienda

Se cambia su `status` a `'live'` y el de la tienda (`stores.play` o `stores.appStore`) a `'live'` con su `url`. El botón pasa de "Próximamente" a enlace. Hoy:

| App | Google Play | App Store |
|---|---|---|
| Ojito | Próximamente (en prueba interna; "Quiero probarla" pide entrar por correo) | Próximamente (en revisión) |
| Resume Roast | Enlace a `com.resumeroast.app` | Próximamente |
| Roast Interview | Próximamente | Próximamente |

## Páginas legales

**Este repositorio es la única fuente de los textos legales** de las apps: la política de privacidad, los términos y el soporte de cada una se publican aquí, en `tutosapp.co`, y en ningún otro lugar. Los repositorios viejos en GitHub Pages (`ojito-legal`, `daily-quest-privacy-policy`, `castores-legal` y `resumeroast-support`) ya no son la fuente: si un texto cambia, se cambia aquí.

| App | Español | Inglés |
|---|---|---|
| Ojito | `/ojito/privacidad/`, `/ojito/terminos/`, `/ojito/soporte/` | `/ojito/en/privacy/`, `/ojito/en/terms/`, `/ojito/en/support/` |
| Resume Roast | `/resume-roast/es/privacidad/`, `/resume-roast/es/terminos/`, `/resume-roast/es/soporte/` | `/resume-roast/privacy/`, `/resume-roast/terms/`, `/resume-roast/support/` |
| Roast Interview | `/roast-interview/es/privacidad/`, `/roast-interview/es/terminos/` | `/roast-interview/privacy/`, `/roast-interview/terms/` |

Cada página va dentro de la carpeta de su app y su idioma (la misma regla de las páginas de las apps), con la dirección en el idioma de la página.

El texto de cada documento está en `legal/<app>/<idioma>-<documento>.html` (por ejemplo `legal/ojito/es-privacy.html`): empieza con su `<h1>` y sigue con el documento tal como se publica, con su versión y su fecha de vigencia. `scripts/build.mjs` lo pone en el diseño del sitio: una columna fácil de leer, una tabla de contenido hecha con sus secciones (`h2`) y la fecha de la última actualización. No cambia el texto: solo le pone un `id` a cada sección que no lo tenga, deja que el teclado llegue a una tabla ancha que se mueve de lado y mantiene los teléfonos en una sola línea. Los enlaces entre documentos se escriben `legal:<app>/<documento>/<idioma>` (con `#id` si hace falta) y el build los cambia por la dirección relativa.

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
