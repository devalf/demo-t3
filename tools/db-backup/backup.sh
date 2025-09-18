#!/bin/bash

# PostgreSQL Database Backup Script
# Backs up the demo-t3 database running in Docker

set -e

# Configuration
BACKUP_DIR="/opt/demo-t3-shared/db-backup"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Load environment variables from production config
ENV_FILE="$(dirname "$0")/../../.env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env.production file not found at $ENV_FILE"
    exit 1
fi

# Source environment variables
set -a
source "$ENV_FILE"
set +a

# Validate required environment variables
if [ -z "$NX_PUBLIC_AUTH_DB_POSTGRES_DB" ] || [ -z "$NX_PUBLIC_AUTH_DB_POSTGRES_USER" ] || [ -z "$NX_PUBLIC_AUTH_DB_POSTGRES_PASSWORD" ]; then
    echo "Error: Required database environment variables not set"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/demo_t3_backup_$DATE.sql"

echo "Starting PostgreSQL backup..."
echo "Database: $NX_PUBLIC_AUTH_DB_POSTGRES_DB"
echo "Backup file: $BACKUP_FILE"

# Perform backup using pg_dump via docker exec
# The database is accessible on localhost:15432 as per docker-compose.data.production.yml
PGPASSWORD="$NX_PUBLIC_AUTH_DB_POSTGRES_PASSWORD" pg_dump \
    -h localhost \
    -p 15432 \
    -U "$NX_PUBLIC_AUTH_DB_POSTGRES_USER" \
    -d "$NX_PUBLIC_AUTH_DB_POSTGRES_DB" \
    --verbose \
    --no-password \
    --format=custom \
    --compress=9 \
    > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"

    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"

    # Clean up old backups (older than RETENTION_DAYS)
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "demo_t3_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete

    echo "Backup process completed successfully"
else
    echo "Error: Backup failed"
    exit 1
fi
