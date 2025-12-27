# Environment Setup Guide

This document explains how to set up the environment variables for the Todo App Full-Stack Web Application.

## Prerequisites

Before running the application, you'll need:
- Node.js (for frontend)
- Python 3.13+ (for backend)
- PostgreSQL database (Neon Postgres recommended)

## Environment Variables

### 1. Database Configuration (Neon PostgreSQL)

You need to set up a Neon PostgreSQL database:

```bash
# Sign up at https://neon.tech and create a project
# Get your connection string from the Neon dashboard
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
NEON_PROJECT_ID=your-neon-project-id
NEON_API_KEY=your-neon-api-key
```

### 2. JWT Configuration

Generate strong secret keys for JWT tokens:

```bash
# Generate using: openssl rand -base64 32
JWT_ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-here-make-it-long-and-random
JWT_REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here-make-it-long-and-random
JWT_ACCESS_TOKEN_EXPIRY=15m  # 15 minutes
JWT_REFRESH_TOKEN_EXPIRY=7d  # 7 days
```

### 3. Backend Configuration

```bash
BACKEND_PORT=8000           # Port for the backend server
BACKEND_HOST=localhost      # Host for the backend server
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8000  # Allowed origins
```

### 4. Frontend Configuration

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api  # Backend API URL
NEXT_PUBLIC_APP_URL=http://localhost:3000      # Frontend URL
NEXT_PUBLIC_APP_NAME=Todo App                  # Application name
```

### 5. Authentication Configuration

```bash
ACCESS_TOKEN_COOKIE_NAME=access_token    # Name for access token cookie
REFRESH_TOKEN_COOKIE_NAME=refresh_token  # Name for refresh token cookie
COOKIE_SECURE=false                      # Set to true in production with HTTPS
COOKIE_HTTP_ONLY=true                    # Prevents XSS attacks
COOKIE_SAME_SITE=strict                  # CSRF protection
```

## Setup Instructions

### Option 1: Copy .env.example

1. Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cd phase2
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual configuration:
   ```bash
   # Edit the file and replace placeholder values
   nano .env  # or use your preferred editor
   ```

### Option 2: Individual Environment Variables

You can also set environment variables directly in your terminal:

```bash
# For Linux/Mac
export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
export JWT_ACCESS_TOKEN_SECRET="your-secret-key"
# ... etc

# For Windows Command Prompt
set DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
set JWT_ACCESS_TOKEN_SECRET=your-secret-key
# ... etc

# For Windows PowerShell
$env:DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
$env:JWT_ACCESS_TOKEN_SECRET="your-secret-key"
# ... etc
```

## Security Guidelines

### JWT Secrets
- Use strong, random secrets (at least 32 characters)
- Generate using: `openssl rand -base64 32`
- Never commit secrets to version control
- Use different secrets for development and production

### Database Connection
- Use SSL connection to database (recommended)
- Never expose database credentials in frontend code
- Use environment variables for database configuration

### Cookie Security
- In production, set `COOKIE_SECURE=true` when using HTTPS
- Use `COOKIE_HTTP_ONLY=true` to prevent XSS access to tokens
- Use `COOKIE_SAME_SITE=strict` for CSRF protection

## Development vs Production

For development:
```bash
NODE_ENV=development
APP_ENV=development
COOKIE_SECURE=false
```

For production:
```bash
NODE_ENV=production
APP_ENV=production
COOKIE_SECURE=true
LOG_LEVEL=warn
```

## Common Issues

### Missing Environment Variables
If you encounter errors about missing environment variables:
1. Check that your `.env` file is in the correct location
2. Verify that the file contains all required variables
3. Ensure your application is reading the `.env` file correctly

### Database Connection Issues
1. Verify your connection string format
2. Check that your database allows connections from your IP
3. Ensure SSL settings are correct

### JWT Token Issues
1. Verify that JWT secrets match between frontend and backend
2. Check token expiration settings
3. Ensure proper token handling in requests

## Testing Your Setup

After setting up your environment variables:

1. For backend:
   ```bash
   cd phase2/backend
   # Make sure your .env file is in the backend directory
   python -m src.main  # or your start command
   ```

2. For frontend:
   ```bash
   cd phase2/frontend
   # Make sure NEXT_PUBLIC_ variables are available
   npm run dev  # or your start command
   ```

Your application should now start without environment variable errors.