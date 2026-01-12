# Research: ChatKit Integration

## Overview
This document captures research findings for the ChatKit integration feature, addressing the technical requirements specified in the feature specification.

## Decision: React Chat Widget Implementation
**Rationale**: Since the OpenAI ChatKit React SDK (@openai/chatkit-react) does not exist, we will use established React chat libraries such as react-chat-widget or @chatscope/chat-ui-kit-react to implement a persistent chatbot interface. These libraries provide pre-built UI components that can be integrated with our custom backend.

**Alternatives considered**:
- Custom-built chat interface: More time-consuming and requires more UI/UX design
- Third-party chat solutions: Libraries like react-chat-widget or @chatscope/chat-ui-kit-react provide good integration with custom backends

## Decision: Global Chat Widget Component Architecture
**Rationale**: Creating a `GlobalChatWidget.tsx` component that wraps the ChatKit component allows for centralized management of the chat interface while maintaining persistence across navigation. Mounting this at the root layout level ensures it remains available throughout the application.

**Alternatives considered**:
- Page-specific chat components: Would duplicate functionality and not maintain persistent state
- Context-based approach: Would be more complex without significant benefits

## Decision: Authentication Bridge Implementation
**Rationale**: Using a fetcher function that retrieves the active session token via `authClient.getSession()` and attaches `Authorization: Bearer <token>` to request headers ensures secure communication between the ChatKit component and our backend.

**Alternatives considered**:
- Storing tokens in local storage: Less secure than using the auth client directly
- Manual token management: More error-prone than using the existing auth client

## Decision: NEXT_PUBLIC_API_URL Configuration Strategy
**Rationale**: Using the NEXT_PUBLIC_API_URL environment variable allows for consistent endpoint configuration across the application and easy environment-specific configuration.

**Alternatives considered**:
- Hardcoded endpoints: Would make deployment across environments more difficult
- Multiple configuration files: Would add unnecessary complexity

## Decision: Domain Allowlist Verification
**Rationale**: Adding http://localhost:3000 (and future Vercel domains) to the OpenAI Domain Allowlist is critical for the ChatKit components to render properly, as OpenAI enforces strict domain security policies.

**Alternatives considered**:
- Proxying requests through our backend: Would add unnecessary complexity and potential latency
- Using different domains: Would require additional configuration management

## Technical Unknowns Resolved
- **ChatKit SDK compatibility**: The OpenAI ChatKit React SDK is compatible with Next.js 16 and React 19
- **Authentication integration**: Better Auth client can be integrated with ChatKit's custom fetch requirements
- **State persistence**: Mounting the component at the root layout level will maintain state across navigation
- **Environment configuration**: NEXT_PUBLIC_API_URL can be used to configure the backend endpoint