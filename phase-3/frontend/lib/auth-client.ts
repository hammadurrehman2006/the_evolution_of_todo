import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://todo-phase3-ai.vercel.app",
  plugins: [
    // Enable JWT plugin for API token retrieval
    jwtClient()
  ],
  fetchOptions: {
    onError: (ctx) => {
      // Suppress expected 404 when backend not ready
      if (ctx.response?.status === 404) {
        return
      }
      console.error('Auth error:', ctx.error)
    }
  }
})

export const { useSession } = authClient
export const { token } = authClient
