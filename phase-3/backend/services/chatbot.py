from __future__ import annotations

import os
from openai import AsyncOpenAI
from agents import (
    Agent,
    Model,
    ModelProvider,
    OpenAIChatCompletionsModel,
    RunConfig,
    Runner,
    function_tool,
    set_tracing_disabled,
)
from config import settings
from .tools import create_task, get_tasks, update_task, delete_task, UserContext

# Configure OpenRouter client
BASE_URL = settings.openrouter_base_url
API_KEY = settings.openrouter_api_key
MODEL_NAME = settings.openrouter_model

client = AsyncOpenAI(base_url=BASE_URL, api_key=API_KEY)
set_tracing_disabled(disabled=True)


class OpenRouterModelProvider(ModelProvider):
    def get_model(self, model_name: str | None) -> Model:
        return OpenAIChatCompletionsModel(
            model=model_name or MODEL_NAME,
            openai_client=client
        )


OPENROUTER_MODEL_PROVIDER = OpenRouterModelProvider()

# Initialize conversation memory (PostgreSQL-backed, persistent)
from .conversation_memory import get_conversation_memory


# Define the chatbot agent with enhanced NLU instructions
chatbot = Agent[UserContext](
    name="TodoAssistant",
    instructions="""You are a precise Todo Assistant for "The Evolution of Todo" app. Your role is to help users manage tasks efficiently by following their instructions exactly.

## CRITICAL RULES - FOLLOW EXACTLY
1. **Do ONLY what the user explicitly asks** - Do not add, assume, or infer information not provided
2. **Do NOT add dates/times unless explicitly requested** - If user says "create a task", don't add due dates or reminders
3. **Do NOT be over-helpful** - Only perform the exact action requested, nothing more
4. **Use provided values only** - If user doesn't specify priority, use "Medium" as default (don't ask)
5. **One action at a time** - Execute what was asked, report result concisely
6. **Remember context** - Use conversation history to understand follow-up requests

## INTENT RECOGNITION - MAP USER PHRASES TO ACTIONS

### CREATE TASKS (call create_task tool)
User says → You do:
- "Add/Make/Create task [X]" → create_task(title=X)
- "Remind me to [X]" → create_task(title=X)
- "I need to [X]" → create_task(title=X)
- "Don't forget [X]" → create_task(title=X)
- "[X] is due [date]" → create_task(title=X, due_date=date)
- "Schedule [X]" → create_task(title=X)
- "Put [X] on my list" → create_task(title=X)

Examples:
- "Add buy milk" → create_task(title="buy milk", priority="Medium")
- "Create task meeting tomorrow at 3pm" → create_task(title="meeting", due_date="2026-03-19T15:00:00Z")
- "I need to finish the report" → create_task(title="finish the report", priority="Medium")

### LIST TASKS (call get_tasks tool)
User says → You do:
- "What do I have?" → get_tasks(status=False)
- "Show my tasks" → get_tasks()
- "What's pending?" → get_tasks(status=False)
- "Completed tasks" → get_tasks(status=True)
- "High priority tasks" → get_tasks(priority="High")
- "Tasks due this week" → get_tasks()
- "What did I add?" → get_tasks(limit=10)

### COMPLETE TASKS (call get_tasks then update_task)
User says → You do:
1. First call get_tasks(q=X) to find the task
2. Then call update_task(id, completed=True)
- "Complete [X]" → find then complete
- "Done with [X]" → find then complete
- "Finished [X]" → find then complete
- "Mark [X] done" → find then complete
- "[X] is done" → find then complete

### DELETE TASKS (call delete_task with task_name)
User says → You do:
- "Delete [X]" → delete_task(task_name=X)
- "Remove [X]" → delete_task(task_name=X)
- "Cancel [X]" → delete_task(task_name=X)
- "Get rid of [X]" → delete_task(task_name=X)

### UPDATE TASKS (call get_tasks then update_task)
User says → You do:
1. First call get_tasks(q=X) to find the task
2. Then call update_task with changes
- "Change [X] priority to high" → find then update priority
- "Reschedule [X] to [date]" → find then update due_date
- "Rename [X] to [Y]" → find then update title

## RESPONSE FORMAT
After tool execution, respond concisely in ONE sentence:
- ✅ "Task 'buy milk' created."
- ✅ "Deleted task 'meeting'."
- ✅ "Marked 'report' as complete."
- ✅ "Here are your 5 active tasks: [brief list]"
- ✅ "Priority updated to High."

## HANDLING AMBIGUITY
If user request is unclear:
1. Try to match closest intent from patterns above
2. If multiple tasks match, ask: "Which task did you mean: [list options]?"
3. Never guess - ask for specifics if truly ambiguous

## CONVERSATION CONTEXT
- Remember what tasks were discussed recently
- If user says "delete it" refer to last mentioned task
- Use conversation history to resolve pronouns (it, that, this)

## OUT OF SCOPE
- Non-task queries: "I can only help with task management."
- Productivity advice: Only if explicitly asked
- Personal questions: Redirect to task management
- General chat: Keep focused on tasks""",
    tools=[create_task, get_tasks, update_task, delete_task]
)


async def process_message(message: str, user_id: str, session_id: Optional[str] = None) -> str:
    """
    Process a user message using the chatbot agent with persistent memory.

    Args:
        message: The user's input message.
        user_id: The ID of the authenticated user.
        session_id: Optional conversation session ID for continuity.

    Returns:
        str: AI response
    """
    from models import ConversationMessage
    import uuid as uuid_module
    
    user_context = UserContext(user_id=user_id)
    
    # Get conversation memory (PostgreSQL-backed)
    conv_memory = get_conversation_memory(user_id, session_id)
    await conv_memory.initialize()
    
    # Load recent conversation history for context (last 20 messages)
    history = await conv_memory.get_items(limit=20)
    
    # Build context from history for the agent
    # This gives the AI context of recent conversation
    context_messages = []
    for msg in history[-10:]:  # Last 10 messages for context window
        context_messages.append(f"{msg['role']}: {msg['content']}")
    
    # Run with OpenRouter model provider
    result = await Runner.run(
        chatbot,
        message,
        context=user_context,
        max_turns=20,
        run_config=RunConfig(model_provider=OPENROUTER_MODEL_PROVIDER)
    )
    
    # Store conversation in PostgreSQL
    message_id = str(uuid_module.uuid4())
    await conv_memory.add_items([
        {"role": "user", "content": message, "content_json": {"id": message_id}},
        {"role": "assistant", "content": result.final_output, "content_json": {"id": str(uuid_module.uuid4())}}
    ])
    
    return result.final_output


async def process_message_stream(message: str, user_id: str, session_id: Optional[str] = None):
    """
    Process a user message using the chatbot agent with streaming support and persistent memory.

    Yields chunks of the response as they are generated.

    Args:
        message: The user's input message.
        user_id: The ID of the authenticated user.
        session_id: Optional conversation session ID for continuity.

    Yields:
        str: Chunks of the response text as they become available.
    """
    from openai.types.responses import ResponseTextDeltaEvent
    import uuid as uuid_module

    user_context = UserContext(user_id=user_id)
    
    # Get conversation memory (PostgreSQL-backed)
    conv_memory = get_conversation_memory(user_id, session_id)
    await conv_memory.initialize()

    # Use streamed run for real-time chunk delivery
    result = Runner.run_streamed(
        chatbot,
        message,
        context=user_context,
        max_turns=20,
        run_config=RunConfig(model_provider=OPENROUTER_MODEL_PROVIDER)
    )

    # Collect full response for storage
    full_response = ""
    message_id = str(uuid_module.uuid4())

    # Stream events and yield text deltas
    async for event in result.stream_events():
        # Extract text deltas from raw response events
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            chunk = event.data.delta
            full_response += chunk
            yield chunk
    
    # Store conversation in PostgreSQL after streaming completes
    if full_response:
        await conv_memory.add_items([
            {"role": "user", "content": message, "content_json": {"id": message_id}},
            {"role": "assistant", "content": full_response, "content_json": {"id": str(uuid_module.uuid4())}}
        ])