# Task Management API (Phase 2 Backend)

A high-performance REST API for task management built with FastAPI, SQLModel, and Neon PostgreSQL.

## Features

- **FastAPI Core**: Asynchronous request handling and automatic OpenAPI (Swagger) documentation.
- **SQLModel Persistence**: Type-safe database interactions with PostgreSQL.
- **Secure Authentication**: JWT Bearer token authentication with strict user-level data isolation.
- **Advanced Querying**: Search by keyword, filter by multiple criteria (status, priority, tags, dates), and customizable sorting.
- **Robust Model**: Tasks support priorities, tags, recurrence rules (RRULE), and reminders.

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **ORM/Validation**: [SQLModel](https://sqlmodel.tiangolo.com/)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/)
- **Auth**: [Better Auth](https://www.better-auth.com/) / JWT

## Getting Started

### 1. Installation
```bash
pip install -r requirements.txt
```

### 2. Environment Setup
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your_super_secret_key
CORS_ORIGINS=["http://localhost:3000"]
```

### 3. Running the Server
```bash
python main.py
```
Visit `http://localhost:8000/docs` for the interactive API documentation.

## Project Structure
- `main.py`: Application entry point and configuration.
- `models.py`: Database table definitions.
- `schemas.py`: Data validation and API response shapes.
- `routes/`: API endpoint implementations.
- `dependencies.py`: Shared dependencies like authentication.