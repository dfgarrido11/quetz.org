#!/bin/bash

# Script para configurar cronos de cold emails automáticos
# Envíos programados: Lunes 6 abril y Martes 7 abril 2026 a las 9:00 AM CET

echo "🚀 Configurando cron jobs para cold emails automáticos..."

# Generar el cron job para Monday April 6, 2026 at 9:00 AM CET (8:00 AM UTC)
MONDAY_CRON="0 8 6 4 * cd /home/daniel/proyectos/quetz.org/landing && npx tsx scripts/send-monday-emails.ts"

# Generar el cron job para Tuesday April 7, 2026 at 9:00 AM CET (8:00 AM UTC)
TUESDAY_CRON="0 8 7 4 * cd /home/daniel/proyectos/quetz.org/landing && npx tsx scripts/send-tuesday-emails.ts"

# Backup current crontab
echo "📋 Backing up current crontab..."
crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt

# Add new cron jobs
echo "⏰ Adding cold email cron jobs..."
(crontab -l 2>/dev/null; echo "$MONDAY_CRON") | crontab -
(crontab -l 2>/dev/null; echo "$TUESDAY_CRON") | crontab -

echo "✅ Cron jobs configured successfully!"
echo ""
echo "📅 Scheduled emails:"
echo "   Monday 6 April 2026, 9:00 AM CET - First 10 contacts"
echo "   Tuesday 7 April 2026, 9:00 AM CET - Remaining contacts"
echo ""
echo "📋 View current cron jobs: crontab -l"
echo "🗑️  Remove cron jobs: crontab -e"
echo ""
echo "🚨 IMPORTANT: Make sure these environment variables are available:"
echo "   - RESEND_API_KEY"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"