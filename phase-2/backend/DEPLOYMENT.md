# Backend Deployment Guide

Complete guide for deploying the TaskHive Backend API to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment Options](#production-deployment-options)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Deployment Steps](#deployment-steps)
7. [Health Checks & Monitoring](#health-checks--monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Python**: 3.10 or higher (tested with 3.13)
- **pip**: Latest version
- **PostgreSQL**: Neon Serverless PostgreSQL (or PostgreSQL 14+)
- **Git**: For version control

### Accounts Needed
- **Neon Database**: https://neon.tech (free tier available)
- **Deployment Platform**: Choose one:
  - Railway (recommended for beginners)
  - Render
  - Fly.io
  - AWS EC2 + RDS
  - DigitalOcean App Platform
  - Heroku

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/hammadurrehman2006/the_evolution_of_todo.git
cd the_evolution_of_todo/phase-2/backend
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
# Database Configuration - Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Configuration (IMPORTANT: Change in production!)
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000"]
```

### 5. Generate Secure JWT Secret
```bash
# Generate a secure random secret
openssl rand -hex 32

# Or using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 6. Start Development Server
```bash
# Run with auto-reload
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using the main.py directly
python3 main.py
```

Access Swagger UI: http://localhost:8000/docs

---

## Production Deployment Options

### Option 1: Railway (Recommended - Easiest)

#### Step 1: Prepare for Deployment
1. Ensure all code is committed to GitHub
2. Create `railway.toml` in backend directory:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

#### Step 2: Deploy to Railway
1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Python and deploy

#### Step 3: Add Neon Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Or connect your existing Neon database
3. Railway will automatically set `DATABASE_URL`

#### Step 4: Configure Environment Variables
In Railway dashboard → Variables tab, add:
```
JWT_SECRET=<your-generated-secret>
JWT_ALGORITHM=HS256
CORS_ORIGINS=["https://your-frontend-domain.com"]
```

#### Step 5: Deploy
Railway automatically deploys on git push. Your API will be at:
```
https://your-app.railway.app
```

---

### Option 2: Render

#### Step 1: Create `render.yaml`
```yaml
services:
  - type: web
    name: taskhive-backend
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_ALGORITHM
        value: HS256
      - key: CORS_ORIGINS
        value: '["https://your-frontend.com"]'
```

#### Step 2: Deploy
1. Go to https://render.com
2. New → Web Service → Connect GitHub repository
3. Render auto-detects Python and deploys
4. Add environment variables in dashboard

---

### Option 3: Docker Deployment (AWS, DigitalOcean, etc.)

#### Step 1: Create `Dockerfile`
```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python3 -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Step 2: Create `.dockerignore`
```
venv/
__pycache__/
*.pyc
.env
.git/
.pytest_cache/
*.log
```

#### Step 3: Build and Test Locally
```bash
# Build image
docker build -t taskhive-backend .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL="your_neon_url" \
  -e JWT_SECRET="your_secret" \
  taskhive-backend
```

#### Step 4: Deploy to Container Platform
- **AWS ECS/Fargate**: Push to ECR, create task definition
- **DigitalOcean App Platform**: Connect to GitHub, auto-deploys
- **Google Cloud Run**: Push to GCR, deploy serverless

---

## Environment Configuration

### Production Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Yes | Secret key for JWT signing (min 32 chars) | `a1b2c3d4e5f6...` |
| `JWT_ALGORITHM` | No | JWT algorithm (default: HS256) | `HS256` |
| `JWT_EXPIRATION_HOURS` | No | Token expiration time (default: 24) | `24` |
| `CORS_ORIGINS` | No | Allowed frontend origins | `["https://app.com"]` |
| `PORT` | No | Server port (default: 8000) | `8000` |

### Generating Secure Secrets

```bash
# For JWT_SECRET (minimum 32 characters)
openssl rand -hex 32

# Or using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Database Setup

### Using Neon (Recommended)

#### Step 1: Create Neon Project
1. Go to https://console.neon.tech
2. Create new project
3. Copy connection string

#### Step 2: Configure Connection
Your Neon connection string format:
```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

Example:
```
postgresql://neondb_owner:abc123@ep-cool-name-123456.aws.neon.tech/neondb?sslmode=require
```

#### Step 3: Database Migration
The application automatically creates tables on startup via:
```python
# In main.py
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
```

No manual migration needed for initial deployment!

### Connection Pooling

The application uses SQLModel with connection pooling:
```python
# In database.py
engine = create_engine(
    settings.database_url,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections
    pool_size=10,        # Concurrent connections
    max_overflow=20      # Additional connections when needed
)
```

---

## Deployment Steps

### Step-by-Step Production Deployment

#### 1. Prepare Code
```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### 2. Set Up Database
1. Create Neon PostgreSQL database
2. Copy connection string
3. Note it for environment variables

#### 3. Generate Secrets
```bash
# Generate JWT secret
openssl rand -hex 32
```

#### 4. Choose Deployment Platform
- Follow platform-specific instructions above
- Railway: Easiest, auto-deploys from GitHub
- Render: Good free tier, easy setup
- Docker: Most flexible, any cloud provider

#### 5. Configure Environment
Set these variables in your platform:
```
DATABASE_URL=postgresql://...
JWT_SECRET=<generated-secret>
JWT_ALGORITHM=HS256
CORS_ORIGINS=["https://your-frontend.com"]
```

#### 6. Deploy Application
- Railway/Render: Auto-deploys on git push
- Docker: Build image, push to registry, deploy

#### 7. Verify Deployment
```bash
# Check health endpoint
curl https://your-api-url.com/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2026-01-03T10:00:00Z",
  "version": "1.0.0"
}
```

#### 8. Test Authentication
```bash
# Generate test token
python3 generate_test_token.py

# Test authenticated endpoint
curl -H "Authorization: Bearer <token>" \
  https://your-api-url.com/tasks/
```

---

## Health Checks & Monitoring

### Health Check Endpoint

The API provides a health check at `/health`:

```bash
curl https://your-api-url.com/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-03T10:00:00Z",
  "version": "1.0.0"
}
```

### Monitoring Setup

#### 1. Application Logs
Most platforms provide built-in logging:
- **Railway**: Logs tab in dashboard
- **Render**: Logs section
- **AWS**: CloudWatch Logs

#### 2. Database Monitoring
Neon provides:
- Connection count
- Query performance
- Storage usage
- Available in Neon console

#### 3. Uptime Monitoring
Use services like:
- **UptimeRobot**: Free tier available
- **Pingdom**: Professional monitoring
- **BetterStack**: Modern monitoring

Configure to ping `/health` every 5 minutes.

### Performance Metrics

Key metrics to monitor:
1. **Response Time**: p50, p95, p99 latency
2. **Error Rate**: 4xx and 5xx responses
3. **Database Connections**: Active connections
4. **Request Volume**: Requests per second

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failures

**Symptoms:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solutions:**
- Verify `DATABASE_URL` is correct
- Check Neon database is active (not suspended)
- Ensure `?sslmode=require` is in connection string
- Verify network connectivity
- Check Neon dashboard for connection limits

#### 2. Authentication Errors

**Symptoms:**
```
{"detail": "Invalid token"}
```

**Solutions:**
- Verify JWT_SECRET matches between token generation and API
- Check token hasn't expired (default 24 hours)
- Ensure `Authorization: Bearer <token>` header format
- Generate fresh token with `generate_test_token.py`

#### 3. CORS Errors

**Symptoms:**
```
Access to fetch at 'API_URL' from origin 'FRONTEND_URL' has been blocked by CORS
```

**Solutions:**
- Add frontend URL to `CORS_ORIGINS` environment variable
- Format: `["https://your-frontend.com","http://localhost:3000"]`
- Restart API after changing environment variables
- Check browser console for exact origin being blocked

#### 4. 404 Not Found

**Symptoms:**
```
{"error":"Not Found","message":"Resource not found"}
```

**Solutions:**
- Verify resource exists (check task ID)
- Ensure user_id matches (JWT token user owns the resource)
- Check API endpoint URL (include trailing slash for FastAPI)

#### 5. Port Already in Use

**Symptoms:**
```
OSError: [Errno 48] Address already in use
```

**Solutions:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port
uvicorn main:app --port 8001
```

### Debug Mode

For troubleshooting, enable detailed SQL logging:

In `database.py`, set `echo=True`:
```python
engine = create_engine(
    settings.database_url,
    echo=True,  # Logs all SQL queries
    ...
)
```

**Warning:** Disable in production (performance impact)

### Getting Help

1. **Check Logs**: First place to look
   - Application logs (uvicorn output)
   - Database logs (Neon console)
   - Platform logs (Railway/Render dashboard)

2. **Test Locally**: Reproduce issue in development
   ```bash
   python3 main.py
   # Test with curl or Swagger UI
   ```

3. **Use Test Script**: Run comprehensive tests
   ```bash
   bash test_endpoints.sh
   ```

4. **Check Documentation**:
   - API docs: `/docs` (Swagger UI)
   - ReDoc: `/redoc`
   - README.md
   - QUICKSTART.md

---

## Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` from default (use 32+ character random string)
- [ ] Set `CORS_ORIGINS` to actual frontend URL(s) only
- [ ] Use strong PostgreSQL password (Neon generates this)
- [ ] Enable database SSL (`?sslmode=require` in connection string)
- [ ] Set up HTTPS/TLS for API (most platforms provide free certificates)
- [ ] Never commit `.env` file (in `.gitignore`)
- [ ] Use environment variables for all secrets
- [ ] Regularly rotate JWT secret in production
- [ ] Monitor failed authentication attempts
- [ ] Set up database backups (Neon provides automatic backups)
- [ ] Configure rate limiting (consider using Cloudflare or API gateway)

---

## Production Checklist

- [ ] Code committed and pushed to GitHub
- [ ] Neon PostgreSQL database created
- [ ] Secure JWT_SECRET generated (32+ chars)
- [ ] Environment variables configured
- [ ] Application deployed to platform
- [ ] Health check endpoint responding
- [ ] Authentication tested
- [ ] CORS configured for frontend
- [ ] Monitoring set up
- [ ] Logs accessible
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## Quick Reference

### Deployment URLs
```
Swagger UI: https://your-api.com/docs
ReDoc: https://your-api.com/redoc
Health Check: https://your-api.com/health
```

### Essential Commands
```bash
# Local development
python3 -m uvicorn main:app --reload

# Test all endpoints
bash test_endpoints.sh

# Generate JWT token
python3 generate_test_token.py

# Check health
curl https://your-api.com/health

# Test authentication
curl -H "Authorization: Bearer <token>" \
  https://your-api.com/tasks/
```

### Support Resources
- **Neon Docs**: https://neon.tech/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs

---

## Next Steps

After successful deployment:

1. **Connect Frontend**: Update frontend `API_BASE_URL` to production URL
2. **Set Up CI/CD**: Auto-deploy on main branch commits
3. **Add Tests**: Implement automated testing in CI pipeline
4. **Performance Tuning**: Optimize database queries and add caching
5. **Error Tracking**: Integrate Sentry or similar service
6. **API Versioning**: Plan for v2 endpoint structure
7. **Rate Limiting**: Protect against abuse
8. **Documentation**: Keep DEPLOYMENT.md updated

---

**Congratulations!** Your TaskHive Backend API is now deployed and ready for production use! 🚀

For questions or issues, refer to:
- README.md for API documentation
- QUICKSTART.md for testing guide
- GitHub Issues for bug reports
