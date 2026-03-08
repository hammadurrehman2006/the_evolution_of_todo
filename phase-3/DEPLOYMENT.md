# Phase 3 Deployment Guide

## Overview

This guide covers deployment of the Task Hive application (Phase 3) to Vercel.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│  Neon Database  │
│   (Next.js)     │     │   (FastAPI)     │     │  (PostgreSQL)   │
│   Vercel        │     │   Vercel        │     │  Neon.tech      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Neon Database** - Sign up at [neon.tech](https://neon.tech)
3. **GitHub Account** - For CI/CD pipelines
4. **OpenRouter API Key** (optional) - For AI chatbot features

## Quick Start

### 1. Clone and Setup

```bash
cd phase-3

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)
```bash
cd phase-3/backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require
JWT_SECRET=<generate-with-openssl-rand-hex-32>
JWT_ALGORITHM=HS256
CORS_ORIGINS=["http://localhost:3000", "https://your-frontend.vercel.app"]
OPENROUTER_API_KEY=your-api-key
```

#### Frontend (.env.local)
```bash
cd phase-3/frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=<same-as-backend-JWT_SECRET>
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require
```

### 3. Local Development

**Terminal 1 - Backend:**
```bash
cd phase-3/backend
python3 main.py
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

**Terminal 2 - Frontend:**
```bash
cd phase-3/frontend
npm run dev
# Frontend running at http://localhost:3000
```

## Deployment to Vercel

### Step 1: Deploy Backend

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Root Directory**: `phase-3/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Install Command**: (leave empty)
   - **Output Directory**: (leave empty)

4. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   JWT_ALGORITHM=HS256
   CORS_ORIGINS=["https://your-frontend.vercel.app"]
   OPENROUTER_API_KEY=your-api-key
   ```

5. Deploy!

### Step 2: Deploy Frontend

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Root Directory**: `phase-3/frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: (leave empty)

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
   BETTER_AUTH_SECRET=your-secret-key
   ```

5. Deploy!

### Step 3: Update CORS Origins

After deploying frontend, update backend's `CORS_ORIGINS` to include the frontend URL.

## MCP Server Setup

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "todo-mcp": {
      "command": "uv",
      "args": [
        "--directory",
        "/path/to/phase-3/backend/mcp-server",
        "run",
        "python3",
        "src/server.py"
      ],
      "env": {
        "PYTHONPATH": ".",
        "DATABASE_URL": "${env:DATABASE_URL}",
        "MCP_USER_ID": "${env:MCP_USER_ID:-default-mcp-user}"
      }
    }
  }
}
```

### Environment Variables for MCP

```bash
cd phase-3/backend/mcp-server
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require
MCP_USER_ID=default-mcp-user
```

## CI/CD Setup

### GitHub Secrets Required

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_BACKEND_PROJECT_ID` | Backend project ID |
| `VERCEL_FRONTEND_PROJECT_ID` | Frontend project ID |

### Get Vercel Token

```bash
npm install -g vercel
vercel login
vercel tokens ls
```

## Database Migrations

The application auto-creates tables on startup. For schema changes:

1. Update `models.py`
2. Tables auto-update on next deployment
3. For complex migrations, use Alembic:

```bash
cd phase-3/backend
alembic init alembic
# Configure alembic.ini
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function execution time
- Check error rates

### Neon Dashboard
- Monitor database performance
- View query statistics
- Set up alerts

## Troubleshooting

### Backend Issues

**Import Errors:**
```bash
pip install -r requirements.txt
```

**Database Connection:**
- Check `DATABASE_URL` format
- Ensure SSL mode is `require`
- Verify Neon connection string

**CORS Errors:**
- Add frontend URL to `CORS_ORIGINS`
- Include both http and https variants

### Frontend Issues

**Build Fails:**
```bash
npm run build
# Check for TypeScript errors
npm run type-check
```

**API Connection:**
- Verify `NEXT_PUBLIC_API_URL`
- Check browser console for errors

**Auth Issues:**
- Ensure `BETTER_AUTH_SECRET` matches backend
- Clear browser cache and cookies

## Security Checklist

- [ ] Generate unique `JWT_SECRET` (don't use examples)
- [ ] Enable SSL for database (`sslmode=require`)
- [ ] Set proper `CORS_ORIGINS` (no wildcards in production)
- [ ] Use environment variables (never commit secrets)
- [ ] Enable Vercel's security features
- [ ] Set up database backups

## Performance Optimization

### Backend
- Connection pooling enabled (pool_size=5, max_overflow=10)
- `pool_pre_ping=True` for connection health checks
- Consider Redis caching for frequent queries

### Frontend
- Next.js automatic code splitting
- Image optimization enabled
- Consider ISR for static content

## Support

For issues:
1. Check logs in Vercel dashboard
2. Review error messages in browser console
3. Test API endpoints at `/docs`
4. Verify database connection in Neon dashboard
