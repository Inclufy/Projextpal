#!/bin/bash

# ============================================================
# ProjeXtPal Quick Start - Production Deployment
# One-command deployment script
# ============================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     🚀 ProjeXtPal Production Deployment                 ║
║        Quick Start Installation                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

PROJECT_DIR="$(pwd)"
PRODUCTION_DIR=/home/claude/production

# ============================================================
# Step 1: Check Prerequisites
# ============================================================
echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker installed:${NC} $(docker --version)"
else
    echo -e "${RED}❌ Docker not found!${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose installed:${NC} $(docker-compose --version)"
else
    echo -e "${RED}❌ Docker Compose not found!${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Docker daemon is running
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
else
    echo -e "${RED}❌ Docker daemon is not running!${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

echo ""

# ============================================================
# Step 2: Prepare Project
# ============================================================
echo -e "${YELLOW}📦 Step 2: Preparing project structure...${NC}"
echo ""

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"
echo -e "${GREEN}✅ Working directory: $PROJECT_DIR${NC}"

# ============================================================
# Step 3: Copy Production Files
# ============================================================
echo -e "${YELLOW}📁 Step 3: Copying production files...${NC}"
echo ""

if [ ! -d "$PRODUCTION_DIR" ]; then
    echo -e "${RED}❌ Production files not found!${NC}"
    exit 1
fi

# Copy docker-compose
cp "$PRODUCTION_DIR/docker-compose.production.yml" .
echo "✅ docker-compose.production.yml"

# Copy environment template
cp "$PRODUCTION_DIR/.env.production.template" .
echo "✅ .env.production.template"

# Copy scripts
cp "$PRODUCTION_DIR/setup-tailscale.sh" .
cp "$PRODUCTION_DIR/backup.sh" .
cp "$PRODUCTION_DIR/restore.sh" .
cp "$PRODUCTION_DIR/health-check.sh" .
chmod +x *.sh
echo "✅ Scripts copied and made executable"

# Copy frontend files
mkdir -p frontend/nginx-config
cp "$PRODUCTION_DIR/Dockerfile.frontend.prod" frontend/Dockerfile.prod
cp "$PRODUCTION_DIR/nginx.conf" frontend/nginx-config/
cp "$PRODUCTION_DIR/default.conf" frontend/nginx-config/
echo "✅ Frontend Docker + Nginx config"

# Copy backend files
cp "$PRODUCTION_DIR/Dockerfile.backend.prod" backend/Dockerfile.prod
cp "$PRODUCTION_DIR/requirements-prod.txt" backend/
echo "✅ Backend Docker + requirements"

echo ""

# ============================================================
# Step 4: Environment Configuration
# ============================================================
echo -e "${YELLOW}⚙️  Step 4: Configuring environment...${NC}"
echo ""

if [ -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production already exists!${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env.production"
    else
        cp .env.production.template .env.production
        echo -e "${GREEN}✅ Created new .env.production${NC}"
    fi
else
    cp .env.production.template .env.production
    echo -e "${GREEN}✅ Created .env.production${NC}"
fi

echo ""
echo -e "${CYAN}🔐 Security Setup:${NC}"
echo "Generating secure passwords..."

# Generate Django secret key
DJANGO_SECRET=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())' 2>/dev/null || openssl rand -base64 50)
echo "✅ Django secret key generated"

# Generate database password
DB_PASSWORD=$(openssl rand -base64 32)
echo "✅ Database password generated"

# Generate Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)
echo "✅ Redis password generated"

# Update .env.production
sed -i.bak "s|DJANGO_SECRET_KEY=.*|DJANGO_SECRET_KEY=$DJANGO_SECRET|" .env.production
sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$DB_PASSWORD|" .env.production
sed -i.bak "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" .env.production

echo ""

# ============================================================
# Step 5: Tailscale Setup
# ============================================================
echo -e "${YELLOW}🔐 Step 5: Tailscale setup...${NC}"
echo ""

read -p "Do you want to configure Tailscale now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./setup-tailscale.sh
else
    echo -e "${YELLOW}⚠️  Skipping Tailscale setup${NC}"
    echo "You can run it later with: ./setup-tailscale.sh"
fi

echo ""

# ============================================================
# Step 6: Build Docker Images
# ============================================================
echo -e "${YELLOW}🏗️  Step 6: Building Docker images...${NC}"
echo "This may take 5-10 minutes..."
echo ""

docker-compose -f docker-compose.production.yml build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker images built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

echo ""

# ============================================================
# Step 7: Start Services
# ============================================================
echo -e "${YELLOW}🚀 Step 7: Starting services...${NC}"
echo ""

docker-compose -f docker-compose.production.yml up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start services!${NC}"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""

# ============================================================
# Step 8: Initialize Database
# ============================================================
echo -e "${YELLOW}🗄️  Step 8: Initializing database...${NC}"
echo ""

echo "Running migrations..."
docker-compose -f docker-compose.production.yml exec -T backend python manage.py migrate

echo "Collecting static files..."
docker-compose -f docker-compose.production.yml exec -T backend python manage.py collectstatic --noinput

echo ""

# ============================================================
# Step 9: Create Superuser
# ============================================================
echo -e "${YELLOW}👤 Step 9: Creating superuser...${NC}"
echo ""

read -p "Create superuser now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose -f docker-compose.production.yml exec backend python manage.py createsuperuser
fi

echo ""

# ============================================================
# Step 10: Health Check
# ============================================================
echo -e "${YELLOW}🏥 Step 10: Running health check...${NC}"
echo ""

./health-check.sh

echo ""

# ============================================================
# Success Summary
# ============================================================
echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     ✅ Deployment Complete!                              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${CYAN}📍 Access Points:${NC}"
echo ""
echo "  🌐 Frontend:  http://localhost"
echo "  🔧 Backend:   http://localhost/api/v1/"
echo "  🛡️  Admin:     http://localhost/admin/"

# Get Tailscale IP if available
TS_IP=$(docker-compose -f docker-compose.production.yml exec -T tailscale tailscale ip -4 2>/dev/null | tr -d '\r\n' || echo "")
if [ -n "$TS_IP" ]; then
    echo ""
    echo "  🔐 Tailscale: http://$TS_IP"
fi

echo ""
echo -e "${CYAN}🛠️  Useful Commands:${NC}"
echo ""
echo "  View logs:       docker-compose -f docker-compose.production.yml logs -f"
echo "  Stop services:   docker-compose -f docker-compose.production.yml stop"
echo "  Start services:  docker-compose -f docker-compose.production.yml start"
echo "  Restart:         docker-compose -f docker-compose.production.yml restart"
echo "  Health check:    ./health-check.sh"
echo "  Backup:          ./backup.sh"
echo "  Restore:         ./restore.sh"
echo ""

echo -e "${CYAN}📚 Documentation:${NC}"
echo ""
echo "  Full guide: PRODUCTION-DEPLOYMENT.md"
echo ""

echo -e "${GREEN}🎉 Happy deploying!${NC}"
echo ""
