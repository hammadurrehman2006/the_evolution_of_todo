"""FastAPI application entry point for Task Management API."""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from config import settings
from database import create_db_and_tables
from datetime import datetime
import traceback

# Create FastAPI application
app = FastAPI(
    title="Task Management API",
    version="1.0.0",
    description="Backend REST API for task management with JWT authentication",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
origins = settings.cors_origins_list
# Ensure production Vercel domain is always included
production_origin = "https://the-evolution-of-todo-ten.vercel.app"
if production_origin not in origins:
    origins.append(production_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with standardized format."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "message": "Invalid request parameters"
        }
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors with standardized format."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Not Found",
            "message": "Resource not found"
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    # PRINT THE ERROR SO VERCEL LOGS IT
    print(f"CRITICAL ERROR: {exc}") 
    traceback.print_exc() 
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        }
    )


# Health check endpoint (no authentication required)
@app.get("/health", tags=["health"])
async def health_check():
    """
    Check API health status.

    Returns:
        dict: Health status with timestamp and version
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    }


# Create database tables on startup
@app.on_event("startup")
def on_startup():
    """Initialize database tables on application startup."""
    create_db_and_tables()


# Import and register routers
from routes import tasks
app.include_router(tasks.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
