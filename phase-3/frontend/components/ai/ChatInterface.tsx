"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/store/chat-store";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ChatInterfaceProps {
  className?: string;
  showHeader?: boolean;
}

export function ChatInterface({ className, showHeader = true }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const { 
    messages, 
    input, 
    isLoading, 
    setInput, 
    addMessage, 
    setLoading 
  } = useChatStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput(""); // Clear input immediately
    
    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    });

    setLoading(true);

    try {
      // Get token for auth header (better-auth handles cookies usually, but we might need explicit header if backend requires Bearer)
      // The backend uses 'get_current_user' which usually checks Authorization header or cookies.
      // We'll rely on browser cookies if better-auth sets them, or we might need to inject the token.
      // better-auth client typically handles this.
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          // sessionId can be handled by backend
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add assistant message
      addMessage({
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || "I didn't get a response.",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
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
              Preview Mode
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
                    <AvatarImage src="/bot-avatar.png" /> // Fallback will show
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
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        
        {!session && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="bg-background border p-6 rounded-xl shadow-lg text-center max-w-sm mx-4">
              <h4 className="font-semibold mb-2">Sign in to Chat</h4>
              <p className="text-sm text-muted-foreground mb-4">You need to be logged in to use the AI assistant.</p>
              <Link href="/auth/login">
                <Button className="w-full">Sign In / Sign Up</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 bg-muted/20 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !session}
            className="flex-1 bg-background border-border/60 focus-visible:ring-primary/20"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim() || !session}
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
