import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Store as string for JSON serialization
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (input: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

// Custom storage for date hydration
const storageWithDates = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return JSON.parse(str);
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      input: '',
      setInput: (input) => set({ input }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, { 
          ...message, 
          timestamp: message.timestamp instanceof Date 
            ? message.timestamp.toISOString() 
            : message.timestamp 
        }] 
      })),
      updateMessage: (id, content) => set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, content } : msg
        ),
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-history',
      storage: storageWithDates,
    }
  )
);
