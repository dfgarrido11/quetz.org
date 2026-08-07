# PENDIENTES — cosas que sólo puede resolver Daniel

Última actualización: 7 de agosto de 2026.

Todo lo que hay aquí está marcado en el código con `TODO-DANIEL`, así que se
puede encontrar con:

```bash
cd landing && grep -rn "TODO-DANIEL" app lib scripts
```

---

## 0. Lo primero (bloquea credibilidad ante el jurado)

| # | Qué | Dónde | Por qué urge |
|---|-----|-------|--------------|
| 1 | Datos legales del Impressum | `landing/lib/legal.ts` | Ahora mismo /impressum dice "Angabe wird ergänzt". Es un incumplimiento de la Impressumspflicht (§5 TMG) y es abmahnfähig. |
| 2 | Decidir la cifra real de la escuela | ver §2 | La home se contradice a sí misma. Un jurado lo detecta en 30 segundos. |
| 3 | Pago real por árbol a las familias | `landing/lib/allocation.ts` | Es literalmente la crítica del jurado KUER: "no se dice qué llega al agricultor". |
| 4 | 2-3 testimonios reales con consentimiento | `landing/lib/testimonials.ts` | La sección existe pero no se renderiza hasta que haya testimonios reales. |

---

## 1. Datos legales — `landing/lib/legal.ts`

No inventé ningún dato. Mientras los campos estén vacíos, /impressum muestra un
aviso honesto en ámbar (nunca la palabra "PLACEHOLDER", que es lo que se estaba
publicando antes). Deben salir de la Gewerbeanmeldung / Handelsregisterauszug /
Finanzamt.

### Obligatorios (§ 5 TMG)
- [ ] `LEGAL.legalName` — nombre legal completo **incluyendo forma jurídica** (p.ej. `Daniel Garrido`, o `QUETZ UG (haftungsbeschränkt)`)
- [ ] `LEGAL.street` — **ladungsfähige Anschrift**. Un Postfach NO vale.
- [ ] `LEGAL.postalCode`
- [ ] `LEGAL.city`
- [ ] `LEGAL.country` — determina la autoridad de control competente
- [ ] `LEGAL.contentResponsible` — responsable de contenidos según **§ 18 Abs. 2 MStV**, persona física con domicilio en DE/UE. Si coincide con `represented` o `legalName`, dejar vacío (se reutiliza solo).

### Condicionales (sólo si aplican)
- [ ] `LEGAL.legalForm` — sólo si no va ya dentro de `legalName`
- [ ] `LEGAL.represented` — **obligatorio si es GmbH / UG / e.V. / gGmbH**. Vacío si es Einzelunternehmen.
- [ ] `LEGAL.registerCourt` / `LEGAL.registerNumber` — sólo si está inscrito (`HRB 123456`, `VR 12345`)
- [ ] `LEGAL.vatId` — formato `DE123456789` (§ 27a UStG)
- [ ] `LEGAL.isSmallBusiness` — poner a `true` si aplica Kleinunternehmerregelung (§ 19 UStG); entonces se muestra ese aviso en vez del USt-IdNr.
- [ ] `LEGAL.contentResponsibleAddress` — sólo si difiere de la dirección de la empresa
- [ ] `LEGAL.phone` — no obligatorio (TJUE C-298/07) pero suma confianza

### Datenschutz — objeto `PRIVACY`
- [ ] `PRIVACY.dpoRequired` — ¿hace falta Datenschutzbeauftragter? (Art. 37 DSGVO + § 38 BDSG: ≥20 personas tratando datos automatizadamente, vigilancia sistemática, datos del Art. 9, o DPIA obligatoria). **Probablemente `false` — confirmar.**
- [ ] `PRIVACY.dpoName` / `PRIVACY.dpoEmail` — sólo si el anterior es `true`
- [ ] `PRIVACY.supervisoryAuthority` + `supervisoryAuthorityUrl` — autoridad del Bundesland de la sede. Mientras esté vacío se enlaza la lista del BfDI.

### Contratos que hay que firmar y archivar
- [ ] AVV (Art. 28 DSGVO) con **Railway** + confirmar la **región del datacenter**. Si es EU-West, se reduce mucho el problema de transferencia a EEUU → actualizar `PROCESSORS[0].location`.
- [ ] AVV con **Cloudflare**, **Resend**, **Gelato**, **HubSpot**
- [ ] DPA con **Anthropic** + verificar que el opt-out de entrenamiento está activo (la política ya lo afirma)
- [ ] Confirmar los anexos de tratamiento de **Google (GA4)** y **Meta (Pixel)**
- [ ] **Telegram**: hoy `app/api/stripe/webhook/route.ts` envía nombre + email del cliente a un bot. No hay AVV realista con Telegram FZ-LLC. → **Recomendado: quitar nombre y email del mensaje**, dejar sólo importe + ID de pedido. Si se quita, borrar esa entrada de `PROCESSORS`.
- [ ] **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30) — documento interno; el jurado puede pedirlo.
- [ ] Valorar auto-alojar **Google Fonts** (`next/font/local`) para eliminar la transferencia de IP a Google (`landing/app/globals.css` línea 1).
- [ ] Actualizar `LEGAL_LAST_UPDATED` en `lib/legal.ts` cada vez que se toquen los textos.

---

## 2. La cifra de la escuela se contradice consigo misma ⚠️

Esto es lo más peligroso que queda de cara al jurado, porque está **en la misma
pantalla**:

- La rejilla "Radikale Transparenz" dice **Schulfonds Zacapa: 1.626,06 €** (el 30 % de 5.420,20 €).
- La barra de la escuela, justo debajo, dice **5.420,20 € de 50.000 € (11 %)**.

Ambas afirman ser "lo recaudado para la escuela" y difieren en 3.794 €. Puse el
11 % porque me lo pediste explícitamente, pero **hay que elegir una**:

- **Opción A (honesta, recomendada):** la escuela lleva recaudado 1.626,06 € → 3 %. Cambiar `SCHOOL.raisedEur` a `1626.06` en `landing/scripts/seed-impact-stats.ts` y volver a ejecutar `npm run seed:impact`.
- **Opción B:** el 100 % de los ingresos va al proyecto escuela → entonces hay que **cambiar la etiqueta** de la rejilla, porque "Schulfonds = 30 %" ya no sería cierto.

Mientras tanto, `transparency.socialFund` y `SCHOOL.raisedEur` cuentan historias
distintas.

- [ ] Elegir opción A o B y aplicarla.

---

## 3. Economía de campo — `landing/lib/allocation.ts`

Las tarjetas muestran "wird ergänzt" en vez de un número inventado.

- [ ] `FARMER_ECONOMICS.payPerTreePlantedEur` — jornal real que recibe la familia por árbol plantado
- [ ] `FARMER_ECONOMICS.payPerTreeCarePerYearEur` — pago por árbol y año de cuidado
- [ ] `FARMER_ECONOMICS.averageDailyWageEur` — jornal medio diario en Zacapa, para poder compararlo con el salario mínimo agrícola de Guatemala (este dato es **oro** ante un jurado: demuestra que se paga por encima)

También conviene poder respaldar las cuatro garantías de permanencia del CO₂ que
ahora afirma la web:

- [ ] Copia del **contrato de tierra** que excluye la tala (aunque sea anonimizada)
- [ ] Lista de **especies nativas** que se plantan realmente
- [ ] Tasa de supervivencia y **cómo se mide** (también marcado como TODO-DANIEL en `app/blog/_content/csr-baumpflanzung-unternehmen.tsx`)

---

## 4. Testimonios — `landing/lib/testimonials.ts`

El array está vacío a propósito y **la sección entera no se renderiza** mientras
lo esté. Publicar testimonios inventados sería publicidad engañosa (§ 5 UWG) y
justo el tipo de afirmación no verificable que el jurado ya criticó.

De cada persona hace falta:
- [ ] cita textual (en su idioma)
- [ ] nombre y ciudad tal y como quiera aparecer
- [ ] **consentimiento por escrito** para publicarlo (Art. 6(1)(a) DSGVO)
- [ ] opcionalmente foto, con consentimiento aparte para la imagen

---

## 5. Enlaces y credenciales que faltan

- [ ] **LinkedIn 404.** `https://www.linkedin.com/company/quetz` devuelve 404 a una petición anónima. Está en dos sitios: `SOCIAL_LINKS` en `landing/app/components/footer.tsx` y `organizationJsonLd.sameAs` en `landing/app/page.tsx`. Confirmar el slug real o quitar ambos. (Instagram y Facebook sí responden 200.)
- [ ] **Link de reserva de llamada.** `BOOKING_URL` en `landing/app/csr-partner/page.tsx` está vacío, así que el CTA de "15-Minuten-Call" cae a un `mailto:`. Poner el enlace de Calendly / cal.com.
- [ ] **`GOOGLE_SITE_VERIFICATION`** sigue vacío en `.env` → no hay Search Console. Sin esto no se puede medir nada del SEO nuevo.

---

## 6. Bloqueantes técnicos que dejé arreglados pero conviene revisar

- [x] **GA4 y Meta Pixel disparaban antes del consentimiento.** Arreglado: ahora no se montan hasta que se acepta la categoría correspondiente, con Consent Mode v2 en denegado por defecto, y se quitó el `<noscript>` de Facebook (que no se podía condicionar). Añadido un enlace "Cookie-Einstellungen" en el footer para poder revocar (Art. 7(3)).
- [ ] **Borrar `landing/app/components/tracking-scripts.tsx`** — es código muerto (no se importa en ningún sitio) con LinkedIn Insight, Microsoft Clarity y Hotjar dentro. Si algún día se activa, hay que añadir los tres a `PROCESSORS` en `lib/legal.ts` **antes**.
- [ ] **framer-motion deja la web en blanco sin JS.** Es el problema de fondo más grande que queda. Casi todas las secciones usan `initial={{ opacity: 0 }}`, que se inyecta como estilo inline en el HTML del servidor: si la hidratación falla o tarda, la página se ve vacía. Verificado con captura de pantalla. Puse un parche `<noscript>` en `app/layout.tsx` y una clase `.reveal` en `globals.css` que hace la misma animación pero **siempre acaba visible**. Las secciones nuevas (FAQ, agricultores, testimonios) ya la usan. Falta migrar: `hero-section`, `plans-section`, `how-it-works-section`, `gallery-section`, `trees-section`, `csr-teaser-section`, `gift-teaser-section`, `newsletter-section`. Es mecánico: quitar el `motion.div` + `useInView` y poner `className="reveal"`.
- [ ] **`robots.txt` lo sirve Cloudflare, no la app.** Borré `landing/public/robots.txt` porque chocaba con `app/robots.ts` y hacía que `/robots.txt` devolviera **500** en local. En producción Cloudflare intercepta la ruta igualmente (AI Audit / Content-Signal), así que `app/robots.ts` sólo aplica a previews. Si algún día se quita Cloudflare de delante, revisar.

---

## 7. Cosas del encargo que NO hice, y por qué

- **"Las imágenes de la tienda no cargan"** — no se reproduce. Lo comprobé de cuatro formas: los PNG están commiteados, producción los sirve con `200 image/png`, `/_next/image` los optimiza bien, y un navegador real contra `https://quetz.org/shop` carga **7 de 7** imágenes sin errores de consola. No toqué `next.config.js` porque `remotePatterns` ya cubre todos los hosts en uso. Si lo sigues viendo, dime en qué navegador/red y con una captura, porque puede ser caché de Cloudflare o un bloqueador.
  - Lo que sí es mejorable: los mockups pesan **600–820 KB cada uno**. Convertirlos a WebP bajaría la página de ~4 MB a ~400 KB. No lo hice porque no era el fallo reportado.
- **"/admin muestra Error cargando datos"** — no pude entrar (no tengo credenciales de admin), así que no vi ese error concreto. Lo que sí encontré y arreglé: la UI llamaba a tres endpoints que **no existían** (`PUT`/`DELETE /api/admin/farmers/:id` y `PATCH /api/admin/adoptions/:id`), todos devolvían 404. Las consultas Prisma del dashboard sí son correctas contra el esquema.
- **Tabla `impact_stats`** — no la creé. El modelo `Stats` que ya existía es exactamente eso (mismos campos) y estaba vacío en producción; crear una tabla nueva habría duplicado la fuente de verdad. Lo que hice fue sembrarla: `npm run seed:impact`.

---

## 8. Comandos útiles que añadí

```bash
cd landing
npm run seed:impact    # reescribe los números públicos (Stats#main + SchoolProject#zacapa)
npm run check:i18n     # falla si algún idioma pierde una clave o la deja vacía
```
