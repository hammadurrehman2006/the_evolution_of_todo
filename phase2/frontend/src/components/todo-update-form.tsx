'use client';

import { useState } from 'react';
import { Todo } from '@/types/todo';
import TodoForm from './todo-form';

interface TodoUpdateFormProps {
  todo: Todo;
  onSubmit: (id: string, title: string, description: string) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function TodoUpdateForm({
  todo,
  onSubmit,
  onCancel,
  isLoading = false,
  error
}: TodoUpdateFormProps) {
  const handleSubmit = async (title: string, description: string) => {
    await onSubmit(todo.id, title, description);
  };

  return (
    <TodoForm
      initialTitle={todo.title}
      initialDescription={todo.description || ''}
      submitButtonText="Update Todo"
      isEditing={true}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}