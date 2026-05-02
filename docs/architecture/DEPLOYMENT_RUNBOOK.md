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
# Automated daily backup cron (add to root crontab)
# crontab -e
0 2 * * * /opt/preciseoptics/scripts/backup.sh >> /var/log/preciseoptics_backup.log 2>&1
```

`/opt/preciseoptics/scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR=/backups/preciseoptics

mkdir -p $BACKUP_DIR

# Database dump
pg_dump -U precise_optics_user precise_optics_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /opt/preciseoptics/Backend/media/

# Remove backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

---

## 9. Monitoring Quick Commands

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

## 10. Critical Production Checks Before Go-Live

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

*Last updated: May 2026*
