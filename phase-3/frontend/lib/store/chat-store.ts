import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  input: '',
  setInput: (input) => set({ input }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, content, timestamp: new Date() } : msg
    ),
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
}));
