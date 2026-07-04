#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$BACKEND_DIR/.env}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="${BACKUP_DIR:-/backups/preciseoptics}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-2555}"
ENCRYPT_BACKUP="${BACKUP_ENCRYPT:-true}"
ARCHIVE_DIR="$BACKUP_DIR/$TIMESTAMP"

mkdir -p "$ARCHIVE_DIR"

echo "[backup] starting backup at $TIMESTAMP"
echo "[backup] target directory: $ARCHIVE_DIR"

DB_ENGINE="${DB_ENGINE:-django.db.backends.sqlite3}"
DB_NAME="${DB_NAME:-db.sqlite3}"
DB_USER="${DB_USER:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-}"

DB_DUMP_GZ="$ARCHIVE_DIR/database.sql.gz"

if [[ "$DB_ENGINE" == *"postgresql"* ]]; then
  echo "[backup] dumping PostgreSQL database"
  export PGPASSWORD="${DB_PASSWORD:-}"
  pg_dump -h "$DB_HOST" ${DB_PORT:+-p "$DB_PORT"} -U "$DB_USER" "$DB_NAME" | gzip > "$DB_DUMP_GZ"
elif [[ "$DB_ENGINE" == *"mysql"* ]]; then
  echo "[backup] dumping MySQL database"
  mysqldump -h "$DB_HOST" ${DB_PORT:+-P "$DB_PORT"} -u "$DB_USER" "${DB_PASSWORD:+-p$DB_PASSWORD}" "$DB_NAME" | gzip > "$DB_DUMP_GZ"
elif [[ "$DB_ENGINE" == *"sqlite3"* ]]; then
  echo "[backup] backing up SQLite database"
  SQLITE_PATH="$BACKEND_DIR/$DB_NAME"
  gzip -c "$SQLITE_PATH" > "$DB_DUMP_GZ"
else
  echo "[backup] unsupported DB_ENGINE: $DB_ENGINE" >&2
  exit 1
fi

if [[ -d "$BACKEND_DIR/media" ]]; then
  tar -czf "$ARCHIVE_DIR/media.tar.gz" -C "$BACKEND_DIR" media
fi

if [[ -d "$BACKEND_DIR/logs" ]]; then
  tar -czf "$ARCHIVE_DIR/logs.tar.gz" -C "$BACKEND_DIR" logs
fi

(
  cd "$ARCHIVE_DIR"
  sha256sum ./* > checksums.sha256
)

if [[ "$ENCRYPT_BACKUP" == "true" ]]; then
  : "${BACKUP_ENCRYPTION_PASSPHRASE:?BACKUP_ENCRYPTION_PASSPHRASE must be set when BACKUP_ENCRYPT=true}"
  TAR_FILE="$BACKUP_DIR/preciseoptics_backup_${TIMESTAMP}.tar.gz"
  ENC_FILE="$TAR_FILE.enc"

  tar -czf "$TAR_FILE" -C "$BACKUP_DIR" "$TIMESTAMP"
  openssl enc -aes-256-cbc -pbkdf2 -salt -in "$TAR_FILE" -out "$ENC_FILE" -pass env:BACKUP_ENCRYPTION_PASSPHRASE
  rm -f "$TAR_FILE"
  rm -rf "$ARCHIVE_DIR"
  echo "[backup] encrypted backup created: $ENC_FILE"
else
  echo "[backup] unencrypted backup kept at: $ARCHIVE_DIR"
fi

find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -mtime "+$RETENTION_DAYS" -exec rm -rf {} \;

echo "[backup] retention cleanup done (older than $RETENTION_DAYS days)"
echo "[backup] completed successfully"
