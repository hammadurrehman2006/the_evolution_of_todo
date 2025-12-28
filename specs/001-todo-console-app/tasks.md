---
description: "Task list for Todo In-Memory Python Console App implementation"
---

# Tasks: Todo In-Memory Python Console App

**Input**: Design documents from `/specs/001-todo-console-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure with src/, tests/, and configuration files
- [X] T002 Initialize Python 3.13+ project with UV package manager
- [X] T003 [P] Create src/models/, src/repositories/, src/services/, src/cli/ directories

---
## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Task model with validation in src/models/task.py
- [X] T005 Create InMemoryTaskRepository with CRUD operations in src/repositories/in_memory_task_repository.py
- [X] T006 Create TaskService with business logic in src/services/task_service.py
- [X] T007 Create basic CLI structure in src/cli/main.py
- [X] T008 Create pyproject.toml with dependencies

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---
## Phase 3: User Story 1 - Add Tasks (Priority: P1) 🎯 MVP

**Goal**: Implement the ability to add tasks with titles and descriptions to the console app

**Independent Test**: Can run the application and use the add task command to create a new task with a unique ID and status of incomplete

### Implementation for User Story 1

- [X] T009 [P] [US1] Implement task creation validation in src/models/task.py
- [X] T010 [US1] Implement create_task method in src/repositories/in_memory_task_repository.py
- [X] T011 [US1] Implement add_task method in src/services/task_service.py
- [X] T012 [US1] Implement add command handler in src/cli/commands.py
- [X] T013 [US1] Integrate add command with main CLI loop in src/cli/main.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---
## Phase 4: User Story 2 - View All Tasks (Priority: P1)

**Goal**: Implement the ability to view all tasks with ID, title, description, and completion status

**Independent Test**: Can add tasks and then view them all with proper status indicators displayed

### Implementation for User Story 2

- [X] T014 [US2] Implement get_all_tasks method in src/repositories/in_memory_task_repository.py
- [X] T015 [US2] Implement get_all_tasks method in src/services/task_service.py
- [X] T016 [US2] Implement list command handler in src/cli/commands.py
- [X] T017 [US2] Integrate list command with main CLI loop in src/cli/main.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---
## Phase 5: User Story 3 - Mark Tasks Complete/Incomplete (Priority: P2)

**Goal**: Implement the ability to toggle task completion status by ID

**Independent Test**: Can mark existing tasks as complete or incomplete and verify the status changes

### Implementation for User Story 3

- [X] T018 [US3] Implement update_task method in src/repositories/in_memory_task_repository.py
- [X] T019 [US3] Implement toggle_task_completion method in src/services/task_service.py
- [X] T020 [US3] Implement complete/incomplete command handlers in src/cli/commands.py
- [X] T021 [US3] Integrate complete/incomplete commands with main CLI loop in src/cli/main.py

**Checkpoint**: All user stories should now be independently functional

---
## Phase 6: User Story 4 - Update Task Details (Priority: P2)

**Goal**: Implement the ability to update task title and description by ID

**Independent Test**: Can update existing task details and verify the changes are saved

### Implementation for User Story 4

- [X] T022 [US4] Enhance update_task method in src/repositories/in_memory_task_repository.py to handle title/description updates
- [X] T023 [US4] Implement update_task method in src/services/task_service.py
- [X] T024 [US4] Implement update command handler in src/cli/commands.py
- [X] T025 [US4] Integrate update command with main CLI loop in src/cli/main.py

---
## Phase 7: User Story 5 - Delete Tasks by ID (Priority: P2)

**Goal**: Implement the ability to delete tasks by their ID

**Independent Test**: Can delete existing tasks by ID and verify they are removed from the system

### Implementation for User Story 5

- [X] T026 [US5] Implement delete_task method in src/repositories/in_memory_task_repository.py
- [X] T027 [US5] Implement delete_task method in src/services/task_service.py
- [X] T028 [US5] Implement delete command handler in src/cli/commands.py
- [X] T029 [US5] Integrate delete command with main CLI loop in src/cli/main.py

---
## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T030 [P] Add comprehensive error handling across all modules
- [X] T031 [P] Add input validation and user-friendly error messages
- [X] T032 [P] Implement help command and documentation in CLI
- [X] T033 [P] Add logging functionality to track operations
- [X] T034 [P] Add unit tests for all components in tests/
- [X] T035 Run quickstart.md validation to ensure all functionality works as expected

---
## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3/US4 but should be independently testable

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---
## Parallel Example: User Story 1

```bash
# Launch foundational tasks together:
Task: "Create Task model with validation in src/models/task.py"
Task: "Create InMemoryTaskRepository with CRUD operations in src/repositories/in_memory_task_repository.py"
Task: "Create TaskService with business logic in src/services/task_service.py"
Task: "Create basic CLI structure in src/cli/main.py"
```

---
## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---
## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence