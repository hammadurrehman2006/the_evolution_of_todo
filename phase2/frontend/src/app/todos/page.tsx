'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TodoForm from '@/components/todo-form';
import TodoUpdateForm from '@/components/todo-update-form';
import Layout from '@/components/layout';
import Alert from '@/components/alert';
import { useSessionContext } from '@/components/session-provider';
import { apiClient } from '@/lib/api/client';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const router = useRouter();
  const { user, loading: sessionLoading, logout } = useSessionContext();

  // Check if user is authenticated
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchTodos();
    }
  }, [user, sessionLoading, router]);

  const fetchTodos = async () => {
    try {
      const data = await apiClient.get('/api/todos');
      setTodos(data.todos || data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        // Redirect to login if unauthorized
        router.push('/login');
      } else {
        setError('Failed to load todos');
      }
      console.error('Fetch todos error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (title: string, description: string) => {
    try {
      await apiClient.post('/api/todos', { title, description });
      fetchTodos(); // Refresh the list
      setError(''); // Clear any previous errors
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        // Redirect to login if unauthorized
        router.push('/login');
      } else {
        setError('Failed to create todo');
      }
      console.error('Create todo error:', err);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await apiClient.patch(`/api/todos/${id}`, { completed: !completed });
      fetchTodos(); // Refresh the list
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        // Redirect to login if unauthorized
        router.push('/login');
      }
      console.error('Toggle complete error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      await apiClient.delete(`/api/todos/${id}`);
      fetchTodos(); // Refresh the list
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        // Redirect to login if unauthorized
        router.push('/login');
      }
      console.error('Delete todo error:', err);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
  };

  const handleUpdate = async (id: string, title: string, description: string) => {
    setUpdateLoading(true);
    setUpdateError('');

    try {
      await apiClient.put(`/api/todos/${id}`, {
        title,
        description
      });
      setEditingId(null);
      fetchTodos(); // Refresh the list
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        // Redirect to login if unauthorized
        router.push('/login');
      } else {
        setUpdateError('Failed to update todo');
      }
      console.error('Update todo error:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <Layout showHeader={true} showFooter={true}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-xl">Loading todos...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={true} showFooter={true}>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Todo List</h1>
          </div>

          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Add Todo Form */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Todo</h2>
            <TodoForm onSubmit={handleCreateTodo} submitButtonText="Add Todo" />
          </div>

          {/* Todo List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Todos ({todos.length})</h2>
            </div>

            {todos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No todos yet. Add one above!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {todos.map((todo) => (
                  <li key={todo.id} className="px-6 py-4">
                    {editingId === todo.id ? (
                      // Edit form
                      <TodoUpdateForm
                        todo={todo}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingId(null)}
                        isLoading={updateLoading}
                        error={updateError}
                      />
                    ) : (
                      // Todo display
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo.id, todo.completed)}
                          className="h-5 w-5 text-indigo-600 rounded mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={`mt-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-600'}`}>
                              {todo.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Created: {new Date(todo.created_at).toLocaleString()}
                            {todo.updated_at !== todo.created_at && ` | Updated: ${new Date(todo.updated_at).toLocaleString()}`}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(todo)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(todo.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}