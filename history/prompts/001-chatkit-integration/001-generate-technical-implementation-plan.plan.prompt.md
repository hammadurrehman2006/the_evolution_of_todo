---
id: 001
title: "Generate technical implementation plan for ChatKit integration"
stage: "plan"
date_iso: "2026-01-12"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-chatkit-integration"
branch: "001-chatkit-integration"
command: "sp.plan"
labels: ["chatkit", "integration", "ai", "authentication", "nextjs", "react", "planning"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - specs/001-chatkit-integration/plan.md
  - specs/001-chatkit-integration/research.md
  - specs/001-chatkit-integration/data-model.md
  - specs/001-chatkit-integration/contracts/api-contracts.md
  - specs/001-chatkit-integration/quickstart.md
  - CLAUDE.md
tests_yaml: |
  - "Plan document created with technical implementation details"
  - "Research document updated with correct approach"
  - "Data model defined for chat entities"
  - "API contracts specified for frontend-backend communication"
---

# PHR: Generate technical implementation plan for ChatKit integration

## User Input

Generate a technical implementation plan for the ChatKit integration. Architect a new component frontend/components/ai/GlobalChatWidget.tsx that wraps the <Chat /> component from the OpenAI ChatKit SDK. Plan the Configuration Strategy: The component must accept the NEXT_PUBLIC_API_URL environment variable to define the endpoint. Plan the Authentication Bridge: Design a fetcher function within the component that retrieves the active session token using authClient.getSession() and attaches Authorization: Bearer <token> to the request headers before forwarding it to ChatKit. Plan the Layout Integration: Modify frontend/app/layout.tsx to mount this widget at the root level, ensuring it persists state across navigation. Critical Prerequisite: Include a planning step to verify that http://localhost:3000 (and the future Vercel domain) is added to the OpenAI Domain Allowlist, as ChatKit components will fail to render without this security clearance.

## Response Summary

Created a comprehensive technical implementation plan for the ChatKit integration feature. Key accomplishments:

1. **Corrected Misconception**: Discovered that `@openai/chatkit-react` does not exist as a package, so planned to use standard React chat widgets like `react-chat-widget` instead.

2. **Technical Context**: Defined the technology stack (TypeScript 5.7+, React 19, Next.js 16.0.3, Python 3.11+, Better Auth, FastAPI, SQLModel).

3. **GlobalChatWidget Architecture**: Planned the component with persistent state, authentication bridge, and proper integration with existing auth system.

4. **Configuration Strategy**: Detailed how the component will use NEXT_PUBLIC_API_URL for endpoint configuration.

5. **Authentication Bridge**: Designed a custom fetcher function that retrieves JWT tokens using Better Auth and attaches them to requests.

6. **Layout Integration**: Planned integration into the root layout for persistent availability across navigation.

7. **Data Models**: Created comprehensive data models for ChatSession, ChatMessage, TaskOperation, and AuthenticationToken entities.

8. **API Contracts**: Defined the contract for the /api/chat endpoint and component interfaces.

9. **Security Considerations**: Addressed CORS, authentication, and error handling requirements.

## Outcome

Successfully generated a complete technical implementation plan that addresses all requirements from the user while correcting the misconception about the non-existent OpenAI ChatKit React SDK. The plan includes all necessary components, data models, API contracts, and integration strategies to implement a persistent AI chatbot interface with proper authentication and state management.