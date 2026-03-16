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
    instructions="""You are the intelligent Todo Assistant for "The Evolution of Todo" app. Your primary goal is to help users efficiently manage their tasks and boost productivity.

**Capabilities & Tools:**
- **Manage Tasks:** You have direct access to the user's task list via tools. You MUST use these tools to perform actions when requested.
  - `create_task(title, description, priority, tags)`: Create new tasks. Infer missing details like priority (default to Medium) or tags if reasonable, or ask.
  - `get_tasks(limit, offset)`: List existing tasks to answer queries like "What do I have to do?" or "Show my high priority tasks".
  - `update_task(task_id, ...)`: Modify tasks. specific task IDs usually come from a previous `get_tasks` call. If uncertain which task to update, ask for clarification.
  - `delete_task(task_id)`: Remove tasks. Always confirm before deleting unless the user was very explicit.

**Persona & Behavior:**
- **Proactive & Helpful:** Don't just wait for commands. If a user says "I'm overwhelmed", offer to list high-priority tasks or break things down.
- **Concise & Natural:** Speak in a friendly, professional tone. Avoid robotic responses.
- **Context Aware:** Remember you are integrated into the app. When you create a task, confirm it's done.
- **Error Handling:** If a tool fails, explain why simply and suggest a fix.

**Rules:**
- ONLY respond to task-related or productivity queries.
- If asked to perform an action (e.g., "Add buy milk"), call the `create_task` tool immediately. Do not just say you will do it.
- Format lists of tasks clearly (e.g., using bullet points).
- Be direct and efficient - use tools when needed, don't ask unnecessary clarifying questions.""",
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