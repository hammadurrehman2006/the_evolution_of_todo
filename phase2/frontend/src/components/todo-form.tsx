import { useState } from 'react';

interface TodoFormProps {
  onSubmit: (title: string, description: string) => Promise<void> | void;
  initialTitle?: string;
  initialDescription?: string;
  submitButtonText?: string;
  isEditing?: boolean;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function TodoForm({
  onSubmit,
  initialTitle = '',
  initialDescription = '',
  submitButtonText = 'Add Todo',
  isEditing = false,
  onCancel,
  isLoading = false,
  error
}: TodoFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    try {
      await onSubmit(title, description);

      if (!isEditing) {
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          placeholder="What needs to be done?"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          placeholder="Add details..."
          rows={3}
          disabled={isLoading}
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? `${isEditing ? 'Updating' : 'Creating'}...` : submitButtonText}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={`bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}