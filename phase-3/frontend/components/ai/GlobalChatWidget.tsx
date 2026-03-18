"use client";

import { useState, useEffect } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import { ChatInterface } from "./ChatInterface";
import { useTodoStore } from "@/lib/store";
import { useChatStore } from "@/lib/store/chat-store";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const fetchTodos = useTodoStore((state) => state.fetchTodos);
  const { clearMessages, addMessage } = useChatStore();

  const handleActionComplete = async () => {
    console.log('[GlobalChatWidget] handleActionComplete called, refreshing todos...');
    await fetchTodos();
    console.log('[GlobalChatWidget] Todos refreshed');
  };

  const handleClearChat = () => {
    clearMessages();
    console.log('[GlobalChatWidget] Chat history cleared');
  };

  // Listen for "Create with AI" button clicks from other pages
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent<{ message?: string }>) => {
      console.log('[GlobalChatWidget] Received open-ai-chat event');
      setIsOpen(true);
      
      // If there's a pre-filled message, add it to the chat
      if (event.detail?.message) {
        // Give the chat time to open, then add the message
        setTimeout(() => {
          addMessage({
            id: `user-${Date.now()}`,
            role: 'user',
            content: event.detail.message || '',
            timestamp: new Date().toISOString(),
          });
        }, 300);
      }
    };

    window.addEventListener('open-ai-chat', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('open-ai-chat', handleOpenChat as EventListener);
    };
  }, [addMessage]);

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
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <FaRobot size={20} />
              <h3 className="font-semibold text-lg">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                    title="Clear chat history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all chat messages. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearChat}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear Chat
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-foreground/20 p-1 rounded transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
            <ChatInterface
              className="h-full w-full border-none shadow-none rounded-none"
              showHeader={false}
              onActionComplete={handleActionComplete}
            />
          </div>
        </div>
      )}
    </>
  );
}
