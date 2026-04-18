"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { classSectionService } from "@/services/classService";
import type { ClassSection } from "@/services/classService";
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  Video,
  GraduationCap,
  Bell,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [userClasses, setUserClasses] = useState<ClassSection[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<unknown[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    upcomingClasses: 0,
    completedAssignments: 0,
  });
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      if (user?.role === 'student' || user?.role === 'teacher') {
        const classes = await classSectionService.getUserClassSections(
          user._id,
          user.role as 'student' | 'teacher'
        );
        setUserClasses(classes.slice(0, 3)); // Show only first 3 classes
        setStats(prev => ({
          ...prev,
          totalClasses: classes.length,
          upcomingClasses: classes.filter((c: any) => c.isActive).length,
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user.name.split(" ")[0]}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {user.role === "student"
            ? "Ready to continue your learning journey?"
            : user.role === "admin"
            ? "Manage your institution efficiently."
            : "Ready to inspire and educate today?"}
        </p>
      </div>

      {/* Dynamic User Content */}
      {(user.role === 'student' || user.role === 'teacher') && (
        <div className="mb-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.role === 'student' ? 'Enrolled Classes' : 'Teaching Classes'}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.totalClasses}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Classes
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.upcomingClasses}
                  </p>
                </div>
                <Video className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.role === 'student' ? 'Upcoming Sessions' : 'Students'}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {user.role === 'student' ? '3' : '45'}
                  </p>
                </div>
                {user.role === 'student' ? (
                  <Clock className="h-8 w-8 text-purple-600" />
                ) : (
                  <Users className="h-8 w-8 text-purple-600" />
                )}
              </div>
            </div>
          </div>

          {/* Recent Classes */}
          {userClasses.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  {user.role === 'student' ? 'My Classes' : 'Teaching Schedule'}
                </h3>
                <Link
                  href="/dashboard/online-classes"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userClasses.map((classItem: any) => (
                  <Link
                    key={classItem._id}
                    href={`/dashboard/classes/${classItem._id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {classItem.className}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        classItem.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {classItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {classItem.classCode} • {classItem.department}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Users className="h-3 w-3 mr-1" />
                      {classItem.currentEnrollment}/{classItem.maxStudents} students
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                href="/dashboard/online-classes"
                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
              >
                <Video className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Online Classes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.role === 'student' ? 'Join classes' : 'Manage classes'}
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/calendar"
                className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group"
              >
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Calendar
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View schedule
                  </p>
                </div>
              </Link>

              {user.role === 'teacher' && (
                <Link
                  href="/dashboard/classes/create"
                  className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors group"
                >
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Create Class
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      New class section
                    </p>
                  </div>
                </Link>
              )}

              <Link
                href="/dashboard/classes"
                className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors group"
              >
                <BookOpen className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    All Classes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Browse all
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {user.role === "admin" && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Quick Admin Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/students"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
            >
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Students
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage student records
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/teachers"
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group"
            >
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Teachers
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage faculty
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/classes"
              className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors group"
            >
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Classes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Section management
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors group"
            >
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Calendar
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Academic events
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {user.role === "student"
                  ? "Enrolled Courses"
                  : "Teaching Courses"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                12
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {user.role === "student"
                  ? "Assignments Due"
                  : "Pending Reviews"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                5
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {user.role === "student" ? "Average Grade" : "Active Students"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.role === "student" ? "85%" : "248"}
              </p>
            </div>
            {user.role === "student" ? (
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
                {user.role === "student" ? "Study Hours" : "Courses Created"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.role === "student" ? "42h" : "8"}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.role === "student"
                    ? "Completed: Introduction to React"
                    : "Updated: Database Management Course"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  2 hours ago
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.role === "student"
                    ? "Assignment due: Data Structures Project"
                    : "New assignment submitted by John Doe"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  1 day ago
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.role === "student"
                    ? "Joined: Advanced JavaScript Study Group"
                    : "New student enrolled: Jane Smith"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  3 days ago
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {user.role === "student" ? (
              <>
                <button className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Browse Courses
                  </p>
                </button>

                <button className="p-4 text-center bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors">
                  <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    View Schedule
                  </p>
                </button>

                <button className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors">
                  <TrendingUp className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    View Grades
                  </p>
                </button>

                <button className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Study Groups
                  </p>
                </button>
              </>
            ) : user.role === "admin" ? (
              <>
                <Link
                  href="/dashboard/students"
                  className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                >
                  <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Manage Students
                  </p>
                </Link>

                <Link
                  href="/dashboard/teachers"
                  className="p-4 text-center bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                >
                  <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Manage Teachers
                  </p>
                </Link>

                <Link
                  href="/dashboard/classes"
                  className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
                >
                  <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Manage Classes
                  </p>
                </Link>

                <button className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors">
                  <TrendingUp className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Analytics
                  </p>
                </button>
              </>
            ) : (
              <>
                <button className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Create Course
                  </p>
                </button>

                <button className="p-4 text-center bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors">
                  <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Manage Students
                  </p>
                </button>

                <button className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors">
                  <Calendar className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Grade Assignments
                  </p>
                </button>

                <button className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors">
                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Analytics
                  </p>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
