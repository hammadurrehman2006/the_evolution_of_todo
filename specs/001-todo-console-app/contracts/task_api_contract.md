# Task API Contract: Todo In-Memory Python Console App

## Task Operations Contract

### Add Task
- **Method**: CREATE
- **Input**: title (string, 1-200 chars), description (string, 0-1000 chars)
- **Output**: task object with id, title, description, completed (false), created_at
- **Errors**: ValidationError if input doesn't meet requirements

### Get Task by ID
- **Method**: READ
- **Input**: id (integer)
- **Output**: task object or NotFoundError

### Update Task
- **Method**: UPDATE
- **Input**: id (integer), title (string, 1-200 chars), description (string, 0-1000 chars)
- **Output**: updated task object
- **Errors**: NotFoundError if task doesn't exist, ValidationError if input doesn't meet requirements

### Delete Task
- **Method**: DELETE
- **Input**: id (integer)
- **Output**: success confirmation or NotFoundError

### List All Tasks
- **Method**: READ ALL
- **Input**: none
- **Output**: array of task objects

### Toggle Task Completion
- **Method**: UPDATE
- **Input**: id (integer), completed (boolean)
- **Output**: updated task object
- **Errors**: NotFoundError if task doesn't exist

## Data Validation Contract

### Title Validation
- Must be between 1-200 characters (inclusive)
- Cannot be empty or null
- Returns ValidationError if invalid

### Description Validation
- Must be between 0-1000 characters (inclusive)
- Can be empty
- Returns ValidationError if invalid

### ID Validation
- Must exist in repository
- Returns NotFoundError if invalid