# PreciseOptics Deployment Runbook

> Step-by-step guide for deploying PreciseOptics to a production server.

---

## Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Python | 3.11+ |
| Node.js | 18+ |
| PostgreSQL or MySQL | PG 15+ / MySQL 8+ |
| Docker (optional) | 24+ |
| Nginx | 1.24+ |
| Redis (for caching) | 7+ |

---

## 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Python, pip, venv
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Nginx
sudo apt install nginx -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

---

## 2. Database Setup (PostgreSQL)

```bash
# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE precise_optics_db;
CREATE USER precise_optics_user WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
ALTER ROLE precise_optics_user SET client_encoding TO 'utf8';
ALTER ROLE precise_optics_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE precise_optics_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE precise_optics_db TO precise_optics_user;
EOF
```

---

## 3. Backend Deployment

### 3.1 Clone and Configure

```bash
cd /opt
sudo mkdir preciseoptics && sudo chown $USER:$USER preciseoptics
cd preciseoptics
git clone https://github.com/your-org/PreciseOptics.git .
cd Backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install production dependencies
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### 3.2 Environment Variables

```bash
# Copy and edit the environment file
cp .env.example .env
nano .env
```

**Minimum required changes in `.env`:**

```env
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

DB_ENGINE=django.db.backends.postgresql
DB_NAME=precise_optics_db
DB_USER=precise_optics_user
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DB_HOST=localhost
DB_PORT=5432

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-provider.com
EMAIL_HOST_USER=noreply@your-domain.com
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=PreciseOptics <noreply@your-domain.com>
```

### 3.3 Database Migration

```bash
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 3.4 Gunicorn Service

Create `/etc/systemd/system/preciseoptics.service`:

```ini
[Unit]
Description=PreciseOptics Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/preciseoptics/Backend
ExecStart=/opt/preciseoptics/Backend/venv/bin/gunicorn \
    --access-logfile - \
    --workers 4 \
    --bind unix:/opt/preciseoptics/preciseoptics.sock \
    precise_optics.wsgi:application
EnvironmentFile=/opt/preciseoptics/Backend/.env
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start preciseoptics
sudo systemctl enable preciseoptics
```

---

## 4. Frontend Deployment

```bash
cd /opt/preciseoptics/frontend
npm ci --production=false

# Create production environment file
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_ENV=production
EOF

npm run build
```

---

## 5. Nginx Configuration

Create `/etc/nginx/sites-available/preciseoptics`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Frontend (React build)
    root /opt/preciseoptics/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://unix:/opt/preciseoptics/preciseoptics.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static/media files
    location /static/ {
        alias /opt/preciseoptics/Backend/staticfiles/;
    }

    location /media/ {
        alias /opt/preciseoptics/Backend/media/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/preciseoptics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 6. Post-Deployment Verification

Run through this checklist after every deployment:

```
[ ] Backend health: curl https://your-domain.com/api/health/
[ ] Login works via frontend
[ ] Patient list loads correctly
[ ] Report pages return data (auth required)
[ ] CSV export works on at least one report
[ ] Static files load (no 404s for CSS/JS)
[ ] HTTPS redirect works (http → https)
[ ] Django admin accessible at /admin/
[ ] Gunicorn service running: systemctl status preciseoptics
[ ] No errors in Nginx log: tail /var/log/nginx/error.log
[ ] No errors in app log: journalctl -u preciseoptics -n 50
```

---

## 7. Updates & Rollback

### Deploy an Update

```bash
cd /opt/preciseoptics
git pull origin main

# Backend
cd Backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart preciseoptics

# Frontend
cd ../frontend
npm ci --production=false
npm run build
sudo systemctl reload nginx
```

### Rollback

```bash
# Roll back to previous commit
git log --oneline -5            # find the commit hash
git checkout <previous-hash>    # check out previous version
# Re-run migration/build steps above
```

---

## 8. Backup Procedure

```bash
# Make scripts executable once
chmod +x /opt/preciseoptics/Backend/scripts/backup_prod.sh
chmod +x /opt/preciseoptics/Backend/scripts/restore_prod.sh

# Automated daily backup cron (add to root crontab)
# crontab -e
0 2 * * * cd /opt/preciseoptics/Backend && ./scripts/backup_prod.sh >> /var/log/preciseoptics_backup.log 2>&1
```

Backup behavior is configured via `.env`:

```env
BACKUP_DIR=/backups/preciseoptics
BACKUP_RETENTION_DAYS=2555
BACKUP_ENCRYPT=true
BACKUP_ENCRYPTION_PASSPHRASE=<store in secrets manager>
```

The backup script includes:
- Database dump for PostgreSQL/MySQL/SQLite
- `media/` and `logs/` archive
- SHA-256 checksum file
- Optional AES-256 encryption
- Retention cleanup

Manual backup:

```bash
cd /opt/preciseoptics/Backend
./scripts/backup_prod.sh
```

Manual restore (destructive, requires `--force`):

```bash
cd /opt/preciseoptics/Backend
./scripts/restore_prod.sh --backup /backups/preciseoptics/preciseoptics_backup_YYYYMMDD_HHMMSS.tar.gz.enc --force
```

---

## 9. Disaster Recovery Plan

### Recovery Objectives

- **RTO:** 4 hours
- **RPO:** 24 hours

### Recovery Steps

```bash
# 1) Provision replacement host / database
# 2) Deploy latest known-good app release
cd /opt/preciseoptics
git checkout <known-good-tag-or-commit>

# 3) Restore from the latest valid backup
cd /opt/preciseoptics/Backend
./scripts/restore_prod.sh --backup /backups/preciseoptics/<backup-file>.enc --force

# 4) Restart services
sudo systemctl restart preciseoptics
sudo systemctl reload nginx
```

### Quarterly DR Drill Checklist

- Restore latest backup to staging
- Validate DB integrity (row counts, spot-check critical patient records)
- Validate file recovery (`media/` documents and images)
- Run smoke tests (login, patient list, report load)
- Record drill duration and compare to RTO target

---

## 10. Monitoring Quick Commands

```bash
# Check service status
sudo systemctl status preciseoptics nginx

# Tail application logs
journalctl -u preciseoptics -f

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Active connections
ss -tlnp | grep nginx

# Database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='precise_optics_db';"
```

---

## 11. Critical Production Checks Before Go-Live

- [ ] `DEBUG=False` confirmed in `.env`
- [ ] `SECRET_KEY` is a newly generated value (not the insecure default)
- [ ] `ALLOWED_HOSTS` set to only your domain(s)
- [ ] All report endpoints require authentication (`AllowAny` removed ✅)
- [ ] HTTPS enforced with valid certificate
- [ ] Security headers in Nginx config
- [ ] Database is PostgreSQL/MySQL (not SQLite)
- [ ] Daily backup cron scheduled and tested
- [ ] Health check endpoint returning 200
- [ ] Superuser account created with strong password
- [ ] Frontend `.env.production` pointing to HTTPS API URL

---

## 12. SQLite to PostgreSQL Cutover Checklist (Exact Commands)

> Run on the production host from `/opt/preciseoptics/Backend`.

For staging rehearsal, you can use the automation script:

```bash
cd /opt/preciseoptics/Backend
chmod +x ./scripts/rehearse_sqlite_to_postgres.sh
./scripts/rehearse_sqlite_to_postgres.sh --sqlite-file ./db.sqlite3 --force
```

### 12.1 Prepare Environment

```bash
cd /opt/preciseoptics/Backend
cp .env.production.template .env
nano .env
```

Required values in `.env` before continuing:
- `ENVIRONMENT=production`
- `DB_ENGINE=django.db.backends.postgresql`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`

### 12.2 Install Dependencies

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### 12.3 Put Application Into Maintenance Mode

```bash
sudo systemctl stop preciseoptics
```

### 12.4 Snapshot Existing SQLite Data

```bash
cd /opt/preciseoptics/Backend
python manage.py dumpdata \
    --exclude contenttypes \
    --exclude auth.permission \
    --exclude admin.logentry \
    --indent 2 > /tmp/preciseoptics_sqlite_export.json
```

### 12.5 Migrate Schema on PostgreSQL

```bash
python manage.py migrate
```

### 12.6 Load Data Into PostgreSQL

```bash
python manage.py loaddata /tmp/preciseoptics_sqlite_export.json
```

### 12.7 Collect Static + Smoke Check

```bash
python manage.py collectstatic --noinput
python manage.py check
python manage.py shell -c "from django.contrib.auth import get_user_model; print('users=', get_user_model().objects.count())"
```

### 12.8 Bring Service Back Online

```bash
sudo systemctl start preciseoptics
sudo systemctl status preciseoptics --no-pager
```

### 12.9 Post-Cutover API Verification

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://your-domain.com/api/health/
curl -sS -o /dev/null -w "%{http_code}\n" https://your-domain.com/api/health/db/
```

---

## 13. First Backup + First Restore Drill (Exact Commands)

### 13.1 Create First Encrypted Backup

```bash
cd /opt/preciseoptics/Backend
chmod +x ./scripts/backup_prod.sh ./scripts/restore_prod.sh
./scripts/backup_prod.sh
ls -lah ${BACKUP_DIR:-/backups/preciseoptics}
```

### 13.2 Restore Drill in Staging (Required)

```bash
# Example only: use a staging host/database
cd /opt/preciseoptics/Backend
./scripts/restore_prod.sh --backup /backups/preciseoptics/preciseoptics_backup_YYYYMMDD_HHMMSS.tar.gz.enc --force
python manage.py check
```

### 13.3 Verify Critical Records After Restore

```bash
python manage.py shell -c "from patients.models import Patient; from consultations.models import Consultation; print('patients=', Patient.objects.count(), 'consultations=', Consultation.objects.count())"
```

### 13.4 Record Drill Outcome

- Start time / end time
- Total recovery duration (must be <= RTO)
- Data age at restore point (must be <= RPO)
- Validation notes and any remediation actions

---

*Last updated: May 2026*
