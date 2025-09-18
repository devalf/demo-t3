#!/bin/bash

# Install daily database backup cron job
# Run this script on your VPS to set up automated backups

set -e

# Get the absolute path to the backup script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"

echo "Setting up daily database backup cron job..."

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"

# Create temporary cron file
TEMP_CRON=$(mktemp)

# Get current crontab (if exists)
crontab -l > "$TEMP_CRON" 2>/dev/null || true

# Remove any existing demo-t3 backup cron jobs
sed -i '/demo-t3.*backup/d' "$TEMP_CRON"

# Add new cron job (daily at 2:30 AM)
echo "30 2 * * * $BACKUP_SCRIPT >> /opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log 2>&1" >> "$TEMP_CRON"

# Install the new crontab
crontab "$TEMP_CRON"

# Clean up
rm "$TEMP_CRON"

echo "Cron job installed successfully!"
echo "Daily backup will run at 2:30 AM"
echo "Logs will be written to /opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log"
echo ""
echo "To view the installed cron job:"
echo "  crontab -l"
echo ""
echo "To check backup logs:"
echo "  tail -f /opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log"