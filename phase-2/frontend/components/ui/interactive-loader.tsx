"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const FUNNY_QUOTES = [
  "Generating excuses for missing deadlines...",
  "Spinning the hamster wheel...",
  "Convincing the server to cooperate...",
  "Mining bitcoins... just kidding, loading tasks.",
  "Counting backwards from infinity...",
  "Optimizing the optimization...",
  "Downloading more RAM...",
  "Feeding the code monkeys...",
  "Distracting you with this text...",
  "Searching for the 'any' key...",
  "Compiling spaghetti code...",
  "Deleting your browser history... wait, what?",
  "Waiting for the coffee to kick in...",
  "Asking Stack Overflow for help...",
  "Debugging the debugger...",
]

export function InteractiveLoader() {
  const [progress, setProgress] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  // Store two stable random quotes for this session
  const [sessionQuotes] = useState<number[]>(() => {
    const idx1 = Math.floor(Math.random() * FUNNY_QUOTES.length)
    let idx2 = Math.floor(Math.random() * FUNNY_QUOTES.length)
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * FUNNY_QUOTES.length)
    }
    return [idx1, idx2]
  })
  
  const [quoteIndex, setQuoteIndex] = useState(sessionQuotes[0])

  useEffect(() => {
    const [_, idx2] = sessionQuotes

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Random increment between 1 and 5
        const diff = Math.random() * 4 + 1
        const newProgress = Math.min(prev + diff, 100)
        
        // Switch to second quote at 50%
        if (newProgress > 50) {
            setQuoteIndex(idx2)
        }
        
        return newProgress
      })
    }, 50)

    return () => {
      clearInterval(interval)
    }
  }, [sessionQuotes])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-8 p-8">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Loading awesomeness...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        <Progress value={progress} className="h-3 w-full overflow-hidden rounded-full bg-secondary" />
        
        <div className="h-12 text-center">
          <p className={cn(
            "text-lg font-medium text-primary transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
            // Key to force animation re-trigger on change
            "key-" + quoteIndex 
          )}
          key={quoteIndex}
          >
            {FUNNY_QUOTES[quoteIndex]}
          </p>
        </div>
      </div>
    </div>
  )
}
