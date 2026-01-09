"""Task CRUD endpoint handlers."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, or_, case, func
from typing import List
from datetime import datetime
import uuid

from models import Task, PriorityEnum
from schemas import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse,
    TaskQueryParams, ToggleResponse, SortField, SortOrder
)
from database import get_session
from dependencies import get_current_user

# Create router for tasks endpoints
router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    Args:
        task_data: Task creation data
        user_id: Authenticated user ID from JWT token
        session: Database session

    Returns:
        TaskResponse: Created task with all fields
    """
    # Create Task model from request data
    task = Task(
        user_id=user_id,  # Enforce user isolation
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        tags=task_data.tags,
        due_date=task_data.due_date,
        reminder_at=task_data.reminder_at,
        is_recurring=task_data.is_recurring,
        recurrence_rule=task_data.recurrence_rule
    )

    # Add to database
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.get("/", response_model=TaskListResponse)
async def list_tasks(
    q: str | None = Query(None, description="Keyword search (title/description)"),
    status_filter: bool | None = Query(None, alias="status", description="Filter by completion status"),
    priority: PriorityEnum | None = Query(None, description="Filter by priority"),
    tags: str | None = Query(None, description="Filter by tags (comma-separated)"),
    due_date_from: datetime | None = Query(None, description="Filter tasks due after this date"),
    due_date_to: datetime | None = Query(None, description="Filter tasks due before this date"),
    sort_by: SortField = Query(SortField.DUE_DATE, description="Sort field"),
    sort_order: SortOrder = Query(SortOrder.ASC, description="Sort order"),
    limit: int = Query(50, ge=1, le=100, description="Page size (max 100)"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tasks for authenticated user with filtering, searching, sorting, and pagination.

    Args:
        q: Keyword search query
        status_filter: Filter by completion status
        priority: Filter by priority level
        tags: Comma-separated tags to filter by
        due_date_from: Filter tasks due after this date
        due_date_to: Filter tasks due before this date
        sort_by: Field to sort by
        sort_order: Sort direction
        limit: Page size
        offset: Pagination offset
        user_id: Authenticated user ID
        session: Database session

    Returns:
        TaskListResponse: List of tasks with pagination metadata
    """
    # Base query with user isolation
    query = select(Task).where(Task.user_id == user_id)

    # Apply keyword search (case-insensitive)
    if q:
        search_pattern = f"%{q}%"
        query = query.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    # Apply status filter
    if status_filter is not None:
        query = query.where(Task.completed == status_filter)

    # Apply priority filter
    if priority:
        query = query.where(Task.priority == priority)

    # Apply tags filter (JSONB contains operator)
    if tags:
        tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        if tags_list:
            # Check if any of the provided tags exist in the task's tags
            query = query.where(Task.tags.op('@>')(tags_list))

    # Apply date range filters
    if due_date_from:
        query = query.where(Task.due_date >= due_date_from)

    if due_date_to:
        query = query.where(Task.due_date <= due_date_to)

    # Apply sorting
    if sort_by == SortField.DUE_DATE:
        order_col = Task.due_date
    elif sort_by == SortField.TITLE:
        order_col = Task.title
    elif sort_by == SortField.PRIORITY:
        # Custom sort: High > Medium > Low
        order_col = case(
            (Task.priority == "High", 1),
            (Task.priority == "Medium", 2),
            (Task.priority == "Low", 3),
            else_=4
        )

    if sort_order == SortOrder.DESC:
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())

    # Get total count before pagination
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    # Apply pagination
    query = query.limit(limit).offset(offset)

    # Execute query
    tasks = session.exec(query).all()

    return TaskListResponse(
        items=tasks,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a single task by ID with user isolation check.

    Args:
        task_id: Task UUID
        user_id: Authenticated user ID
        session: Database session

    Returns:
        TaskResponse: Task details

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    task = session.get(Task, task_id)

    # Return 404 (not 403) to prevent information leakage
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_data: TaskUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update one or more fields of an existing task (partial updates supported).

    Args:
        task_id: Task UUID
        task_data: Fields to update
        user_id: Authenticated user ID
        session: Database session

    Returns:
        TaskResponse: Updated task

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    task = session.get(Task, task_id)

    # Return 404 (not 403) to prevent information leakage
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    # Update timestamp
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Permanently delete a task with user isolation check.

    Args:
        task_id: Task UUID
        user_id: Authenticated user ID
        session: Database session

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    task = session.get(Task, task_id)

    # Return 404 (not 403) to prevent information leakage
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    session.delete(task)
    session.commit()

    return None


@router.post("/{task_id}/toggle", response_model=ToggleResponse)
async def toggle_task_completion(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle task completion status. For non-recurring tasks, just flip the completed flag.
    For recurring tasks, mark as complete and create a new instance (future enhancement).

    Args:
        task_id: Task UUID
        user_id: Authenticated user ID
        session: Database session

    Returns:
        ToggleResponse: Updated task and optionally new task for recurring

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    task = session.get(Task, task_id)

    # Return 404 (not 403) to prevent information leakage
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion status
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    # For now, just return the toggled task
    # Recurring logic will be implemented in Phase 7 (User Story 5)
    return ToggleResponse(task=task, new_task=None)
