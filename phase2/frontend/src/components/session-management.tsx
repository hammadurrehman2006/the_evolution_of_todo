'use client';

import { useSessionContext } from '@/components/session-provider';
import { useState } from 'react';
import Button from '@/components/button';

export default function SessionManagement() {
  const { user, loading, logout, fetchUserInfo } = useSessionContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-gray-600">
        <p>Not logged in</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">User Session</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.name && (
            <p className="text-sm text-gray-500">{user.name}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={fetchUserInfo}
            disabled={loading}
            className="text-sm"
          >
            Refresh
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
}