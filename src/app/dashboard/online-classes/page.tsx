"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, checkPermission } from "@/lib/auth";
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Users,
  BookOpen,
  Calendar,
  Eye,
  Edit,
  LogOut,
  Clock,
  MapPin,
  Video,
} from "lucide-react";
import { classSectionService, ClassSection } from "@/services/classService";

export default function OnlineClassesPage() {
  const { user, loading: authLoading, logout } = useAuth(); // Remove role restriction to allow students
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const isFetchingRef = useRef(false);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadClasses = async () => {
      if (user && !authLoading && isMounted) {
        console.log("Fetching classes for user:", user.role, user._id);
        await fetchClasses();
      }
    };

    loadClasses();

    return () => {
      isMounted = false;
      isFetchingRef.current = false;
    };
  }, [user, authLoading]);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm, departmentFilter]);

  const fetchClasses = async () => {
    if (isFetchingRef.current) {
      console.log("Already fetching, skipping fetchClasses");
      return;
    }

    if (!user?._id) {
      console.log("No user ID available, skipping fetchClasses");
      return;
    }

    console.log("Starting fetchClasses for:", user.role, user._id);
    isFetchingRef.current = true;

    try {
      setLoading(true);
      let response;

      if (user?.role === "admin") {
        console.log("Fetching all class sections for admin");
        response = await classSectionService.getClassSections({ limit: 100 });
        console.log("Admin response:", response);
        setClasses(response?.data || []);
      } else if (user?.role === "teacher") {
        console.log("Fetching user class sections for teacher:", user._id);
        // For teachers, get only their assigned classes
        const userClasses = await classSectionService.getUserClassSections(
          user._id,
          "teacher"
        );
        console.log("Teacher response:", userClasses);
        setClasses(userClasses || []);
      } else if (user?.role === "student") {
        console.log("Fetching user class sections for student:", user._id);
        // For students, get only their enrolled classes
        const userClasses = await classSectionService.getUserClassSections(
          user._id,
          "student"
        );
        console.log("Student response:", userClasses);
        setClasses(userClasses || []);
      }
      setError("");
    } catch (err: any) {
      console.error("Error fetching classes:", err);

      const errorMessage =
        err.response?.data?.error || err.message || "Failed to fetch classes";
      setError(errorMessage);
      setClasses([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
      console.log("fetchClasses completed");
    }
  };

  const filterClasses = () => {
    let filtered = [...classes];

    if (searchTerm) {
      filtered = filtered.filter(
        (cls) =>
          cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cls.subject &&
            cls.subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((cls) => cls.department === departmentFilter);
    }

    setFilteredClasses(filtered);
  };

  const handleLogout = logout;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const uniqueDepartments = Array.from(
    new Set(classes.map((cls) => cls.department))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Video className="h-8 w-8 text-blue-600" />
                Online Classes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {user?.role === "admin" &&
                  "Manage all online classes and virtual sessions"}
                {user?.role === "teacher" &&
                  "View and manage your online classes"}
                {user?.role === "student" &&
                  "View your enrolled online classes and join sessions"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <Link
                  href="/dashboard/classes/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Class
                </Link>
              )}
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Classes Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading classes...
            </p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No online classes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role === "admin"
                ? "No classes have been created yet."
                : user?.role === "teacher"
                ? "No classes have been assigned to you yet."
                : "You are not enrolled in any online classes yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        {classItem.className}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {classItem.classCode} • {classItem.department}
                      </p>
                      {classItem.subject && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {classItem.subject}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        classItem.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {classItem.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {classItem.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {classItem.currentEnrollment} / {classItem.maxStudents}{" "}
                        students
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>
                        {Array.isArray(classItem.teachers)
                          ? classItem.teachers.length
                          : 0}{" "}
                        teachers
                      </span>
                    </div>

                    {classItem.schedule.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {classItem.schedule[0].days.join(", ")} •{" "}
                          {classItem.schedule[0].startTime} -{" "}
                          {classItem.schedule[0].endTime}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{classItem.academicYear}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Link href={`/dashboard/classes/${classItem._id}`}>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <Video className="h-4 w-4" />
                        Join Online Class
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
