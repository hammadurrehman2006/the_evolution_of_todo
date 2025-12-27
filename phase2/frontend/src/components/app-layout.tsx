'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        apiClient.setToken(token);
        const isValid = await apiClient.validateToken();
        if (isValid) {
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('access_token');
            apiClient.removeToken();
            if (pathname !== '/login' && pathname !== '/register') {
              router.push('/login');
            }
          }
        } else {
          // Token is expired or invalid, remove it
          localStorage.removeItem('access_token');
          apiClient.removeToken();
          if (pathname !== '/login' && pathname !== '/register') {
            router.push('/login');
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [pathname, router]);

  const handleLogout = async () => {
    await apiClient.logout();
    localStorage.removeItem('access_token');
    apiClient.removeToken();
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthPage) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/todos" className="text-xl font-bold text-indigo-600">
                Todo App
              </Link>
              <nav className="ml-6 flex space-x-4">
                <Link
                  href="/todos"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/todos'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Todos
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {user.firstName || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    href="/login"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Todo App. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}