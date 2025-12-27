'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function MobileNav({ isAuthenticated = false, onLogout, user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = isAuthenticated
    ? [
        { name: 'Todos', href: '/todos' },
        { name: 'Profile', href: '/profile' },
      ]
    : [
        { name: 'Sign in', href: '/login' },
        { name: 'Sign up', href: '/register' },
      ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-lg p-6">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-base font-medium ${
                    isActive(item.href)
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && (
                <button
                  onClick={() => {
                    onLogout?.();
                    setIsOpen(false);
                  }}
                  className="text-left text-base font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              )}
            </nav>

            {isAuthenticated && user && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Welcome, {user.firstName} {user.lastName}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}