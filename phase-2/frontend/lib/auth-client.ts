import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
