# 🚀 ProjeXtPal Production Deployment Guide

**Complete guide for deploying ProjeXtPal to production with Docker + Tailscale**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Tailscale Configuration](#tailscale-configuration)
5. [SSL/HTTPS Setup](#ssl-https-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

### System Requirements
- **OS:** Ubuntu 20.04+ / macOS / any Docker-compatible system
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 20GB minimum
- **Docker:** v20.10+
- **Docker Compose:** v2.0+

### Install Docker & Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

## ⚡ Quick Start (5 minutes)

```bash
# 1. Navigate to project
cd ~/Desktop/ProjextPal

# 2. Copy production files
cp /home/claude/production/* ./

# 3. Move Dockerfiles to correct locations
mv Dockerfile.frontend.prod frontend/Dockerfile.prod
mv Dockerfile.backend.prod backend/Dockerfile.prod
mv nginx.conf frontend/
mv default.conf frontend/

# 4. Create environment file
cp .env.production.template .env.production
nano .env.production  # Edit with your values

# 5. Setup Tailscale
chmod +x setup-tailscale.sh
./setup-tailscale.sh

# 6. Build and start
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# 7. Check status
docker-compose -f docker-compose.production.yml ps
```

**Done!** Access at: `http://localhost` or `http://[tailscale-ip]`

---

## 📚 Detailed Setup

### Step 1: Prepare Project Structure

```bash
cd ~/Desktop/ProjextPal

# Your structure should look like:
# ProjeXtPal/
# ├── frontend/
# │   ├── Dockerfile.prod
# │   ├── nginx.conf
# │   ├── default.conf
# │   └── src/
# ├── backend/
# │   ├── Dockerfile.prod
# │   └── manage.py
# ├── docker-compose.production.yml
# ├── .env.production
# └── setup-tailscale.sh
```

### Step 2: Configure Environment Variables

Edit `.env.production`:

```bash
nano .env.production
```

**Required settings:**

```bash
# Django
DJANGO_SECRET_KEY=generate-with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
ALLOWED_HOSTS=your-domain.com,projextpal.ts.net
CORS_ALLOWED_ORIGINS=https://your-domain.com

# Database
POSTGRES_PASSWORD=super-secure-password-here

# Redis
REDIS_PASSWORD=another-secure-password

# Tailscale
TAILSCALE_AUTHKEY=tskey-auth-xxxxx  # Get from tailscale.com/admin

# Frontend
VITE_BACKEND_URL=https://your-domain.com/api/v1
```

**Generate secure passwords:**

```bash
# Django secret key
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Database password
openssl rand -base64 32

# Redis password
openssl rand -base64 32
```

### Step 3: Backend Production Settings

Create/update `backend/config/settings/production.py`:

```python
from .base import *

DEBUG = False
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('POSTGRES_HOST', 'postgres'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Static files
STATIC_ROOT = '/app/staticfiles'
MEDIA_ROOT = '/app/media'
```

### Step 4: Frontend Production Configuration

Update `frontend/.env.production`:

```bash
VITE_BACKEND_URL=https://your-domain.com/api/v1
VITE_API_URL=https://your-domain.com/api/v1
```

Update `frontend/src/contexts/AuthContext.tsx`:

```typescript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api/v1';
```

---

## 🔐 Tailscale Configuration

### Option 1: Automated Setup

```bash
chmod +x setup-tailscale.sh
./setup-tailscale.sh
```

### Option 2: Manual Setup

#### 1. Install Tailscale

```bash
# Ubuntu/Debian
curl -fsSL https://tailscale.com/install.sh | sh

# macOS
brew install tailscale

# Start Tailscale
sudo tailscale up
```

#### 2. Get Auth Key

1. Go to: https://login.tailscale.com/admin/settings/keys
2. Click "Generate auth key"
3. Settings:
   - ✅ **Reusable:** Yes
   - ✅ **Ephemeral:** No
   - ✅ **Tags:** `tag:prod` (optional)
4. Copy the key (starts with `tskey-auth-...`)

#### 3. Add to Environment

```bash
echo "TAILSCALE_AUTHKEY=tskey-auth-your-key-here" >> .env.production
```

#### 4. Verify Connection

```bash
tailscale status
tailscale ip -4  # Get your Tailscale IP
```

---

## 🔒 SSL/HTTPS Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificates will be at:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# Copy to project
mkdir -p frontend/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem frontend/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem frontend/ssl/key.pem
sudo chown $USER:$USER frontend/ssl/*
```

Update `frontend/default.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of config
}
```

### Option 2: Tailscale HTTPS (Easier)

Tailscale provides automatic HTTPS!

```bash
# Enable HTTPS in Tailscale
tailscale cert your-device-name

# Access at: https://your-device-name.your-tailnet.ts.net
```

---

## 🚀 Build & Deploy

### Build Docker Images

```bash
# Build all services
docker-compose -f docker-compose.production.yml build

# Build specific service
docker-compose -f docker-compose.production.yml build frontend
docker-compose -f docker-compose.production.yml build backend
```

### Start Services

```bash
# Start all services in background
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# View specific service logs
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend
```

### Initial Setup (First Time Only)

```bash
# Run migrations
docker-compose -f docker-compose.production.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.production.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput
```

---

## 📊 Monitoring & Maintenance

### Check Container Status

```bash
# List running containers
docker-compose -f docker-compose.production.yml ps

# Check resource usage
docker stats

# Check health
docker-compose -f docker-compose.production.yml exec backend python manage.py check
```

### View Logs

```bash
# All logs
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.production.yml logs --tail=100 backend

# Since specific time
docker-compose -f docker-compose.production.yml logs --since 2h backend
```

### Database Backup

```bash
# Manual backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U projextpal projextpal > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=./backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U projextpal projextpal | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

### Database Restore

```bash
# Restore from backup
gunzip -c backups/backup_20250122_120000.sql.gz | docker-compose -f docker-compose.production.yml exec -T postgres psql -U projextpal projextpal
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Run migrations
docker-compose -f docker-compose.production.yml exec backend python manage.py migrate
```

---

## 🆘 Troubleshooting

### Issue 1: Containers not starting

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs

# Check specific service
docker-compose -f docker-compose.production.yml logs backend

# Rebuild
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### Issue 2: Database connection errors

```bash
# Check postgres is running
docker-compose -f docker-compose.production.yml ps postgres

# Test connection
docker-compose -f docker-compose.production.yml exec backend python manage.py dbshell

# Check environment variables
docker-compose -f docker-compose.production.yml exec backend env | grep POSTGRES
```

### Issue 3: Frontend not loading

```bash
# Check nginx logs
docker-compose -f docker-compose.production.yml logs frontend

# Check if files are built
docker-compose -f docker-compose.production.yml exec frontend ls /usr/share/nginx/html

# Rebuild frontend
docker-compose -f docker-compose.production.yml build frontend
docker-compose -f docker-compose.production.yml up -d frontend
```

### Issue 4: Tailscale not connecting

```bash
# Check Tailscale status
docker-compose -f docker-compose.production.yml logs tailscale

# Verify auth key
docker-compose -f docker-compose.production.yml exec tailscale tailscale status

# Restart Tailscale
docker-compose -f docker-compose.production.yml restart tailscale
```

### Issue 5: Permission errors

```bash
# Fix ownership
sudo chown -R $USER:$USER ~/Desktop/ProjextPal

# Fix permissions for volumes
docker-compose -f docker-compose.production.yml down
sudo rm -rf volumes/
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔧 Useful Commands

```bash
# Stop all services
docker-compose -f docker-compose.production.yml stop

# Start all services
docker-compose -f docker-compose.production.yml start

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend

# Remove all containers (keeps volumes)
docker-compose -f docker-compose.production.yml down

# Remove all including volumes (⚠️  DESTRUCTIVE)
docker-compose -f docker-compose.production.yml down -v

# Execute command in container
docker-compose -f docker-compose.production.yml exec backend python manage.py shell

# Access container shell
docker-compose -f docker-compose.production.yml exec backend bash

# View resource usage
docker stats

# Clean up unused images
docker image prune -a

# Clean up everything (⚠️  CAREFUL)
docker system prune -a --volumes
```

---

## 📈 Performance Optimization

### 1. Gunicorn Workers

Adjust in `docker-compose.production.yml`:

```yaml
backend:
  command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --threads 2
```

**Formula:** `(2 x CPU cores) + 1`

### 2. PostgreSQL Tuning

Create `postgres.conf`:

```conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

Mount in docker-compose:

```yaml
postgres:
  volumes:
    - ./postgres.conf:/etc/postgresql/postgresql.conf
```

### 3. Redis Configuration

Add to docker-compose:

```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

---

## 🎉 Success Checklist

- [ ] Docker & Docker Compose installed
- [ ] Environment variables configured (.env.production)
- [ ] Tailscale setup and connected
- [ ] Containers built successfully
- [ ] Database migrated
- [ ] Superuser created
- [ ] Static files collected
- [ ] Frontend accessible at http://localhost or Tailscale IP
- [ ] Backend API working at /api/v1/
- [ ] Can login to admin panel (/admin/)
- [ ] Backups configured
- [ ] Monitoring setup

---

**Deployment Date:** 2025-01-22  
**Version:** 1.0  
**Status:** Production Ready ✅

**Need help?** Check logs, review troubleshooting section, or contact support.
