"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function LoginButton() {
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignUp = async () => {
    router.push('/auth/signup')
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={handleSignIn}
        disabled={isSigningIn}
      >
        {isSigningIn ? 'Signing In...' : 'Sign In'}
      </Button>
      <Button variant="ghost" onClick={handleSignUp}>
        Sign Up
      </Button>
    </div>
  )
}
