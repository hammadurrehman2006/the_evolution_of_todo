---
id: 0002
title: Hybrid Cloud Integration Technical Plan
stage: plan
date: 2026-01-04
surface: agent
model: claude-sonnet-4-5
feature: 004-hybrid-cloud-integration
branch: 004-hybrid-cloud-integration
user: hammadurrehman2006
command: /sp.plan
labels: ["api-integration", "architecture", "jwt-auth", "api-client", "mock-data-removal"]
links:
  spec: /home/hammadurrehman2006/Desktop/the_evolution_of_todo/specs/004-hybrid-cloud-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /home/hammadurrehman2006/Desktop/the_evolution_of_todo/specs/004-hybrid-cloud-integration/plan.md
  - /home/hammadurrehman2006/Desktop/the_evolution_of_todo/specs/004-hybrid-cloud-integration/research.md
  - /home/hammadurrehman2006/Desktop/the_evolution_of_todo/specs/004-hybrid-cloud-integration/data-model.md
  - /home/hammadurrehman2006/Desktop/the_evolution_of_todo/specs/004-hybrid-cloud-integration/quickstart.md
  - /home/hammadurrehman2006/Desktop/the_evolution_of_todo/specs/004-hybrid-cloud-integration/contracts/api-endpoints.md
  - /home/hammadurrehman2006/Desktop/the_evolution_of_todo/CLAUDE.md
tests:
  - Constitution checks passed (all applicable principles followed)
  - Phase 0 research validated all architectural decisions
  - Phase 1 design artifacts complete and internally consistent
---

## Prompt

Generate a technical implementation plan for the "Hybrid Cloud Integration" based on the new specification. Architect a centralized API Client Layer (e.g., in frontend/lib/api-client.ts) that acts as the single gateway for all remote communication. This client must be configured to read the base URL from the NEXT_PUBLIC_API_URL environment variable, defaulting to https://teot-phase2.vercel.app/. Plan the integration of a fetch interceptor or wrapper that automatically injects the Authorization: Bearer <token> header using the session data from Better Auth. Detail the refactoring strategy for the UI components: map out exactly which files (e.g., TaskList, AddTaskForm) need to have their mock data calls replaced with this new ApiClient methods. Ensure the plan includes a step to verify that the local .env file contains the exact BETTER_AUTH_SECRET used by the remote server to ensure signature validation succeeds.

## Response snapshot

Created comprehensive technical implementation plan for Hybrid Cloud Integration feature (004-hybrid-cloud-integration):

**Phase 0: Research & Architecture (Complete)**
- Generated `research.md` with 11 key architectural decisions
- Centralized API Client Layer architecture chosen
- Fetch interceptor strategy for automatic JWT injection
- Environment configuration approach (NEXT_PUBLIC_API_URL + BETTER_AUTH_SECRET)
- Mock data removal strategy (systematic replacement of use-mock-todos.ts)
- Error handling standardized (ApiError class with 401 → logout flow)
- Performance baseline established (no aggressive optimization)
- Security considerations documented (JWT storage, CORS, HTTPS)

**Phase 1: Design & Contracts (Complete)**
- Generated `data-model.md` with complete entity definitions:
  - Todo entity (11 fields) with validation rules and state transitions
  - User entity (7 fields) with authentication context
  - JWT Token claims structure
  - API request/response models with TypeScript interfaces
- Generated `contracts/api-endpoints.md` with REST API contract:
  - 7 endpoints documented (health, getTodos, getTodo, createTodo, updateTodo, deleteTodo, toggleTodo)
  - Request/response formats with examples
  - Error response format standardized
  - Authentication flow detailed
  - Testing examples with cURL commands
- Generated `quickstart.md` developer guide:
  - Step-by-step setup instructions (10-15 minutes)
  - Environment configuration with .env.local example
  - Integration testing steps
  - Troubleshooting section for common issues
  - Verification checklist (14 items)
- Updated agent context (CLAUDE.md) with new technologies

**Phase 2: Implementation Plan (Complete)**
- Generated comprehensive `plan.md` with:
  - Technical context (TypeScript 5.7+, Next.js 16.0.3, Better Auth JWT Plugin)
  - Constitution compliance check (all gates passed)
  - Project structure with file-level refactoring map
  - Implementation phases breakdown (Environment, API Client, Hook Refactoring, Component Integration, Auth Flow, Testing, Documentation)
  - Files to create (4), modify (3), remove (1)
  - Refactoring flow diagrams (current mock → target API)
  - Testing strategy (unit, integration, contract, manual)
  - Risk assessment (high, medium, low risks with mitigations)
  - Success metrics mapped to spec requirements

**Key Technical Decisions**:
1. **API Client**: Centralized `lib/api-client.ts` with fetch wrapper
2. **Authentication**: JWT injection via Better Auth session
3. **Component Strategy**: Minimal changes (only page component needs update)
4. **Hook Migration**: `use-mock-todos.ts` → `use-todos.ts` with identical interface
5. **Error Handling**: Standardized ApiError class with status-based routing
6. **Environment**: NEXT_PUBLIC_API_URL with production fallback
7. **Secret Sync**: BETTER_AUTH_SECRET must match remote server

**Files Mapped for Refactoring**:
- **To Create**: `lib/api-client.ts`, `hooks/use-todos.ts`, `.env.local`, `.env.example`
- **To Modify**: `app/todos/page.tsx`, `lib/types.ts`, `lib/auth-client.ts`
- **To Remove**: `hooks/use-mock-todos.ts`
- **No Changes**: All todo components (TaskList, TaskCard, TaskForm, FilterBar) remain unchanged

## Outcome

- ✅ Impact: Complete technical implementation plan with Phase 0 (Research), Phase 1 (Design & Contracts), and Phase 2 (Implementation Tasks outline) ready for task generation
- 🧪 Tests: Constitution checks passed, research decisions validated, contract consistency verified
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, contracts/api-endpoints.md; updated CLAUDE.md
- 🔁 Next prompts: Run `/sp.tasks` to generate atomic implementation tasks in tasks.md
- 🧠 Reflection: Planning phase successfully translated business requirements into detailed technical architecture with clear implementation path. All architectural decisions documented and justified. Component-level refactoring strategy minimizes blast radius by leveraging existing prop-based architecture.

## Evaluation notes (flywheel)

- Failure modes observed: Initial conflict with 004-backend-task-api directory (resolved by renaming to 005); agent context update completed successfully
- Graders run and results (PASS/FAIL): Constitution Check - PASS; Research completeness - PASS; Contract consistency - PASS; Documentation quality - PASS
- Prompt variant (if applicable): Standard /sp.plan workflow with detailed user requirements for API client architecture and refactoring strategy
- Next experiment (smallest change to try): Proceed to task generation phase (/sp.tasks) to create atomic, testable implementation tasks
