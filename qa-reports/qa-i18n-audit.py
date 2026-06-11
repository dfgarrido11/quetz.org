#!/usr/bin/env python3
"""
QA i18n Audit — quetz.org
Detecta texto en español en un sitio que debería estar en alemán (audiencia DACH)
"""

import asyncio
import re
import json
import os
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "https://quetz.org"
REPORT_DIR = Path("/home/daniel/proyectos/quetz.org/qa-reports")
DATE_STR = datetime.now().strftime("%Y-%m-%d")
REPORT_MD = REPORT_DIR / f"qa-i18n-{DATE_STR}.md"
SCREENSHOTS_DIR = REPORT_DIR / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)

# Palabras delatoras de español (evitar falsos positivos con nombres propios)
SPANISH_WORDS = re.compile(
    r'\b(el|la|los|las|un|una|unos|unas|para|con|por|del|de la|de los|al|'
    r'tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras|mi|mis|'
    r'árbol|arboles|árboles|bosque|planta[rs]?|plantar|'
    r'regalar|regalo|regalos|empresa|empresas|'
    r'gratis|ahora|comprar|ver más|siguiente|anterior|'
    r'inicio|inicio\.|bienvenido|bienvenida|'
    r'precio|precios|pagar|pago|carrito|tienda|'
    r'certificado|transparencia|'
    r'haz clic|hacer clic|haga clic|'
    r'enviar|guardar|cancelar|aceptar|rechazar|'
    r'seleccionar|seleccione|'
    r'nombre|apellido|correo|teléfono|dirección|'
    r'contraseña|usuario|cuenta|'
    r'más información|leer más|saber más|'
    r'contacto|contáctanos|'
    r'sobre nosotros|quiénes somos|'
    r'política|privacidad|términos|condiciones|'
    r'descarga[r]?|descargar|'
    r'siguiente paso|paso siguiente)',
    re.IGNORECASE
)

SPANISH_PHRASES = [
    "haz clic", "hacer clic", "más información", "ver más", "leer más",
    "saber más", "sobre nosotros", "quiénes somos", "política de privacidad",
    "términos y condiciones", "correo electrónico", "nombre completo",
    "siguiente paso", "paso anterior", "añadir al carrito", "añadir a",
    "tu pedido", "tu cuenta", "tu perfil", "bienvenido a", "bienvenida a",
    "gracias por", "te hemos enviado", "hemos enviado", "por favor",
    "ingresa tu", "escribe tu", "introduce tu", "selecciona", "elige",
    "empresa" , "compra ahora", "regalar ahora", "descubre", "conoce",
    "explora", "únete", "regístrate", "inicia sesión", "cerrar sesión",
    "descuento", "oferta", "precio especial", "árbol adoptado",
    "mis árboles", "mis bosques", "mi cuenta", "mi perfil",
    "¿", "!", "es decir", "es un", "es una", "para ti", "para tu",
    "para sus", "para la", "para el", "para los", "para las",
]

# Ignorar nombres propios y palabras técnicas
IGNORE_WORDS = {
    "quetzito", "zacapa", "guatemala", "daniel", "garrido", "quetz",
    "data", "email", "ok", "id", "co2", "co₂", "api", "url", "html",
    "css", "js", "png", "jpg", "svg", "pdf", "qr", "nfc",
    # palabras alemanas que parecen español
    "am", "an", "das", "der", "des", "den",
    # Palabras que pueden ser alemán e ignorar
    "la" ,  # también puede ser nota musical en alemán
}

def is_spanish(text: str) -> list[str]:
    """Detecta fragmentos en español en el texto dado."""
    if not text or len(text.strip()) < 3:
        return []

    hits = []
    text_lower = text.lower()

    # Frases completas primero (más confiable)
    for phrase in SPANISH_PHRASES:
        if phrase in text_lower:
            hits.append(f"FRASE: '{phrase}'")

    # Palabras individuales
    words = re.findall(r'\b\w+\b', text_lower)
    for word in words:
        if word in IGNORE_WORDS:
            continue
        if SPANISH_WORDS.match(word) and len(word) > 2:
            hits.append(f"PALABRA: '{word}'")

    return list(set(hits))


ROUTES = [
    ("/", "Homepage"),
    ("/empresas", "CSR Partner"),
    ("/firmengeschenk", "Firmengeschenk"),
    ("/shop", "Shop"),
    ("/regalar", "Regalar / Schenken"),
    ("/carrito", "Carrito / Warenkorb"),
    ("/mi-bosque", "Mi Bosque"),
    ("/transparencia", "Transparencia"),
    ("/auth/login", "Login"),
    ("/agb", "AGB"),
    ("/datenschutz", "Datenschutz"),
    ("/impressum", "Impressum"),
    ("/zertifikat/QZ-2026-00001", "Zertifikat"),
    ("/esta-pagina-no-existe", "404 Error"),
]

findings = []
screenshot_counter = [0]

async def take_screenshot(page, label: str, tag: str = "") -> str:
    screenshot_counter[0] += 1
    safe_label = re.sub(r'[^a-z0-9_-]', '_', (label + tag).lower())[:50]
    fname = f"{screenshot_counter[0]:03d}_{safe_label}.png"
    fpath = SCREENSHOTS_DIR / fname
    await page.screenshot(path=str(fpath), full_page=False)
    return fname


async def audit_page(page, route: str, name: str, viewport: dict, vp_label: str):
    url = BASE_URL + route
    print(f"  [{vp_label}] {url}")

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(2)  # esperar JS
    except Exception as e:
        print(f"    ERROR cargando: {e}")
        findings.append({
            "url": url, "route": route, "name": name, "viewport": vp_label,
            "severity": "ALTO", "text_es": "ERROR DE CARGA",
            "location": "página completa", "suggestion": str(e),
            "screenshot": ""
        })
        return

    # Scroll para activar lazy-load
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    await asyncio.sleep(1)
    await page.evaluate("window.scrollTo(0, 0)")
    await asyncio.sleep(1)

    # Obtener meta tags del HTML
    meta_data = await page.evaluate("""() => {
        const metas = {};
        document.querySelectorAll('meta[name], meta[property]').forEach(m => {
            const key = m.getAttribute('name') || m.getAttribute('property');
            metas[key] = m.getAttribute('content') || '';
        });
        metas['title'] = document.title || '';
        return metas;
    }""")

    # Revisar meta tags
    for key, val in meta_data.items():
        if not val:
            continue
        hits = is_spanish(val)
        if hits:
            sshot = await take_screenshot(page, name, "_meta")
            severity = "BAJO"
            findings.append({
                "url": url, "route": route, "name": name, "viewport": vp_label,
                "severity": severity,
                "text_es": val[:200],
                "location": f"meta tag: {key}",
                "suggestion": f"Traducir al alemán (Sie-Form): '{val[:100]}'",
                "screenshot": sshot,
                "hits": hits
            })

    # Obtener TODO el texto visible
    text_nodes = await page.evaluate("""() => {
        const results = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    const tag = parent.tagName.toLowerCase();
                    if (['script', 'style', 'noscript'].includes(tag)) return NodeFilter.FILTER_REJECT;
                    const style = window.getComputedStyle(parent);
                    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (text.length > 2) {
                const el = node.parentElement;
                results.push({
                    text: text,
                    tag: el.tagName.toLowerCase(),
                    className: el.className ? el.className.toString().substring(0, 100) : '',
                    id: el.id || '',
                });
            }
        }
        return results;
    }""")

    # Revisar placeholders e inputs
    input_data = await page.evaluate("""() => {
        const results = [];
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.placeholder) results.push({text: el.placeholder, location: 'placeholder', type: el.type || el.tagName});
            if (el.title) results.push({text: el.title, location: 'title attr', type: el.type || el.tagName});
            const label = document.querySelector(`label[for="${el.id}"]`);
            if (label) results.push({text: label.textContent, location: 'label', type: el.type || el.tagName});
        });
        return results;
    }""")

    # Revisar aria-labels y alt texts
    aria_data = await page.evaluate("""() => {
        const results = [];
        document.querySelectorAll('[aria-label]').forEach(el => {
            results.push({text: el.getAttribute('aria-label'), location: 'aria-label', tag: el.tagName.toLowerCase()});
        });
        document.querySelectorAll('img[alt]').forEach(el => {
            results.push({text: el.getAttribute('alt'), location: 'img alt', tag: 'img'});
        });
        document.querySelectorAll('[aria-placeholder]').forEach(el => {
            results.push({text: el.getAttribute('aria-placeholder'), location: 'aria-placeholder', tag: el.tagName.toLowerCase()});
        });
        return results;
    }""")

    # Procesar todos los textos
    all_checks = []
    for node in text_nodes:
        all_checks.append((node['text'], f"{node['tag']}.{node['className'][:40]}", "MEDIO"))
    for item in input_data:
        all_checks.append((item['text'], f"{item['location']} ({item['type']})", "CRÍTICO"))
    for item in aria_data:
        all_checks.append((item['text'], f"{item['location']} <{item['tag']}>", "BAJO"))

    page_findings_texts = set()
    for text, location, base_severity in all_checks:
        if not text or len(text.strip()) < 3:
            continue
        hits = is_spanish(text)
        if not hits:
            continue

        # Evitar duplicados exactos
        key = text.strip()[:100]
        if key in page_findings_texts:
            continue
        page_findings_texts.add(key)

        # Determinar severidad por contexto
        severity = base_severity
        loc_lower = location.lower()
        if any(k in loc_lower for k in ['button', 'btn', 'cta', 'checkout', 'carrito', 'comprar', 'placeholder', 'label']):
            severity = "CRÍTICO"
        elif any(k in loc_lower for k in ['nav', 'header', 'hero', 'h1', 'h2']):
            severity = "ALTO"
        elif 'footer' in loc_lower:
            severity = "MEDIO"

        sshot = await take_screenshot(page, name, f"_{len(findings)}")

        # Sugerir traducción básica
        suggestion = generar_sugerencia(text.strip())

        print(f"    [HALLAZGO {severity}] '{text[:60]}' en {location[:60]}")
        findings.append({
            "url": url, "route": route, "name": name, "viewport": vp_label,
            "severity": severity,
            "text_es": text.strip()[:300],
            "location": location[:200],
            "suggestion": suggestion,
            "screenshot": sshot,
            "hits": hits
        })


def generar_sugerencia(text: str) -> str:
    """Sugerencias de traducción básicas para los casos más comunes."""
    mapping = {
        "comprar": "Kaufen", "regalar": "Verschenken", "empresa": "Unternehmen",
        "empresas": "Unternehmen", "carrito": "Warenkorb", "tienda": "Shop",
        "árbol": "Baum", "bosque": "Wald", "plantar": "Pflanzen",
        "inicio": "Startseite", "precio": "Preis", "precios": "Preise",
        "para": "für", "gratis": "kostenlos", "ahora": "jetzt",
        "siguiente": "Weiter", "anterior": "Zurück", "cancelar": "Abbrechen",
        "aceptar": "Akzeptieren", "rechazar": "Ablehnen", "enviar": "Senden",
        "guardar": "Speichern", "seleccionar": "Auswählen",
        "nombre": "Name", "correo": "E-Mail", "contraseña": "Passwort",
        "ver más": "Mehr anzeigen", "leer más": "Mehr lesen",
        "más información": "Mehr erfahren", "saber más": "Mehr erfahren",
        "contacto": "Kontakt", "sobre nosotros": "Über uns",
        "política de privacidad": "Datenschutzerklärung",
        "términos y condiciones": "AGB", "inicia sesión": "Anmelden",
        "regístrate": "Registrieren", "cerrar sesión": "Abmelden",
        "bienvenido": "Willkommen", "gracias": "Danke",
        "por favor": "Bitte", "certificado": "Zertifikat",
        "transparencia": "Transparenz", "mi cuenta": "Mein Konto",
        "mis árboles": "Meine Bäume",
    }

    text_lower = text.lower()
    for es, de in mapping.items():
        if es in text_lower:
            return f"Probablemente: '{de}' (revisar contexto)"
    return "Revisar y traducir al alemán (Sie-Form)"


async def check_redirect(page, route_from: str, route_to: str) -> dict:
    """Verifica que una URL redireccione correctamente."""
    url = BASE_URL + route_from
    response = await page.goto(url, wait_until="domcontentloaded", timeout=15000)
    final_url = page.url
    redirected = route_to in final_url
    return {
        "from": url,
        "to": final_url,
        "expected": BASE_URL + route_to,
        "ok": redirected,
        "status": response.status if response else "N/A"
    }


async def main():
    print(f"\n{'='*60}")
    print("QA i18n AUDIT — quetz.org")
    print(f"Fecha: {DATE_STR}")
    print(f"{'='*60}\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        viewports = [
            ({"width": 1440, "height": 900}, "desktop"),
            ({"width": 375, "height": 667}, "mobile"),
        ]

        redirects_to_check = []

        for viewport, vp_label in viewports:
            print(f"\n--- VIEWPORT: {vp_label} ({viewport['width']}x{viewport['height']}) ---")

            context = await browser.new_context(
                viewport=viewport,
                locale="de-DE",
                extra_http_headers={
                    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8"
                }
            )
            page = await context.new_page()

            for route, name in ROUTES:
                await audit_page(page, route, name, viewport, vp_label)

            # Solo en desktop verificar redirect
            if vp_label == "desktop":
                try:
                    r = await check_redirect(page, "/empresas-b2b", "/empresas")
                    redirects_to_check.append(r)
                except Exception as e:
                    redirects_to_check.append({"from": "/empresas-b2b", "error": str(e)})

            await context.close()

        await browser.close()

    # Generar reporte
    generate_report(findings, redirects_to_check)
    print(f"\nReporte generado: {REPORT_MD}")
    return findings


def severity_order(s):
    order = {"CRÍTICO": 0, "ALTO": 1, "MEDIO": 2, "BAJO": 3}
    return order.get(s, 99)


def generate_report(all_findings: list, redirects: list):
    findings_sorted = sorted(all_findings, key=lambda x: severity_order(x['severity']))

    counts = {"CRÍTICO": 0, "ALTO": 0, "MEDIO": 0, "BAJO": 0}
    for f in findings_sorted:
        counts[f['severity']] = counts.get(f['severity'], 0) + 1

    # Agrupar por URL
    by_url = {}
    for f in findings_sorted:
        key = f"{f['url']} [{f['viewport']}]"
        by_url.setdefault(key, []).append(f)

    lines = []
    lines.append(f"# QA i18n Audit — quetz.org")
    lines.append(f"**Fecha:** {DATE_STR}  ")
    lines.append(f"**Auditor:** Claude Code QA Agent  ")
    lines.append(f"**Alcance:** Detección de contenido en español en sitio DACH (alemán)  ")
    lines.append("")

    lines.append("## Resumen Ejecutivo")
    lines.append("")
    lines.append(f"| Severidad | Hallazgos |")
    lines.append(f"|-----------|-----------|")
    lines.append(f"| 🔴 CRÍTICO | {counts['CRÍTICO']} |")
    lines.append(f"| 🟠 ALTO | {counts['ALTO']} |")
    lines.append(f"| 🟡 MEDIO | {counts['MEDIO']} |")
    lines.append(f"| 🟢 BAJO | {counts['BAJO']} |")
    lines.append(f"| **TOTAL** | **{sum(counts.values())}** |")
    lines.append("")

    # Tabla principal
    lines.append("## Hallazgos por Página")
    lines.append("")
    lines.append("| URL | Viewport | Severidad | Texto ES encontrado | Ubicación | Traducción DE sugerida | Screenshot |")
    lines.append("|-----|----------|-----------|---------------------|-----------|------------------------|------------|")

    for f in findings_sorted:
        text_es = f['text_es'].replace('|', '\\|').replace('\n', ' ')[:100]
        location = f['location'].replace('|', '\\|')[:80]
        suggestion = f['suggestion'].replace('|', '\\|')[:80]
        sshot = f"[ver](screenshots/{f['screenshot']})" if f['screenshot'] else "—"
        sev_icon = {"CRÍTICO": "🔴", "ALTO": "🟠", "MEDIO": "🟡", "BAJO": "🟢"}.get(f['severity'], "⚪")

        lines.append(
            f"| `{f['route']}` | {f['viewport']} | {sev_icon} {f['severity']} "
            f"| {text_es} | {location} | {suggestion} | {sshot} |"
        )

    lines.append("")

    # Verificación de redirects
    lines.append("## Verificación de Redirects")
    lines.append("")
    for r in redirects:
        if "error" in r:
            lines.append(f"- ❌ `{r['from']}` → ERROR: {r['error']}")
        elif r['ok']:
            lines.append(f"- ✅ `{r['from']}` → `{r['to']}` (correcto)")
        else:
            lines.append(f"- ❌ `{r['from']}` → `{r['to']}` (esperado: `{r['expected']}`)")
    lines.append("")

    # Archivos del repo donde buscar los strings
    lines.append("## Archivos del Repo — Dónde Buscar")
    lines.append("")
    lines.append("Basado en los hallazgos, revisar estos paths:")
    lines.append("")

    route_to_files = {
        "/": ["landing/app/page.tsx", "landing/components/hero*", "landing/components/navbar*"],
        "/empresas": ["landing/app/empresas/page.tsx", "landing/app/csr-partner/page.tsx"],
        "/firmengeschenk": ["landing/app/firmengeschenk/page.tsx"],
        "/shop": ["landing/app/shop/**", "landing/components/shop*"],
        "/regalar": ["landing/app/regalar/page.tsx"],
        "/carrito": ["landing/app/carrito/**"],
        "/mi-bosque": ["landing/app/mi-bosque/**"],
        "/transparencia": ["landing/app/transparencia/page.tsx"],
        "/auth/login": ["landing/app/auth/**"],
        "/agb": ["landing/app/agb/page.tsx"],
        "/datenschutz": ["landing/app/datenschutz/page.tsx"],
        "/impressum": ["landing/app/impressum/page.tsx"],
        "/zertifikat/QZ-2026-00001": ["landing/app/zertifikat/**"],
    }

    routes_with_findings = set(f['route'] for f in findings_sorted)
    for route in routes_with_findings:
        files = route_to_files.get(route, [f"landing/app{route}/**"])
        lines.append(f"**`{route}`:**")
        for f in files:
            lines.append(f"  - `{f}`")

    lines.append("")
    lines.append("### Comandos grep útiles")
    lines.append("```bash")
    lines.append('# Buscar frases en español en el repo')
    lines.append('grep -r "para tu\\|para la\\|ver más\\|compra ahora\\|regalar" landing/ --include="*.tsx" --include="*.ts" -l')
    lines.append('grep -r "empresa\\|carrito\\|tienda" landing/ --include="*.tsx" -l')
    lines.append('# Buscar en archivos de traducciones')
    lines.append('find landing/ -name "*.json" | xargs grep -l "es" 2>/dev/null')
    lines.append('find landing/ -name "i18n*" -o -name "translations*" -o -name "messages*" 2>/dev/null')
    lines.append("```")
    lines.append("")

    lines.append("## Notas del Auditor")
    lines.append("")
    lines.append("- Auditoría realizada con `Accept-Language: de-DE`")
    lines.append("- Viewports testeados: desktop (1440x900) y mobile (375x667)")
    lines.append("- Screenshots disponibles en `qa-reports/screenshots/`")
    lines.append("- Esta es una auditoría automática — revisar falsos positivos antes de corregir")
    lines.append("")

    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")

    # También guardar JSON para análisis posterior
    json_path = REPORT_DIR / f"qa-i18n-{DATE_STR}.json"
    json_path.write_text(json.dumps(findings_sorted, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"JSON guardado: {json_path}")


if __name__ == "__main__":
    asyncio.run(main())
