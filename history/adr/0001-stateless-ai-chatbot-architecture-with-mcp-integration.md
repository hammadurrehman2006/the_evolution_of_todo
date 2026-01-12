# ADR-0001: Stateless AI Chatbot Architecture with MCP Integration

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-10
- **Feature:** 001-ai-powered-chatbot
- **Context:** Need to implement an AI-powered chatbot that allows users to manage their tasks using natural language while ensuring stateless operation, proper user isolation, and security. The system must integrate with existing task management functionality and provide persistent conversation history without storing state in server memory.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

Implement a stateless AI chatbot architecture with the following integrated components:

- **Database Layer**: SQLModel classes for Conversation and Message entities with proper relationships (Conversation has many Messages)
- **MCP Layer**: Internal MCP server with stateless tools (add_task, list_tasks, complete_task, delete_task, update_task) that accept user_id for security
- **Agent Layer**: AgentRunner class implementing the "Hydrate -> Run -> Persist" cycle with OpenAI Agents SDK
- **API Layer**: RESTful chat endpoint at POST /api/{user_id}/chat orchestrating the conversation flow
- **Integration Layer**: OpenRouter for single model configuration and Better Auth for JWT-based authentication
- **State Management**: Conversation history persisted in Neon PostgreSQL database, never in server memory

## Consequences

### Positive

- **Scalability**: Stateless architecture allows for horizontal scaling without session affinity concerns
- **Reliability**: Conversation history persists across server restarts and deployments
- **Security**: User isolation enforced through user_id scoping at multiple layers (MCP tools, database queries, API endpoints)
- **Auditability**: Complete conversation history stored for compliance and debugging
- **Consistency**: Single source of truth for conversation state across all application instances
- **Cost Efficiency**: Single AI model configuration through OpenRouter for predictable costs

### Negative

- **Latency**: Database round-trips required for conversation history hydration on each request
- **Complexity**: Multiple architectural layers (MCP, Agent, API, Database) increase system complexity
- **Database Load**: Frequent reads/writes to conversation/message tables may impact performance
- **MCP Overhead**: Additional protocol layer between AI agent and application tools
- **Dependency Management**: Multiple external services (OpenRouter, Better Auth, Neon DB) create operational complexity

## Alternatives Considered

Alternative Stateful Architecture: Store conversation history in server memory with in-memory caching (Redis)
- Why rejected: Violates stateless architecture requirement, creates scaling challenges, risk of data loss during server restarts, requires session affinity

Alternative Direct API Integration: AI agent calls application endpoints directly instead of using MCP
- Why rejected: Less standardized, harder to maintain, doesn't leverage MCP ecosystem benefits, less secure for tool access

Alternative Client-Side State: Store conversation history in client and send with each request
- Why rejected: Security concerns with client-side data manipulation, larger request payloads, inconsistent state management

## References

- Feature Spec: /specs/001-ai-powered-chatbot/spec.md
- Implementation Plan: /specs/001-ai-powered-chatbot/plan.md
- Related ADRs: ADR-001 (Flowbite GSAP Integration Strategy)
- Evaluator Evidence: /history/prompts/001-ai-powered-chatbot/1-generate-technical-implementation-plan-phase-iii.plan.prompt.md
