'use client'

import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 fixed left-0 top-0 z-40 h-screen border-r border-gray-200 dark:border-gray-700">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
