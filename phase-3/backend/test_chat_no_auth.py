"""Test script for chat endpoint without authentication."""
import asyncio
import os
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, set_tracing_disabled

# Override the model for testing
TEST_MODEL = "openai/gpt-oss-120b:free"

# Get API key from environment or .env file
OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY",
    "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"
)
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Configure the client with test model
client = AsyncOpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_API_KEY,
)

set_tracing_disabled(disabled=True)

# Simple test agent (without task tools for basic connectivity test)
test_agent = Agent(
    name="TestAssistant",
    instructions="You are a helpful assistant. Keep responses brief.",
    model=OpenAIChatCompletionsModel(
        model=TEST_MODEL,
        openai_client=client
    ),
)


async def test_chat(message: str) -> str:
    """Test chat without authentication."""
    print(f"\n{'='*60}")
    print(f"Testing chat endpoint WITHOUT auth")
    print(f"Model: {TEST_MODEL}")
    print(f"Message: '{message}'")
    print(f"{'='*60}\n")

    try:
        result = await Runner.run(test_agent, message)
        print(f"✅ SUCCESS - Response received:")
        print(f"   {result.final_output}")
        return result.final_output
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
        raise


async def main():
    """Run chat tests."""
    print("\n" + "="*60)
    print("CHAT ENDPOINT TEST (No Auth)")
    print("="*60)

    test_messages = [
        "Hello! Can you help me with my todo list?",
        "What tasks do I have?",
    ]

    for msg in test_messages:
        try:
            await test_chat(msg)
        except Exception as e:
            print(f"Test failed: {e}")
            return 1

    print("\n" + "="*60)
    print("ALL TESTS PASSED ✓")
    print("="*60 + "\n")
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
