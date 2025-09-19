# Database Backup Tools

Simple PostgreSQL backup automation for the demo-t3 project using Docker.

## Setup on VPS

1. **Ensure PostgreSQL container is running**:
   ```bash
   docker ps | grep postgres
   # Should show: postgres container running on 127.0.0.1:15432->5432/tcp
   ```

2. **Install the cron job** (creates directories automatically):
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
- **Method**: Uses `docker exec` on postgres container (no version conflicts)
- **Environment**: Uses `.env.production` for database credentials

## Monitoring

- **Logs**: `/opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log`
- **View logs**: `tail -f /opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log`
- **List backups**: `ls -la /opt/demo-t3-shared/db-backup/`

## Restore Example

To restore from a backup:
```bash
# Stop application services that use the database (keep PostgreSQL running)
docker compose -f docker-compose.production.yml --env-file .env.production down

# Restore database using Docker (same approach as backup)
docker exec -i postgres pg_restore \
  -U your_user \
  -d your_database \
  --clean \
  --if-exists \
  < /opt/demo-t3-shared/db-backup/demo_t3_backup_YYYYMMDD_HHMMSS.sql

# Restart the application services
docker compose -f docker-compose.production.yml --env-file .env.production up -d
```

**Why this approach?**
- Uses Docker exec for consistency (same method as backup)
- No PostgreSQL client installation required on host
- No version compatibility issues
- PostgreSQL container stays running during restore

## Troubleshooting

- **Permission denied**: Ensure backup script is executable (`chmod +x backup.sh`)
- **Container not found**: Verify PostgreSQL container is running (`docker ps | grep postgres`)
- **Docker exec failed**: Check that postgres container is healthy (`docker ps` shows "healthy" status)
- **Environment variables**: Check that `.env.production` exists and contains required database variables
- **Disk space**: Monitor `/opt/demo-t3-shared/db-backup/` directory size
- **Backup fails**: Check container logs (`docker logs postgres`)
