from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, delete
from backend.database import get_session
from backend.models import Task
from backend.dependencies import get_current_user_id

router = APIRouter(prefix="/user", tags=["user"])

@router.delete("/data", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_data(
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Permanently delete all data associated with the authenticated user.
    This is used prior to account deletion to ensure no orphaned data remains.
    """
    try:
        # Delete all tasks owned by the user
        statement = delete(Task).where(Task.user_id == current_user_id)
        result = session.exec(statement)
        session.commit()
        
        # In a real app, you would also delete files from S3/Blob storage here
        
        return None
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user data: {str(e)}"
        )
