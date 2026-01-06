# Feature Specification: Hybrid Cloud Integration

**Feature Branch**: `004-hybrid-cloud-integration`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "Update the project specifications to define the 'Hybrid Cloud Integration' requirements. The core objective is to connect the local Next.js frontend application to the production backend API deployed at https://teot-phase2.vercel.app/. Explicitly specify that all data persistence (Tasks, Users) must occur in the remote Neon PostgreSQL database via this API, strictly replacing any local mock data or in-memory stores. Define the Authentication Bridge requirement: the frontend must utilize the Better Auth library with the JWT Plugin enabled. It must retrieve the active session's JWT and attach it as a Bearer token in the Authorization header for every outgoing request to the remote API. Define acceptance criteria requiring that a task created on localhost is immediately visible in the remote database and that any request without a valid token is rejected by the backend with a 401 Unauthorized status."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Task with Cloud Persistence (Priority: P1)

A user logs into the local Next.js application, creates a new task, and expects the task to be immediately persisted to the remote production database.

**Why this priority**: This is the core functionality that validates the hybrid cloud integration. Without this working, the entire feature is non-functional. It demonstrates end-to-end data flow from local UI to remote database.

**Independent Test**: Can be fully tested by creating a user session, creating a task via the UI, and verifying the task appears in the remote Neon database by querying the production API or database directly.

**Acceptance Scenarios**:

1. **Given** a user is authenticated on localhost, **When** they create a task with title "Buy groceries" and description "Milk, bread, eggs", **Then** the task is immediately visible in the remote Neon PostgreSQL database with a unique ID, correct user association, and timestamp
2. **Given** a user has just created a task on localhost, **When** they refresh the task list, **Then** the newly created task appears in the list with all correct details fetched from the remote API
3. **Given** a user creates a task on localhost, **When** another user (or the same user on another device) queries the remote API, **Then** the task is immediately visible without any local caching or delay

---

### User Story 2 - Authenticated API Request Flow (Priority: P1)

A user with an active session on the local frontend expects all their API requests to be automatically authenticated with their JWT token, ensuring secure data access.

**Why this priority**: Authentication is critical for security and data isolation. Without this, the application cannot enforce user-specific data access or protect against unauthorized requests. This is a foundational requirement for all subsequent operations.

**Independent Test**: Can be tested by inspecting network requests in browser DevTools to verify the Authorization header contains a valid Bearer token, and by attempting API calls with and without valid tokens to confirm 401 responses for unauthenticated requests.

**Acceptance Scenarios**:

1. **Given** a user has logged in via Better Auth, **When** the frontend makes any API request to https://teot-phase2.vercel.app/, **Then** the request includes an Authorization header with format "Bearer [JWT_TOKEN]"
2. **Given** a user's JWT token is valid, **When** they make an API request to fetch tasks, **Then** the backend accepts the request and returns only the tasks belonging to that user
3. **Given** a user's JWT token is expired or invalid, **When** they make an API request, **Then** the backend rejects the request with HTTP 401 Unauthorized status
4. **Given** a user makes an API request without any Authorization header, **When** the request reaches the backend, **Then** the backend rejects the request with HTTP 401 Unauthorized status

---

### User Story 3 - Replace Local Mock Data with Remote API (Priority: P2)

A user expects the application to fetch all task data from the remote production API, completely replacing any local mock data or in-memory storage.

**Why this priority**: This ensures data consistency and eliminates confusion from having multiple data sources. It's prioritized after P1 because it's the cleanup/migration step that follows establishing the core integration.

**Independent Test**: Can be tested by searching the codebase for mock data, disabling or removing it, and verifying that all task operations (create, read, update, delete) continue to work exclusively through the remote API.

**Acceptance Scenarios**:

1. **Given** the application has been updated to use remote API, **When** the user loads the task list, **Then** zero local/mock tasks are displayed, and only tasks from the remote database appear
2. **Given** the codebase has been refactored, **When** searching for "mock" or "in-memory" data stores, **Then** no active mock data implementations are found in the task data flow
3. **Given** a user performs CRUD operations on tasks, **When** monitoring network traffic, **Then** every operation results in an API call to https://teot-phase2.vercel.app/ with no local data fallback

---

### User Story 4 - Session Management and Token Refresh (Priority: P3)

A user with an active session expects seamless API access even as their JWT token approaches expiration, with automatic token refresh handled transparently.

**Why this priority**: While important for user experience, the application can function with manual re-authentication if token refresh fails. This is prioritized after core integration and data migration.

**Independent Test**: Can be tested by setting a short JWT expiration time, observing the application behavior as the token expires, and verifying that either token refresh occurs automatically or the user is prompted to re-authenticate gracefully.

**Acceptance Scenarios**:

1. **Given** a user's JWT token is about to expire, **When** they make an API request, **Then** the frontend automatically attempts to refresh the token before sending the request
2. **Given** token refresh succeeds, **When** subsequent API requests are made, **Then** the new JWT token is used in the Authorization header
3. **Given** token refresh fails, **When** the user attempts an API request, **Then** the application redirects the user to the login page with a clear message indicating session expiration

---

### Edge Cases

- What happens when the remote API is unavailable or returns a 500 error? The application should display a user-friendly error message and optionally retry with exponential backoff, but must not fall back to local mock data.
- How does the system handle network timeouts? API requests should have reasonable timeout values (e.g., 10 seconds for task operations) and display appropriate error messages to users.
- What happens when a user's JWT token is valid but the user has been deleted or disabled in the remote database? The backend should return 403 Forbidden, and the frontend should handle this by logging the user out and redirecting to login.
- How does the system handle race conditions when multiple devices modify the same task simultaneously? The backend should use optimistic locking or last-write-wins with proper conflict detection, returning 409 Conflict when appropriate.
- What happens when Better Auth JWT plugin is not properly configured? The application should fail fast during initialization with a clear error message indicating missing JWT configuration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST connect the local Next.js frontend to the production backend API at https://teot-phase2.vercel.app/ for all task and user data operations
- **FR-002**: System MUST persist all task data (title, description, status, user association, timestamps) exclusively to the remote Neon PostgreSQL database via the production API
- **FR-003**: System MUST persist all user data exclusively to the remote Neon PostgreSQL database via the production API
- **FR-004**: System MUST utilize the Better Auth library with the JWT Plugin enabled in the frontend application
- **FR-005**: System MUST retrieve the active user's JWT token from the Better Auth session
- **FR-006**: System MUST attach the JWT token as a Bearer token in the Authorization header for every outgoing API request to the remote backend
- **FR-007**: System MUST completely remove and replace all local mock data implementations with remote API calls
- **FR-008**: System MUST completely remove and replace all in-memory data stores with remote API calls
- **FR-009**: Backend API MUST reject any request without a valid JWT token with HTTP 401 Unauthorized status
- **FR-010**: Backend API MUST reject any request with an expired or invalid JWT token with HTTP 401 Unauthorized status
- **FR-011**: Backend API MUST reject any request with a malformed Authorization header with HTTP 401 Unauthorized status
- **FR-012**: System MUST ensure that a task created on localhost is immediately visible in the remote Neon PostgreSQL database
- **FR-013**: System MUST ensure that task creation, retrieval, update, and deletion operations all use the remote API exclusively
- **FR-014**: System MUST handle API authentication errors (401) by logging the user out and redirecting to the login page
- **FR-015**: System MUST display user-friendly error messages when API requests fail due to network or server errors
- **FR-016**: System MUST validate that JWT tokens contain required claims (user_id, expiration) before sending API requests

### Key Entities

- **Task**: Represents a user's todo item with attributes including unique identifier, title, description, completion status, user association (foreign key), creation timestamp, and last updated timestamp. All task data resides exclusively in the remote Neon PostgreSQL database.
- **User**: Represents an authenticated user with attributes including unique identifier, authentication credentials, and session information. User data is managed by Better Auth and persisted exclusively in the remote Neon PostgreSQL database.
- **JWT Token**: Represents an authentication token issued by Better Auth containing user identity claims, expiration timestamp, and signature. Tokens are retrieved from Better Auth sessions and attached to all API requests.
- **API Request**: Represents an HTTP request from the frontend to the backend API, including HTTP method, endpoint URL, request body, and Authorization header with Bearer token.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A task created on localhost appears in the remote Neon PostgreSQL database within 2 seconds of user submission
- **SC-002**: 100% of API requests from the frontend include a valid JWT Bearer token in the Authorization header
- **SC-003**: All API requests without valid JWT tokens are rejected by the backend with HTTP 401 Unauthorized status
- **SC-004**: Zero local mock data or in-memory stores remain active in the task data flow (verified by code search)
- **SC-005**: Users can perform full CRUD operations on tasks with data persisting exclusively to the remote database
- **SC-006**: The application handles authentication errors gracefully, redirecting users to login within 1 second of receiving a 401 response
- **SC-007**: All task data retrieved by the frontend matches exactly what is stored in the remote Neon PostgreSQL database (no local modifications or caching discrepancies)
- **SC-008**: Network request logs show zero attempts to access local storage or mock data for task operations

## Assumptions

- The production backend API at https://teot-phase2.vercel.app/ is already deployed, functional, and supports JWT authentication
- The backend API accepts Bearer tokens in the Authorization header format "Bearer [JWT_TOKEN]"
- The backend API has existing endpoints for task CRUD operations (POST /tasks, GET /tasks, PUT /tasks/:id, DELETE /tasks/:id, etc.)
- The Better Auth library is already integrated into the frontend application or will be integrated as part of this feature
- The Better Auth JWT Plugin can be enabled via configuration without requiring significant architectural changes
- The remote Neon PostgreSQL database schema already includes tables for Tasks and Users with appropriate relationships
- JWT tokens issued by Better Auth contain at minimum a user_id claim and expiration timestamp (exp)
- The backend API enforces user data isolation, ensuring users can only access their own tasks when authenticated
- Standard HTTP status codes are used: 200 for success, 401 for unauthorized, 403 for forbidden, 500 for server errors
- Network latency between localhost and production API is reasonable (under 500ms for most requests)
- The application operates in a trusted network environment where HTTPS is used for all API communication

## Dependencies

- Better Auth library and JWT Plugin must be available and properly configured in the frontend
- Production backend API at https://teot-phase2.vercel.app/ must be operational
- Remote Neon PostgreSQL database must be accessible by the backend API
- Backend API must have proper CORS configuration to accept requests from localhost during development
- User authentication system must be functional to generate valid JWT tokens

## Out of Scope

- Offline functionality or local data caching for when the remote API is unavailable
- Migration of existing local task data to the remote database
- Backend API implementation or modifications (assumes API already exists and is functional)
- User registration or authentication flow (assumes Better Auth is already handling this)
- Performance optimization of API calls (e.g., batching, request coalescing)
- Real-time synchronization or WebSocket connections for live updates
- Database schema design or migration scripts for the Neon PostgreSQL database
- API rate limiting or throttling on the frontend
- Comprehensive error recovery strategies beyond basic retry logic
