# 📧 Guía del Sistema de Outreach Campaign - Quetz

Sistema completo para gestionar campañas de outreach corporativo con seguimiento avanzado y integración con Resend API.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener configurada la variable de entorno en Railway:

```bash
RESEND_API_KEY=tu_resend_api_key_aqui
```

### 2. Base de Datos

Aplica las migraciones de Prisma para crear las tablas necesarias:

```bash
npx prisma db push
# o
npx prisma migrate dev --name "add-outreach-models"
```

## 📊 Preparación de Datos

### Convertir Excel a CSV

Si tienes los leads en un archivo Excel, conviértelos primero:

```bash
# Convertir archivo Excel a CSV
npm run excel:convert data/leads-corporativos.xlsx data/leads.csv

# Especificar hoja específica
npm run excel:convert leads.xlsx --sheet "Corporate Contacts" --output leads.csv

# Formato TSV
npm run excel:convert leads.xlsx leads.tsv --format tsv
```

### Formato CSV Requerido

El archivo CSV debe tener estas columnas (mínimo `email` es requerido):

```csv
email,name,company,position,country
ana.garcia@empresa1.com,Ana García,EcoTech Solutions,Directora de Sostenibilidad,España
carlos.lopez@verde.mx,Carlos López,Verde Corporativo,Gerente de RSE,México
```

## 📤 Creación y Envío de Campañas

### 1. Crear una Nueva Campaña

```bash
npm run outreach:create -- --name "Q1 2024 Corporate Outreach" --subject "Reducir huella de carbono de tu empresa" --csv "data/leads.csv"
```

### 2. Enviar email de Prueba

```bash
npm run outreach:test -- --email "tu-email@test.com" --template "corporate"
```

### 3. Enviar la Campaña

```bash
npm run outreach:send -- --campaign-id "clp123abc456"
```

### 4. Verificar Estado

```bash
npm run outreach:status -- --campaign-id "clp123abc456"
```

## 📈 Seguimiento de Resultados

### Estados de Leads

- `pending`: Lead creado, no enviado
- `sent`: Email enviado exitosamente
- `delivered`: Email entregado (webhook de Resend)
- `opened`: Lead abrió el email
- `clicked`: Lead hizo clic en un enlace
- `replied`: Lead respondió al email
- `bounced`: Email rebotó
- `unsubscribed`: Lead se dio de baja

### Estados de Campaña

- `draft`: Campaña creada, no enviada
- `scheduled`: Programada para envío
- `sending`: En proceso de envío
- `completed`: Envío completado
- `paused`: Pausada por error

## 🔧 Comandos Avanzados

### Gestión de Campañas

```bash
# Crear campaña con programación
npm run outreach:create -- --name "Campaña Navidad" --subject "Regalos corporativos sostenibles" --csv "leads.csv" --scheduled "2024-12-15T09:00:00Z"

# Envío con rate limiting personalizado
npm run outreach:send -- --campaign-id "abc123" --rate-limit 50

# Reanudar campaña pausada
npm run outreach:send -- --campaign-id "abc123" --resume
```

### Análisis de Datos

```bash
# Exportar resultados de campaña
npm run outreach:export -- --campaign-id "abc123" --format csv

# Estadísticas detalladas
npm run outreach:analytics -- --campaign-id "abc123" --detailed
```

## 📧 Configuración de Reply-To

Todos los emails enviados tienen configurado:

- **From**: `Equipo Quetz <hola@quetz.org>`
- **Reply-To**: `hola@quetz.org`
- **Headers personalizados**: Para tracking y análisis

## 🛡️ Mejores Prácticas

### 1. Rate Limiting
- Por defecto: 100ms entre emails
- Para volúmenes grandes: configurar delays más largos
- Monitorear métricas de deliverability

### 2. Personalización
```bash
# El template usa variables automáticas:
# {{name}} -> Nombre del contacto o "Estimado/a"
# {{company}} -> Nombre de empresa o "su empresa"
# {{position}} -> Posición o vacío
```

### 3. A/B Testing
```bash
# Crear variantes de campaña
npm run outreach:create -- --name "Prueba A" --subject "Versión A" --csv "leads-a.csv"
npm run outreach:create -- --name "Prueba B" --subject "Versión B" --csv "leads-b.csv"
```

### 4. Compliance
- Links de unsubscribe incluidos automáticamente
- Respetar listas de exclusión
- Cumplir con GDPR y regulaciones locales

## 🔍 Troubleshooting

### Error: RESEND_API_KEY no definida
```bash
# En Railway, verifica que la variable esté configurada
railway variables
```

### Error: Archivo CSV no encontrado
```bash
# Verifica que el archivo existe
ls -la data/
# Usa ruta absoluta si es necesario
npm run outreach:create -- --csv "/ruta/completa/al/archivo.csv"
```

### Error: Campaña no encontrada
```bash
# Lista todas las campañas
npx prisma studio
# O consulta directamente
npm run outreach:list
```

## 📊 Métricas y KPIs

### Métricas Clave
- **Deliverability Rate**: (Entregados / Enviados) × 100
- **Open Rate**: (Abiertos / Entregados) × 100
- **Click Rate**: (Clics / Entregados) × 100
- **Response Rate**: (Respuestas / Entregados) × 100

### Reporting
```bash
# Reporte semanal
npm run outreach:report -- --week

# Reporte por país
npm run outreach:report -- --country "España"

# Comparativa de campañas
npm run outreach:compare -- --campaign-ids "abc123,def456"
```

## 🔗 Integración con CRM

Para integrar con sistemas CRM externos:

```bash
# Exportar leads con actividad
npm run outreach:export -- --campaign-id "abc123" --include-activity

# Webhook para notificaciones en tiempo real
npm run outreach:webhook -- --url "https://tu-crm.com/webhook" --events "opened,clicked,replied"
```

## 📞 Próximos Pasos

1. **Configurar webhooks** de Resend para tracking automático
2. **Implementar A/B testing** de subject lines
3. **Añadir templates** para diferentes industrias
4. **Integrar con calendario** para follow-ups
5. **Dashboard de analytics** en tiempo real

---

**⚠️ Importante**: Siempre prueba las campañas con emails de prueba antes del envío masivo.

**📧 Soporte**: Si tienes problemas, contacta al equipo técnico.