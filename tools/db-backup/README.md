# Database Backup Tools

Automated PostgreSQL backup with GPG encryption for the demo-t3 project using Docker.

### 5. Install the Cron Job

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
- **Format**: PostgreSQL custom format with compression, encrypted with GPG
- **File extension**: `.sql.gpg` (encrypted)
- **Encryption**: GPG asymmetric encryption (public key on server, private key offline)
- **Method**: Uses `docker exec` on postgres container (no version conflicts)
- **Environment**: Uses `.env.production` for database credentials and GPG recipient

## Monitoring

- **Logs**: `/opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log`
- **View logs**: `tail -f /opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log`
- **List backups**: `ls -lh /opt/demo-t3-shared/db-backup/`
- **Backup files**: Named `demo_t3_backup_YYYYMMDD_HHMMSS.sql.gpg`

## Restore Example

To restore from an encrypted backup:

### 1. Download Backup from the VPS

```bash
# Download encrypted backup
scp user@your-vps:/opt/demo-t3-shared/db-backup/demo_t3_backup_YYYYMMDD_HHMMSS.sql.gpg ~/Downloads/
```

### 2. Decrypt Backup (e.g. local machine)

```bash
# Decrypt using your private key (will ask for GPG key passphrase)
gpg --decrypt ~/Downloads/demo_t3_backup_YYYYMMDD_HHMMSS.sql.gpg > ~/Downloads/backup.sql

# Verify decryption succeeded
ls -lh ~/Downloads/backup.sql
```

### 3. Upload Decrypted Backup to the VPS

```bash
# Upload to server
scp ~/Downloads/backup.sql user@your-vps:/tmp/

```

### 4. Restore Database on the VPS

```bash
docker compose -f docker-compose.production.yml --env-file .env.production down

# Restore database using Docker
docker exec -i postgres pg_restore \
  -U ${NX_PUBLIC_AUTH_DB_POSTGRES_USER} \
  -d ${NX_PUBLIC_AUTH_DB_POSTGRES_DB} \
  --clean \
  --if-exists \
  < /tmp/backup.sql

# Clean up
rm /tmp/backup.sql

# Restart the application services
docker compose -f docker-compose.production.yml --env-file .env.production up -d
```

**Security Notes:**
- Backups are encrypted with GPG asymmetric encryption
- Only the private key holder can decrypt backups
- Even if server is compromised, backups remain encrypted and secure
- Always delete decrypted backups after use

## Troubleshooting

- **Permission denied**: Ensure backup script is executable (`chmod +x backup.sh`)
- **Container not found**: Verify PostgreSQL container is running (`docker ps | grep postgres`)
- **Docker exec failed**: Check that postgres container is healthy (`docker ps` shows "healthy" status)
- **Environment variables**: Check that `.env.production` exists and contains `NX_PUBLIC_BACKUP_GPG_RECIPIENT`
- **GPG key not found**: Verify public key is imported (`gpg --list-keys`)
- **GPG encryption fails**: Check that GPG recipient matches imported key (`gpg --list-keys | grep backup@demo-t3.local`)
- **Cannot decrypt**: Ensure you have the private key on your local machine (`gpg --list-secret-keys`)
- **Disk space**: Monitor `/opt/demo-t3-shared/db-backup/` directory size
- **Backup fails**: Check container logs (`docker logs postgres`) and backup logs
