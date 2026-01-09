# Phase 2: The Evolution of Todo (Full-Stack)

This phase marks the transition from a simple CLI application to a modern, scalable full-stack productivity suite. It features a robust backend API and a visually stunning, feature-rich frontend.

## Architecture Overview

The system follows a modern decoupled architecture:

- **Frontend**: Next.js 15+ application with TypeScript, Tailwind CSS, and Framer Motion.
- **Backend**: FastAPI REST API using SQLModel (SQLAlchemy + Pydantic) for high performance and type safety.
- **Database**: PostgreSQL hosted on Neon (Serverless), providing reliable persistence.
- **Authentication**: Better Auth with support for Email/Password and Social Providers (Google/GitHub).
- **Deployment**: Both frontend and backend are optimized for Vercel deployment.

## Sub-Projects

### [/backend](./backend)
A production-ready REST API that handles:
- Task CRUD operations with strict user isolation.
- Advanced filtering, searching, and sorting.
- JWT-based authentication.
- Automated database migrations and schema management.

### [/frontend](./frontend)
A "glassmorphism" inspired UI that provides:
- Real-time task management.
- Dynamic analytics dashboard.
- Dark/Light mode support.
- Fully responsive and mobile-optimized layout.
- Social login integration.

## Key Features

- **Hybrid Cloud Integration**: Connects a local or serverless frontend to a managed cloud database.
- **Modern UI/UX**: Built with Radix UI primitives (Shadcn UI) and custom animations.
- **Secure by Design**: Enforces user data isolation and follows security best practices for JWT and OAuth.
- **Production Ready**: Includes comprehensive build scripts, linting, and environment configuration.
