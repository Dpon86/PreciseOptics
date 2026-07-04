#!/usr/bin/env bash
set -euo pipefail

# Rehearsal script for SQLite -> PostgreSQL cutover on staging.
# Expected usage:
#   1) .env contains PostgreSQL target settings
#   2) pass path to source sqlite db file
# Example:
#   ./scripts/rehearse_sqlite_to_postgres.sh --sqlite-file ./db.sqlite3

usage() {
  cat <<'EOF'
Usage:
  rehearse_sqlite_to_postgres.sh --sqlite-file <path> [--export-file <path>] [--force]

Arguments:
  --sqlite-file   Required. Source SQLite database file path.
  --export-file   Optional. JSON dump output path.
  --force         Required to run destructive target DB operations.

Notes:
  - Target DB settings are read from Backend/.env (must be PostgreSQL).
  - Script performs: export (from SQLite), migrate target, flush target, loaddata, sanity checks.
EOF
}

SQLITE_FILE=""
EXPORT_FILE=""
FORCE=false

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$BACKEND_DIR/.env"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sqlite-file)
      SQLITE_FILE="${2:-}"
      shift 2
      ;;
    --export-file)
      EXPORT_FILE="${2:-}"
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

if [[ -z "$SQLITE_FILE" ]]; then
  echo "--sqlite-file is required" >&2
  usage
  exit 1
fi

if [[ "$FORCE" != "true" ]]; then
  echo "Refusing to run without --force (target DB flush is destructive)." >&2
  exit 1
fi

if [[ ! -f "$SQLITE_FILE" ]]; then
  echo "SQLite file not found: $SQLITE_FILE" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ "${DB_ENGINE:-}" != "django.db.backends.postgresql" ]]; then
  echo "DB_ENGINE must be django.db.backends.postgresql for this rehearsal script." >&2
  exit 1
fi

if [[ -z "$EXPORT_FILE" ]]; then
  TS="$(date +%Y%m%d_%H%M%S)"
  EXPORT_FILE="/tmp/preciseoptics_sqlite_export_${TS}.json"
fi

echo "[rehearsal] starting SQLite -> PostgreSQL rehearsal"
echo "[rehearsal] source sqlite: $SQLITE_FILE"
echo "[rehearsal] export file:   $EXPORT_FILE"
echo "[rehearsal] target db:     ${DB_NAME:-<missing>}@${DB_HOST:-localhost}:${DB_PORT:-5432}"

cd "$BACKEND_DIR"

# 1) Export from SQLite source using environment overrides for this command only.
DB_ENGINE=django.db.backends.sqlite3 \
DB_NAME="$SQLITE_FILE" \
ENVIRONMENT=development \
python manage.py dumpdata \
  --exclude contenttypes \
  --exclude auth.permission \
  --exclude admin.logentry \
  --indent 2 > "$EXPORT_FILE"

echo "[rehearsal] sqlite export complete"

# 2) Ensure target schema is current
python manage.py migrate --noinput

echo "[rehearsal] target migrate complete"

# 3) Flush target before load (destructive)
python manage.py flush --noinput

echo "[rehearsal] target flush complete"

# 4) Load exported data
python manage.py loaddata "$EXPORT_FILE"

echo "[rehearsal] data load complete"

# 5) Sanity checks
python manage.py check
python manage.py shell -c "from patients.models import Patient; from consultations.models import Consultation; from medications.models import Prescription; print(f'patients={Patient.objects.count()} consultations={Consultation.objects.count()} prescriptions={Prescription.objects.count()}')"

echo "[rehearsal] SUCCESS: rehearsal completed"
