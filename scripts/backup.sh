#!/bin/sh
set -e

# MongoDB Backup Script
# Usage: ./scripts/backup.sh [output-dir]
#
# Defaults:
#   - Host: localhost:27017
#   - Database: testimonies_com
#   - Output: ./backups/<date>
#
# Override via env vars: MONGO_URI, BACKUP_DIR

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
OUTPUT="$BACKUP_DIR/$DATE"

MONGO_URI="${MONGO_URI:-mongodb://admin:admin@localhost:27017/testimonies_com?authSource=admin}"

echo "Starting backup to $OUTPUT ..."
mkdir -p "$OUTPUT"

mongodump --uri="$MONGO_URI" --out="$OUTPUT" --gzip

echo "Backup complete: $OUTPUT"

# Keep only last 30 backups
ls -dt "$BACKUP_DIR"/*/ 2>/dev/null | tail -n +31 | xargs -r rm -rf
echo "Cleaned up backups older than 30 days."
