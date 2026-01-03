# 🚀 Quick Start Guide - Backend Task Management API

## ✅ Setup Complete!

Your backend API is fully configured and ready to use with:
- ✅ Neon PostgreSQL database connected
- ✅ All tables created (`tasks` table)
- ✅ JWT authentication configured
- ✅ All CRUD endpoints implemented
- ✅ Advanced search, filtering, and sorting

## 🎯 Start the Server

```bash
cd /home/hammadurrehman2006/Desktop/the_evolution_of_todo/backend
python3 main.py
```

The server will start on: **http://localhost:8000**

## 📖 Access Swagger UI

Open your browser to: **http://localhost:8000/docs**

You'll see interactive API documentation with all endpoints.

## 🔑 Get Your Test Token

Run this command to generate a JWT token:

```bash
python3 generate_test_token.py
```

This will generate a token valid for 24 hours with user_id: `test-user-123`

**Example Output:**
```
Token:
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwidXNlcl9pZCI6InRlc3QtdXNlci0xMjMiLCJleHAiOjE3Njc1MTA4ODIsImlhdCI6MTc2NzQyNDQ4Mn0.ddj5T2e6UYU6VOAMkXXDEVXfW-yvjXj6eUuYYEtIF6k
```

## 🧪 Test in Swagger UI

### Step 1: Authorize
1. Click the **"Authorize"** button (🔒 lock icon) at the top right
2. In the "Value" field, enter:
   ```
   Bearer <your-token>
   ```
   (Replace `<your-token>` with the token from generate_test_token.py)
3. Click **"Authorize"**
4. Click **"Close"**

### Step 2: Create a Task
1. Expand **POST /tasks**
2. Click **"Try it out"**
3. Edit the request body:
   ```json
   {
     "title": "Buy groceries",
     "description": "Milk, bread, eggs",
     "priority": "High",
     "tags": ["Home", "Urgent"],
     "due_date": "2026-01-10T17:00:00Z",
     "reminder_at": "2026-01-10T16:00:00Z",
     "is_recurring": false
   }
   ```
4. Click **"Execute"**
5. You should see **201 Created** with the created task including its ID

### Step 3: List Tasks
1. Expand **GET /tasks**
2. Click **"Try it out"**
3. Try different query parameters:
   - `q`: Search for "groceries"
   - `status`: Filter by false (incomplete tasks)
   - `priority`: Filter by "High"
   - `sort_by`: Sort by "due_date"
4. Click **"Execute"**
5. You should see your tasks in the response

### Step 4: Search and Filter
Try these examples:
- **Search**: `q=groceries`
- **Filter incomplete**: `status=false`
- **Filter by priority**: `priority=High`
- **Filter by tags**: `tags=Home,Urgent`
- **Date range**: `due_date_from=2026-01-01T00:00:00Z&due_date_to=2026-01-31T23:59:59Z`
- **Combined**: `q=buy&status=false&priority=High&sort_by=due_date&sort_order=asc`

### Step 5: Update a Task
1. Copy the task ID from the create response
2. Expand **PUT /tasks/{task_id}**
3. Click **"Try it out"**
4. Enter the task_id
5. Edit fields you want to update:
   ```json
   {
     "title": "Buy groceries and fruits",
     "priority": "Medium"
   }
   ```
6. Click **"Execute"**

### Step 6: Toggle Completion
1. Expand **POST /tasks/{task_id}/toggle**
2. Click **"Try it out"**
3. Enter the task_id
4. Click **"Execute"**
5. The task's `completed` status will flip

### Step 7: Delete a Task
1. Expand **DELETE /tasks/{task_id}**
2. Click **"Try it out"**
3. Enter the task_id
4. Click **"Execute"**
5. You should see **204 No Content**

## 🧪 Test with cURL

### Health Check (No Auth)
```bash
curl http://localhost:8000/health
```

### Create Task
```bash
TOKEN="your-token-here"

curl -X POST http://localhost:8000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "description": "Testing the API",
    "priority": "High",
    "tags": ["Work", "Testing"],
    "due_date": "2026-01-15T17:00:00Z"
  }'
```

### List Tasks
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/tasks?q=test&status=false&priority=High&sort_by=due_date&limit=10"
```

### Get Single Task
```bash
TASK_ID="your-task-uuid"
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/tasks/$TASK_ID"
```

### Update Task
```bash
curl -X PUT http://localhost:8000/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "Low",
    "tags": ["Work", "Completed"]
  }'
```

### Toggle Completion
```bash
curl -X POST http://localhost:8000/tasks/$TASK_ID/toggle \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Task
```bash
curl -X DELETE http://localhost:8000/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Example Workflow

```bash
# 1. Get your token
python3 generate_test_token.py

# 2. Set your token
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# 3. Create a task
curl -X POST http://localhost:8000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Finish project documentation",
    "description": "Complete README and API docs",
    "priority": "High",
    "tags": ["Work", "Documentation"],
    "due_date": "2026-01-10T17:00:00Z",
    "reminder_at": "2026-01-10T09:00:00Z"
  }' | jq

# 4. List all tasks
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/tasks" | jq

# 5. Search for tasks
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/tasks?q=documentation&status=false&priority=High" | jq

# 6. Get specific task
TASK_ID="<copy-from-create-response>"
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/tasks/$TASK_ID" | jq

# 7. Mark as complete
curl -X POST http://localhost:8000/tasks/$TASK_ID/toggle \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 🎨 Example Responses

### Create Task (201 Created)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "test-user-123",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "priority": "High",
  "tags": ["Home", "Urgent"],
  "due_date": "2026-01-10T17:00:00Z",
  "reminder_at": "2026-01-10T16:00:00Z",
  "is_recurring": false,
  "recurrence_rule": null,
  "created_at": "2026-01-03T12:00:00Z",
  "updated_at": "2026-01-03T12:00:00Z"
}
```

### List Tasks (200 OK)
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      ...
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Validation Error",
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "message": "Invalid request parameters"
}
```

## 🔒 Security Notes

- All endpoints (except `/health`) require JWT authentication
- User isolation is enforced: users can only access their own tasks
- Invalid tokens return 401 Unauthorized
- Accessing non-existent or other users' tasks returns 404 (not 403) to prevent information leakage

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/docs (Interactive testing)
- **ReDoc**: http://localhost:8000/redoc (Pretty documentation)
- **OpenAPI JSON**: http://localhost:8000/openapi.json (Machine-readable spec)

## ✨ Features Available

| Feature | Status | Endpoints |
|---------|--------|-----------|
| Create tasks | ✅ | POST /tasks |
| List tasks | ✅ | GET /tasks |
| Get single task | ✅ | GET /tasks/{id} |
| Update tasks | ✅ | PUT /tasks/{id} |
| Delete tasks | ✅ | DELETE /tasks/{id} |
| Toggle completion | ✅ | POST /tasks/{id}/toggle |
| Keyword search | ✅ | GET /tasks?q=keyword |
| Filter by status | ✅ | GET /tasks?status=false |
| Filter by priority | ✅ | GET /tasks?priority=High |
| Filter by tags | ✅ | GET /tasks?tags=Work,Home |
| Filter by date range | ✅ | GET /tasks?due_date_from=...&due_date_to=... |
| Sort by due date | ✅ | GET /tasks?sort_by=due_date&sort_order=asc |
| Sort by title | ✅ | GET /tasks?sort_by=title |
| Sort by priority | ✅ | GET /tasks?sort_by=priority |
| Pagination | ✅ | GET /tasks?limit=20&offset=40 |
| Priorities (H/M/L) | ✅ | All task operations |
| Tags (array) | ✅ | All task operations |
| Due dates | ✅ | All task operations |
| Reminders | ✅ | All task operations |
| User isolation | ✅ | All authenticated endpoints |

## 🐛 Troubleshooting

**Server won't start:**
- Check that port 8000 is not in use: `lsof -i :8000`
- Verify database connection in .env is correct

**Authentication errors:**
- Make sure you're using "Bearer " prefix in Authorization header
- Check that JWT_SECRET in .env matches the token generation

**Database errors:**
- Verify Neon database is running at console.neon.tech
- Check DATABASE_URL in .env has correct credentials

**Tasks not showing up:**
- Remember: each user only sees their own tasks (user_id from JWT)
- Try creating a task first before listing

## 🎉 You're All Set!

Your backend API is fully functional. Start the server and test it in Swagger UI!

```bash
python3 main.py
# Then open: http://localhost:8000/docs
```

Happy coding! 🚀
