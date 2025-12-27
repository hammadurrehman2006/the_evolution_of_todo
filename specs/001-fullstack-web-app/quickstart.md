# Quickstart Guide: Phase 2 Full-Stack Web Application

## Prerequisites
- Node.js 18+ for Next.js frontend
- Python 3.11+ for FastAPI backend
- PostgreSQL-compatible database (Neon DB)
- Docker (optional, for containerization)

## Project Setup

### 1. Clone and Initialize
```bash
# Clone the repository
git clone <repository-url>
cd phase2

# Initialize the project
mkdir frontend backend
```

### 2. Frontend Setup (Next.js 16+)
```bash
# Navigate to frontend directory
cd frontend

# Initialize Next.js project
npm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/"

# Install authentication dependencies
npm install better-auth @better-auth/ui-react
npm install @types/node @types/react
```

### 3. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] psycopg2-binary sqlmodel python-multipart python-dotenv better-auth

# Install async database driver if using async database
pip install asyncpg
```

## Configuration

### 1. Environment Variables

Create `.env` files in both frontend and backend:

**Backend (.env):**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=RS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_HOURS=24
NEON_DATABASE_URL=your-neon-db-url
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
```

### 2. Better Auth Configuration
```typescript
// frontend/lib/auth.ts
import { betterAuth } from "better-auth";
import { postgresAdapter } from "@better-auth/postgres-adapter";
import { neon } from "neon-serverless";

const db = neon(process.env.NEON_DATABASE_URL!);

export const auth = betterAuth({
  database: postgresAdapter(db, {
    user: {
      id: "id",
      email: "email",
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  advanced: {
    generateUserId: () => `user_${crypto.randomUUID()}`,
  },
});
```

### 3. FastAPI JWT Setup
```python
# backend/auth/jwt_handler.py
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import HTTPException, status
from pydantic import BaseModel

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class TokenData(BaseModel):
    user_id: str
    email: str
    role: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role", "user")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id, email=email, role=role)
    except jwt.PyJWTError:
        raise credentials_exception
    return token_data
```

## Running the Application

### 1. Start Backend
```bash
# From backend directory
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend
```bash
# From frontend directory
cd frontend
npm run dev
```

## Key Endpoints

### Frontend Routes
- `http://localhost:3000` - Main application
- `http://localhost:3000/api/auth/*` - Better Auth endpoints

### Backend API
- `http://localhost:8000/api/todos` - Todo management
- `http://localhost:8000/api/users` - User management
- `http://localhost:8000/api/auth/token` - JWT token endpoints

## Development Workflow

1. **Database Migrations**: Use SQLModel for schema management
2. **Authentication**: All API calls require JWT tokens
3. **Data Isolation**: Verify user_id in all queries to prevent cross-user access
4. **Testing**: Run both frontend and backend tests
5. **Deployment**: Containerize with Docker for production

## Security Notes
- Never expose JWT secrets in frontend code
- Use HTTPS in production
- Validate all user inputs
- Implement rate limiting for authentication endpoints
- Regularly rotate JWT secrets