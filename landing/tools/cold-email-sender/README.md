# Cold Email Sender — B2B CSR NRW

Envío automatizado de cold emails B2B vía Resend. Lunes / miércoles / viernes 10:00 CET.

## Estructura

```
tools/cold-email-sender/
├── send-cold-batch.js   script principal
├── queue.json           batches pendientes
├── sent.json            historial de enviados
└── README.md

landing/data/sales-outreach/
└── EMAIL-*.md           plantillas de email (una por empresa)
```

## Cómo agregar empresas nuevas

1. Crear `landing/data/sales-outreach/EMAIL-EMPRESA.md` con formato:
   ```
   ---
   Para: contacto@empresa.de
   Empresa: Nombre Empresa GmbH
   Score: 9/10
   Ángulo: Descripción del ángulo
   ---

   Betreff: Asunto del email

   Cuerpo del email...

   Daniel Garrido
   Gründer & CEO | quetz.org
   Düsseldorf-Unterbach NRW
   ```

2. Añadir un nuevo batch a `queue.json`:
   ```json
   {
     "batches": [
       {
         "scheduled_for": "2026-05-26T08:00:00Z",
         "emails": ["EMAIL-EMPRESA1.md", "EMAIL-EMPRESA2.md"]
       }
     ]
   }
   ```
   `scheduled_for` en UTC. Lunes/miércoles/viernes 08:00 UTC = 10:00 CET (mayo DST).

3. Commit y push. El cron lo enviará automáticamente en la fecha indicada.

## Trigger manual desde GitHub Actions

1. Ir a https://github.com/dfgarrido11/quetz.org/actions
2. Click en "Cold Email Batch — B2B CSR NRW"
3. Click "Run workflow"
4. Elegir `dry_run: true` para simular, `false` para envío real
5. Revisar logs y alertas Telegram

## Dry-run local

```bash
RESEND_API_KEY=re_... node tools/cold-email-sender/send-cold-batch.js --dry-run
```

## Cancelar el cron temporalmente

Editar `.github/workflows/cold-email-cron.yml` y comentar el bloque `schedule`:
```yaml
# schedule:
#   - cron: "0 8 * * 1,3,5"
```

Push el cambio. Para reactivar, descomentar y hacer push.

## Status endpoint

```bash
curl https://quetz.org/api/internal/cold-batch-status
```

Respuesta:
```json
{
  "last_run": "2026-05-18T08:43:00Z",
  "next_run": "2026-05-19T08:00:00Z",
  "queue_remaining": 0,
  "total_sent": 5,
  "last_5_sent": [...],
  "current_status": "idle",
  "sent_today": ["WILO SE", "..."],
  "errors": []
}
```

Usar a las **09:45 CET** el día del envío para confirmar que el cron está en orden.

## Si la queue queda vacía

El script envía alerta Telegram: `⚠️ Queue cold emails vacía — agregar empresas a queue.json`

## Anti-duplicado

El script escribe en `/tmp/cold-email-sent-log.json` (ephemeral por instancia Railway).
Si se dispara dos veces el mismo día, la segunda ejecución aborta con log de error.

Para forzar re-envío (solo en emergencias):
```bash
railway run rm /tmp/cold-email-sent-log.json
```

## Env vars necesarias (configuradas en Railway)

| Variable | Descripción |
|----------|-------------|
| `RESEND_API_KEY` | API key de Resend |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `TELEGRAM_CHAT_ID` | Chat ID para alertas |
| `CRON_SECRET` | Secret para el endpoint POST /api/internal/send-cold-batch |
