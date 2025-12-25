# Todo Console Application

A simple in-memory todo console application built with Python 3.13+.

## Features

- Add tasks with titles and descriptions
- View all tasks with status indicators
- Mark tasks as complete/incomplete
- Update task details
- Delete tasks by ID
- Interactive command-line interface

## Requirements

- Python 3.13+
- UV package manager

## Installation

```bash
uv sync
```

## Usage

```bash
uv run python src/cli/main.py
```

## Available Commands

Once the application is running, you'll see the `todo>` prompt. Here are the available commands:

### Add a Task
```bash
add "task title" "task description"
```
- Add a new task with a title and optional description
- Example: `add "Buy groceries" "Milk, bread, eggs"`

### List All Tasks
```bash
list
```
- Display all tasks with their status (Complete/Pending) and IDs

### Mark Task as Complete
```bash
complete <id>
```
- Mark a task as complete using its ID
- Example: `complete 1`

### Mark Task as Incomplete
```bash
incomplete <id>
```
- Mark a task as incomplete using its ID
- Example: `incomplete 1`

### Update a Task
```bash
update <id> "new title" "new description"
```
- Update an existing task's title and description
- Example: `update 1 "Updated title" "Updated description"`
- You can update just the title: `update 1 "New title"`

### Delete a Task
```bash
delete <id>
```
- Delete a task by its ID
- Example: `delete 1`

### Help
```bash
help
```
- Show available commands with descriptions

### Exit
```bash
exit
```
- Quit the application

## Example Workflow

```
todo> add "Buy groceries" "Milk, bread, eggs"
Task added successfully with ID: 1

todo> add "Finish report" "Complete the quarterly report"
Task added successfully with ID: 2

todo> list

ID  | Status    | Title
--------------------------------------------------
1   | Pending   | Buy groceries
2   | Pending   | Finish report

todo> complete 1
Task 1 marked as complete.

todo> update 2 "Finish quarterly report" "Complete the Q4 quarterly report"
Task 2 updated successfully.

todo> list

ID  | Status    | Title
--------------------------------------------------
1   | Complete  | Buy groceries
2   | Pending   | Finish quarterly report

todo> delete 2
Task 2 deleted successfully.

todo> list

ID  | Status    | Title
--------------------------------------------------
1   | Complete  | Buy groceries

todo> exit
Goodbye!
```

## Running Tests

To run the test suite:
```bash
python -m pytest
```

All tests have passed successfully, confirming the application functionality.

## Architecture

This application follows a clean architecture pattern with:

- **Models**: Task data structures
- **Repositories**: In-memory data storage (InMemoryTaskRepository)
- **Services**: Business logic (TaskService)
- **CLI**: Command-line interface (Commands, main.py)