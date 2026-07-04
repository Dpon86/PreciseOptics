#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  restore_prod.sh --backup <path-to-backup> [--env-file <path>] [--force]

Examples:
  ./restore_prod.sh --backup /backups/preciseoptics/preciseoptics_backup_20260510_020000.tar.gz.enc --force
  ./restore_prod.sh --backup /backups/preciseoptics/20260510_020000 --env-file /opt/preciseoptics/Backend/.env --force
EOF
}

BACKUP_PATH=""
FORCE=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$BACKEND_DIR/.env"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backup)
      BACKUP_PATH="${2:-}"
      shift 2
      ;;
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --force)
      FORCE=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$BACKUP_PATH" ]]; then
  echo "--backup is required" >&2
  usage
  exit 1
fi

if [[ "$FORCE" != "true" ]]; then
  echo "Refusing to run without --force (destructive operation)." >&2
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

EXTRACT_DIR="$TMP_DIR/extracted"
mkdir -p "$EXTRACT_DIR"

if [[ -f "$BACKUP_PATH" && "$BACKUP_PATH" == *.enc ]]; then
  : "${BACKUP_ENCRYPTION_PASSPHRASE:?BACKUP_ENCRYPTION_PASSPHRASE must be set for encrypted backup restore}"
  TAR_FILE="$TMP_DIR/backup.tar.gz"
  openssl enc -d -aes-256-cbc -pbkdf2 -in "$BACKUP_PATH" -out "$TAR_FILE" -pass env:BACKUP_ENCRYPTION_PASSPHRASE
  tar -xzf "$TAR_FILE" -C "$EXTRACT_DIR"
elif [[ -f "$BACKUP_PATH" && "$BACKUP_PATH" == *.tar.gz ]]; then
  tar -xzf "$BACKUP_PATH" -C "$EXTRACT_DIR"
elif [[ -d "$BACKUP_PATH" ]]; then
  cp -r "$BACKUP_PATH" "$EXTRACT_DIR/"
else
  echo "Backup path not found or unsupported format: $BACKUP_PATH" >&2
  exit 1
fi

DATA_DIR="$(find "$EXTRACT_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
if [[ -z "$DATA_DIR" ]]; then
  echo "Could not locate extracted backup directory" >&2
  exit 1
fi

if [[ -f "$DATA_DIR/checksums.sha256" ]]; then
  (cd "$DATA_DIR" && sha256sum -c checksums.sha256)
fi

DB_ENGINE="${DB_ENGINE:-django.db.backends.sqlite3}"
DB_NAME="${DB_NAME:-db.sqlite3}"
DB_USER="${DB_USER:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-}"
DB_DUMP_GZ="$DATA_DIR/database.sql.gz"

if [[ "$DB_ENGINE" == *"postgresql"* ]]; then
  echo "[restore] restoring PostgreSQL database"
  export PGPASSWORD="${DB_PASSWORD:-}"
  gunzip -c "$DB_DUMP_GZ" | psql -h "$DB_HOST" ${DB_PORT:+-p "$DB_PORT"} -U "$DB_USER" "$DB_NAME"
elif [[ "$DB_ENGINE" == *"mysql"* ]]; then
  echo "[restore] restoring MySQL database"
  gunzip -c "$DB_DUMP_GZ" | mysql -h "$DB_HOST" ${DB_PORT:+-P "$DB_PORT"} -u "$DB_USER" "${DB_PASSWORD:+-p$DB_PASSWORD}" "$DB_NAME"
elif [[ "$DB_ENGINE" == *"sqlite3"* ]]; then
  echo "[restore] restoring SQLite database"
  gunzip -c "$DB_DUMP_GZ" > "$BACKEND_DIR/$DB_NAME"
else
  echo "[restore] unsupported DB_ENGINE: $DB_ENGINE" >&2
  exit 1
fi

if [[ -f "$DATA_DIR/media.tar.gz" ]]; then
  rm -rf "$BACKEND_DIR/media"
  tar -xzf "$DATA_DIR/media.tar.gz" -C "$BACKEND_DIR"
fi

if [[ -f "$DATA_DIR/logs.tar.gz" ]]; then
  rm -rf "$BACKEND_DIR/logs"
  tar -xzf "$DATA_DIR/logs.tar.gz" -C "$BACKEND_DIR"
fi

echo "[restore] restore completed successfully"
