# tutosapp-web

Sitio de Tutos App: Ojito, Resume Roast y Roast Interview.

Un solo sitio para la marca: el inicio muestra las tres apps y cada app tiene su propia página para compartir con su enlace. Es HTML y CSS, sin JavaScript, sin analítica y sin cookies.

Hoy se publica en **https://msalcedo23.github.io/tutosapp-web/** con GitHub Pages, cada vez que algo entra a `main`.

## Páginas

| Página | Idioma principal | Otro idioma |
|---|---|---|
| Inicio | `/` español | `/en/` |
| Ojito | `/ojito/` español | `/ojito/en/` |
| Resume Roast | `/resume-roast/` inglés | `/resume-roast/es/` |
| Roast Interview | `/roast-interview/` inglés | `/roast-interview/es/` |

Cada página tiene su título, descripción, imagen para redes (Open Graph), botón para compartir por WhatsApp y un botón de correo a `castores.app@gmail.com` ("Quiero probarla" en Ojito, "Avísame" en las demás). También están `sitemap.xml`, `robots.txt`, `404.html` y los íconos.

## Cómo cambiar algo

Los textos, los enlaces y el estado de las tiendas están en `scripts/build.mjs`. Las páginas de `site/` salen de ese archivo: no se editan a mano.

```sh
node scripts/build.mjs          # vuelve a escribir las páginas en site/
node scripts/build.mjs --check  # falla si site/ no está al día o si hay un enlace roto
```

Después se hace commit de `scripts/build.mjs` y de `site/` juntos. El flujo `.github/workflows/pages.yml` corre `--check` en cada PR y publica `site/` cuando entra a `main`.

Para verlo en el computador:

```sh
python3 -m http.server 8000 --directory site   # y abrir http://localhost:8000
```

**Cuando una app salga en una tienda**, se cambia su `status` de `'soon'` a `'live'` en `apps` (y se pone la `url` de App Store). El botón pasa de "Muy pronto" a enlace. Hoy:

| App | Google Play | App Store |
|---|---|---|
| Ojito | Muy pronto. La ficha `co.ojito.ojito` todavía no es pública (prueba cerrada); por ahora "Quiero probarla" pide entrar por correo | Muy pronto (en revisión) |
| Resume Roast | Enlace a `com.resumeroast.app` | Muy pronto (en revisión) |
| Roast Interview | Muy pronto | Muy pronto |

Las imágenes salen de los repos de cada app (`docs/tienda/capturas` de Ojito, `docs/store/graphics/play/screenshots` de Resume Roast, `docs/screenshots` de Roast Interview iOS), reducidas a 960 px. Las imágenes para redes (`site/assets/img/og/`) son de 1200 × 630.

## Dominio propio (cuando se compre)

No hay archivo `CNAME`: con publicación por GitHub Actions el dominio se configura en GitHub, no con ese archivo. Pasos, con `tutosapp.com` como ejemplo:

1. En GoDaddy, en DNS del dominio, crear cuatro registros `A` para `@` con `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`, y un `CNAME` para `www` con `msalcedo23.github.io`. Borrar el registro `A` de "parking" que trae GoDaddy.
2. En GitHub, Settings → Pages → Custom domain, escribir `tutosapp.com` y guardar (o `gh api -X PUT repos/msalcedo23/tutosapp-web/pages -f cname=tutosapp.com`). Cuando el certificado esté listo, marcar "Enforce HTTPS".
3. En `scripts/build.mjs` cambiar `SITE_URL` a `'https://tutosapp.com/'`, correr `node scripts/build.mjs` y hacer commit. Así los enlaces de compartir, el sitemap y las imágenes para redes usan el dominio nuevo.

`robots.txt` solo lo leen los buscadores en la raíz de un dominio, así que empieza a contar con el dominio propio.

## Dominio

Investigación del 2026-11-08. Solo datos: no se compró nada ni se creó ninguna cuenta.

**Disponibilidad**, consultada en el registro de cada extensión (RDAP de Verisign para `.com`, RDAP de Google Registry para `.app`, WHOIS de `whois.registry.co` para `.co`):

| Dominio | ¿Libre? | Detalle |
|---|---|---|
| tutosapp.com | Sí | RDAP: no existe |
| tutosapp.co | Sí | WHOIS: "DOMAIN NOT FOUND" |
| tutos.app | **No** | Registrado el 2026-09-28, vence el 2027-09-28. El dueño no es público |
| tutosapp.app | Sí | RDAP: no existe |
| gettutos.com | Sí | RDAP: no existe |

**Precios de GoDaddy por un año**, en dólares de godaddy.com (Estados Unidos). Las páginas de GoDaddy devolvieron 403 a la consulta automática, así que los precios vienen de domainoffer.net, que sigue los precios de GoDaddy. Hay que confirmarlos en el carrito antes de pagar: GoDaddy Colombia cobra en pesos y puede mostrar otros valores, y el primer año suele ser una promoción.

| Extensión | Primer año | Renovación anual | Fuente |
|---|---|---|---|
| `.com` (tutosapp.com, gettutos.com) | US$ 4.99 con promoción para clientes nuevos (código GDWELCOME); US$ 12.99 sin ella | US$ 22.99 | [domainoffer.net/tld/com/godaddy](https://domainoffer.net/tld/com/godaddy), mayo 2026 |
| `.co` (tutosapp.co) | US$ 17.99 | US$ 59.99 | [domainoffer.net/tld/co/godaddy](https://domainoffer.net/tld/co/godaddy), julio 2026 |
| `.app` (tutosapp.app) | US$ 15.99 | US$ 27.99 | [domainoffer.net/tld/app/godaddy](https://domainoffer.net/tld/app/godaddy), octubre 2026 |

En `.com` y `.app` se suma la tarifa de ICANN de US$ 0.20 al año. `.app` solo funciona con HTTPS, y GitHub Pages lo da.

**Recomendación: `tutosapp.com`.** Es el más barato el primer año y también al renovar (unos US$ 23 al año contra unos US$ 60 de `.co`), es igual al nombre de la marca y es lo que la gente escribe sin pensar. `gettutos.com` cuesta lo mismo pero es menos claro. Conviene comprar solo el dominio, a un año, sin los extras que ofrece GoDaddy (correo o constructor de sitios): GitHub Pages ya da el sitio y el HTTPS gratis.
