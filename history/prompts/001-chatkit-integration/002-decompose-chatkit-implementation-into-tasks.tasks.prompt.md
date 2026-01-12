---
id: 002
title: "Decompose ChatKit implementation into tasks"
stage: "tasks"
date_iso: "2026-01-12"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-chatkit-integration"
branch: "001-chatkit-integration"
command: "sp.tasks"
labels: ["chatkit", "integration", "ai", "tasks", "decomposition", "nextjs", "react"]
links:
  spec: "specs/001-chatkit-integration/spec.md"
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - specs/001-chatkit-integration/tasks.md
tests_yaml: |
  - "Tasks decomposed by user story priority"
  - "Checklist format maintained for all tasks"
  - "Dependencies identified between user stories"
  - "Parallel execution opportunities documented"
---

# PHR: Decompose ChatKit implementation into tasks

## User Input

Decompose the ChatKit implementation into atomic, testable tasks. Create Task T-331: Install @openai/chatkit-react and add the NEXT_PUBLIC_OPENAI_DOMAIN_KEY to the environment configuration. Create Task T-332: Implement the GlobalChatWidget component, configuring the ChatKit connect options to point to our custom FastAPI backend (/api/chat) and implementing the custom fetch wrapper for JWT injection. Create Task T-333: Implement the "Create with AI" floating button using Tailwind CSS (fixed bottom-4 right-4 z-50) that toggles the ChatKit visibility. Create Task T-334: Integrate the widget into app/layout.tsx and implement the onToolCall callback or useEffect hook to invalidate the ['tasks'] query key, ensuring the UI stays in sync with the AI's actions. Create Task T-335: Verification step to confirm the domain allowlist is active and the chat successfully creates a task in the Neon database.

## Response Summary

Created a comprehensive tasks document (tasks.md) that decomposes the ChatKit integration into atomic, testable tasks. Key accomplishments:

1. **Corrected Package Approach**: Since `@openai/chatkit-react` doesn't exist, replaced with `react-chat-widget` as determined in the planning phase.

2. **Structured Task Organization**: Organized tasks by user story priority (P1, P1, P2) following the specification requirements.

3. **Complete Task Breakdown**: Generated 35 detailed tasks covering:
   - Setup phase (directory creation, dependencies)
   - Foundational phase (backend endpoint, react-query setup)
   - User Story 1: Access AI Chatbot Interface (P1)
   - User Story 2: Secure AI-Powered Task Management (P1)
   - User Story 3: Real-time Task List Updates (P2)
   - Integration & Verification phase

4. **Checklist Format**: All tasks follow the required checklist format with proper IDs, story labels, and file paths.

5. **Dependencies and Parallelization**: Identified dependencies between user stories and opportunities for parallel execution.

## Outcome

Successfully generated a complete tasks.md file that breaks down the ChatKit integration into atomic, testable tasks. The tasks follow the user's requested structure while accounting for the reality that the OpenAI ChatKit React SDK doesn't exist, using react-chat-widget as an alternative. Each task is specific enough for an LLM to complete without additional context and follows the checklist format with proper IDs and labels.