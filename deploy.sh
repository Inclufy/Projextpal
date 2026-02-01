#!/bin/bash

set -e

echo "🚀 ProjeXtPal - Deploy from GitLab Registry"
echo "==========================================="

# Login to GitLab Registry
echo ""
echo "🔐 Logging in to GitLab Container Registry..."
docker login registry.gitlab.com

# Pull latest frontend image
echo ""
echo "📥 Pulling latest frontend image..."
docker pull registry.gitlab.com/inclufy/projextpal/frontend:latest

# Stop old frontend
echo ""
echo "🛑 Stopping old frontend..."
docker-compose -f docker-compose.production.yml stop frontend
docker-compose -f docker-compose.production.yml rm -f frontend

# Start new frontend
echo ""
echo "✅ Starting new frontend..."
docker-compose -f docker-compose.production.yml up -d frontend

# Show logs
echo ""
echo "📝 Container logs:"
docker-compose -f docker-compose.production.yml logs frontend --tail=20

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Frontend: http://localhost:8083"
