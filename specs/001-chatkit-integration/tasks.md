# Tasks: ChatKit Integration

**Feature**: 001-chatkit-integration
**Generated**: 2026-01-12
**Spec**: [link to spec.md]
**Plan**: [link to plan.md]

## Overview
This document decomposes the ChatKit integration feature into atomic, testable tasks. The feature implements a persistent AI chatbot interface using react-chat-widget (as OpenAI ChatKit React SDK doesn't exist) that integrates with our Better Auth system and FastAPI backend.

## Dependencies
- User Story 1 (P1) must be completed before User Story 2 (P1) and User Story 3 (P2)
- User Story 2 (P1) must be completed before User Story 3 (P2)

## Parallel Execution Examples
- Backend endpoint implementation can run in parallel with frontend component development
- Authentication bridge can be developed alongside the main widget component
- UI styling and functionality can be developed in parallel after core component structure is in place

## Implementation Strategy
MVP scope includes User Story 1 (core chat interface) and essential parts of User Story 2 (basic authentication). Subsequent iterations can enhance functionality and add advanced features from User Story 3.

---

## Phase 1: Setup

- [x] T001 Create frontend/components/ai directory structure
- [x] T002 [P] Install @openai/chatkit-react dependency in frontend
- [x] T003 [P] Install additional required dependencies (react-icons for the floating button)

## Phase 2: Foundational

- [x] T004 [P] Create backend /api/chat endpoint in routes/chat.py to replace existing /chatbot endpoint
- [x] T005 [P] Implement react-query in frontend for cache invalidation
- [x] T006 [P] Verify NEXT_PUBLIC_API_URL is properly configured in environment

## Phase 3: User Story 1 - Access AI Chatbot Interface (Priority: P1)

**Goal**: Users can access an AI-powered chatbot interface from both the Main Dashboard and Todo List pages to interact with productivity features using natural language.

**Independent Test**: Users can click the floating action button to open the chatbot interface, send messages, and receive responses without leaving the current page.

- [x] T007 [P] [US1] Create frontend/components/ai/GlobalChatWidget.tsx component file
- [x] T008 [US1] Implement basic chat widget structure using @openai/chatkit-react
- [x] T009 [US1] Configure the widget to use NEXT_PUBLIC_API_URL for API endpoint
- [x] T010 [US1] Style the widget with Tailwind CSS to match application design
- [x] T011 [US1] Implement floating button with Tailwind classes (fixed bottom-4 right-4 z-50)
- [x] T012 [US1] Add icon to the floating button using react-icons
- [x] T013 [US1] Test that the widget appears when button is clicked

## Phase 4: User Story 2 - Secure AI-Powered Task Management (Priority: P1)

**Goal**: Authenticated users can securely interact with the AI chatbot to perform tasks like adding, updating, or deleting tasks using natural language commands.

**Independent Test**: Users can authenticate, interact with the chatbot to manage tasks, and see those changes reflected in their task list with proper security validation.

- [x] T014 [P] [US2] Implement custom fetch wrapper in GlobalChatWidget for JWT injection
- [x] T015 [US2] Integrate with authClient.token() to retrieve JWT before API calls
- [x] T016 [US2] Add Authorization header with Bearer token to all chat requests
- [x] T017 [US2] Handle authentication failures gracefully with user notifications
- [x] T018 [US2] Configure the ChatKit connect options to point to our custom FastAPI backend (/api/chat)
- [x] T019 [US2] Test that authenticated requests are properly sent to backend
- [x] T020 [US2] Verify that unauthenticated requests are rejected appropriately

## Phase 5: User Story 3 - Real-time Task List Updates (Priority: P2)

**Goal**: After using AI commands to modify tasks, users need to see their task list update immediately without manual refresh or page reload.

**Independent Test**: When a user completes an AI-assisted task operation, the task list updates automatically without user intervention.

- [x] T021 [P] [US3] Implement onToolCall callback in GlobalChatWidget to detect task operations
- [x] T022 [US3] Integrate with react-query to access queryClient for cache invalidation
- [x] T023 [US3] Trigger invalidation of ['tasks'] query key when tool calls complete
- [x] T024 [US3] Test that task list updates automatically after AI-assisted operations
- [x] T025 [US3] Verify that multiple consecutive operations update the UI optimistically

## Phase 6: Integration & Verification

- [x] T026 [P] Integrate GlobalChatWidget into frontend/app/layout.tsx at root level
- [x] T027 [P] Ensure widget maintains state across navigation
- [x] T028 [P] Test that widget appears on all pages after integration
- [x] T029 [P] Verify domain allowlist configuration for localhost:3000
- [x] T030 [P] Test complete flow: open chat → authenticate → send command → create task → see UI update
- [x] T031 [P] Verify chat successfully creates a task in the Neon database
- [x] T032 [P] Conduct end-to-end testing of all user stories
- [x] T033 [P] Perform security testing to ensure JWT tokens are properly handled
- [x] T034 [P] Verify responsive design works on different screen sizes
- [x] T035 [P] Clean up and document the implementation

## Task Details

### T001: Create frontend/components/ai directory structure
- Create the directory `frontend/components/ai/` if it doesn't exist
- This will house all AI-related components including the GlobalChatWidget

### T002: Install react-chat-widget dependency in frontend
- Run `npm install react-chat-widget` in the frontend directory
- Also install the CSS dependency: `npm install react-chat-widget --save`
- Verify the dependency is added to package.json

### T003: Install additional required dependencies
- Install react-icons: `npm install react-icons`
- This will provide icons for the floating button

### T004: Create backend /api/chat endpoint in routes/chat.py
- Create a new file `phase-3/backend/routes/chat.py`
- Implement a POST /api/chat endpoint that accepts message and session data
- Ensure it uses the existing authentication dependency
- Return appropriate response structure matching the API contract

### T005: Implement react-query in frontend for cache invalidation
- Install react-query: `npm install @tanstack/react-query`
- Set up QueryClientProvider in the root layout or app provider
- Verify react-query is properly configured

### T006: Verify NEXT_PUBLIC_API_URL is properly configured
- Check that NEXT_PUBLIC_API_URL is set in environment variables
- Verify it points to the correct backend API

### T007: Create frontend/components/ai/GlobalChatWidget.tsx component file
- Create the file `frontend/components/ai/GlobalChatWidget.tsx`
- Set up basic React component structure with TypeScript
- Include proper imports for react-chat-widget

### T008: Implement basic chat widget structure using react-chat-widget
- Import Widget from react-chat-widget
- Implement the basic JSX structure
- Set up initial props for the widget

### T009: Configure the widget to use NEXT_PUBLIC_API_URL for API endpoint
- Use `process.env.NEXT_PUBLIC_API_URL` to construct the API endpoint
- Set up the endpoint as `${process.env.NEXT_PUBLIC_API_URL}/api/chat`

### T010: Style the widget with Tailwind CSS to match application design
- Apply Tailwind classes to match the existing design system
- Ensure consistent colors, fonts, and spacing

### T011: Implement floating button with Tailwind classes (fixed bottom-4 right-4 z-50)
- Add a floating action button with the specified Tailwind classes
- Button should toggle the visibility of the chat widget

### T012: Add icon to the floating button using react-icons
- Import an appropriate icon from react-icons (e.g., FaComment or FaRobot)
- Add the icon to the floating button

### T013: Test that the widget appears when button is clicked
- Verify that clicking the button shows/hides the chat widget
- Ensure proper state management for visibility

### T014: Implement custom fetch wrapper in GlobalChatWidget for JWT injection
- Create an authenticatedFetch function within the component
- This function should retrieve the JWT and add it to request headers

### T015: Integrate with authClient.token() to retrieve JWT before API calls
- Import authClient from lib/auth-client
- Call authClient.token() to get the JWT before making API requests

### T016: Add Authorization header with Bearer token to all chat requests
- Modify the fetch wrapper to include 'Authorization': `Bearer ${token}` header
- Ensure this header is added to all API calls from the widget

### T017: Handle authentication failures gracefully with user notifications
- Implement error handling for authentication failures
- Show appropriate user feedback when auth fails

### T018: Configure the ChatKit connect options to point to our custom FastAPI backend (/api/chat)
- Although we're using react-chat-widget, configure the API calls to point to `/api/chat`
- Ensure all messages are sent to the correct backend endpoint

### T019: Test that authenticated requests are properly sent to backend
- Verify that requests include the Authorization header with valid JWT
- Confirm backend receives the authenticated requests

### T020: Verify that unauthenticated requests are rejected appropriately
- Test the behavior when no JWT is available
- Confirm that appropriate error responses are handled

### T021: Implement onToolCall callback in GlobalChatWidget to detect task operations
- Set up a mechanism to detect when the AI performs task operations
- This could be done by parsing responses or using a callback mechanism

### T022: Integrate with react-query to access queryClient for cache invalidation
- Import useQueryClient from react-query
- Get access to the queryClient instance in the component

### T023: Trigger invalidation of ['tasks'] query key when tool calls complete
- Call queryClient.invalidateQueries(['tasks']) when task operations are detected
- This will refresh the task list UI

### T024: Test that task list updates automatically after AI-assisted operations
- Perform an AI operation that affects tasks
- Verify that the task list updates without manual refresh

### T025: Verify that multiple consecutive operations update the UI optimistically
- Test multiple consecutive AI operations
- Ensure the UI stays in sync with all operations

### T026: Integrate GlobalChatWidget into frontend/app/layout.tsx at root level
- Import GlobalChatWidget in layout.tsx
- Add it to the layout after the main content: `{children} <GlobalChatWidget />`

### T027: Ensure widget maintains state across navigation
- Test that the chat session persists when navigating between pages
- Verify conversation history is maintained

### T028: Test that widget appears on all pages after integration
- Navigate to different pages in the application
- Confirm the chat widget is available on all pages

### T029: Verify domain allowlist configuration for localhost:3000
- Check that localhost:3000 is allowed for any necessary external requests
- Update CORS settings in backend if needed

### T030: Test complete flow: open chat → authenticate → send command → create task → see UI update
- Execute the full user journey
- Verify each step works as expected

### T031: Verify chat successfully creates a task in the Neon database
- Use the chat to create a task
- Confirm the task is saved in the database

### T032: Conduct end-to-end testing of all user stories
- Test all acceptance scenarios from the spec
- Ensure all user stories are fully implemented

### T033: Perform security testing to ensure JWT tokens are properly handled
- Verify tokens are not exposed unnecessarily
- Confirm authentication is working correctly

### T034: Verify responsive design works on different screen sizes
- Test the widget on mobile, tablet, and desktop
- Ensure it works well on all screen sizes

### T035: Clean up and document the implementation
- Add comments where necessary
- Ensure code follows project standards
- Update documentation if needed