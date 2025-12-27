'use client';

import { ReactNode } from 'react';
import { useSessionContext } from '@/components/session-provider';
import Header from './header';
import Footer from './footer';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function Layout({
  children,
  showHeader = true,
  showFooter = true,
}: LayoutProps) {
  const { user, loading } = useSessionContext();

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && (
        <Header
          isAuthenticated={!!user && !loading}
        />
      )}

      <main
        className={`flex-grow ${
          showHeader ? 'pt-16' : '' // Add top padding if header is shown
        }`}
      >
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}