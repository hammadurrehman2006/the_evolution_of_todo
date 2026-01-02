"use client"

import { Button } from "@/components/ui/button"

export function LoginButton() {
  const handleSignIn = () => {
    console.log("Sign In clicked - backend not implemented yet")
  }

  const handleSignUp = () => {
    console.log("Sign Up clicked - backend not implemented yet")
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={handleSignIn}>
        Sign In
      </Button>
      <Button onClick={handleSignUp}>
        Sign Up
      </Button>
    </div>
  )
}
