"use client";

import { useState, useCallback } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { FaRobot, FaTimes } from "react-icons/fa";
import { authClient, useSession } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    // Get JWT token from Better Auth
    const tokenResponse = await (authClient as any).jwt.getToken();
    const token = tokenResponse?.data?.token;

    const headers = new Headers(options.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");

    return fetch(url, {
      ...options,
      headers,
    });
  }, []);

  const { control } = useChatKit({
    api: {
      // Use local FastAPI endpoint
      url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/chat`,
      // Custom fetcher to inject JWT
      fetch: authenticatedFetch as any,
    } as any,
    composer: {
      placeholder: "Ask me to add a task, list your todos, or summarize your goals...",
    },
    startScreen: {
      greeting: "Hello! I'm your AI assistant. How can I help you manage your tasks today?",
    },
    onClientTool: (toolCall: any) => {
      console.log("Tool call detected:", toolCall);
      // Invalidate tasks query to refresh UI after AI modifications
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // return empty object as expected by the type definition
      return {}; 
    },
  } as any);

  // Listen for custom events to open chat
  useState(() => {
    if (typeof window !== "undefined") {
      const handleOpenChat = (event: any) => {
        setIsOpen(true);
        if (event.detail?.message) {
          // This is a bit of a hack as useChatKit might not expose a direct way to send message programmatically easily 
          // without user interaction in some versions, but we can try to at least open it.
          // If ChatKit supports control.sendMessage, we could use it here.
          console.log("Request to send message:", event.detail.message);
        }
      };
      window.addEventListener("open-ai-chat", handleOpenChat);
      return () => window.removeEventListener("open-ai-chat", handleOpenChat);
    }
  });

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </button>

      {/* Chat Widget Container */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaRobot size={20} />
              <h3 className="font-semibold text-lg">AI Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/20 p-1 rounded transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
          
          <div className="flex-1 relative">
            {isPending ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <FaRobot size={32} className="animate-pulse opacity-50" />
              </div>
            ) : session ? (
              <ChatKit
                control={control}
                className="h-full w-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                <FaRobot size={48} className="mb-4 opacity-50" />
                <h4 className="text-xl font-semibold mb-2">Login Required</h4>
                <p className="mb-6">Please log in to access your personal AI assistant and manage your tasks.</p>
                <Link 
                  href="/auth/sign-in" 
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
