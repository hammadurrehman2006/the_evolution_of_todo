"""PostgreSQL-backed conversation memory for persistent chat history."""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select, col
from database import get_session


class ConversationMemory:
    """PostgreSQL-backed conversation storage."""
    
    def __init__(self, user_id: str, session_id: Optional[str] = None):
        self.user_id = user_id
        self.session_id = session_id or str(uuid.uuid4())
        self._db_session: Optional[Session] = None
    
    def get_db_session(self) -> Session:
        """Get or create database session."""
        if self._db_session is None:
            self._db_session = next(get_session())
        return self._db_session
    
    async def initialize(self) -> None:
        """Create session in database if not exists."""
        from models import ConversationSession
        
        db = self.get_db_session()
        existing = db.exec(
            select(ConversationSession).where(ConversationSession.id == self.session_id)
        ).first()
        
        if not existing:
            session_model = ConversationSession(
                id=self.session_id,
                user_id=self.user_id,
                status='active'
            )
            db.add(session_model)
            db.commit()
    
    async def get_items(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retrieve conversation history from database."""
        from models import ConversationMessage
        
        db = self.get_db_session()
        query = select(ConversationMessage).where(
            ConversationMessage.session_id == self.session_id
        ).order_by(ConversationMessage.created_at.asc())
        
        if limit:
            query = query.limit(limit)
        
        messages = db.exec(query).all()
        return [
            {
                "role": msg.role,
                "content": msg.content,
                "content_json": msg.content_json,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    
    async def add_items(self, items: List[Dict[str, Any]]) -> None:
        """Store new messages in database."""
        from models import ConversationMessage, ConversationSession
        
        db = self.get_db_session()
        for item in items:
            message = ConversationMessage(
                session_id=self.session_id,
                role=item.get("role", "user"),
                content=item.get("content", ""),
                content_json=item.get("content_json"),
                token_count=item.get("token_count")
            )
            db.add(message)
        
        # Update session timestamp
        session = db.get(ConversationSession, self.session_id)
        if session:
            session.updated_at = datetime.utcnow()
            db.add(session)
        
        db.commit()
    
    async def add_tool_call(
        self,
        tool_name: str,
        input_json: dict,
        output_json: Optional[dict] = None,
        status: str = "success",
        error_message: Optional[str] = None,
        duration_ms: Optional[int] = None,
        message_id: Optional[str] = None
    ) -> None:
        """Log tool execution for audit trail."""
        from models import ToolCall
        
        db = self.get_db_session()
        tool_call = ToolCall(
            session_id=self.session_id,
            message_id=message_id,
            tool_name=tool_name,
            input_json=input_json,
            output_json=output_json,
            status=status,
            error_message=error_message,
            duration_ms=duration_ms
        )
        db.add(tool_call)
        db.commit()
    
    async def clear_session(self) -> None:
        """Clear all messages for this session."""
        from models import ConversationMessage
        
        db = self.get_db_session()
        messages = db.exec(
            select(ConversationMessage).where(
                ConversationMessage.session_id == self.session_id
            )
        ).all()
        
        for msg in messages:
            db.delete(msg)
        db.commit()
    
    def close(self) -> None:
        """Close database session."""
        if self._db_session:
            self._db_session.close()
            self._db_session = None


def get_conversation_memory(user_id: str, session_id: Optional[str] = None) -> ConversationMemory:
    """Get or create conversation memory for user."""
    return ConversationMemory(user_id=user_id, session_id=session_id)
