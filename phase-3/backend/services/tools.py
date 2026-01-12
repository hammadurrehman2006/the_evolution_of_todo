from typing import Optional, List, Any
from datetime import datetime
from sqlmodel import select, or_
from agents import function_tool, RunContextWrapper
from database import get_session
from models import Task, PriorityEnum
from dataclasses import dataclass

@dataclass
class UserContext:
    user_id: str

@function_tool
def create_task(
    ctx: RunContextWrapper[UserContext],
    title: str,
    description: Optional[str] = None,
    priority: str = "Medium",
    due_date: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> str:
    """
    Create a new task for the user.
    
    Args:
        title: The title of the task.
        description: A detailed description of the task.
        priority: Priority level (High, Medium, Low).
        due_date: Due date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).
        tags: List of tags associated with the task.
        
    Returns:
        A success message with the created task ID or an error message.
    """
    user_id = ctx.context.user_id
    try:
        priority_enum = PriorityEnum(priority.capitalize())
    except ValueError:
        return f"Error: Invalid priority '{priority}'. Must be High, Medium, or Low."

    due_date_obj = None
    if due_date:
        try:
            due_date_obj = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
        except ValueError:
             return f"Error: Invalid due_date format '{due_date}'. Use ISO 8601."

    try:
        session_gen = get_session()
        session = next(session_gen)
        try:
            task = Task(
                user_id=user_id,
                title=title,
                description=description,
                priority=priority_enum,
                due_date=due_date_obj,
                tags=tags
            )
            session.add(task)
            session.commit()
            session.refresh(task)
            return f"Task created successfully. ID: {task.id}"
        finally:
            session.close()
    except Exception as e:
        return f"Error creating task: {str(e)}"

@function_tool
def get_tasks(
    ctx: RunContextWrapper[UserContext],
    q: Optional[str] = None,
    status: Optional[bool] = None,
    priority: Optional[str] = None,
    tags: Optional[str] = None,
    limit: int = 10
) -> str:
    """
    List tasks for the user with optional filtering.
    
    Args:
        q: Keyword search query (title or description).
        status: Filter by completion status (True/False).
        priority: Filter by priority (High, Medium, Low).
        tags: Comma-separated tags to filter by.
        limit: Maximum number of tasks to return.
        
    Returns:
        A JSON-formatted string listing the tasks.
    """
    user_id = ctx.context.user_id
    try:
        session_gen = get_session()
        session = next(session_gen)
        try:
            query = select(Task).where(Task.user_id == user_id)

            if q:
                search_pattern = f"%{q}%"
                query = query.where(
                    or_(
                        Task.title.ilike(search_pattern),
                        Task.description.ilike(search_pattern)
                    )
                )

            if status is not None:
                query = query.where(Task.completed == status)

            if priority:
                try:
                    priority_enum = PriorityEnum(priority.capitalize())
                    query = query.where(Task.priority == priority_enum)
                except ValueError:
                    pass 

            if tags:
                tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
                if tags_list:
                    query = query.where(Task.tags.op('@>')(tags_list))

            query = query.order_by(Task.due_date.asc())
            query = query.limit(limit)

            tasks = session.exec(query).all()
            
            if not tasks:
                return "No tasks found matching your criteria."

            result = []
            for t in tasks:
                result.append({
                    "id": str(t.id),
                    "title": t.title,
                    "status": "Completed" if t.completed else "Pending",
                    "priority": t.priority.value,
                    "due_date": t.due_date.isoformat() if t.due_date else None,
                    "tags": t.tags
                })
            import json
            return json.dumps(result, indent=2)
        finally:
            session.close()
    except Exception as e:
        return f"Error fetching tasks: {str(e)}"

@function_tool
def update_task(
    ctx: RunContextWrapper[UserContext],
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None
) -> str:
    """
    Update an existing task.
    
    Args:
        task_id: The UUID of the task to update.
        title: New title.
        description: New description.
        completed: Set completion status.
        priority: New priority (High, Medium, Low).
        due_date: New due date (ISO 8601).
        
    Returns:
        Success or error message.
    """
    user_id = ctx.context.user_id
    try:
        import uuid
        try:
            task_uuid = uuid.UUID(task_id)
        except ValueError:
            return "Error: Invalid task ID format."

        session_gen = get_session()
        session = next(session_gen)
        try:
            task = session.get(Task, task_uuid)
            if not task or task.user_id != user_id:
                return "Error: Task not found or access denied."

            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if completed is not None:
                task.completed = completed
            if priority is not None:
                try:
                    task.priority = PriorityEnum(priority.capitalize())
                except ValueError:
                    return f"Error: Invalid priority '{priority}'."
            if due_date is not None:
                try:
                    task.due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
                except ValueError:
                    return f"Error: Invalid due_date format."

            task.updated_at = datetime.utcnow()
            session.add(task)
            session.commit()
            return f"Task {task_id} updated successfully."
        finally:
            session.close()
    except Exception as e:
        return f"Error updating task: {str(e)}"

@function_tool
def delete_task(ctx: RunContextWrapper[UserContext], task_id: str) -> str:
    """
    Delete a task.
    
    Args:
        task_id: The UUID of the task to delete.
        
    Returns:
        Success or error message.
    """
    user_id = ctx.context.user_id
    try:
        import uuid
        try:
            task_uuid = uuid.UUID(task_id)
        except ValueError:
            return "Error: Invalid task ID format."

        session_gen = get_session()
        session = next(session_gen)
        try:
            task = session.get(Task, task_uuid)
            if not task or task.user_id != user_id:
                return "Error: Task not found or access denied."

            session.delete(task)
            session.commit()
            return f"Task {task_id} deleted successfully."
        finally:
            session.close()
    except Exception as e:
        return f"Error deleting task: {str(e)}"