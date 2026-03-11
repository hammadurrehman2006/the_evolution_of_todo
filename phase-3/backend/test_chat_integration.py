#!/usr/bin/env python3
"""
Test script to verify OpenAI Agents SDK + OpenRouter integration.
Run this locally to test before deploying.

Usage:
    python test_chat_integration.py
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import settings
from services.chatbot import process_message
from services.tools import UserContext

async def test_basic_chat():
    """Test basic chat without tools."""
    print("=" * 60)
    print("TEST 1: Basic Chat (no tools)")
    print("=" * 60)
    print(f"Model: {settings.openrouter_model}")
    print(f"Base URL: {settings.openrouter_base_url}")
    print(f"API Key: {settings.openrouter_api_key[:15]}...")
    print()
    
    try:
        response = await process_message(
            "Hello! I'm testing the chat. Please give a short response.",
            "test_user_123"
        )
        print(f"✓ Response: {response[:200]}...")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_create_task():
    """Test task creation via agent."""
    print()
    print("=" * 60)
    print("TEST 2: Create Task via Agent")
    print("=" * 60)
    
    try:
        response = await process_message(
            "Please create a task called 'Test Task' with description 'Testing the chatbot integration'",
            "test_user_123"
        )
        print(f"✓ Response: {response}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_list_tasks():
    """Test listing tasks via agent."""
    print()
    print("=" * 60)
    print("TEST 3: List Tasks via Agent")
    print("=" * 60)
    
    try:
        response = await process_message(
            "What tasks do I have?",
            "test_user_123"
        )
        print(f"✓ Response: {response[:300]}...")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("\n" + "=" * 60)
    print("OpenAI Agents SDK + OpenRouter Integration Test")
    print("=" * 60 + "\n")
    
    # Check environment
    print("Environment Check:")
    print(f"  - OPENROUTER_API_KEY set: {bool(settings.openrouter_api_key)}")
    print(f"  - OPENROUTER_BASE_URL: {settings.openrouter_base_url}")
    print(f"  - OPENROUTER_MODEL: {settings.openrouter_model}")
    print()
    
    if not settings.openrouter_api_key or settings.openrouter_api_key.startswith("sk-or-v1-XXXX"):
        print("⚠ WARNING: API key may not be set correctly!")
        print()
    
    # Run tests
    results = []
    results.append(("Basic Chat", await test_basic_chat()))
    results.append(("Create Task", await test_create_task()))
    results.append(("List Tasks", await test_list_tasks()))
    
    # Summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"  {status}: {name}")
    
    all_passed = all(r[1] for r in results)
    print()
    if all_passed:
        print("✓ All tests passed!")
    else:
        print("✗ Some tests failed. Check your OpenRouter API key.")
        print("  Get a new key at: https://openrouter.ai/settings/keys")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
