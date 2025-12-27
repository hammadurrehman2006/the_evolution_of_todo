'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  fetchUserInfo: () => void;
}

interface SessionProviderProps {
  children: React.ReactNode;
}

const sessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        // In a real app, you would verify the token with the backend
        // For now, we'll just check if it exists and extract user info from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            router.push('/login');
          }
        } else {
          // If we have a token but no user data, fetch user info
          fetchUserInfo();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const login = (userData: User, token: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout, fetchUserInfo };
};

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const { user, loading, login, logout, fetchUserInfo } = useSession();

  return (
    <sessionContext.Provider value={{ user, loading, login, logout, fetchUserInfo }}>
      {children}
    </sessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(sessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};