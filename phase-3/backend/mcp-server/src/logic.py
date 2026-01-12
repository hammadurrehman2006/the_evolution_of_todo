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
        # Ensure tables exist
        database.create_db_and_tables()

    def create_task(self, input_data: CreateTaskInput) -> Task:
        with Session(database.engine) as session:
            try:
                task = Task(
                    user_id=settings.mcp_user_id,
                    title=input_data.title,
                    description=input_data.description,
                    priority=input_data.priority or PriorityEnum.MEDIUM,
                    due_date=input_data.due_date,
                    tags=input_data.tags or []
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
                    # Construct JSON array string for containment check: '["tag"]'
                    tag_json = json.dumps([filter_data.tag])
                    # Use @> operator for JSONB
                    statement = statement.where(Task.tags.op('@>')(tag_json))

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
