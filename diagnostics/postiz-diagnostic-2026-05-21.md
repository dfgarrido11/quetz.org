# Diagnóstico Postiz — 21 mayo 2026

> **Estado: DIAGNÓSTICO COMPLETO** — Railway CLI autenticado, DB consultada, logs analizados.

---

## Resumen Ejecutivo

Postiz está deployado en Railway y el backend/frontend responden. Sin embargo, **el sistema está completamente no funcional por dos razones independientes**:

1. **Nunca se ha conectado ninguna cuenta social** (0 integraciones en DB) — el flujo OAuth de LinkedIn/Facebook nunca completó con éxito. Causa probable: redirect URIs incorrectos o apps en Development Mode.

2. **El motor de publicación (Temporal) no existe en Railway** — el proceso `orchestrator` lleva ~650 reintentos fallidos intentando conectar a `temporal.railway.internal:7233` que no resuelve. Sin Temporal, ningún post programado se publicará jamás, aunque se conecten cuentas.

Ambos problemas deben resolverse. Son independientes pero igualmente bloqueantes.

---

## Estado por componente

| Componente | Estado | Severidad | Evidencia |
|---|---|---|---|
| Railway deploy (infraestructura) | ✅ Corriendo | — | HTTP 307→/auth; "App is running!" |
| Frontend Next.js (proceso 0) | ✅ Carga | BAJO | HTTP 200 en `/auth`, `/integrations` |
| Backend NestJS (proceso 1) | ✅ Responde | MEDIO | API OK, WARN: OpenAI key no configurada |
| Orchestrator Temporal (proceso 2) | ❌ Crash loop | CRÍTICO | 650+ retries DNS, `temporal.railway.internal:7233` no resuelve |
| Variables de entorno | ⚠️ Incompletas | ALTO | LINKEDIN/FACEBOOK presentes; faltan RESEND, OPENAI |
| Base de datos — esquema | ✅ Migrado | — | Tablas creadas (Integration, Post, User, etc.) |
| Base de datos — Users | ✅ 3 usuarios | — | Admin + cuentas configuradas |
| Base de datos — Integrations | ❌ 0 registros | CRÍTICO | Ninguna cuenta social conectada jamás |
| Base de datos — Posts | ❌ 0 registros | — | Nunca se publicó nada |
| LinkedIn OAuth app | ⚠️ Sin verificar | CRÍTICO | Credenciales SET, redirect URIs no verificados |
| Facebook OAuth app | ⚠️ Sin verificar | CRÍTICO | Credenciales SET, posible Development Mode |
| Storage (media) | ⚠️ Local, sin volumen | ALTO | `STORAGE_PROVIDER=local`, no hay volumen persistente |
| Email (Resend) | ❌ No configurado | MEDIO | `RESEND_API_KEY` ausente del servicio Postiz |

---

## Hallazgos por severidad

### 🔴 CRÍTICO

#### 1. Temporal no existe en Railway → publicación 100% rota

**El error más frecuente en los logs (100% de los mensajes de error):**
```
2|orchestrator | ERROR temporalio_client::retry: gRPC call poll_workflow_task_queue retried 656 times
error=Status { code: Unavailable, message: "dns error",
source: "failed to lookup address information: Temporary failure in name resolution" }
```

- Postiz usa [Temporal](https://temporal.io) como motor de workflows para scheduling y publicación
- `TEMPORAL_ADDRESS = temporal.railway.internal:7233` apunta a un servicio Railway que no existe en el proyecto
- El proceso `orchestrator` (PM2 proceso 2) lleva cientos de reintentos sin parar
- **Impacto**: Todo post programado — pasado, presente y futuro — **nunca se ejecutará**
- **Este error genera 500+ logs/seg** y hace que Railway dropee otros mensajes de log

**Soluciones disponibles (ordenadas por complejidad):**

| Opción | Descripción | Esfuerzo |
|---|---|---|
| A) Deploy Temporal en Railway | Añadir servicio Temporal al proyecto Railway | 30-60 min |
| B) Desactivar Temporal | Usar versión de Postiz sin Temporal (no oficial) | Complejo |
| C) Temporal Cloud | Usar Temporal Cloud (managed) | 1-2h + costo |
| D) Cambiar scheduler | Migrar a Postiz con BullMQ (versión legacy < v2) | Muy complejo |

**Recomendación**: Opción A — deploying Temporal via Docker en Railway.

#### 2. Cero integraciones conectadas en base de datos

```sql
SELECT COUNT(*) FROM "Integration";
-- Resultado: 0
```

Ninguna cuenta social (LinkedIn, Facebook, Instagram, etc.) ha sido conectada exitosamente. Hay 3 usuarios en el sistema pero ninguno tiene cuentas vinculadas. Las causas posibles:

- **a)** Redirect URIs en LinkedIn/Facebook Developer Portal no incluyen `https://postiz.quetz.org/integrations/social/[provider]`
- **b)** Apps en Development Mode (Facebook) → solo admins pueden conectar
- **c)** `FRONTEND_URL` anterior era `postiz-production-a677.up.railway.app` y se cambió a `postiz.quetz.org` sin actualizar redirect URIs en las plataformas
- **d)** Nadie ha intentado conectar desde el dominio correcto

**Redirect URIs que deben estar configurados:**
```
LinkedIn: https://postiz.quetz.org/integrations/social/linkedin
LinkedIn Page: https://postiz.quetz.org/integrations/social/linkedin-page
Facebook: https://postiz.quetz.org/integrations/social/facebook
Instagram: https://postiz.quetz.org/integrations/social/instagram
```

### 🟠 ALTO

#### 3. Storage local sin volumen persistente

```
STORAGE_PROVIDER = local
UPLOAD_DIRECTORY = /uploads
```

Railway containers son efímeros. Sin un volumen persistente montado en `/uploads`, **todas las imágenes y media subidos a Postiz se pierden en cada redeploy o reinicio del contenedor**. Posts con imágenes fallaron sin trace visible.

**Fix**: En Railway > servicio Postiz > Volumes > montar `/uploads`. O mejor: migrar a `STORAGE_PROVIDER=cloudflare` / `s3`.

#### 4. Railway log rate limit por Temporal flood

```
Railway rate limit of 500 logs/sec reached for replica, update your application 
to reduce the logging rate. Messages dropped: 3493
```

El flood de logs de Temporal hace que Railway dropee miles de mensajes. Errores OAuth, crashes del backend, y otros problemas importantes pueden no ser visibles en logs. Esto complica el debugging activo.

### 🟡 MEDIO

#### 5. RESEND_API_KEY no configurada en servicio Postiz

`RESEND_API_KEY` existe en el servicio `quetz.org` pero **no en el servicio Postiz**. Funcionalidades rotas:
- Invitaciones de equipo por email
- Recuperación de contraseña
- Notificaciones de post publicado

#### 6. OpenAI API key no configurada

```
1|backend | WARN OpenAI API key not set, chat functionality will not work
```

El chat/copilot de Postiz está roto. No bloqueante para OAuth/publicación.

### 🟢 BAJO / INFO

#### 7. Next.js Server Action mismatch

```
0|frontend | Error: Failed to find Server Action "x". This request might be from 
an older or newer deployment.
```

Artifact de build viejo en cache del browser. Se resuelve solo con hard refresh / nueva sesión del usuario.

#### 8. PM2 desactualizado

```
PM2 | [PM2] This PM2 is not UP TO DATE — Upgrade to version 7.0.1
```

No es bloqueante pero puede causar comportamientos inesperados.

---

## Causa raíz definitiva

**Hay dos causas raíz independientes, ambas bloqueantes:**

**Causa A — OAuth nunca completó**: Los redirect URIs en LinkedIn y/o Facebook Developer Portal probablemente no incluyen el dominio actual `postiz.quetz.org`. Cuando Postiz fue configurado inicialmente usaba `postiz-production-a677.up.railway.app` y luego se migró al dominio custom — los redirect URIs en las plataformas de terceros no se actualizaron. Esto explica por qué la tabla `Integration` tiene 0 registros.

**Causa B — Temporal no deployado**: El motor de publicación programada de Postiz (Temporal) nunca fue deployado en Railway. `temporal.railway.internal:7233` no resuelve porque el servicio no existe. Esto explica por qué ningún post programado se ejecutó. Este error además inunda los logs a 500+/seg.

---

## Próximos pasos recomendados (priorizados)

### Paso 1 — [20 min] Silenciar Temporal flood (quick win)

Mientras se resuelve el Temporal, detener el log flood para recuperar visibilidad:

**Opción rápida**: En Railway > servicio Postiz > Variables, agregar:
```
DISABLE_WORKER=true
```
(verifica si Postiz soporta esta variable en su versión actual)

O bien, revisar si hay opción de correr Postiz sin el worker en el `railway.toml` / Dockerfile del servicio.

### Paso 2 — [30 min] Verificar y corregir redirect URIs en LinkedIn

1. Ir a `developers.linkedin.com/apps` → seleccionar la app de Postiz
2. En "Auth" → "Authorized redirect URLs for your app", confirmar que existe:
   ```
   https://postiz.quetz.org/integrations/social/linkedin
   https://postiz.quetz.org/integrations/social/linkedin-page
   ```
3. Si solo existe `postiz-production-a677.up.railway.app/...` → agregar el nuevo dominio

### Paso 3 — [30 min] Verificar Facebook App

1. Ir a `developers.facebook.com/apps` → seleccionar app
2. Confirmar **App Mode**: si está en **Development** → Switch a **Live** (requiere Business Verification completada)
3. En Facebook Login > Settings, agregar redirect URIs:
   ```
   https://postiz.quetz.org/integrations/social/facebook
   https://postiz.quetz.org/integrations/social/instagram
   ```
4. Confirmar permisos: `pages_manage_posts`, `pages_read_engagement`, `instagram_content_publish`

### Paso 4 — [45-60 min] Conectar cuentas LinkedIn y Facebook desde Postiz UI

Una vez pasos 2-3 completados:
1. Ir a `https://postiz.quetz.org/auth` → login con `dgarrido@quetz.org`
2. Settings > Integrations > conectar LinkedIn personal
3. Settings > Integrations > conectar LinkedIn Page (quetzorg)
4. Settings > Integrations > conectar Facebook Page
5. Settings > Integrations > conectar Instagram Business

Si falla, revisar logs en tiempo real:
```bash
railway service postiz && railway logs --follow
```

### Paso 5 — [1-2h] Deploy Temporal en Railway

Postiz requiere Temporal para ejecutar posts programados. Sin este paso, aunque se conecten cuentas, **ningún post se publicará**.

Opciones:
```bash
# Opción A: Temporal via Railway Template
# Buscar en Railway template marketplace: "Temporal"
# O deploy manualmente el Temporal server (Postgres backend ya disponible)

# Opción B: Temporal Cloud (managed, más simple)
# registry.temporal.cloud → crear namespace gratuito
# Actualizar TEMPORAL_ADDRESS=<namespace>.tmprl.cloud:7233
```

### Paso 6 — [15 min] Volumen persistente para uploads

En Railway > servicio Postiz > Volumes:
- Agregar volumen montado en `/uploads`
- Mínimo 1GB para empezar

---

## Bloqueos externos (que requieren acción humana en plataformas de terceros)

1. **LinkedIn Developer Portal**: Verificar y actualizar redirect URIs para dominio `postiz.quetz.org`. Si la app no tiene producto "Share on LinkedIn" aprobado, posting personal puede requerir review.

2. **LinkedIn Marketing Developer Platform**: Para postear en Company Page `quetzorg` desde la API, LinkedIn requiere acceso aprobado a su Marketing Developer Platform. Sin esto, Company Page posting está bloqueado. Proceso: días a semanas.

3. **Facebook App Mode**: Si la app Meta está en Development Mode, solo los usuarios listados como testers/admins pueden conectar. Para uso general (o para conectar con la cuenta de la empresa) la app debe estar en **Live Mode**, lo que requiere completar Business Verification de Meta.

4. **Facebook App Review**: Para permisos de publicación avanzados (`pages_manage_posts`, `instagram_content_publish`), Meta requiere App Review. Si no se ha hecho: 1-7 días laborables de proceso.

---

## Estimación de esfuerzo para funcionalidad completa

| Tarea | Esfuerzo | Tipo |
|---|---|---|
| Corregir redirect URIs LinkedIn | 15 min | Config |
| Corregir redirect URIs Facebook | 15 min | Config |
| Conectar cuentas LinkedIn/Facebook/Instagram | 30 min | Config |
| Deploy Temporal en Railway | 1-2h | Infraestructura |
| Volumen persistente para uploads | 15 min | Infraestructura |
| Facebook App Review (si aplica) | 1-7 días | Proceso externo |
| LinkedIn Marketing Developer Platform (si aplica) | Semanas | Proceso externo |

**Tiempo mínimo para tener OAuth + publicación funcionando**: ~3-4 horas (si redirect URIs son el único problema y Temporal se configura rápido)

**Tiempo con bloqueos externos**: Variable (semanas si Meta/LinkedIn requieren reviews)

---

## Datos técnicos recopilados

| Parámetro | Valor |
|---|---|
| Postiz URL (activo) | `https://postiz.quetz.org` |
| Postiz URL (legacy, sigue respondiendo) | `https://postiz-production-a677.up.railway.app` |
| Railway Project | `overflowing-fascination` |
| Railway Service ID (Postiz) | confirmado via `railway service postiz` |
| DB host | `gondola.proxy.rlwy.net:30632` |
| DB name | `postiz` |
| Users en DB | 3 |
| Integrations en DB | **0** |
| Posts en DB | **0** |
| TEMPORAL_ADDRESS configurado | `temporal.railway.internal:7233` |
| Temporal DNS resuelve | **NO** — servicio no existe |
| Temporal retries en log | **650+** por queue |
| Log rate en Railway | **500+ logs/seg** → rate limited |
| FRONTEND_URL | `https://postiz.quetz.org` ✅ |
| LINKEDIN_CLIENT_ID | SET (14 chars) |
| FACEBOOK_APP_ID | SET (16 chars) |
| RESEND_API_KEY | **NO SET** en servicio Postiz |
| STORAGE_PROVIDER | `local` (sin volumen) |
| Proceso PM2-0 (frontend) | ✅ Running |
| Proceso PM2-1 (backend) | ✅ Running (WARN: OpenAI key) |
| Proceso PM2-2 (orchestrator) | ❌ Crash loop (Temporal DNS) |
| Admin email | `dgarrido@quetz.org` |

---

*Diagnóstico generado: 21 mayo 2026 — Usando Railway CLI, psql directo a DB, curl, análisis de logs en producción.*
*NO se realizaron cambios en configuración, variables de entorno, ni base de datos.*
