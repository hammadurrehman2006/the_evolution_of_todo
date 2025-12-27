'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface SessionManagerProps {
  onSessionExpired?: () => void;
  children: React.ReactNode;
}

export default function SessionManager({ onSessionExpired, children }: SessionManagerProps) {
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setSessionValid(false);
        return;
      }

      const isValid = await apiClient.validateToken();
      setSessionValid(isValid);

      if (!isValid) {
        // Session is expired, remove token and redirect
        localStorage.removeItem('access_token');
        apiClient.removeToken();

        if (onSessionExpired) {
          onSessionExpired();
        } else {
          // Default behavior: redirect to login
          router.push('/login');
        }
      }
    };

    // Check session immediately
    checkSession();

    // Set up interval to check session validity periodically
    const intervalId = setInterval(async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const isValid = await apiClient.validateToken();
        if (!isValid) {
          // Session expired
          localStorage.removeItem('access_token');
          apiClient.removeToken();

          if (onSessionExpired) {
            onSessionExpired();
          } else {
            router.push('/login');
          }
        }
      }
    }, 60000); // Check every minute

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [onSessionExpired, router]);

  // While checking session validity, show a loading state
  if (sessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Checking session...</div>
      </div>
    );
  }

  // If session is invalid, we already handled the redirect
  // This should not happen if onSessionExpired or default behavior redirects
  if (sessionValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Session expired. Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
}