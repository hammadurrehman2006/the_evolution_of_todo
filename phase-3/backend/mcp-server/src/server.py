import asyncio
import json
import os
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

from .logic import TaskManager
from .models import CreateTaskInput, UpdateTaskInput, TaskFilter, PriorityEnum

# Initialize FastMCP server
mcp = FastMCP("todo-mcp-server")
task_manager = TaskManager()

@mcp.tool()
def create_task(title: str, description: str = None, priority: str = "Medium", tags: list[str] = [], due_date: str = None) -> str:
    """
    Create a new task.
    
    Args:
        title: The title of the task.
        description: Detailed description.
        priority: Priority level (High, Medium, Low).
        tags: List of tags.
        due_date: Optional due date (ISO 8601 string).
    """
    try:
        due_date_obj = None
        if due_date:
            try:
                due_date_obj = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except ValueError:
                 return f"Error: Invalid due_date format '{due_date}'. Use ISO 8601."

        input_data = CreateTaskInput(
            title=title, 
            description=description, 
            priority=priority, # Pydantic coerces str -> Enum
            tags=tags,
            due_date=due_date_obj
        )
        task = task_manager.create_task(input_data)
        return f"Task created with ID: {task.id}"
    except Exception as e:
        return f"Error creating task: {str(e)}"

@mcp.tool()
def read_tasks(completed: bool = None, priority: str = None, tag: str = None) -> str:
    """
    Read tasks with optional filtering.
    
    Args:
        completed: Filter by completion status.
        priority: Filter by priority.
        tag: Filter by tag presence.
    """
    try:
        filter_data = TaskFilter(
            completed=completed, 
            priority=priority, 
            tag=tag
        )
        tasks = task_manager.read_tasks(filter_data)
        return json.dumps([t.model_dump(mode='json') for t in tasks], indent=2)
    except Exception as e:
        return f"Error reading tasks: {str(e)}"

@mcp.tool()
def update_task(task_id: str, title: str = None, description: str = None, completed: bool = None, priority: str = None, tags: list[str] = None, due_date: str = None) -> str:
    """
    Update an existing task.
    
    Args:
        task_id: The ID of the task to update.
        title: New title.
        description: New description.
        completed: New completion status.
        priority: New priority.
        tags: New tags.
        due_date: New due date.
    """
    try:
        due_date_obj = None
        if due_date:
            try:
                due_date_obj = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except ValueError:
                 return f"Error: Invalid due_date format '{due_date}'. Use ISO 8601."

        input_data = UpdateTaskInput(
            task_id=task_id,
            title=title,
            description=description,
            completed=completed,
            priority=priority,
            tags=tags,
            due_date=due_date_obj
        )
        task = task_manager.update_task(input_data)
        if task:
            return f"Task {task.id} updated."
        return f"Task {task_id} not found."
    except Exception as e:
        return f"Error updating task: {str(e)}"

@mcp.tool()
def delete_task(task_id: str) -> str:
    """
    Delete a task by ID.
    
    Args:
        task_id: The ID of the task to delete.
    """
    try:
        success = task_manager.delete_task(task_id)
        if success:
            return f"Task {task_id} deleted."
        return f"Task {task_id} not found."
    except Exception as e:
        return f"Error deleting task: {str(e)}"

@mcp.resource("task://list")
def list_tasks_resource() -> str:
    """Get all tasks as a JSON resource."""
    tasks = task_manager.read_tasks()
    return json.dumps([t.model_dump(mode='json') for t in tasks], indent=2)

if __name__ == "__main__":
    mcp.run()