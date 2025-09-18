# Database Backup Tools

Simple PostgreSQL backup automation for the demo-t3 project.

## Setup on VPS

1. **Install PostgreSQL client tools** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install postgresql-client
   ```

2. **Create backup and logs directories**:
   ```bash
   sudo mkdir -p /opt/demo-t3-shared/db-backup /opt/demo-t3-shared/db-backup-logs
   sudo chown $USER:$USER /opt/demo-t3-shared/db-backup /opt/demo-t3-shared/db-backup-logs
   ```

3. **Install the cron job**:
   ```bash
   cd /opt/demo-t3/tools/db-backup
   ./install-cron.sh
   ```

## Manual Backup

To run a backup manually:
```bash
./backup.sh
```

## Configuration

- **Backup location**: `/opt/demo-t3-shared/db-backup/`
- **Schedule**: Daily at 2:30 AM
- **Retention**: 7 days (configurable in `backup.sh`)
- **Format**: PostgreSQL custom format with compression
- **Environment**: Uses `.env.production` for database credentials

## Monitoring

- **Logs**: `/opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log`
- **View logs**: `tail -f /opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log`
- **List backups**: `ls -la /opt/demo-t3-shared/db-backup/`

## Restore Example

To restore from a backup:
```bash
# Stop application services that use the database (keep PostgreSQL running)
docker compose -f docker-compose.production.yml down

# Restore database (PostgreSQL container stays running)
PGPASSWORD="your_password" pg_restore \
  -h localhost \
  -p 15432 \
  -U your_user \
  -d your_database \
  --clean \
  --if-exists \
  /opt/demo-t3-shared/db-backup/demo_t3_backup_YYYYMMDD_HHMMSS.sql

# Restart the application services
docker compose -f docker-compose.production.yml up -d
```

**Why stop the apps?**
- Prevents active database connections during restore
- Avoids data corruption from concurrent writes
- Ensures clean application startup with restored data
- PostgreSQL container (in `docker-compose.data.production.yml`) continues running

## Troubleshooting

- **Permission denied**: Ensure backup script is executable (`chmod +x backup.sh`)
- **Connection refused**: Verify PostgreSQL container is running and port 15432 is accessible
- **Environment variables**: Check that `.env.production` exists and contains required database variables
- **Disk space**: Monitor `/opt/demo-t3-shared/db-backup/` directory size
