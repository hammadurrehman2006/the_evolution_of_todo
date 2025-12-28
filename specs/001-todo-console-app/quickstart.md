# Quickstart: Todo In-Memory Python Console App

## Setup

1. Ensure Python 3.13+ is installed on your system
2. Install dependencies using UV:
   ```bash
   uv sync
   ```

## Running the Application

```bash
uv run python src/cli/main.py
```

## Available Commands

- `add "title" "description"` - Add a new task
- `list` - List all tasks with status
- `update <id> "new title" "new description"` - Update a task
- `complete <id>` - Mark a task as complete
- `incomplete <id>` - Mark a task as incomplete
- `delete <id>` - Delete a task
- `help` - Show available commands
- `exit` - Exit the application

## Example Usage

```bash
# Add a new task
add "Buy groceries" "Milk, bread, eggs"

# List all tasks
list

# Mark task #1 as complete
complete 1

# Update task #1
update 1 "Buy groceries" "Milk, bread, eggs, fruits"

# Delete task #2
delete 2
```