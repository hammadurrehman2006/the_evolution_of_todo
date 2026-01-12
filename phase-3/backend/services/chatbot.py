from openai import AsyncOpenAI
from agents import Agent, Runner, ModelSettings, set_default_openai_client
from config import settings
from .tools import create_task, get_tasks, update_task, delete_task, UserContext

# Configure the default client for the agents SDK
client = AsyncOpenAI(
    base_url=settings.openrouter_base_url,
    api_key=settings.openrouter_api_key,
)
set_default_openai_client(client, use_for_tracing=False)

# Define the chatbot agent
chatbot = Agent[UserContext](
    name="TodoAssistant",
    instructions="You are a helpful assistant for a Todo application. You help users organize their tasks. You can create, list, update, and delete tasks.",
    model_settings=ModelSettings(
        model=settings.openrouter_model,
        temperature=0.7,
        max_tokens=1000,
    ),
    tools=[create_task, get_tasks, update_task, delete_task]
)

async def process_message(message: str, user_id: str) -> str:
    """
    Process a user message using the chatbot agent.
    
    Args:
        message: The user's input message.
        user_id: The ID of the authenticated user.
    """
    user_context = UserContext(user_id=user_id)
    
    # The runner executes the agent and returns the result
    result = await Runner.run(chatbot, message, context=user_context)
    return result.final_output