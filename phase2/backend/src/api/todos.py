from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import uuid

from ..models.todo import Todo
from ..models.user import User
from ..database import get_session
from ..auth.dependencies import get_current_user_id
from pydantic import BaseModel


router = APIRouter(prefix="/todos", tags=["Todos"])


class TodoCreate(BaseModel):
    title: str
    description: str = ""
    completed: bool = False


class TodoUpdate(BaseModel):
    title: str = None
    description: str = None
    completed: bool = None


class TodoResponse(Todo):
    pass


@router.get("/", response_model=List[TodoResponse])
def get_todos(
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get all todos for the current user.
    """
    # Query todos for the current user only
    todos = session.exec(
        select(Todo)
        .where(Todo.user_id == current_user_id)
        .order_by(Todo.created_at.desc())
    ).all()

    return todos


@router.post("/", response_model=TodoResponse)
def create_todo(
    todo_data: TodoCreate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Create a new todo for the current user.
    """
    # Verify the user exists
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create new todo
    todo = Todo(
        todo_id=str(uuid.uuid4()),
        user_id=current_user_id,
        title=todo_data.title,
        description=todo_data.description,
        completed=todo_data.completed,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return todo


@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get a specific todo by ID for the current user.
    """
    # Query for the specific todo owned by the current user
    todo = session.exec(
        select(Todo)
        .where(Todo.todo_id == todo_id)
        .where(Todo.user_id == current_user_id)
    ).first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or access denied"
        )

    return todo


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: str,
    todo_data: TodoUpdate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Update a specific todo by ID for the current user.
    """
    # Query for the specific todo owned by the current user
    todo = session.exec(
        select(Todo)
        .where(Todo.todo_id == todo_id)
        .where(Todo.user_id == current_user_id)
    ).first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or access denied"
        )

    # Update fields that were provided
    if todo_data.title is not None:
        todo.title = todo_data.title
    if todo_data.description is not None:
        todo.description = todo_data.description
    if todo_data.completed is not None:
        todo.completed = todo_data.completed

    todo.updated_at = datetime.utcnow()

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return todo


@router.delete("/{todo_id}")
def delete_todo(
    todo_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Delete a specific todo by ID for the current user.
    """
    # Query for the specific todo owned by the current user
    todo = session.exec(
        select(Todo)
        .where(Todo.todo_id == todo_id)
        .where(Todo.user_id == current_user_id)
    ).first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or access denied"
        )

    session.delete(todo)
    session.commit()

    return {"message": "Todo deleted successfully"}


@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
def toggle_todo_completion(
    todo_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Toggle the completion status of a specific todo.
    """
    # Query for the specific todo owned by the current user
    todo = session.exec(
        select(Todo)
        .where(Todo.todo_id == todo_id)
        .where(Todo.user_id == current_user_id)
    ).first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or access denied"
        )

    # Toggle completion status
    todo.completed = not todo.completed
    todo.updated_at = datetime.utcnow()

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return todo