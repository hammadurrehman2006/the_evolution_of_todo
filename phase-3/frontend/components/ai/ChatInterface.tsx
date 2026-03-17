"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "@/lib/store/chat-store";
import { useSession } from "@/lib/auth-client";
import { useTodoStore } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  className?: string;
  showHeader?: boolean;
  onActionComplete?: () => void; // Callback when AI performs an action
}

// Patterns to detect AI actions that modify todos - expanded for better detection
const ACTION_PATTERNS = {
  created: [
    /task created/i,
    /created task/i,
    /added task/i,
    /task added/i,
    /i've created/i,
    /i've added/i,
    /successfully created/i,
    /task has been created/i,
    /task has been added/i,
    /task.*created successfully/i,
    /task.*added successfully/i,
    /new task.*created/i,
    /created.*task.*successfully/i,
  ],
  deleted: [
    /task deleted/i,
    /deleted task/i,
    /removed task/i,
    /task removed/i,
    /i've deleted/i,
    /i've removed/i,
    /successfully deleted/i,
    /task has been deleted/i,
    /task has been removed/i,
    /task.*deleted successfully/i,
    /task.*removed successfully/i,
    /deleted.*task.*successfully/i,
  ],
  updated: [
    /task updated/i,
    /updated task/i,
    /modified task/i,
    /task modified/i,
    /i've updated/i,
    /successfully updated/i,
    /task has been updated/i,
    /marked as complete/i,
    /marked as incomplete/i,
    /task completed/i,
    /task.*updated successfully/i,
    /task.*marked as/i,
    /updated.*task.*successfully/i,
    /changed.*priority/i,
    /priority.*changed/i,
  ],
};

/**
 * Detects if the AI response indicates a todo-modifying action
 */
function detectAction(content: string): "create" | "delete" | "update" | null {
  const lowerContent = content.toLowerCase();

  // Check delete first (more specific)
  for (const pattern of ACTION_PATTERNS.deleted) {
    if (pattern.test(lowerContent)) return "delete";
  }

  // Then check update
  for (const pattern of ACTION_PATTERNS.updated) {
    if (pattern.test(lowerContent)) return "update";
  }

  // Finally check create
  for (const pattern of ACTION_PATTERNS.created) {
    if (pattern.test(lowerContent)) return "create";
  }

  return null;
}

/**
 * Helper to convert timestamp to Date object
 */
function toTimestamp(timestamp: string | Date): string {
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp;
}

/**
 * Helper to format timestamp for display
 */
function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return '';
  }
}

export function ChatInterface({
  className,
  showHeader = true,
  onActionComplete,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const {
    messages,
    input,
    isLoading,
    setInput,
    addMessage,
    updateMessage,
    setLoading,
  } = useChatStore();
  const fetchTodos = useTodoStore((state) => state.fetchTodos);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isLoading]);

  /**
   * Refresh todos after AI action immediately
   */
  const refreshTodos = useCallback(async () => {
    console.log('[ChatInterface] Refreshing todos after AI action...');
    await fetchTodos();
    onActionComplete?.();
  }, [fetchTodos, onActionComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput(""); // Clear input immediately

    // Add user message
    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: toTimestamp(new Date()),
    });

    setLoading(true);

    try {
      // Send request with credentials to include cookies for authentication
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Check if response is streaming (SSE)
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("text/event-stream")) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessageId = `assistant-${Date.now()}`;
        let assistantContent = "";

        // Add empty assistant message that will be filled incrementally
        addMessage({
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: toTimestamp(new Date()),
        });

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            // Parse SSE lines (format: "data: {...}\n\n")
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === "chunk" && data.content) {
                    assistantContent += data.content;
                    // Update the message with accumulated content
                    updateMessage(assistantMessageId, assistantContent);
                  } else if (data.type === "error") {
                    throw new Error(data.message);
                  }
                } catch (parseError) {
                  // Skip malformed JSON lines
                  console.warn("Failed to parse SSE chunk:", parseError);
                }
              }
            }
          }
        }

        // Stream completed - check for actions and refresh todos if needed
        const detectedAction = detectAction(assistantContent);
        if (detectedAction) {
          console.log(`[ChatInterface] Detected action: ${detectedAction}`);
          await refreshTodos();
        }
      } else {
        // Handle non-streaming JSON response (fallback)
        const data = await response.json();
        const responseContent = data.response || "I didn't get a response.";

        // Add assistant message
        addMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: responseContent,
          timestamp: toTimestamp(new Date()),
        });

        // Check for actions and refresh todos if needed
        const detectedAction = detectAction(responseContent);
        if (detectedAction) {
          console.log(`[ChatInterface] Detected action: ${detectedAction}`);
          await refreshTodos();
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: toTimestamp(new Date()),
      });
    } finally {
      setLoading(false);
      // Focus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <Card className={cn("flex flex-col h-[600px] w-full max-w-4xl mx-auto shadow-xl border-border/50", className)}>
      {showHeader && (
        <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between space-y-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-none">Todo Assistant</h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online
              </p>
            </div>
          </div>
          {!session && (
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Anonymous Mode
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full p-6">
          <div className="flex flex-col gap-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground opacity-50">
                <Bot className="h-16 w-16 mb-4" />
                <p className="text-lg font-medium">How can I help you today?</p>
                <p className="text-sm">Ask me to create tasks, list them, or just chat!</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className={cn("h-8 w-8 mt-1", msg.role === "assistant" ? "bg-primary/10" : "bg-muted")}>
                  {msg.role === "assistant" ? (
                    <AvatarImage src="/globe.svg" className="p-1" /> // Fallback will show
                  ) : (
                    <AvatarImage src={session?.user?.image || ""} />
                  )}
                  <AvatarFallback className={cn(msg.role === "assistant" ? "text-primary" : "")}>
                    {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col max-w-[80%]", 
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted/50 border border-border/50 rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex w-full gap-3">
                 <Avatar className="h-8 w-8 mt-1 bg-primary/10">
                    <AvatarFallback className="text-primary"><Bot size={16} /></AvatarFallback>
                 </Avatar>
                 <div className="flex items-center gap-1 bg-muted/50 px-4 py-3 rounded-2xl rounded-tl-none border border-border/50">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                 </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 bg-muted/20 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-background border-border/60 focus-visible:ring-primary/20"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="shrink-0 transition-all"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
