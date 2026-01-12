# Implementation Plan: AI-Powered Chatbot

**Branch**: `001-ai-powered-chatbot` | **Date**: 2026-01-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ai-powered-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the implementation of Phase III: AI-Powered Chatbot, which introduces a conversational interface for task management using the OpenAI Agents SDK and Model Context Protocol (MCP). The system implements a stateless architecture with conversation history persisted in Neon PostgreSQL database, ensuring proper user isolation through user_id scoping. The implementation includes five key architectural components:

1. **Database Layer**: SQLModel classes for Conversation and Message entities with proper relationships
2. **MCP Layer**: Internal MCP server with stateless tools (add_task, list_tasks, complete_task, delete_task, update_task) that accept user_id for security
3. **Agent Layer**: AgentRunner class implementing the "Hydrate -> Run -> Persist" cycle with OpenAI Agents SDK
4. **API Layer**: RESTful chat endpoint at POST /api/{user_id}/chat orchestrating the conversation flow
5. **Integration Layer**: OpenRouter for single model configuration and Better Auth for JWT-based authentication

The implementation follows the project constitution's requirements for technology stack evolution, stateless architecture, and AI chatbot interface while maintaining strict user isolation and security requirements.


## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3.13+ (as per constitution)
**Primary Dependencies**: FastAPI, SQLModel, Neon PostgreSQL, OpenAI Agents SDK, MCP SDK, OpenRouter
**Storage**: Neon PostgreSQL database with Conversation and Message tables
**Testing**: pytest for unit/integration tests, contract testing for API endpoints
**Target Platform**: Linux server (cloud-native deployment)
**Project Type**: Web application (backend API with MCP integration)
**Performance Goals**: <3 seconds response time for 90% of chat interactions, 95% accuracy in task management operations
**Constraints**: Stateless architecture (no server memory for conversation history), user isolation by user_id, secure MCP tool access
**Scale/Scope**: Multi-user support with proper data isolation, persistent conversation history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Verification:
- ✅ **No Task = No Code**: Will ensure all implementation follows tasks in tasks.md
- ✅ **Technology Stack Evolution**: Using FastAPI, SQLModel, and Neon DB as required
- ✅ **JWT-based Authentication**: Will integrate Better Auth for user authentication
- ✅ **AI Chatbot Interface**: Implementing OpenAI Agents SDK and MCP as specified
- ❌ **Event-Driven Architecture**: Not applicable for Phase III (will be implemented in later phases)
- ✅ **Containerized Deployment**: Will prepare for containerization with stateless design
- ✅ **Stateless Architecture**: Designing with no server memory for conversation history
- ✅ **User Isolation**: Ensuring all operations are scoped by user_id
- ✅ **MCP Integration**: Building internal MCP server as required

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── models/
│   ├── __init__.py
│   ├── conversation.py      # Conversation SQLModel
│   ├── message.py          # Message SQLModel
│   └── task.py             # Task SQLModel (existing)
├── mcp/
│   ├── __init__.py
│   ├── server.py           # MCP Server implementation
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── task_tools.py   # add_task, list_tasks, complete_task, etc.
│   │   └── utils.py        # Helper functions for MCP tools
│   └── protocol/           # MCP protocol definitions
├── agents/
│   ├── __init__.py
│   ├── runner.py           # AgentRunner class with Hydrate->Run->Persist cycle
│   ├── config.py           # Agent configuration (OpenRouter, tools, etc.)
│   └── prompts.py          # System prompts for the AI agent
├── routes/
│   ├── __init__.py
│   └── chat.py             # POST /chat endpoint
├── services/
│   ├── __init__.py
│   ├── conversation_service.py  # Conversation management logic
│   ├── message_service.py       # Message handling logic
│   └── auth_service.py          # Authentication utilities
├── core/
│   ├── __init__.py
│   ├── config.py               # Application configuration
│   ├── database.py             # Database connection setup
│   └── security.py             # Security utilities (user_id validation)
├── main.py                    # Application entry point
└── requirements.txt           # Dependencies (FastAPI, SQLModel, openai, mcp-sdk, etc.)
```

**Structure Decision**: Backend-focused web application with clear separation of concerns. The structure includes dedicated modules for database models, MCP server implementation, AI agent logic, API routes, and supporting services. This aligns with the stateless architecture requirement and enables proper user isolation through the service layer.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
