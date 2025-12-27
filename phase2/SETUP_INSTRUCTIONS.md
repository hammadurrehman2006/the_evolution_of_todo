# Phase 2 Setup Instructions

This document provides comprehensive instructions for setting up the full-stack Todo application with backend and frontend services.

## Prerequisites

- Python 3.11+ (for backend)
- Node.js 18+ (for frontend)
- npm or yarn
- A Neon PostgreSQL account (for database)

## Backend Setup

### 1. Database Configuration (Neon PostgreSQL)

1. Create a Neon account at https://neon.tech/
2. Create a new project in Neon
3. Get your connection string from the project dashboard
4. Update the `DATABASE_URL` in your backend `.env` file

### 2. Backend Environment Variables

Create/update the `.env` file in the `phase2/backend/` directory:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
NEON_PROJECT_ID=your-project-id
NEON_API_KEY=your-api-key

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-here-make-it-long-and-random
JWT_REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here-make-it-long-and-random
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Backend Configuration
BACKEND_PORT=8000
BACKEND_HOST=localhost
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Authentication Configuration
ACCESS_TOKEN_COOKIE_NAME=access_token
REFRESH_TOKEN_COOKIE_NAME=refresh_token
COOKIE_SECURE=false  # Set to true in production
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=strict

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Development/Production Mode
NODE_ENV=development
APP_ENV=development
```

### 3. Backend Installation and Setup

```bash
cd phase2/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Start the backend server
uvicorn src.main:app --host localhost --port 8000 --reload
```

## Frontend Setup

### 1. Frontend Environment Variables

Create/update the `.env.local` file in the `phase2/frontend/` directory:

```env
# Database Configuration
DATABASE_URL="your-neon-database-connection-string-here"

# Better Auth Configuration
AUTH_SECRET="your-super-secret-jwt-key-here-make-sure-it-is-at-least-32-characters-long"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXTAUTH_URL="http://localhost:8000/api/auth"
AUTH_TRUST_HOST=true

# SMTP Configuration (optional - for email verification/password reset)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
# SMTP_FROM="noreply@yourapp.com"

# Social Provider Configuration (optional)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
```

### 2. Frontend Installation and Setup

```bash
cd phase2/frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

## Running Both Services

1. Start the backend first:
   ```bash
   cd phase2/backend
   source venv/bin/activate  # if using virtual environment
   uvicorn src.main:app --host localhost --port 8000 --reload
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd phase2/frontend
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## Running Playwright Tests

Before running the tests, ensure both backend and frontend services are running.

```bash
cd phase2/frontend

# Run all Playwright tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run tests with detailed output
npx playwright test --debug
```

## Docker Setup (Alternative)

If you prefer using Docker, you can use the provided docker-compose file:

```bash
cd phase2
docker-compose up --build
```

This will start both backend and frontend services with proper networking.

## Troubleshooting

### Common Issues:

1. **Database Connection Issues**: Ensure your Neon PostgreSQL connection string is correct and the database is accessible.

2. **CORS Issues**: Make sure the `BACKEND_CORS_ORIGINS` in the backend includes your frontend URL.

3. **Authentication Issues**: Verify that the `AUTH_SECRET` is the same in both backend and frontend environments.

4. **Port Conflicts**: If ports 8000 or 3000 are already in use, update the configuration files accordingly.

### Test Database Setup:

For running tests, make sure your database is properly set up with the necessary tables. The backend will automatically create tables on startup, but you can also run migrations manually:

```bash
cd phase2/backend
alembic upgrade head
```