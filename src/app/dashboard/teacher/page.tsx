"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import classService from "@/services/classService";
import calendarService from "@/services/calendarService";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Video,
  FileText,
  TrendingUp,
  Bell,
  Play,
  Pause,
  Eye,
  Plus,
} from "lucide-react";

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    liveClasses: 0,
    totalStudents: 0,
    todayClasses: 0,
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is teacher
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "teacher") {
      router.push("/dashboard");
      return;
    }

    setUser(parsedUser);
    fetchTeacherData(parsedUser._id);
  }, [router]);

  const fetchTeacherData = async (teacherId: string) => {
    try {
      setLoading(true);

      // Fetch teacher's classes
      const classesResponse = await classService.getClassesByTeacher(teacherId);
      setMyClasses(classesResponse);

      // Fetch upcoming events
      const eventsResponse = await calendarService.getUpcomingEvents(7);
      setUpcomingEvents(eventsResponse);

      // Calculate stats
      const totalStudents = classesResponse.reduce(
        (sum, cls) => sum + cls.currentEnrollment,
        0
      );
      const liveClasses = classesResponse.filter((cls) => cls.isLive).length;
      const today = new Date().toDateString();
      const todayClasses = classesResponse.filter(
        (cls) => new Date(cls.schedule.date).toDateString() === today
      ).length;

      setStats({
        totalClasses: classesResponse.length,
        liveClasses,
        totalStudents,
        todayClasses,
      });
    } catch (error) {
      console.error("Failed to fetch teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = async (classId: string) => {
    try {
      await classService.toggleLiveClass(classId, true);
      fetchTeacherData(user._id);
    } catch (error) {
      console.error("Failed to start class:", error);
    }
  };

  const handleEndClass = async (classId: string) => {
    try {
      await classService.toggleLiveClass(classId, false);
      fetchTeacherData(user._id);
    } catch (error) {
      console.error("Failed to end class:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user.name.split(" ")[0]}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Ready to teach and inspire your students today?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                My Classes
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
                Live Classes
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.liveClasses}
              </p>
            </div>
            <Video className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Students
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalStudents}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Classes
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.todayClasses}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Classes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Classes
              </h3>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create Class
              </button>
            </div>
          </div>

          <div className="p-6">
            {myClasses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No classes scheduled
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Your First Class
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myClasses.slice(0, 3).map((classItem) => (
                  <div
                    key={classItem._id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {classItem.name}
                        </h4>
                        {classItem.isLive && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                            LIVE
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {classItem.currentEnrollment} students
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(classItem.schedule.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {classItem.schedule.startTime} -{" "}
                        {classItem.schedule.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {classItem.isLive ? (
                        <button
                          onClick={() => handleEndClass(classItem._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Pause className="h-4 w-4" />
                          End Class
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartClass(classItem._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Play className="h-4 w-4" />
                          Start Class
                        </button>
                      )}

                      <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}

                {myClasses.length > 3 && (
                  <div className="text-center pt-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All Classes ({myClasses.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Events
            </h3>
          </div>

          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No upcoming events
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event._id}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(event.startDate)} at{" "}
                        {formatTime(event.startDate)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        event.eventType === "exam"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          : event.eventType === "meeting"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                      }`}
                    >
                      {event.eventType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
            <Video className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Start Live Class
            </p>
          </button>

          <button className="p-4 text-center bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors">
            <Plus className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Create Class
            </p>
          </button>

          <button className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors">
            <FileText className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              View Attendance
            </p>
          </button>

          <button className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Class Analytics
            </p>
          </button>
        </div>
      </div>
    </>
  );
}
