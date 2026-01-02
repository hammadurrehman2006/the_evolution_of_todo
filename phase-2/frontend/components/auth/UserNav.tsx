"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface UserNavProps {
  user: {
    name: string | null
    email: string
    image?: string | null
  }
}

export function UserNav({ user }: UserNavProps) {
  const getInitials = (name: string | null): string => {
    if (!name) return ""

    const trimmed = name.trim()
    const words = trimmed.split(/\s+/)

    if (words.length === 1) {
      return words[0][0].toUpperCase()
    }

    // Take first letter of first word and last word
    const first = words[0][0]
    const last = words[words.length - 1][0]
    return (first + last).toUpperCase()
  }

  const initials = getInitials(user.name)

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
      <AvatarFallback>
        {initials || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )
}
