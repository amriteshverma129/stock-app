# 🚀 Deployment Guide

Complete guide for deploying the Stock Market Data Science Dashboard to production.

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Docker Deployment](#docker-deployment)
3. [Manual Deployment](#manual-deployment)
4. [Cloud Platforms](#cloud-platforms)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Security Checklist](#security-checklist)
8. [Monitoring](#monitoring)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Scaling](#scaling)

---

## Deployment Overview

### Recommended Architecture

```
┌──────────────────────────────────────┐
│      Cloudflare CDN (Optional)       │
└──────────────────────────────────────┘
                 │
┌──────────────────────────────────────┐
│    Vercel (Frontend - Next.js)       │
│    - Auto-scaling                    │
│    - Global CDN                      │
│    - Zero-config SSL                 │
└──────────────────────────────────────┘
                 │
                 │ HTTPS API Calls
                 ▼
┌──────────────────────────────────────┐
│  AWS EC2 / DigitalOcean (Backend)    │
│  - FastAPI Application               │
│  - Nginx Reverse Proxy               │
│  - SSL Certificate (Let's Encrypt)   │
│  - PM2 Process Manager               │
└──────────────────────────────────────┘
                 │
┌──────────────────────────────────────┐
│    Redis Cache (Optional)            │
│    - API response caching            │
│    - Model caching                   │
└──────────────────────────────────────┘
```

### Deployment Options

| Option | Complexity | Cost | Best For |
|--------|-----------|------|----------|
| Docker Compose | Low | Low | Development/Testing |
| Vercel + Railway | Low | Medium | Quick production |
| Vercel + AWS EC2 | Medium | Medium | Production |
| Kubernetes | High | High | Enterprise |

---

## Docker Deployment

### Option 1: Docker Compose (Easiest)

**Prerequisites:**
- Docker installed
- Docker Compose installed

**Step 1: Update docker-compose.yml**

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATA_FOLDER=/app/data
      - CACHE_ENABLED=true
      - LOG_LEVEL=INFO
    restart: unless-stopped
    networks:
      - stock-network

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - stock-network

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - stock-network

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - stock-network

networks:
  stock-network:
    driver: bridge
```

**Step 2: Build and Run**

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Step 3: Access Application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Docker Production Build

**Backend Dockerfile** (`backend/Dockerfile.prod`):

```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/')"

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**Frontend Dockerfile** (`frontend/Dockerfile.prod`):

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

---

## Manual Deployment

### Backend Deployment (Ubuntu Server)

**Step 1: Server Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.9+
sudo apt install python3.9 python3.9-venv python3-pip -y

# Install Nginx
sudo apt install nginx -y

# Install supervisor (process manager)
sudo apt install supervisor -y
```

**Step 2: Deploy Application**

```bash
# Create app directory
sudo mkdir -p /var/www/stock-api
sudo chown $USER:$USER /var/www/stock-api

# Clone repository
cd /var/www/stock-api
git clone <your-repo-url> .

# Create virtual environment
cd backend
python3.9 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Gunicorn (production server)
pip install gunicorn
```

**Step 3: Create Systemd Service**

Create `/etc/systemd/system/stock-api.service`:

```ini
[Unit]
Description=Stock Market API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/stock-api/backend
Environment="PATH=/var/www/stock-api/backend/venv/bin"
ExecStart=/var/www/stock-api/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Step 4: Start Service**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable stock-api

# Start service
sudo systemctl start stock-api

# Check status
sudo systemctl status stock-api

# View logs
sudo journalctl -u stock-api -f
```

**Step 5: Configure Nginx**

Create `/etc/nginx/sites-available/stock-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/stock-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Step 6: SSL Certificate (Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

### Frontend Deployment (Vercel - Recommended)

**Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

**Step 2: Deploy**

```bash
cd frontend
vercel login
vercel --prod
```

**Step 3: Set Environment Variables**

In Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com`

**Alternative: Build and Deploy to Nginx**

```bash
# Build Next.js app
cd frontend
npm run build

# Copy build to server
scp -r .next public package.json server:/var/www/stock-frontend/

# On server, install PM2
npm install -g pm2

# Start app
cd /var/www/stock-frontend
pm2 start npm --name "stock-frontend" -- start
pm2 save
pm2 startup
```

---

## Cloud Platforms

### AWS EC2 Deployment

**Step 1: Launch EC2 Instance**

1. Choose Ubuntu 22.04 LTS
2. Instance type: t3.medium (2 vCPU, 4GB RAM)
3. Configure security group:
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (8000) - 0.0.0.0/0 (for testing)

**Step 2: Connect and Deploy**

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow manual deployment steps above
```

**Step 3: Configure Elastic IP (Optional)**

- Allocate Elastic IP in AWS Console
- Associate with EC2 instance
- Update DNS records

### DigitalOcean Deployment

**Step 1: Create Droplet**

```bash
# Using doctl CLI
doctl compute droplet create stock-api \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc1 \
  --ssh-keys <your-ssh-key-id>
```

**Step 2: Deploy Application**

Same as manual deployment steps.

### Railway Deployment (Easiest)

**Step 1: Install Railway CLI**

```bash
npm install -g @railway/cli
```

**Step 2: Deploy Backend**

```bash
cd backend
railway login
railway init
railway up
```

**Step 3: Add Environment Variables**

In Railway Dashboard:
- Add environment variables
- Connect to GitHub repo for auto-deployment

### Heroku Deployment

**Backend:**

Create `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Deploy:
```bash
heroku create stock-api
git push heroku main
```

---

## Environment Variables

### Production Environment Variables

**Backend** (`.env.prod`):
```bash
# Application
ENV=production
DEBUG=False
LOG_LEVEL=INFO

# API
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
API_KEY=your-secure-api-key

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Cache
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=300

# External APIs
YAHOO_FINANCE_RATE_LIMIT=100

# Security
SECRET_KEY=your-very-secret-key-here
```

**Frontend** (`.env.production`):
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## Database Setup

### PostgreSQL Setup (Production)

**Step 1: Install PostgreSQL**

```bash
sudo apt install postgresql postgresql-contrib -y
```

**Step 2: Create Database**

```bash
sudo -u postgres psql

CREATE DATABASE stock_market;
CREATE USER stock_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE stock_market TO stock_user;
\q
```

**Step 3: Update Backend Code**

```python
# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

---

## Security Checklist

### Pre-Deployment Security

- [ ] Change all default passwords
- [ ] Generate secure SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall (UFW)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up log rotation
- [ ] Configure backup strategy
- [ ] Use environment variables (never commit secrets)
- [ ] Disable debug mode
- [ ] Set up monitoring/alerts

### Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### Rate Limiting (Nginx)

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;

server {
    location /api/ {
        limit_req zone=api_limit burst=10 nodelay;
        proxy_pass http://127.0.0.1:8000;
    }
}
```

---

## Monitoring

### Application Monitoring

**Install Prometheus + Grafana:**

```bash
# Using Docker
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3001:3000 grafana/grafana
```

**Add metrics to FastAPI:**

```python
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app)
```

### Error Tracking (Sentry)

```bash
# Install Sentry SDK
pip install sentry-sdk[fastapi]
```

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### Log Management

**Configure Log Rotation:**

Create `/etc/logrotate.d/stock-api`:

```
/var/log/stock-api/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/stock-api
            git pull origin main
            cd backend
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart stock-api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Scaling

### Horizontal Scaling

**Load Balancer Configuration (Nginx):**

```nginx
upstream backend {
    least_conn;
    server backend1.example.com:8000;
    server backend2.example.com:8000;
    server backend3.example.com:8000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### Caching Strategy

**Redis Caching:**

```python
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(ttl=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{args}:{kwargs}"
            cached = redis_client.get(cache_key)
            
            if cached:
                return json.loads(cached)
            
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            
            return result
        return wrapper
    return decorator

@app.get("/stocks/{symbol}")
@cache_result(ttl=60)
async def get_stock(symbol: str):
    # Cached for 60 seconds
    pass
```

---

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify frontend loads correctly
- [ ] Check database connections
- [ ] Test stock predictions
- [ ] Verify SSL certificate
- [ ] Monitor server resources
- [ ] Set up automated backups
- [ ] Configure alerts
- [ ] Update DNS records
- [ ] Document deployment process

---

## Troubleshooting Deployment

### Service Won't Start

```bash
# Check service status
sudo systemctl status stock-api

# View recent logs
sudo journalctl -u stock-api -n 50

# Test application manually
cd /var/www/stock-api/backend
source venv/bin/activate
python main.py
```

### High Memory Usage

```bash
# Check memory
free -h

# Check process memory
ps aux | grep python

# Reduce workers in gunicorn
# Change -w 4 to -w 2
```

### Slow Response Times

- Enable caching (Redis)
- Optimize database queries
- Add more workers
- Use CDN for static assets
- Enable gzip compression

---

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh

# Backup database
pg_dump stock_market > /backups/db_$(date +%Y%m%d).sql

# Backup application
tar -czf /backups/app_$(date +%Y%m%d).tar.gz /var/www/stock-api

# Upload to S3
aws s3 cp /backups/ s3://your-bucket/backups/ --recursive

# Keep only last 7 days
find /backups -type f -mtime +7 -delete
```

**Set up cron job:**

```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## Support

For deployment issues:
1. Check logs: `sudo journalctl -u stock-api -f`
2. Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Open GitHub issue with deployment details

---

**Last Updated**: October 14, 2025

