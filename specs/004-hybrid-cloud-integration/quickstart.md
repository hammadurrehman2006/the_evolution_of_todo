# Quickstart: Hybrid Cloud Integration

**Feature**: 004-hybrid-cloud-integration
**Target Audience**: Frontend Developers
**Estimated Setup Time**: 10-15 minutes
**Date**: 2026-01-04

## Overview

This guide walks you through connecting the local Next.js frontend to the production backend API at https://teot-phase2.vercel.app/. After completing this guide, your local application will persist all task data to the remote Neon PostgreSQL database.

---

## Prerequisites

Before you begin, ensure you have:

- [x] **Node.js**: Version 18+ installed ([Download](https://nodejs.org/))
- [x] **npm** or **yarn**: Package manager (comes with Node.js)
- [x] **Git**: For version control
- [x] **Code Editor**: VS Code or similar
- [x] **Backend API Access**: Production API at https://teot-phase2.vercel.app/ must be operational
- [x] **BETTER_AUTH_SECRET**: Shared secret used by the production backend (obtain from team/docs)

**Check your Node.js version**:
```bash
node --version  # Should be v18.0.0 or higher
```

---

## Step 1: Clone and Navigate to Project

```bash
# If not already in project directory
cd /path/to/the_evolution_of_todo/phase-2/frontend
```

---

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

**Expected output**: All packages installed successfully (may take 1-2 minutes)

---

## Step 3: Configure Environment Variables

Create a `.env.local` file in the `phase-2/frontend` directory:

```bash
touch .env.local
```

Add the following configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://teot-phase2.vercel.app/

# Better Auth Configuration (CRITICAL: Must match production backend secret)
BETTER_AUTH_SECRET=<OBTAIN_FROM_PRODUCTION_BACKEND>

# App URL (for Better Auth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ CRITICAL: BETTER_AUTH_SECRET**
- This secret MUST match the exact value used by the production backend
- Without the correct secret, JWT token signature validation will fail
- Contact your team lead or check production backend documentation for the correct value
- **Never commit this file to git** (already in `.gitignore`)

**Example**:
```env
NEXT_PUBLIC_API_URL=https://teot-phase2.vercel.app/
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Verify Backend API is Operational

Test the production API health endpoint:

```bash
curl https://teot-phase2.vercel.app/api/health
```

**Expected response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-04T14:30:00Z",
  "version": "1.0.0"
}
```

**If you get an error**:
- Check your internet connection
- Verify the backend URL is correct
- Contact backend team to confirm API is deployed and running

---

## Step 5: Start Development Server

```bash
npm run dev
# or
yarn dev
```

**Expected output**:
```
> next dev

   ▲ Next.js 16.0.3
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

**Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

---

## Step 6: Test the Integration

### 6.1 Login (Better Auth)

1. Navigate to the login page (e.g., `/login` or click "Sign In" button)
2. Log in with your credentials
3. **Check browser console**: You should see successful authentication logs

**Expected console output**:
```
[Auth] User logged in: user@example.com
[Auth] JWT token obtained
```

### 6.2 Create a Task

1. Click "New Task" or "+" button
2. Fill in task details:
   - **Title**: "Test API Integration"
   - **Description**: "Verify task is saved to remote database"
   - **Priority**: "High"
3. Click "Create Task"

**What happens**:
- Frontend sends POST request to `https://teot-phase2.vercel.app/api/todos`
- Request includes `Authorization: Bearer <JWT>` header
- Backend validates JWT and creates task in Neon PostgreSQL database
- Frontend receives 201 Created response with task ID
- Task appears in your task list

### 6.3 Verify Network Request

Open **Browser DevTools** (F12) → **Network** tab:

1. Filter by "todos"
2. Click on the POST request to `/api/todos`
3. **Check Request Headers**:
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1Q...
   Content-Type: application/json
   ```
4. **Check Response**:
   ```json
   {
     "data": {
       "id": "uuid-generated-by-backend",
       "title": "Test API Integration",
       ...
     }
   }
   ```

### 6.4 Verify Database Persistence

**Method 1: Refresh the page**
- Press F5 to refresh
- Task should still appear (fetched from remote database, not localStorage)

**Method 2: Open in incognito/private window**
- Log in with the same account
- Task should appear (proving it's in the remote database)

**Method 3: Check backend logs (if accessible)**
- Backend should log: `Created task <id> for user <user_id>`

---

## Step 7: Verify Mock Data is Removed

Search for any remaining mock data implementations:

```bash
# From phase-2/frontend directory
grep -r "localStorage\|STORAGE_KEY\|useMockTodos" hooks/ components/ app/ --exclude-dir=node_modules
```

**Expected result after implementation**:
- No matches (or only in archived/deleted files)
- All data operations use API client

---

## Troubleshooting

### Issue: "401 Unauthorized" Errors

**Possible Causes**:
1. **Wrong BETTER_AUTH_SECRET**: Secret doesn't match backend
2. **Expired JWT**: Token has expired (check `exp` claim)
3. **Missing Authorization Header**: API client not attaching JWT

**Solution**:
1. **Verify Secret**:
   ```bash
   # Check your .env.local file
   cat .env.local | grep BETTER_AUTH_SECRET
   # Compare with production backend secret
   ```
2. **Check JWT Expiration**:
   - Decode JWT at [jwt.io](https://jwt.io)
   - Check `exp` claim (Unix timestamp)
   - If expired, log out and log in again
3. **Inspect Network Request**:
   - Open DevTools → Network → Click failing request
   - Verify `Authorization: Bearer <token>` header is present

---

### Issue: "Network Error" or "Failed to Fetch"

**Possible Causes**:
1. Backend API is down
2. CORS configuration issue
3. Firewall/network blocking request

**Solution**:
1. **Test Backend**:
   ```bash
   curl https://teot-phase2.vercel.app/api/health
   ```
2. **Check CORS**:
   - Backend must allow `http://localhost:3000` origin
   - Check browser console for CORS errors
3. **Try Different Network**:
   - Disable VPN if active
   - Try from different network (e.g., mobile hotspot)

---

### Issue: "TypeError: Cannot read property of undefined"

**Possible Causes**:
1. API response doesn't match expected structure
2. Date conversion failing

**Solution**:
1. **Check API Response**:
   - DevTools → Network → Click request → Response tab
   - Verify response structure matches TypeScript interfaces
2. **Check Date Fields**:
   - Ensure backend sends ISO 8601 strings (e.g., `"2026-01-04T14:30:00Z"`)
   - Verify frontend converts to Date objects correctly

---

### Issue: Tasks Not Persisting

**Possible Causes**:
1. Still using mock data (localStorage)
2. API request failing silently

**Solution**:
1. **Check localStorage**:
   ```javascript
   // In browser console
   localStorage.getItem('taskhive-todos')
   // Should return null or undefined
   ```
2. **Enable Verbose Logging**:
   ```typescript
   // In api-client.ts, add console.logs
   console.log('[API] Request:', method, url, body)
   console.log('[API] Response:', response)
   ```

---

### Issue: "Module not found: Can't resolve '@/lib/api-client'"

**Possible Causes**:
1. API client file not created yet
2. TypeScript path alias not configured

**Solution**:
1. **Check File Exists**:
   ```bash
   ls -la phase-2/frontend/lib/api-client.ts
   ```
2. **Check tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

---

## Next Steps After Setup

Once the integration is working:

1. **Replace Mock Hook**: Implement `hooks/use-todos.ts` to replace `use-mock-todos.ts`
2. **Update Components**: Ensure all components use the new API-backed hook
3. **Add Error Handling**: Display user-friendly error messages for API failures
4. **Add Loading States**: Show spinners/skeletons while API requests are in progress
5. **Test All CRUD Operations**: Create, read, update, delete, and toggle tasks
6. **Verify Authentication**: Test logout/login flow and token expiration handling

---

## Verification Checklist

Before considering the integration complete, verify:

- [ ] ✅ Environment variables configured (`.env.local` created)
- [ ] ✅ BETTER_AUTH_SECRET matches production backend
- [ ] ✅ Development server starts successfully
- [ ] ✅ Health check endpoint returns 200 OK
- [ ] ✅ User can log in and JWT token is obtained
- [ ] ✅ Creating a task sends POST request with Authorization header
- [ ] ✅ Task appears in UI after creation (with server-generated ID)
- [ ] ✅ Task persists after page refresh (fetched from database)
- [ ] ✅ Task visible in incognito window after login (proves database storage)
- [ ] ✅ No localStorage calls for task data (verified by code search)
- [ ] ✅ Network tab shows all requests include JWT Bearer token
- [ ] ✅ 401 errors trigger logout/redirect to login

---

## Additional Resources

- **API Documentation**: `specs/004-hybrid-cloud-integration/contracts/api-endpoints.md`
- **Data Model**: `specs/004-hybrid-cloud-integration/data-model.md`
- **Architecture Decisions**: `specs/004-hybrid-cloud-integration/research.md`
- **Better Auth Docs**: [https://www.better-auth.com/docs](https://www.better-auth.com/docs)
- **Next.js Environment Variables**: [https://nextjs.org/docs/app/building-your-application/configuring/environment-variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Browser Console**: Look for error messages
2. **Check Network Tab**: Inspect API requests and responses
3. **Review Backend Logs**: If accessible, check for errors on backend
4. **Search Documentation**: Review research.md and api-endpoints.md
5. **Ask Team**: Reach out to backend team for API issues

---

**Quickstart Guide By**: Claude (Sonnet 4.5)
**Last Updated**: 2026-01-04
**Status**: Ready for Implementation
