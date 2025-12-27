import React from 'react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage({ message, className = '' }: SuccessMessageProps) {
  return (
    <div
      className={`bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 ${className}`}
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
    </div>
  );
}