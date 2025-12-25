<!--
Sync Impact Report:
Version change: N/A → 1.0.0
Added sections: All principles and sections as specified for "Evolution of Todo" project
Removed sections: None (new constitution)
Modified principles: N/A (new constitution)
Templates requiring updates:
- .specify/templates/plan-template.md ⚠ pending
- .specify/templates/spec-template.md ⚠ pending
- .specify/templates/tasks-template.md ⚠ pending
- .specify/commands/*.md ⚠ pending
- README.md ⚠ pending
Follow-up TODOs: None
-->
# Evolution of Todo Constitution

## Core Principles

### No Task = No Code
Strict spec-driven workflow where no code can be written without a corresponding task in the tasks.md file. The Constitution is the highest authority in the hierarchy, and all development must follow the spec-driven approach.

### Technology Stack Evolution
Mandatory technology stack transitioning from an in-memory Python 3.13+ console app to a cloud-native system using Next.js, FastAPI, SQLModel, and Neon DB.

### JWT-based Authentication
Explicitly require the implementation of JWT-based authentication via Better Auth for all user authentication processes.

### AI Chatbot Interface
Mandatory implementation of an AI chatbot interface using the OpenAI Agents SDK and MCP for enhanced user interaction.

### Event-Driven Architecture
Implementation of an event-driven architecture powered by Kafka and Dapr for scalable and decoupled system communication.

### Containerized Deployment
Mandate a monorepo structure, stateless server design, and containerized deployment via Docker and Kubernetes (Minikube/DOKS) using AI-assisted DevOps tools like kubectl-ai and Kagent.

## Technical Constraints
All systems must be stateless, use containerization, follow cloud-native patterns, and implement proper observability. No hardcoding of secrets or configuration values.

## Development Workflow
All development follows spec-driven approach with mandatory tasks in tasks.md, code reviews required for all changes, automated testing at all levels, and adherence to the technology stack requirements.

## Governance
This Constitution is the highest authority in the project hierarchy. All development must comply with these principles. Amendments require explicit documentation and approval. All PRs/reviews must verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2025-12-24 | **Last Amended**: 2025-12-24