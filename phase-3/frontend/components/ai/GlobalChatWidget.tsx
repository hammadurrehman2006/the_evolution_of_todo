"use client";

import { useState, useCallback } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { FaRobot, FaTimes } from "react-icons/fa";
import { Send } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    // Get JWT token from Better Auth
    const { data, error } = await authClient.token();
    const token = data?.token;

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

  const { control, sendUserMessage } = useChatKit({
    api: {
      // Use local FastAPI endpoint
      url: `${process.env.NEXT_PUBLIC_API_URL || "https://todo-api-phase3.vercel.app"}/chat`,
      // Custom fetcher to inject JWT
      fetch: authenticatedFetch as any,
    } as any,
    // We provide our own composer
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

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    sendUserMessage({ text: inputMessage });
    setInputMessage("");
  };

  // Listen for custom events to open chat
  useState(() => {
    if (typeof window !== "undefined") {
      const handleOpenChat = (event: any) => {
        setIsOpen(true);
        if (event.detail?.message) {
          console.log("Request to send message:", event.detail.message);
          // If we want to support programmatic sending:
          sendUserMessage({ text: event.detail.message });
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
          
          <div className="flex-1 flex flex-col min-h-0">
            {isPending ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <FaRobot size={32} className="animate-pulse opacity-50" />
              </div>
            ) : session ? (
              <>
                <div className="flex-1 relative overflow-hidden">
                  <ChatKit
                    control={control}
                    className="h-full w-full"
                  />
                </div>
                {/* Custom Input Area */}
                <div className="p-4 border-t border-border bg-background">
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask me anything..."
                      className="flex-1 max-h-32 min-h-[40px] px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={1}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                <FaRobot size={48} className="mb-4 opacity-50" />
                <h4 className="text-xl font-semibold mb-2">Login Required</h4>
                <p className="mb-6">Please log in to access your personal AI assistant and manage your tasks.</p>
                <Link 
                  href="/auth/login" 
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