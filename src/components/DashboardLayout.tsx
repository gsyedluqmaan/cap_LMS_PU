"use client";

import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { Bell } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout = ({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={logout} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col">
        {/* Top Header */}
        {(title || subtitle) && (
          <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 lg:ml-64">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="ml-12 lg:ml-0">
                  {title && (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Bell className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
