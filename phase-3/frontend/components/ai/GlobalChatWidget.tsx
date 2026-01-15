"use client";

import { useState } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import { ChatInterface } from "./ChatInterface";

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

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
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/20 p-1 rounded transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
            <ChatInterface 
              className="h-full w-full border-none shadow-none rounded-none" 
              showHeader={false} 
            />
          </div>
        </div>
      )}
    </>
  );
}
