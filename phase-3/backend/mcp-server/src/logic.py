from typing import List, Optional
from datetime import datetime, timezone
from sqlmodel import Session, select
from .models import Task, CreateTaskInput, UpdateTaskInput, TaskFilter, PriorityEnum
from . import database
from .config import settings
import uuid
import json

class TaskManager:
    def __init__(self):
        # Database tables will be created on first operation
        # This avoids connection attempts during import
        pass

    def _ensure_tables(self):
        """Ensure database tables exist (called lazily)."""
        database.create_db_and_tables()
        self._ensure_tables = lambda: None  # Only run once

    def create_task(self, input_data: CreateTaskInput) -> Task:
        self._ensure_tables()
        with Session(database.engine) as session:
            try:
                # Check for idempotency if client_request_id is provided
                if input_data.client_request_id:
                    existing_statement = select(Task).where(
                        Task.client_request_id == input_data.client_request_id,
                        Task.user_id == settings.mcp_user_id
                    )
                    existing_task = session.exec(existing_statement).first()
                    if existing_task:
                        # Return existing task for idempotency
                        return existing_task

                task = Task(
                    user_id=settings.mcp_user_id,
                    title=input_data.title,
                    description=input_data.description,
                    priority=input_data.priority or PriorityEnum.MEDIUM,
                    due_date=input_data.due_date,
                    tags=input_data.tags or [],
                    client_request_id=input_data.client_request_id
                )

                session.add(task)
                session.commit()
                session.refresh(task)
                return task
            except Exception as e:
                session.rollback()
                raise RuntimeError(f"Failed to create task: {e}")

    def read_tasks(self, filter_data: Optional[TaskFilter] = None) -> List[Task]:
        with Session(database.engine) as session:
            statement = select(Task).where(Task.user_id == settings.mcp_user_id)

            if filter_data:
                if filter_data.completed is not None:
                    statement = statement.where(Task.completed == filter_data.completed)
                if filter_data.priority:
                    statement = statement.where(Task.priority == filter_data.priority)
                if filter_data.tag:
                    # Use JSON contains check that works with both SQLite and PostgreSQL
                    # For SQLite: JSON_EXTRACT(tags, '$[*]') LIKE '%tag%'
                    # For PostgreSQL: tags @> '["tag"]'
                    tag_json = json.dumps([filter_data.tag])
                    try:
                        # Try PostgreSQL JSONB operator first
                        statement = statement.where(Task.tags.op('@>')(tag_json))
                    except Exception:
                        # Fallback for SQLite - use JSON contains
                        from sqlalchemy import text
                        statement = statement.where(
                            Task.tags.op('LIKE')(f'%"{filter_data.tag}"%')
                        )

            results = session.exec(statement).all()
            return list(results)

    def get_task(self, task_id: str) -> Optional[Task]:
        try:
            task_uuid = uuid.UUID(task_id)
        except ValueError:
            return None
            
        with Session(database.engine) as session:
            statement = select(Task).where(Task.id == task_uuid, Task.user_id == settings.mcp_user_id)
            return session.exec(statement).first()

    def update_task(self, input_data: UpdateTaskInput) -> Optional[Task]:
        try:
            task_uuid = uuid.UUID(input_data.task_id)
        except ValueError:
            return None

        with Session(database.engine) as session:
            statement = select(Task).where(Task.id == task_uuid, Task.user_id == settings.mcp_user_id)
            task = session.exec(statement).first()
            
            if not task:
                return None
            
            try:
                if input_data.title is not None:
                    task.title = input_data.title
                if input_data.description is not None:
                    task.description = input_data.description
                if input_data.completed is not None:
                    task.completed = input_data.completed
                if input_data.priority is not None:
                    task.priority = input_data.priority
                if input_data.tags is not None:
                    task.tags = input_data.tags
                if input_data.due_date is not None:
                    task.due_date = input_data.due_date
                
                task.updated_at = datetime.now(timezone.utc)
                session.add(task)
                session.commit()
                session.refresh(task)
                return task
            except Exception as e:
                session.rollback()
                raise RuntimeError(f"Failed to update task: {e}")

    def delete_task(self, task_id: str) -> bool:
        try:
            task_uuid = uuid.UUID(task_id)
        except ValueError:
            return False

        with Session(database.engine) as session:
            statement = select(Task).where(Task.id == task_uuid, Task.user_id == settings.mcp_user_id)
            task = session.exec(statement).first()
            
            if task:
                try:
                    session.delete(task)
                    session.commit()
                    return True
                except Exception as e:
                    session.rollback()
                    raise RuntimeError(f"Failed to delete task: {e}")
            return False
