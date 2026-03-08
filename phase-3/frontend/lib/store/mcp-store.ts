import { create } from 'zustand'
import { mcpClient, MCPToolResponse } from '../lib/mcp-client'

interface MCPState {
  isConnected: boolean
  isConnecting: boolean
  serverName: string | null
  lastError: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  callTool: (tool: string, args: Record<string, unknown>) => Promise<MCPToolResponse>
  clearError: () => void
}

export const useMCPStore = create<MCPState>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  serverName: null,
  lastError: null,

  connect: async () => {
    set({ isConnecting: true, lastError: null })
    try {
      // Configure with default todo-mcp server
      mcpClient.configure({
        name: 'todo-mcp',
        command: 'uv',
        args: [
          '--directory',
          'phase-3/backend/mcp-server',
          'run',
          'python3',
          'src/server.py'
        ],
        env: {
          PYTHONPATH: '.'
        }
      })

      const connected = await mcpClient.connect()
      set({
        isConnected: connected,
        isConnecting: false,
        serverName: connected ? 'todo-mcp' : null,
        lastError: connected ? null : 'Failed to connect to MCP server'
      })
    } catch (error) {
      set({
        isConnecting: false,
        lastError: error instanceof Error ? error.message : 'Connection failed'
      })
    }
  },

  disconnect: async () => {
    await mcpClient.disconnect()
    set({
      isConnected: false,
      serverName: null
    })
  },

  callTool: async (tool: string, args: Record<string, unknown>) => {
    const response = await mcpClient.callTool(tool, args)
    if (!response.success) {
      set({ lastError: response.error || 'Tool call failed' })
    }
    return response
  },

  clearError: () => {
    set({ lastError: null })
  }
}))
