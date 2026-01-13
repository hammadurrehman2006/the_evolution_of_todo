from typing import Any, Dict, List, Optional, AsyncIterator
from datetime import datetime
import asyncio
from chatkit.store import Store, AttachmentStore
from chatkit.server import ChatKitServer
from chatkit.types import (
    ThreadMetadata, ThreadItem, Page, Attachment, AttachmentCreateParams,
    UserMessageItem, ClientToolCallItem, FeedbackKind, Action,
    ThreadStreamEvent
)
from chatkit.agents import AgentContext, stream_agent_response, simple_to_agent_input
from agents import Runner, RunConfig
from .chatbot import chatbot as default_agent

class MemoryStore(Store[Any]):
    def __init__(self):
        self.threads: Dict[str, ThreadMetadata] = {}
        self.thread_items: Dict[str, List[ThreadItem]] = {}
        self.attachments: Dict[str, Attachment] = {}

    async def load_thread(self, thread_id: str, context: Any) -> ThreadMetadata:
        if thread_id not in self.threads:
            # Auto-create for demo purposes if not found, or raise NotFound
            # For ChatKit, usually we create explicit threads. 
            # But let's raise error to be safe.
            raise ValueError(f"Thread {thread_id} not found")
        return self.threads[thread_id]

    async def save_thread(self, thread: ThreadMetadata, context: Any) -> None:
        self.threads[thread.id] = thread
        if thread.id not in self.thread_items:
            self.thread_items[thread.id] = []

    async def load_thread_items(
        self, thread_id: str, after: str | None, limit: int, order: str, context: Any
    ) -> Page[ThreadItem]:
        items = self.thread_items.get(thread_id, [])
        # Simple sorting and pagination
        # order: 'asc' or 'desc'. Default usually 'asc' for reading history? 
        # ChatKit usually requests 'desc' for recent items.
        
        sorted_items = sorted(items, key=lambda x: x.created_at, reverse=(order == "desc"))
        
        start_idx = 0
        if after:
            for i, item in enumerate(sorted_items):
                if item.id == after:
                    start_idx = i + 1
                    break
        
        paged = sorted_items[start_idx : start_idx + limit]
        
        return Page(
            data=paged,
            has_more=(start_idx + limit < len(sorted_items)),
            after=paged[-1].id if paged else None
        )

    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: Any) -> None:
        if thread_id not in self.thread_items:
            self.thread_items[thread_id] = []
        # Check if item exists?
        self.thread_items[thread_id].append(item)

    async def save_item(self, thread_id: str, item: ThreadItem, context: Any) -> None:
        # Update existing item
        if thread_id in self.thread_items:
            for i, existing in enumerate(self.thread_items[thread_id]):
                if existing.id == item.id:
                    self.thread_items[thread_id][i] = item
                    return
            # If not found, append
            self.thread_items[thread_id].append(item)

    async def delete_thread_item(self, thread_id: str, item_id: str, context: Any) -> None:
        if thread_id in self.thread_items:
            self.thread_items[thread_id] = [
                i for i in self.thread_items[thread_id] if i.id != item_id
            ]

    async def delete_thread(self, thread_id: str, context: Any) -> None:
        if thread_id in self.threads:
            del self.threads[thread_id]
        if thread_id in self.thread_items:
            del self.thread_items[thread_id]

    async def load_threads(
        self, limit: int, after: str | None, order: str, context: Any
    ) -> Page[ThreadMetadata]:
        all_threads = list(self.threads.values())
        sorted_threads = sorted(all_threads, key=lambda x: x.created_at, reverse=(order == "desc"))
        
        start_idx = 0
        if after:
            for i, t in enumerate(sorted_threads):
                if t.id == after:
                    start_idx = i + 1
                    break
        
        paged = sorted_threads[start_idx : start_idx + limit]
        
        return Page(
            data=paged,
            has_more=(start_idx + limit < len(sorted_threads)),
            after=paged[-1].id if paged else None
        )

    async def save_attachment(self, attachment: Attachment, context: Any) -> None:
        self.attachments[attachment.id] = attachment

    async def load_attachment(self, attachment_id: str, context: Any) -> Attachment:
        if attachment_id not in self.attachments:
             raise ValueError("Attachment not found")
        return self.attachments[attachment_id]

    async def delete_attachment(self, attachment_id: str, context: Any) -> None:
        if attachment_id in self.attachments:
            del self.attachments[attachment_id]
    
    async def load_item(self, thread_id: str, item_id: str, context: Any) -> ThreadItem | None:
         if thread_id in self.thread_items:
            for item in self.thread_items[thread_id]:
                if item.id == item_id:
                    return item
         return None


class AgentChatKitServer(ChatKitServer[Any]):
    def __init__(self, agent=default_agent, store=None):
        super().__init__(store=store or MemoryStore())
        self.agent = agent

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: Any,
    ) -> AsyncIterator[ThreadStreamEvent]:
        
        # 1. Prepare AgentContext
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context
        )

        # 2. Convert Thread History to Agent Input
        # Load recent history. Note: default_agent usually expects full history or manages memory.
        # But 'Runner' typically takes 'input'.
        # For simplicity, we just pass the last message as input, 
        # and let the Agent's internal memory (if any) or simple usage handle it.
        # Ideally, we should reconstruct the conversation.
        
        # In this adapter, we will use 'simple_to_agent_input' on the NEW message only,
        # assuming the agent is stateless or we rely on the Runner to manage session if provided.
        # However, standard Runner.run is stateless unless we pass a session.
        # ChatKit stores the history, so we should fetch it.
        
        # Load last N items for context? 
        # For now, let's just use the current input.
        
        agent_input = "Continue conversation"
        if input_user_message:
             # Convert to list of input items
             input_items = await simple_to_agent_input(input_user_message)
             # Extract text for simple agents, or pass complex items if Agent supports it.
             # The 'Runner' expects 'input' as str or specific types.
             # If using 'openai-agents', input can be string.
             # We might need to handle multi-modal input here.
             
             # Simplification: Extract text from input_user_message
             text_parts = [p.text for p in input_user_message.content if p.type == "text"]
             agent_input = "\n".join(text_parts)

        # 3. Run the Agent
        # We need to run it streamed.
        result = Runner.run_streamed(
            self.agent,
            input=agent_input,
            context=context # This should match the TContext of the Agent (UserContext)
        )

        # 4. Stream response back to ChatKit
        async for event in stream_agent_response(agent_context, result):
            yield event
