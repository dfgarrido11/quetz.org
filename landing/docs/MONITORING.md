# Quetzito Health Monitoring & Auto-Recovery

Sistema de monitoreo de salud y diagnóstico automático para el chatbot Quetzito de quetz.org.

---

## Arquitectura

```
UptimeRobot → GET /api/health/quetzito (público, sin auth)
                └── Verifica en paralelo:
                    ├── Anthropic API (claude-haiku-4-5-20251001, ping mínimo)
                    ├── PostgreSQL (SELECT 1 via Prisma)
                    ├── Telegram Bot (getMe)
                    └── Chat endpoint (/api/chat, POST probe)

Alerta externa → POST /api/diagnose (protegido por X-Diagnose-Secret)
                  └── Haiku analiza logs → Telegram alert (alemán) + DB log
```

---

## Variables de entorno requeridas

Añadir en Railway → Variables:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `ANTHROPIC_API_KEY` | Ya existe — reusar | `sk-ant-...` |
| `TELEGRAM_BOT_TOKEN` | Ya existe — bot principal del chatbot | `123456:ABC...` |
| `HAIKU_DIAGNOSE_ENABLED` | Habilita diagnóstico con Haiku | `true` |
| `HEALTH_CHECK_SECRET` | Secret para proteger `/api/diagnose` | 32 chars aleatorios |
| `TELEGRAM_ALERT_BOT_TOKEN` | Bot dedicado para enviar alertas | `987654:XYZ...` |
| `TELEGRAM_ALERT_CHAT_ID` | Chat ID de Daniel para recibir alertas | `-1001234567890` |

Generar HEALTH_CHECK_SECRET:
```bash
openssl rand -hex 16
```

**NUNCA renombres `OR_API_KEY`** — la usa el webhook de Telegram.

---

## 1. Configurar UptimeRobot

1. Ir a [uptimerobot.com](https://uptimerobot.com) → **Add New Monitor**
2. **Monitor Type:** HTTP(s)
3. **Friendly Name:** `Quetzito Health`
4. **URL:** `https://www.quetz.org/api/health/quetzito`
5. **Monitoring Interval:** 5 minutos
6. **Monitor Timeout:** 10 segundos
7. En **Advanced Settings:**
   - HTTP Method: `GET`
   - Expected HTTP Status Code: `200`
   - Alert Contacts: tu email / Telegram
8. Guardar → el monitor empieza inmediatamente

El endpoint retorna `200` si todo OK, `503` si algo falla. UptimeRobot alertará cuando el status cambie.

---

## 2. Configurar Telegram Alert Bot

### Crear el bot de alertas (si no existe ya)

1. Abre Telegram → busca `@BotFather`
2. Envía `/newbot`
3. Nombre: `Quetzito Monitor`
4. Username: `quetzito_monitor_bot` (o similar disponible)
5. Copia el token → guardar como `TELEGRAM_ALERT_BOT_TOKEN`

### Obtener el Chat ID de Daniel

1. Abre el chat con Daniel en Telegram (o un grupo)
2. Envía un mensaje al bot desde ese chat
3. Visita: `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Busca `"chat":{"id":...}` en la respuesta
5. Ese número es el `TELEGRAM_ALERT_CHAT_ID`

Para grupos, el ID tiene prefijo `-` (negativo).

---

## 3. Webhook Telegram para el chatbot

El bot de Telegram del chatbot usa el endpoint `/api/telegram/webhook`.

### Registrar el webhook

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.quetz.org/api/telegram/webhook"}'
```

### Verificar que está activo

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Deberías ver `"url": "https://www.quetz.org/api/telegram/webhook"`.

---

## 4. Railway Redeploy Webhook URL

Para triggerear un redeploy automático desde un sistema externo (p.ej. tras detectar un fallo):

1. En Railway → tu proyecto → **Settings** → **Deployments**
2. Busca **Deploy Webhook** o usa el CLI:
   ```bash
   railway up --detach
   ```
3. Alternativamente, via Railway API:
   ```bash
   curl -X POST "https://backboard.railway.app/graphql/v2" \
     -H "Authorization: Bearer <RAILWAY_API_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"query":"mutation { serviceInstanceRedeploy(environmentId: \"<ENV_ID>\", serviceId: \"<SERVICE_ID>\") }"}'
   ```
4. El `RAILWAY_API_TOKEN` se genera en Railway → **Account Settings** → **Tokens**

---

## 5. Testear localmente con curl

### Health check (público)

```bash
curl -v https://www.quetz.org/api/health/quetzito
```

**Respuesta OK (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-04-27T12:00:00.000Z",
  "checks": {
    "anthropic": { "ok": true, "latencyMs": 812 },
    "database":  { "ok": true, "latencyMs": 43 },
    "telegram":  { "ok": true, "latencyMs": 234 },
    "chat":      { "ok": true, "latencyMs": 1205 }
  }
}
```

**Respuesta degradada (503):**
```json
{
  "status": "degraded",
  "timestamp": "2026-04-27T12:00:00.000Z",
  "checks": {
    "anthropic": { "ok": false, "latencyMs": 3500, "error": "anthropic timed out after 3500ms" },
    "database":  { "ok": true,  "latencyMs": 41 },
    "telegram":  { "ok": true,  "latencyMs": 198 },
    "chat":      { "ok": true,  "latencyMs": 987 }
  }
}
```

### Endpoint de diagnóstico (protegido)

```bash
curl -X POST https://www.quetz.org/api/diagnose \
  -H "Content-Type: application/json" \
  -H "X-Diagnose-Secret: <HEALTH_CHECK_SECRET>" \
  -d '{
    "failure_type": "OpenRouter API timeout",
    "logs_excerpt": "Error: fetch failed\n  at /app/.next/server/app/api/chat/route.js:45\n  ETIMEDOUT connecting to openrouter.ai:443",
    "timestamp": "2026-04-27T12:00:00.000Z"
  }'
```

**Respuesta exitosa:**
```json
{
  "ok": true,
  "logId": "clxxx123...",
  "diagnosis": "(1) Was ist passiert? Ein Timeout beim Verbinden zu OpenRouter API...\n(2) Ursache: Netzwerkproblem oder API-Überlastung...\n(3) Aktion: Retry nach 60s, API-Status prüfen unter status.openrouter.ai"
}
```

### Test local con entorno de dev

```bash
# Primero levanta el servidor
cd landing && npm run dev

# Health check local
curl -s http://localhost:3000/api/health/quetzito | jq .

# Diagnose local
curl -X POST http://localhost:3000/api/diagnose \
  -H "Content-Type: application/json" \
  -H "X-Diagnose-Secret: tu_secret_local" \
  -d '{"failure_type":"test","logs_excerpt":"test error","timestamp":"2026-04-27T00:00:00Z"}'
```

---

## 6. Migración de base de datos

El modelo `SystemHealthLog` registra todos los eventos de health y diagnóstico.

### Aplicar migración

```bash
cd landing

# Opción A: entorno de desarrollo (crea la migración y aplica)
npx prisma migrate dev --name add_system_health_log

# Opción B: producción (aplica migraciones pendientes sin generar nuevas)
npx prisma migrate deploy

# Opción C: si usas db push (sin historial de migraciones)
npx prisma db push
```

### Schema del modelo

```prisma
model SystemHealthLog {
  id           String    @id @default(cuid())
  timestamp    DateTime  @default(now())
  checkType    String    // "health_check" | "diagnosis" | "recovery"
  status       String    // "ok" | "fail" | "recovered"
  errorMessage String?   @db.Text
  diagnosis    String?   @db.Text
  resolvedAt   DateTime?
  metadata     Json?
}
```

### Consultar logs recientes

```bash
# Via Prisma Studio
npx prisma studio

# Via SQL directo en Railway
SELECT id, timestamp, "checkType", status, "errorMessage"
FROM "SystemHealthLog"
ORDER BY timestamp DESC
LIMIT 20;
```

---

## 7. Troubleshooting común

### Health check siempre 503

1. Revisa qué check falla: lee el campo `checks` del JSON de respuesta
2. **Anthropic falla:** verifica `ANTHROPIC_API_KEY` en Railway Variables
3. **Database falla:** verifica `DATABASE_URL` y que la migración fue aplicada
4. **Telegram falla:** verifica `TELEGRAM_BOT_TOKEN` — prueba el token con `curl https://api.telegram.org/bot<TOKEN>/getMe`
5. **Chat falla:** verifica que `NEXTAUTH_URL` apunta al dominio correcto

### Diagnose retorna 401

- El header `X-Diagnose-Secret` no coincide con `HEALTH_CHECK_SECRET` en Railway
- Regenera el secret y actualiza ambos lados

### Diagnose retorna 503

- `HAIKU_DIAGNOSE_ENABLED` no está seteado a `true` en Railway Variables

### Telegram alerts no llegan

1. Verifica `TELEGRAM_ALERT_BOT_TOKEN` y `TELEGRAM_ALERT_CHAT_ID`
2. Asegúrate de que el bot haya sido iniciado por el chat de destino (`/start`)
3. Para grupos, el bot debe ser miembro del grupo
4. Prueba manualmente:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
     -d "chat_id=<CHAT_ID>&text=Test+alert"
   ```

### Anthropic timeout en health check

- El check individual tiene timeout de 3500ms
- Si Anthropic está lento, el health check reportará degradado
- Verifica el status de Anthropic en [status.anthropic.com](https://status.anthropic.com)

### Sin logs en SystemHealthLog

- Verifica que la migración fue aplicada: `SELECT * FROM "SystemHealthLog" LIMIT 1;`
- Si la tabla no existe, aplica la migración (ver sección 6)
- Revisa los logs de Railway para errores de DB en el endpoint `/api/diagnose`

---

## 8. Flujo de auto-recovery recomendado

```
UptimeRobot detecta 503
  → Notifica por email/Telegram
  → (Opcional) llama webhook de Railway para redeploy
  → Llama POST /api/diagnose con los logs del fallo
      → Haiku diagnostica en alemán
      → Alerta llega al Telegram de Daniel
      → Log guardado en SystemHealthLog
  → Si redeploy exitoso, UptimeRobot detecta 200 nuevamente
```

Para automatizar la llamada a `/api/diagnose` desde UptimeRobot:
1. UptimeRobot → **Alert Contacts** → **Add Alert Contact**
2. Type: **Webhook**
3. URL: `https://www.quetz.org/api/diagnose`
4. POST Value:
   ```json
   {"failure_type":"UptimeRobot alert","logs_excerpt":"Monitor *monitorFriendlyName* is DOWN","timestamp":"*alertDateTime*"}
   ```
5. Añadir header personalizado no es posible en UptimeRobot free — usar un webhook relay (p.ej. Make/n8n) que añada el `X-Diagnose-Secret`
