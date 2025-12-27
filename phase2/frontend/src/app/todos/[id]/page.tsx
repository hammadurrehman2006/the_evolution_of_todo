'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function TodoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: sessionLoading, logout } = useSessionContext();

  // Check if user is authenticated
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchTodo();
    }
  }, [user, sessionLoading, router, id]);

  const fetchTodo = async () => {
    try {
      const data = await apiClient.get(`/api/todos/${id}`);
      setTodo(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        // Redirect to login if unauthorized
        router.push('/login');
      } else if (err instanceof Error && err.message.includes('Resource not found')) {
        setError('Todo not found');
      } else {
        setError('Failed to load todo');
      }
      console.error('Fetch todo error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!todo) return;

    try {
      const updatedTodo = await apiClient.patch(`/api/todos/${todo.id}`, { completed: !todo.completed });
      setTodo(updatedTodo);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        // Redirect to login if unauthorized
        router.push('/login');
      }
      console.error('Toggle complete error:', err);
    }
  };

  const handleDelete = async () => {
    if (!todo) return;

    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      await apiClient.delete(`/api/todos/${todo.id}`);
      router.push('/todos'); // Redirect back to todo list
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        // Redirect to login if unauthorized
        router.push('/login');
      } else {
        setError('Failed to delete todo');
      }
      console.error('Delete todo error:', err);
    }
  };

  const handleBack = () => {
    router.push('/todos');
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading todo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Todo not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            ← Back to Todo List
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start mb-4">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              className="h-5 w-5 text-indigo-600 rounded mt-1"
            />
            <div className="ml-3">
              <h1 className={`text-2xl font-bold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {todo.title}
              </h1>
            </div>
          </div>

          {todo.description && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-500 mb-1">Description</h2>
              <p className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {todo.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-1">Created</h2>
              <p className="text-gray-700">{new Date(todo.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h2>
              <p className="text-gray-700">{new Date(todo.updated_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleToggleComplete}
              className={`px-4 py-2 rounded-md font-medium ${
                todo.completed
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {todo.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Delete Todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}