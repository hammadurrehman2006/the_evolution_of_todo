/**
 * MCP Client for Todo operations
 * 
 * This client provides integration with the Todo MCP server.
 * It can be used by AI agents or directly in the application.
 */

import { Todo, TodoInput } from './types'

export interface MCPServerConfig {
  name: string
  command: string
  args: string[]
  env?: Record<string, string>
}

export interface MCPToolCall {
  tool: string
  arguments: Record<string, unknown>
}

export interface MCPResource {
  uri: string
  name: string
  mimeType?: string
}

export interface MCPToolResponse {
  success: boolean
  result?: string
  error?: string
}

/**
 * MCP Client for interacting with the Todo MCP server
 */
export class MCPClient {
  private serverConfig: MCPServerConfig | null = null
  private isConnected: boolean = false

  constructor(config?: MCPServerConfig) {
    if (config) {
      this.serverConfig = config
    }
  }

  /**
   * Configure the MCP server
   */
  configure(config: MCPServerConfig): void {
    this.serverConfig = config
  }

  /**
   * Connect to the MCP server
   * Note: In a browser environment, this is a stub that simulates connection
   * Real MCP communication happens via Claude Desktop or other MCP hosts
   */
  async connect(): Promise<boolean> {
    if (!this.serverConfig) {
      console.warn('MCP server not configured')
      return false
    }

    // In browser environment, we simulate connection
    // Real MCP communication requires an MCP host (Claude Desktop, etc.)
    this.isConnected = true
    console.log(`[MCPClient] Connected to ${this.serverConfig.name}`)
    return true
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    this.isConnected = false
    console.log('[MCPClient] Disconnected')
  }

  /**
   * Check if connected to MCP server
   */
  isReady(): boolean {
    return this.isConnected && !!this.serverConfig
  }

  /**
   * Call an MCP tool
   * 
   * In a real MCP host environment, this would communicate with the server
   * In browser, this falls back to REST API calls
   */
  async callTool(tool: string, args: Record<string, unknown>): Promise<MCPToolResponse> {
    if (!this.isConnected) {
      return {
        success: false,
        error: 'MCP client not connected'
      }
    }

    // In browser environment, fall back to REST API
    // This is a fallback - real MCP communication happens in MCP hosts
    console.log(`[MCPClient] Calling tool: ${tool}`, args)
    
    try {
      const result = await this.fallbackToRestApi(tool, args)
      return {
        success: true,
        result: JSON.stringify(result)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Fallback to REST API when MCP is not available
   */
  private async fallbackToRestApi(tool: string, args: Record<string, unknown>): Promise<unknown> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://todo-api-phase3.vercel.app'
    
    // Get auth token
    const token = await this.getAuthToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    switch (tool) {
      case 'create_task': {
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: args.title as string,
            description: args.description as string,
            priority: args.priority as string,
            tags: args.tags as string[],
            due_date: args.due_date as string
          })
        })
        if (!response.ok) throw new Error('Failed to create task')
        return response.json()
      }

      case 'read_tasks': {
        const params = new URLSearchParams()
        if (args.completed !== undefined) params.append('status', args.completed ? 'true' : 'false')
        if (args.priority) params.append('priority', args.priority as string)
        if (args.tag) params.append('tags', args.tag as string)
        
        const response = await fetch(`${API_BASE_URL}/tasks/?${params.toString()}`, {
          headers
        })
        if (!response.ok) throw new Error('Failed to read tasks')
        const data = await response.json()
        return data.items || data
      }

      case 'update_task': {
        const { task_id, ...updates } = args
        const response = await fetch(`${API_BASE_URL}/tasks/${task_id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updates)
        })
        if (!response.ok) throw new Error('Failed to update task')
        return response.json()
      }

      case 'delete_task': {
        const response = await fetch(`${API_BASE_URL}/tasks/${args.task_id}`, {
          method: 'DELETE',
          headers
        })
        if (!response.ok) throw new Error('Failed to delete task')
        return { success: true }
      }

      default:
        throw new Error(`Unknown tool: ${tool}`)
    }
  }

  /**
   * Get auth token from Better Auth
   */
  private async getAuthToken(): Promise<string | null> {
    // This is a simplified version - in reality you'd import from auth-client
    // For now, return null and let the API handle unauthenticated requests
    return null
  }

  /**
   * Get available tools from the MCP server
   */
  getAvailableTools(): { name: string; description: string }[] {
    return [
      {
        name: 'create_task',
        description: 'Create a new task with title, description, priority, tags, and due date'
      },
      {
        name: 'read_tasks',
        description: 'Read tasks with optional filtering by completion status, priority, or tag'
      },
      {
        name: 'update_task',
        description: 'Update an existing task by ID'
      },
      {
        name: 'delete_task',
        description: 'Delete a task by ID'
      }
    ]
  }

  /**
   * Get available resources from the MCP server
   */
  getAvailableResources(): MCPResource[] {
    return [
      {
        uri: 'task://list',
        name: 'All Tasks',
        mimeType: 'application/json'
      }
    ]
  }

  /**
   * Read an MCP resource
   */
  async readResource(uri: string): Promise<string | null> {
    if (uri === 'task://list') {
      const result = await this.callTool('read_tasks', {})
      return result.success ? result.result || null : null
    }
    return null
  }
}

// Export singleton instance
export const mcpClient = new MCPClient()
