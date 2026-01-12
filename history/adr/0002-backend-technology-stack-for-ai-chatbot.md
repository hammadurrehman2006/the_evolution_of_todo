# ADR-0002: Backend Technology Stack for AI Chatbot

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-10
- **Feature:** 001-ai-powered-chatbot
- **Context:** Need to select a cohesive backend technology stack that aligns with the project constitution requirements (Python 3.13+, FastAPI, SQLModel, Neon PostgreSQL) while supporting AI integration (OpenAI Agents SDK), MCP protocol implementation, and authentication (Better Auth).

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

Select a Python-based backend technology stack with the following integrated components:

- **Language**: Python 3.13+ (as mandated by project constitution)
- **Web Framework**: FastAPI for building RESTful APIs with automatic documentation
- **ORM/Database Layer**: SQLModel for type-safe database models and queries
- **Database**: Neon PostgreSQL for cloud-native PostgreSQL with branch/clone features
- **AI Integration**: OpenAI Agents SDK for AI agent functionality
- **MCP Protocol**: Python MCP SDK for Model Context Protocol implementation
- **AI Provider**: OpenRouter for unified access to multiple AI models
- **Authentication**: Better Auth for JWT-based user authentication and management

## Consequences

### Positive

- **Type Safety**: Strong typing throughout the stack with Python type hints and SQLModel
- **Developer Experience**: FastAPI's automatic API documentation and validation
- **Constitution Compliance**: Aligns with project constitution requirements
- **Integration Capability**: Cohesive stack that works well together for AI/MCP integration
- **Performance**: FastAPI's async capabilities and Neon's cloud-native features
- **Maintainability**: Well-established libraries with strong community support
- **Security**: Built-in validation and authentication capabilities

### Negative

- **Learning Curve**: Team may need to familiarize themselves with newer Python features
- **Dependency Complexity**: Multiple new dependencies increase potential for conflicts
- **Vendor Lock-in**: Heavy reliance on specific services (Neon, OpenRouter, Better Auth)
- **Performance Overhead**: Multiple abstraction layers may impact performance
- **Debugging Complexity**: More complex stack may make debugging more challenging

## Alternatives Considered

Alternative Node.js Stack: TypeScript + Express/Koa + Prisma + PostgreSQL
- Why rejected: Doesn't comply with project constitution requirement for Python 3.13+

Alternative Django Stack: Django + DRF + Django ORM + PostgreSQL
- Why rejected: Less suitable for AI integration and modern API development compared to FastAPI

Alternative Microservice Architecture: Separate services for AI, MCP, and database
- Why rejected: Premature complexity for Phase III, increases operational overhead

## References

- Feature Spec: /specs/001-ai-powered-chatbot/spec.md
- Implementation Plan: /specs/001-ai-powered-chatbot/plan.md
- Related ADRs: ADR-0001 (Stateless AI Chatbot Architecture with MCP Integration)
- Evaluator Evidence: /history/prompts/001-ai-powered-chatbot/1-generate-technical-implementation-plan-phase-iii.plan.prompt.md
