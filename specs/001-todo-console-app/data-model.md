# Data Model: Todo In-Memory Python Console App

## Task Entity

### Fields
- **id**: Integer (auto-generated, unique)
  - Primary identifier for the task
  - Auto-incremented for each new task
  - Required field, immutable after creation

- **title**: String (1-200 characters)
  - Title of the task
  - Required field
  - Must be between 1-200 characters (inclusive)

- **description**: String (0-1000 characters)
  - Detailed description of the task
  - Optional field (can be empty)
  - Must be between 0-1000 characters (inclusive)

- **completed**: Boolean
  - Completion status of the task
  - Default value: False
  - Can be toggled between True/False

- **created_at**: DateTime (ISO 8601 format)
  - Timestamp when the task was created
  - Auto-generated on creation
  - Immutable after creation

### Validation Rules
- Title must be 1-200 characters (inclusive)
- Description must be 0-1000 characters (inclusive)
- ID must be unique within the repository
- ID, created_at are read-only after creation

### State Transitions
- New Task → Incomplete (default state when created)
- Incomplete → Complete (when marked as done)
- Complete → Incomplete (when marked as not done)

## In-Memory Repository

### Structure
- **Storage**: Dictionary with integer keys (task ID) and Task objects as values
- **ID Generation**: Auto-incrementing integer starting from 1
- **Thread Safety**: Not required for single-user console application

### Operations
- **Create**: Add new task to repository, assign unique ID
- **Read**: Retrieve task by ID
- **Update**: Modify existing task fields (except ID and created_at)
- **Delete**: Remove task by ID
- **List All**: Return all tasks in repository
- **Toggle Completion**: Switch completed status of task by ID