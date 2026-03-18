# Action Detection Patterns - Complete Reference

## Backend Response Formats

### CREATE Operations
Backend returns:
- `"Task created successfully. ID: {uuid}"`
- `"Error creating task: {message}"`
- `"Error: Invalid priority..."`

**Patterns that match:**
```javascript
/task.*created/i           // ✅ "Task 'X' created", "Task created successfully"
/created.*task/i           // ✅ "Created task 'X'"
/task created successfully/i  // ✅ EXACT backend response
/created successfully/i    // ✅ "Created successfully"
```

### DELETE Operations  
Backend returns:
- `"Task '{title}' deleted successfully."`
- `"Error deleting task: {message}"`
- `"Error: No task found..."`

**Patterns that match:**
```javascript
/task.*deleted/i           // ✅ "Task 'X' deleted", "Task deleted successfully"
/deleted.*task/i           // ✅ "Deleted task 'X'"
/task.*deleted successfully/i  // ✅ EXACT backend response: "Task 'X' deleted successfully."
/deleted successfully/i    // ✅ "Deleted successfully"
```

### UPDATE Operations
Backend returns:
- `"Task {uuid} updated successfully."`
- `"Error updating task: {message}"`

**Patterns that match:**
```javascript
/task.*updated/i           // ✅ "Task 'X' updated", "Task updated successfully"
/updated.*task/i           // ✅ "Updated task 'X'"
/task.*updated successfully/i  // ✅ EXACT backend response: "Task xxx updated successfully."
/updated successfully/i    // ✅ "Updated successfully"
```

### LIST Operations (No UI refresh needed)
Backend returns:
- JSON array of tasks
- `"No tasks found matching your criteria."`
- `"Error fetching tasks: {message}"`

**No action detection** - listing tasks doesn't trigger UI refresh.

---

## Pattern Matching Rules

### How Regex Works
| Pattern | Matches | Doesn't Match |
|---------|---------|---------------|
| `/task created/i` | "task created" | "task 'X' created" ❌ |
| `/task.*created/i` | "task created", "task 'X' created", "task (anything) created" | - |
| `/created.*task/i` | "created task", "created task 'X'" | - |

### Why `.*` is Important
The `.*` wildcard matches **zero or more of any character**, including:
- Spaces: "task created"
- Quotes: "task 'buy milk' created"
- UUIDs: "task abc-123-xyz created"
- Any text: "task (anything here) created"

---

## Test Cases

### ✅ CREATE - Should Match
```
"Task 'test task 2' created."
→ Matches: /task.*created/i ✅

"Task created successfully. ID: abc-123"
→ Matches: /task created successfully/i ✅

"Created task 'meeting'"
→ Matches: /created.*task/i ✅
```

### ✅ DELETE - Should Match
```
"Task 'test task' deleted successfully."
→ Matches: /task.*deleted successfully/i ✅

"Deleted task 'old meeting'"
→ Matches: /deleted.*task/i ✅

"Task 'buy milk' deleted."
→ Matches: /task.*deleted/i ✅
```

### ✅ UPDATE - Should Match
```
"Task abc-123 updated successfully."
→ Matches: /task.*updated successfully/i ✅

"Updated task 'report'"
→ Matches: /updated.*task/i ✅

"Task 'meeting' updated."
→ Matches: /task.*updated/i ✅
```

### ❌ Should NOT Match (Conversational)
```
"Here are your tasks:"
→ No match ✅ (just listing)

"No tasks found"
→ No match ✅ (just listing)

"I can help with that"
→ No match ✅ (conversational)

"Would you like me to create a task?"
→ No match ✅ (question, not action)
```

---

## Debugging

### Console Logs
When action detection runs, you'll see:
```
[detectAction] Analyzing content: Task 'test' created.
[detectAction] Lowercase: task 'test' created.
[detectAction] Testing CREATE pattern: /task.*created/i → ✅ MATCH
[detectAction] ✅ Detected CREATE action
[detectAction] Refreshing todos after AI action...
```

### If Pattern Doesn't Match
1. Check console logs for exact backend response
2. Verify the response contains "task" + action word
3. Check if it's a new response format not covered
4. Add new pattern if needed

### Adding New Patterns
```javascript
created: [
  /task.*created/i,
  // Add new pattern here:
  /your.*new.*pattern/i,
]
```

---

## Coverage Summary

| Operation | Backend Format | Pattern Coverage |
|-----------|---------------|------------------|
| CREATE | `"Task created successfully. ID: xxx"` | ✅ 100% |
| CREATE | `"Task 'X' created."` | ✅ 100% |
| DELETE | `"Task 'X' deleted successfully."` | ✅ 100% |
| DELETE | `"Task 'X' deleted."` | ✅ 100% |
| UPDATE | `"Task xxx updated successfully."` | ✅ 100% |
| UPDATE | `"Task 'X' updated."` | ✅ 100% |
| LIST | JSON array | ✅ N/A (no refresh) |
| ERROR | `"Error: ..."` | ✅ N/A (no refresh) |

**Total Coverage: 100% of CRUD operations** ✅
