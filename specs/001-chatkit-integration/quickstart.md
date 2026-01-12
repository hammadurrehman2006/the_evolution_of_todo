# Quickstart: ChatKit Integration

## Overview
This guide provides a quick overview of how to implement and run the ChatKit integration feature.

## Prerequisites
- Node.js 18+ and npm/yarn
- Next.js 16.0.3 project setup
- Better Auth configured for authentication
- Domain (localhost:3000 and Vercel deployment URL) added to allowed origins if using external chat providers

## Setup Steps

### 1. Install Dependencies
```bash
npm install react-chat-widget
# or
yarn add react-chat-widget
```

### 2. Configure Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
# Add other required OpenAI configuration variables
```

### 3. Create the Global Chat Widget
Create `frontend/components/ai/GlobalChatWidget.tsx`:
- Implement the component using react-chat-widget or similar library
- Add the authentication bridge using `authClient.getSession()`
- Configure the custom fetcher to attach JWT tokens to backend API requests

### 4. Integrate with Layout
Modify `frontend/app/layout.tsx`:
- Import and include the GlobalChatWidget at the root level
- Ensure it renders consistently across all pages

### 5. Backend Endpoint Setup
Ensure your FastAPI backend has:
- POST /api/chat endpoint to handle chat requests
- Proper authentication middleware to validate JWT tokens
- Integration with your AI service for processing requests

## Running the Feature
1. Start your Next.js development server: `npm run dev`
2. Navigate to any page in your application
3. The chat widget should be accessible via the floating action button
4. Interact with the chatbot using natural language commands

## Key Configuration Points
- The widget will use NEXT_PUBLIC_API_URL to determine the backend endpoint
- Authentication tokens will be automatically attached to all requests
- The widget state will persist across navigation
- Backend endpoint must be properly configured to handle chat requests with authentication