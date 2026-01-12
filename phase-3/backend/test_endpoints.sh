#!/bin/bash

# Backend API Test Script
# Tests all endpoints with authentication

TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwidXNlcl9pZCI6InRlc3QtdXNlci0xMjMiLCJleHAiOjE3Njc1MTMwNjIsImlhdCI6MTc2NzQyNjY2Mn0.06x0pyzR4scmxsP7Cz3bq9UNvaSno6ZiWqgeNQQmpSg"
BASE_URL="http://localhost:8000"

echo "================================================================================"
echo "BACKEND API ENDPOINT TESTING"
echo "================================================================================"
echo ""

# Test 4: Search filter
echo "TEST 4: GET /tasks/?q=groceries (Search Filter)"
echo "--------------------------------------------------------------------------------"
curl -s "$BASE_URL/tasks/?q=groceries" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
echo ""

# Test 5: Priority filter
echo "TEST 5: GET /tasks/?priority=High (Priority Filter)"
echo "--------------------------------------------------------------------------------"
curl -s "$BASE_URL/tasks/?priority=High" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
echo ""

# Test 6: Tag filter
echo "TEST 6: GET /tasks/?tags=Home (Tag Filter)"
echo "--------------------------------------------------------------------------------"
curl -s "$BASE_URL/tasks/?tags=Home" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
echo ""

# Test 7: Get single task
echo "TEST 7: GET /tasks/{id} (Get Single Task)"
echo "--------------------------------------------------------------------------------"
TASK_ID=$(curl -s "$BASE_URL/tasks/" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; print(json.load(sys.stdin)['items'][0]['id'])")
echo "Getting task ID: $TASK_ID"
curl -s "$BASE_URL/tasks/$TASK_ID" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 8: Update task
echo "TEST 8: PUT /tasks/{id} (Update Task)"
echo "--------------------------------------------------------------------------------"
curl -s -X PUT "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Finish project report - UPDATED","description":"Complete the Q4 report with executive summary","priority":"High","tags":["Work","Important","Urgent"]}' | python3 -m json.tool
echo ""

# Test 9: Toggle completion
echo "TEST 9: POST /tasks/{id}/toggle (Toggle Completion)"
echo "--------------------------------------------------------------------------------"
echo "Toggling task to complete..."
curl -s -X POST "$BASE_URL/tasks/$TASK_ID/toggle" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""
echo "Toggling task back to incomplete..."
curl -s -X POST "$BASE_URL/tasks/$TASK_ID/toggle" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 10: Status filter
echo "TEST 10: GET /tasks/?status=true (Completed Tasks Filter)"
echo "--------------------------------------------------------------------------------"
# First mark a task as complete
curl -s -X POST "$BASE_URL/tasks/$TASK_ID/toggle" -H "Authorization: Bearer $TOKEN" > /dev/null
curl -s "$BASE_URL/tasks/?status=true" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
echo ""

# Test 11: Delete task
echo "TEST 11: DELETE /tasks/{id} (Delete Task)"
echo "--------------------------------------------------------------------------------"
# Get a task to delete
DELETE_TASK_ID=$(curl -s "$BASE_URL/tasks/" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; items=json.load(sys.stdin)['items']; print(items[-1]['id'] if items else '')")
echo "Deleting task ID: $DELETE_TASK_ID"
curl -s -X DELETE "$BASE_URL/tasks/$DELETE_TASK_ID" -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n"
echo ""

# Test 12: Verify deletion
echo "TEST 12: Verify Task Deleted"
echo "--------------------------------------------------------------------------------"
curl -s "$BASE_URL/tasks/$DELETE_TASK_ID" -H "Authorization: Bearer $TOKEN"
echo ""

# Test 13: User isolation
echo "TEST 13: User Isolation Test"
echo "--------------------------------------------------------------------------------"
echo "Creating token for different user..."
python3 -c "
import jwt
from datetime import datetime, timedelta

payload = {
    'sub': 'different-user-456',
    'user_id': 'different-user-456',
    'exp': datetime.utcnow() + timedelta(hours=24),
    'iat': datetime.utcnow()
}
token = jwt.encode(payload, 'dev-secret-key-replace-in-production-with-openssl-rand-hex-32', algorithm='HS256')
print(token)
" > /tmp/user2_token.txt

USER2_TOKEN=$(cat /tmp/user2_token.txt)
echo "Different user's token: $USER2_TOKEN"
echo ""
echo "Fetching tasks for different user (should be empty)..."
curl -s "$BASE_URL/tasks/" -H "Authorization: Bearer $USER2_TOKEN" | python3 -m json.tool
echo ""

echo "================================================================================"
echo "ALL TESTS COMPLETED!"
echo "================================================================================"
