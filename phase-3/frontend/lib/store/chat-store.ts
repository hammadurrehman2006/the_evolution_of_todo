import { create } from 'zustand'

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
  addMessage: (message: Message | { id: string; role: 'user' | 'assistant'; content: string; timestamp: string | Date }) => void;
  updateMessage: (id: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

// Simple localStorage wrapper for chat history
const CHAT_STORAGE_KEY = 'chat-history'

const loadFromStorage = (): Message[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveToStorage = (messages: Message[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  } catch (e) {
    console.warn('Failed to save chat history:', e)
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  input: '',
  setInput: (input) => set({ input }),
  addMessage: (message) => {
    const newMessage = {
      ...message,
      timestamp: typeof message.timestamp === 'string'
        ? message.timestamp
        : message.timestamp.toISOString()
    }
    set((state) => {
      const newMessages = [...state.messages, newMessage]
      saveToStorage(newMessages)
      return { messages: newMessages }
    })
  },
  updateMessage: (id, content) => set((state) => {
    const newMessages = state.messages.map((msg) =>
      msg.id === id ? { ...msg, content } : msg
    )
    saveToStorage(newMessages)
    return { messages: newMessages }
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => {
    saveToStorage([])
    set({ messages: [] })
  },
}))

// Load messages from localStorage on mount (client-side only)
if (typeof window !== 'undefined') {
  const storedMessages = loadFromStorage()
  if (storedMessages.length > 0) {
    useChatStore.setState({ messages: storedMessages })
  }
}
