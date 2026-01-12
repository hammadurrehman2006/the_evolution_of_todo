"use client"

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export function LoginButton() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/auth/login')
  }

  const handleSignUp = () => {
    router.push('/auth/signup')
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={handleSignIn}
      >
        Sign In
      </Button>
      <Button variant="default" onClick={handleSignUp}>
        Sign Up
      </Button>
    </div>
  )
}
