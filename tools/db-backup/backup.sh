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
if [ -z "$NX_PUBLIC_AUTH_DB_POSTGRES_DB" ] || [ -z "$NX_PUBLIC_AUTH_DB_POSTGRES_USER" ] || [ -z "$NX_PUBLIC_AUTH_DB_POSTGRES_PASSWORD" ] || [ -z "$NX_PUBLIC_AUTH_DB_POSTGRES_HOST" ] || [ -z "$NX_PUBLIC_AUTH_DB_POSTGRES_PORT" ]; then
    echo "Error: Required database environment variables not set"
    exit 1
fi

if [ -z "$NX_PUBLIC_BACKUP_GPG_RECIPIENT" ]; then
    echo "Error: NX_PUBLIC_BACKUP_GPG_RECIPIENT not set"
    echo "This should be the email or key ID associated with your GPG public key"
    exit 1
fi

# Verify GPG key exists
if ! gpg --list-keys "$NX_PUBLIC_BACKUP_GPG_RECIPIENT" > /dev/null 2>&1; then
    echo "Error: GPG key for '$NX_PUBLIC_BACKUP_GPG_RECIPIENT' not found"
    echo "Please import the public key first: gpg --import public-key.asc"
    exit 1
fi

# Use Docker to run pg_dump with matching PostgreSQL version
echo "Using Docker postgres container for pg_dump to ensure version compatibility"

# Create backup and log directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "/opt/demo-t3-shared/db-backup-logs/demo-t3-backup.log")"

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/demo_t3_backup_$DATE.sql"
ENCRYPTED_BACKUP_FILE="$BACKUP_FILE.gpg"

echo "Starting PostgreSQL backup..."
echo "Database: $NX_PUBLIC_AUTH_DB_POSTGRES_DB"
echo "Backup file: $ENCRYPTED_BACKUP_FILE"

# Perform backup using pg_dump via Docker exec and encrypt with GPG
# This uses the same PostgreSQL version as the server, avoiding version mismatch
# Encrypts using asymmetric encryption (public key) - requires private key to decrypt
docker exec -e PGPASSWORD="$NX_PUBLIC_AUTH_DB_POSTGRES_PASSWORD" postgres pg_dump \
    -h localhost \
    -U "$NX_PUBLIC_AUTH_DB_POSTGRES_USER" \
    -d "$NX_PUBLIC_AUTH_DB_POSTGRES_DB" \
    --verbose \
    --no-password \
    --format=custom \
    --compress=9 | gpg --encrypt --recipient "$NX_PUBLIC_BACKUP_GPG_RECIPIENT" --trust-model always -o "$ENCRYPTED_BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup and encryption completed successfully: $ENCRYPTED_BACKUP_FILE"

    # Get backup file size
    BACKUP_SIZE=$(du -h "$ENCRYPTED_BACKUP_FILE" | cut -f1)
    echo "Encrypted backup size: $BACKUP_SIZE"

    # Clean up old backups (older than RETENTION_DAYS)
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "demo_t3_backup_*.sql.gpg" -type f -mtime +$RETENTION_DAYS -delete

    echo "Backup process completed successfully"
else
    echo "Error: Backup or encryption failed"
    exit 1
fi
