from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import auth, todos, users
from src.database import engine
import src.models  # Import all models to register them with SQLModel

app = FastAPI(title="Todo API", version="1.0.0")

# CORS middleware - in production, configure this properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(todos.router, prefix="/api/todos", tags=["todos"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
def read_root():
    return {"message": "Todo API is running"}

@app.on_event("startup")
def startup_event():
    # Create database tables
    src.models.create_db_and_tables()