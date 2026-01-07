"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AuthSuccessCard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        // Clean up URL
        router.replace('/todos')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
      <Card className="bg-green-50 border-green-200 shadow-lg w-80">
        <CardContent className="flex items-center gap-4 p-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <CardTitle className="text-base text-green-700">Authentication Successful</CardTitle>
            <p className="text-sm text-green-600">Welcome back!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
