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

El inicio presenta a Tutos App como estudio de apps: una fila de íconos que se mueve sola (se puede pausar y se queda quieta si el teléfono pide reducir el movimiento), una sección por app con capturas y estado en tiendas, cómo trabajamos y contacto.

Cada app tiene su propia página con su color y su estilo: propuesta de valor, botones de tienda (o "Próximamente"), beneficios, cómo funciona, capturas, preguntas frecuentes y un pie con los enlaces a **su** política de privacidad y **sus** términos. El texto legal vive en el repositorio de cada app; aquí solo se enlaza.

Todas las páginas tienen título, descripción, imagen para redes (Open Graph), datos estructurados (JSON-LD), versión clara y oscura, y el pie con TUTOS APP S.A.S., NIT 902.125.524-7, Medellín. También están `sitemap.xml`, `robots.txt`, `404.html`, `CNAME` y los íconos.

## Cómo cambiar algo

Todo sale de `scripts/build.mjs`: los textos, los enlaces, el estado de las tiendas y los enlaces legales. Las páginas de `site/` no se editan a mano. El diseño está en `site/assets/style.css`.

```sh
node scripts/build.mjs          # vuelve a escribir las páginas en site/
node scripts/build.mjs --check  # falla si site/ no está al día, si hay un enlace roto
                                # o si una app no tiene su privacidad y sus términos
```

Después se hace commit de `scripts/build.mjs` y de `site/` juntos. El flujo `.github/workflows/pages.yml` corre `--check` en cada PR y publica `site/` cuando entra a `main`.

Para verlo en el computador:

```sh
node scripts/serve.mjs   # y abrir http://127.0.0.1:4173
```

## Calidad

Las herramientas son solo para revisar; el sitio publicado sigue sin dependencias. Se instalan con `npm ci` (necesita Node 24 y Google Chrome) y corren en cada PR en el trabajo `quality` de `.github/workflows/pages.yml`. Si falla, no se publica.

| Comando | Qué revisa |
|---|---|
| `npm run lint` | HTML válido ([html-validate](https://html-validate.org)) y CSS ([stylelint](https://stylelint.io) con `stylelint-config-standard`) |
| `npm run test:ui` | Con [Playwright](https://playwright.dev) abre cada página del sitemap en un teléfono y en un computador, en tema claro y oscuro: cero problemas de accesibilidad de [axe-core](https://github.com/dequelabs/axe-core) (WCAG 2.2 A y AA y buenas prácticas), sin scroll de lado, sin imágenes rotas, sin errores en consola, un solo `h1`, canonical y `og:url` en `https://tutosapp.co`. También revisa que la fila de íconos tenga un enlace con nombre por app, se pueda pausar y quede quieta con "reducir movimiento". Deja capturas de página completa en `test-results/screens/` |
| `npm run lighthouse` | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) en las 8 páginas: accesibilidad y SEO en 100, buenas prácticas en 95 o más, y aviso si el rendimiento baja de 90. Los informes quedan en `.lighthouseci/` |
| `npm run quality` | Todo lo anterior, más `node scripts/build.mjs --check` |

En GitHub, los informes y las capturas quedan como artefacto `quality-reports` de cada ejecución.

Las herramientas automáticas encuentran solo una parte de los problemas de accesibilidad. Antes de un cambio grande conviene probar con el teclado y con el lector de pantalla del teléfono.

### Agregar una app

Se agrega una entrada a la lista `apps` de `scripts/build.mjs` (copiando una de las que hay) y sus imágenes en `site/assets/img/<id>/`: ícono de 256 × 256, cuatro capturas por idioma y dos imágenes para redes de 1200 × 630 (`site/assets/img/og/<id>-es.jpg` y `-en.jpg`). Con eso aparece sola en la fila de íconos, en el inicio, en los menús, en los pies de página, en el sitemap y con su propia página. `--check` exige que tenga enlace a su política de privacidad y a sus términos en los dos idiomas.

Después se corre `npm run og`, que vuelve a dibujar las imágenes para redes del inicio (`home-es.jpg` y `home-en.jpg`) con el titular del inicio y un ícono por app. También se corre si cambia el titular del inicio.

Si la app trae un estilo nuevo, se le pone un `theme` (por ejemplo `t-nueva`) y se definen sus colores en `style.css`, como `.t-ojito`.

### Cuando una app salga en una tienda

Se cambia su `status` a `'live'` y el de la tienda (`stores.play` o `stores.appStore`) a `'live'` con su `url`. El botón pasa de "Próximamente" a enlace. Hoy:

| App | Google Play | App Store |
|---|---|---|
| Ojito | Próximamente (en prueba interna; "Quiero probarla" pide entrar por correo) | Próximamente (en revisión) |
| Resume Roast | Enlace a `com.resumeroast.app` | Próximamente |
| Roast Interview | Próximamente | Próximamente |

## Enlaces legales

| App | Privacidad | Términos |
|---|---|---|
| Ojito | `ojito-legal/privacidad.html` (EN `privacy.html`) | `ojito-legal/terminos.html` (EN `terms.html`) |
| Resume Roast | `daily-quest-privacy-policy/resume-roast/` | `daily-quest-privacy-policy/resume-roast/terms.html` |
| Roast Interview | `castores-legal/privacy/` | `castores-legal/terms/` |

Todas bajo `https://msalcedo23.github.io/`. Si una de esas páginas cambia de dirección, se cambia en `legal` de la app en `scripts/build.mjs`.

## Dominio

`tutosapp.co` está comprado en GoDaddy y configurado así:

- **GoDaddy (DNS):** registro `A` de `@` a `185.199.108.153` y `CNAME` de `www` a `msalcedo23.github.io`. GitHub recomienda agregar también los `A` a `185.199.109.153`, `185.199.110.153` y `185.199.111.153` para que el sitio no dependa de una sola dirección.
- **GitHub, Settings → Pages:** dominio personalizado `tutosapp.co` y "Enforce HTTPS" activado (el certificado de Let's Encrypt ya está emitido). Con publicación por GitHub Actions el dominio se guarda en GitHub, no en el archivo `CNAME`; el `CNAME` de `site/` queda como referencia.
- **Redirecciones:** GitHub manda `www.tutosapp.co`, `http://` y las direcciones viejas `https://msalcedo23.github.io/tutosapp-web/...` a la misma página en `https://tutosapp.co/...`, así que los enlaces que ya se compartieron siguen funcionando.

Para cambiar de dominio: se cambia `DOMAIN` en `scripts/build.mjs`, se corre `node scripts/build.mjs` y se cambia el dominio en Settings → Pages (o `gh api -X PUT repos/msalcedo23/tutosapp-web/pages -f cname=<dominio>`).

## Imágenes y fuentes

Las capturas salen de los repos de cada app (`docs/tienda/capturas` de Ojito, `docs/store/graphics/play/screenshots` de Resume Roast, `docs/screenshots` de Roast Interview iOS), reducidas a 960 px de alto.

Las fuentes son Geist y Instrument Serif (itálica), con licencia SIL Open Font License (`site/assets/fonts/OFL-*.txt`). Se sirven desde el mismo sitio, solo con los caracteres latinos.
