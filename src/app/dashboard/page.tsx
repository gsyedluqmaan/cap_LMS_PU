'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, User, BookOpen, Settings, LogOut, Bell, Calendar, TrendingUp, Users } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">CAP LMS</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {user.role === 'student' 
              ? 'Ready to continue your learning journey?' 
              : 'Ready to inspire and educate today?'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {user.role === 'student' ? 'Enrolled Courses' : 'Teaching Courses'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {user.role === 'student' ? 'Assignments Due' : 'Pending Reviews'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">5</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {user.role === 'student' ? 'Average Grade' : 'Active Students'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {user.role === 'student' ? '85%' : '248'}
                </p>
              </div>
              {user.role === 'student' ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <Users className="h-8 w-8 text-purple-600" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {user.role === 'student' ? 'Study Hours' : 'Courses Created'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {user.role === 'student' ? '42h' : '8'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.role === 'student' 
                      ? 'Completed: Introduction to React' 
                      : 'Updated: Database Management Course'
                    }
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.role === 'student'
                      ? 'Assignment due: Data Structures Project'
                      : 'New assignment submitted by John Doe'
                    }
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.role === 'student'
                      ? 'Joined: Advanced JavaScript Study Group'
                      : 'New student enrolled: Jane Smith'
                    }
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {user.role === 'student' ? (
                <>
                  <button className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
                    <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Browse Courses</p>
                  </button>
                  
                  <button className="p-4 text-center bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors">
                    <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">View Schedule</p>
                  </button>
                  
                  <button className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors">
                    <TrendingUp className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">View Grades</p>
                  </button>
                  
                  <button className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors">
                    <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Study Groups</p>
                  </button>
                </>
              ) : (
                <>
                  <button className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
                    <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Create Course</p>
                  </button>
                  
                  <button className="p-4 text-center bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors">
                    <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Students</p>
                  </button>
                  
                  <button className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors">
                    <Calendar className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Grade Assignments</p>
                  </button>
                  
                  <button className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors">
                    <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Role</p>
              <p className="text-gray-900 dark:text-white capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</p>
              <p className="text-gray-900 dark:text-white">{user.department || 'Not specified'}</p>
            </div>
            {user.studentId && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Student ID</p>
                <p className="text-gray-900 dark:text-white">{user.studentId}</p>
              </div>
            )}
            {user.employeeId && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employee ID</p>
                <p className="text-gray-900 dark:text-white">{user.employeeId}</p>
              </div>
            )}
          </div>
          <div className="mt-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Settings className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
