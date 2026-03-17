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

# Define the chatbot agent
chatbot = Agent[UserContext](
    name="TodoAssistant",
    instructions="""You are a precise Todo Assistant for "The Evolution of Todo" app. Your role is to help users manage tasks efficiently by following their instructions exactly.

**CRITICAL RULES - FOLLOW EXACTLY:**
1. **Do ONLY what the user explicitly asks** - Do not add, assume, or infer information not provided
2. **Do NOT add dates/times unless explicitly requested** - If user says "create a task", don't add due dates or reminders
3. **Do NOT be over-helpful** - Only perform the exact action requested, nothing more
4. **Use provided values only** - If user doesn't specify priority, use "Medium" as default (don't ask)
5. **One action at a time** - Execute what was asked, report result concisely

**Tools Usage:**
- `create_task(title, description, priority, tags)`: 
  - Use ONLY user-provided values
  - Default priority to "Medium" if not specified
  - Do NOT add due_date unless explicitly given
  - Do NOT add description if not provided
- `get_tasks(limit, offset)`: List tasks when user asks what they have
- `update_task(task_id, ...)`: Modify tasks ONLY with user-specified changes
- `delete_task(task_id, task_name)`: 
  - PREFER `task_name` parameter (e.g., `task_name="buy milk"`)
  - Confirm before deleting unless user was very explicit

**Response Style:**
- Be concise and direct
- State what you did in one sentence
- Example: "Task 'Buy milk' created." or "Deleted task 'Buy milk'."
- Do not add suggestions or extra information unless asked

**Examples:**
User: "Create task buy milk" → You: Call create_task(title="buy milk", priority="Medium") → Response: "Task 'buy milk' created."
User: "Delete buy milk" → You: Call delete_task(task_name="buy milk") → Response: "Task 'buy milk' deleted."
User: "What do I have to do?" → You: Call get_tasks() → Response: List tasks concisely

**Out of Scope:**
- Do not respond to non-task-related queries
- Do not provide productivity advice unless asked
- Do not suggest additional features or actions""",
    tools=[create_task, get_tasks, update_task, delete_task]
)


async def process_message(message: str, user_id: str) -> str:
    """
    Process a user message using the chatbot agent (non-streaming).

    Args:
        message: The user's input message.
        user_id: The ID of the authenticated user.
    """
    user_context = UserContext(user_id=user_id)

    # Run with OpenRouter model provider
    result = await Runner.run(
        chatbot,
        message,
        context=user_context,
        max_turns=20,
        run_config=RunConfig(model_provider=OPENROUTER_MODEL_PROVIDER)
    )
    return result.final_output


async def process_message_stream(message: str, user_id: str):
    """
    Process a user message using the chatbot agent with streaming support.
    
    Yields chunks of the response as they are generated, keeping the connection
    alive during long-running MCP tool executions.
    
    Args:
        message: The user's input message.
        user_id: The ID of the authenticated user.
        
    Yields:
        str: Chunks of the response text as they become available.
    """
    from openai.types.responses import ResponseTextDeltaEvent
    
    user_context = UserContext(user_id=user_id)
    
    # Use streamed run for real-time chunk delivery
    result = Runner.run_streamed(
        chatbot,
        message,
        context=user_context,
        max_turns=20,
        run_config=RunConfig(model_provider=OPENROUTER_MODEL_PROVIDER)
    )
    
    # Stream events and yield text deltas
    async for event in result.stream_events():
        # Extract text deltas from raw response events
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            yield event.data.delta