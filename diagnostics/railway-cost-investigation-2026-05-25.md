# Railway Cost Investigation — 2026-05-25

## TL;DR
- **Coste mensual esperado:** €25 (~$27) — solo quetz.org + Postgres
- **Coste mensual estimado (al ritmo actual, mes completo):** ~$22–24/mes
- **Proyectado a 31 días:** $23–26/mes (~€22–24)
- **Diferencia:** Dentro del presupuesto nominal, pero con 11 servicios activos en lugar de 2
- **Causa principal:** Postiz + Temporal + n8n corriendo 24/7, más dos proyectos huérfanos (logisweb) que drenan ~$2/mes sin producir nada

---

## Inventario de proyectos

| Proyecto | Servicios activos | Estado | Coste estimado mayo (parcial) | ¿Necesario? |
|----------|-------------------|--------|-------------------------------|-------------|
| overflowing-fascination | 8 servicios (ver abajo) | Activo | ~$16.32 | PRINCIPAL |
| bountiful-luck | logisweb + Postgres | Sospechoso | ~$0.95 | **REVISAR** |
| skillful-emotion | web (logisweb frontend) | Sospechoso | ~$0.81 | **REVISAR** |

### Detalle: overflowing-fascination (proyecto quetz.org)

| Servicio | ID | Creado | CPU (vCPU-min) | Mem (GB-min) | Net TX (GB) | Est. coste/mes |
|----------|----|--------|----------------|--------------|-------------|----------------|
| **postiz** | 749641d5 | 2026-05-15 | 2367 | 34,904 | 0.18 | **$9.18** |
| **n8n** | 67e130bc | 2026-03-26 | 39 | 12,522 | ~0 | **$2.91** |
| temporal | cdfe9e0b | 2026-05-16 | 344 | 3,541 | 6.08 | $1.58 |
| Postgres (main) | 8c24e021 | 2026-03-26 | 78 | 3,592 | 3.29 | $1.19 |
| quetz.org | 3545d088 | 2026-03-25 | 8 | 3,606 | 0.35 | $0.87 |
| Postgres-gRdU (n8n DB) | 8b918c14 | 2026-03-26 | 8 | 1,259 | ~0 | $0.29 |
| empowering-commitment | 9267a5be | 2026-03-26 | 1 | 1,096 | ~0 | $0.25 |
| Redis | 104e7771 | 2026-05-15 | 78 | 72 | ~0 | $0.05 |
| **TOTAL** | | | | | | **$16.32** |

> Nota: postiz y temporal fueron añadidos el 15–16 mayo (solo ~10 días de datos).
> Proyectado al mes completo solo postiz costaría ~$22–28/mes.

### Detalle: bountiful-luck

| Servicio | Est. coste/mes |
|----------|----------------|
| logisweb (Node.js app) | $0.69 |
| Postgres | $0.26 |
| **TOTAL** | **$0.95** |

### Detalle: skillful-emotion

| Servicio | Est. coste/mes |
|----------|----------------|
| web (domain: www.logisweb.org) | $0.81 |
| **TOTAL** | **$0.81** |

---

## Servicios huérfanos / sospechosos detectados

### 🔴 SOSPECHOSO: bountiful-luck + skillful-emotion (logisweb.org)

- `bountiful-luck/logisweb` — Node.js app con variables placeholder:
  - `BREVO_API_KEY = your_brevo_api_key_here` ← nunca configurado
  - `N8N_WEBHOOK_URL = http://localhost:5678/webhook` ← apuntando a localhost
  - `POSTGRESQL_URL = postgresql://user:password@localhost:5432/logisweb_db` ← placeholder
  - **Conclusión: experimento nunca completado, corriendo indefinidamente**
- `skillful-emotion/web` — frontend de logisweb con logs de `Parse Error` constantes
  - Domain: `www.logisweb.org`
  - No hay usuarios; app rota
  - **Conclusión: muerto y sin usar**

### 🟡 REVISAR: postiz + Redis + temporal (añadidos 15–16 mayo)

- Postiz es una plataforma de social media scheduling de código abierto
- Temporal es su motor de workflow (gestiona colas para reddit, twitter/X, devto, gmb, etc.)
- Si fue un experimento → costaría ~$11–13/mes adicionales al proyectarlo a un mes completo
- Si es intencional → decidir si el valor lo justifica

### 🟡 REVISAR: n8n + Postgres-gRdU (desde marzo)

- n8n lleva corriendo desde el 26 de marzo (~2 meses)
- Cuesta ~$3.20/mes (n8n + su Postgres dedicado)
- Si no se usa activamente → candidato a cortar

### ✅ OK: empowering-commitment (Go service)

- Es un servicio Go que refresca una caché de recomendaciones de modelos cada ~4h
- Relacionado con quetz.org (sabe la URL de quetz.org, n8n y postiz)
- Bajo consumo ($0.25/mes) — probablemente necesario para quetz.org

---

## Top 3 servicios que más consumen

1. **postiz** — $9.18/mes actuales → proyectado: ~$22–28/mes completo (solo lleva 10 días)
2. **n8n** — $2.91/mes — corriendo desde marzo
3. **temporal** — $1.58/mes (requerido por postiz, 6 GB network egress = $0.60)

---

## Proyección a mes completo (estimación)

| Proyecto | Coste mes completo |
|----------|--------------------|
| overflowing-fascination | ~$35–40 (postiz domina) |
| bountiful-luck | ~$1.15 |
| skillful-emotion | ~$0.95 |
| **TOTAL sin cortes** | **~$37–42/mes** |

> Esto supera el presupuesto de $27/mes. El mes actual (mayo) está contenido porque
> postiz solo lleva 10 días, pero en junio se dispararía si no se actúa.

---

## Recomendaciones priorizadas

### Acción inmediata — cortar hoy si son experimentos

**Opción A: eliminar postiz + Redis + temporal + Postgres-gRdU si no se usan**
- Ahorro: ~$11–13/mes (o ~$22–28 en junio si se dejan correr)
- Estos 4 servicios fueron añadidos hace 10 días — ¿fue un experimento?

**Opción B: eliminar proyectos logisweb (bountiful-luck + skillful-emotion)**
- Ahorro: ~$1.76/mes
- Evidencia de abandono: variables placeholder, logs de Parse Error, no hay usuarios

### Acción esta semana

- **Decidir sobre n8n**: si no se usa activamente, eliminar junto con su Postgres ($3.20/mes)
- **Revisar postiz**: si se quiere mantener, considerar moverlo a una instancia más pequeña o usar la versión cloud de Postiz en lugar de self-hosted

### Optimización opcional

- **empowering-commitment**: verificar si sigue siendo necesario en quetz.org. Si no, son $0.25/mes libres.
- Considerar pasar n8n a plan "sleep when inactive" si Railway lo ofrece en el futuro

---

## Escenario recomendado (para quedar en $10–15/mes)

Si el objetivo es **solo quetz.org en producción**:

| Mantener | Eliminar |
|----------|----------|
| quetz.org | postiz + Redis + temporal |
| Postgres (main) | n8n + Postgres-gRdU |
| empowering-commitment | bountiful-luck (logisweb completo) |
| — | skillful-emotion (logisweb frontend) |

Coste resultante: ~$2.36/mes en uso + $5 base = **~$7.36/mes** (bien por debajo de $27)

---

## Comandos exactos para ejecutar los cortes

> ⚠️ ADVERTENCIA: No ejecutar estos comandos sin confirmación. Son destructivos e irreversibles.

```bash
# === CORTAR proyectos huérfanos de logisweb ===

# Proyecto bountiful-luck (logisweb + Postgres)
railway link --project bountiful-luck
# Eliminar servicios individualmente o el proyecto entero:
railway service delete logisweb
railway service delete Postgres
# O eliminar todo el proyecto:
# railway project delete

# Proyecto skillful-emotion (web frontend logisweb)
railway link --project skillful-emotion
railway service delete web
# O eliminar todo el proyecto:
# railway project delete

# === CORTAR postiz stack (si fue experimento) ===
railway link --project overflowing-fascination
railway service delete postiz
railway service delete Redis
railway service delete temporal
railway service delete Postgres-gRdU

# === CORTAR n8n stack (si no se usa) ===
railway link --project overflowing-fascination
railway service delete n8n
# Ojo: Postgres-gRdU es la DB de n8n — eliminar junto con n8n
railway service delete Postgres-gRdU
```

---

## Annexos

### Output crudo de `railway list`

```
dfgarrido11's Projects
  overflowing-fascination    (quetz.org, n8n, postiz, Redis, Postgres×2, temporal, empowering-commitment)
  bountiful-luck             (logisweb, Postgres)
  skillful-emotion           (web — frontend logisweb)
```

### Query GraphQL: Projects completa

```json
Proyecto overflowing-fascination (id: c5559a47-cb7f-4aa4-9e82-8340990782ab):
  Creado: 2026-03-25 | Environments: production
  Servicios (8):
    - Redis                  (id: 104e7771, creado: 2026-05-15)
    - quetz.org              (id: 3545d088, creado: 2026-03-25)
    - n8n                    (id: 67e130bc, creado: 2026-03-26)
    - postiz                 (id: 749641d5, creado: 2026-05-15)
    - Postgres-gRdU (n8n DB) (id: 8b918c14, creado: 2026-03-26)
    - Postgres (main)        (id: 8c24e021, creado: 2026-03-26)
    - empowering-commitment  (id: 9267a5be, creado: 2026-03-26)
    - temporal               (id: cdfe9e0b, creado: 2026-05-16)

Proyecto bountiful-luck (id: a6fe3297-5f2f-4c52-baf5-7b4d009f1f96):
  Creado: 2026-03-23 | Environments: production
  Servicios (2):
    - logisweb  (id: 15bd09a7, creado: 2026-03-23)
    - Postgres  (id: a0e581d7, creado: 2026-03-23)

Proyecto skillful-emotion (id: a2898a37-48e7-45b3-ac0c-9ee6cf7c1be9):
  Creado: 2026-03-23 | Environments: production
  Servicios (1):
    - web (id: b67ae575, creado: 2026-03-23, domain: www.logisweb.org)
```

### Señales de abandono detectadas en logisweb

```
logisweb variables:
  BREVO_API_KEY = your_brevo_api_key_here     ← placeholder
  N8N_WEBHOOK_URL = http://localhost:5678/... ← localhost, no conectado
  POSTGRESQL_URL = postgresql://user:pass...  ← placeholder

skillful-emotion/web logs:
  Error: Parse Error (socketOnEnd) - corriendo pero roto
```

### Señal de que temporal está activo para postiz

```
temporal logs (activos ahora mismo):
  task queues: devto, gmb, reddit, hashnode, twitch, x, nostr, skool, whop...
  → Postiz usa Temporal para gestionar publicaciones en todas estas redes
```
