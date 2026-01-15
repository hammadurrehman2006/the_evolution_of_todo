import sys
import os
from unittest.mock import MagicMock

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "phase-3/backend"))

# Mock environment variables BEFORE importing config
os.environ["DATABASE_URL"] = "postgresql://dummy:dummy@localhost:5432/dummy"
os.environ["JWT_SECRET"] = "dummy_secret"
os.environ["OPENROUTER_API_KEY"] = "sk-or-dummy-key"
os.environ["OPENROUTER_BASE_URL"] = "https://openrouter.ai/api/v1"
os.environ["OPENROUTER_MODEL"] = "google/gemini-2.0-flash-exp:free"

try:
    from config import settings
    from services.chatbot import chatbot, client
    from openai import AsyncOpenAI

    print("--- Configuration Verification ---")
    print(f"Settings OpenRouter URL: {settings.openrouter_base_url}")
    print(f"Settings OpenRouter Model: {settings.openrouter_model}")

    print("\n--- Client Verification ---")
    print(f"Client Base URL: {client.base_url}")
    
    print("\n--- Agent Verification ---")
    print(f"Agent Name: {chatbot.name}")
    print(f"Agent Model (direct): {chatbot.model}")
    print(f"Model Settings: {chatbot.model_settings}")

    # Assertions
    # Check Client URL (handling potential trailing slash mismatch)
    client_url = str(client.base_url).rstrip('/')
    settings_url = settings.openrouter_base_url.rstrip('/')
    assert client_url == settings_url, f"Client URL mismatch: {client_url} vs {settings_url}"
    
    # Check Agent Model
    assert chatbot.model == settings.openrouter_model, f"Agent model mismatch: {chatbot.model} vs {settings.openrouter_model}"
    
    print("\nSUCCESS: Agent is configured to use OpenRouter settings.")

except Exception as e:
    print(f"\nFAILURE: {e}")
    import traceback
    traceback.print_exc()
