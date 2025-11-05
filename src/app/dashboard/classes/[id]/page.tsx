"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { classSectionService, ClassSection } from "@/services/classService";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  UserCheck,
  Clock,
  MapPin,
  Calendar,
  Edit,
  Mail,
  User,
  GraduationCap,
  Building,
  Hash,
  Video,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [classData, setClassData] = useState<ClassSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user && params.id) {
      fetchClassDetails();
    }
  }, [user, params.id]);

  const fetchClassDetails = async () => {
    try {
      setIsLoading(true);
      const data = await classSectionService.getClassSectionById(
        params.id as string
      );
      setClassData(data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch class details");
      if (err.response?.status === 403 || err.response?.status === 404) {
        router.push("/dashboard/classes");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyMeetingLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const joinMeeting = (link: string) => {
    window.open(link, "_blank");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading class details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Link
              href="/dashboard/classes"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Classes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/classes"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {classData.className}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {classData.classCode} • {classData.department}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Class Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Class Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Class Code
                    </label>
                    <div className="flex items-center mt-1">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white font-mono">
                        {classData.classCode}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Subject
                    </label>
                    <div className="flex items-center mt-1">
                      <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {classData.subject || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Department
                    </label>
                    <div className="flex items-center mt-1">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {classData.department}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Academic Year
                    </label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {classData.academicYear}
                      </span>
                    </div>
                  </div>

                  {classData.semester && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Semester
                      </label>
                      <div className="flex items-center mt-1">
                        <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">
                          {classData.semester}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Enrollment
                    </label>
                    <div className="flex items-center mt-1">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {classData.currentEnrollment} / {classData.maxStudents}{" "}
                        students
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {classData.description && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {classData.description}
                  </p>
                </div>
              )}
            </div>

            {/* Meeting Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Video className="h-5 w-5 mr-2 text-blue-600" />
                Online Meeting
              </h2>

              {(() => {
                // For demo purposes, generate meeting link based on class data
                const mockMeetingLink = `https://meet.google.com/${classData.classCode.toLowerCase()}-${classData._id.slice(
                  -6
                )}`;

                return (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Meeting Link
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={mockMeetingLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => copyMeetingLink(mockMeetingLink)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition-colors"
                          title="Copy link"
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => joinMeeting(mockMeetingLink)}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Join Meeting
                    </button>

                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Meeting is available during scheduled class times</p>
                      {user?.role !== "student" && (
                        <p>
                          • As a {user?.role}, you can start the meeting anytime
                        </p>
                      )}
                      <p>• This link is unique to this class section</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Schedule */}
            {classData.schedule.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Schedule
                </h2>

                <div className="space-y-4">
                  {classData.schedule.map((sched, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Days
                          </label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sched.days.map((day) => (
                              <span
                                key={day}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Time
                          </label>
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 dark:text-white">
                              {sched.startTime} - {sched.endTime}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Location
                          </label>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 dark:text-white">
                              {[sched.room, sched.building]
                                .filter(Boolean)
                                .join(", ") || "TBA"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teachers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Teachers (
                {Array.isArray(classData.teachers)
                  ? classData.teachers.length
                  : 0}
                )
              </h2>

              {Array.isArray(classData.teachers) &&
              classData.teachers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classData.teachers.map((teacher: any) => (
                    <div
                      key={teacher._id || teacher}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {typeof teacher === "string" ? teacher : teacher.name}
                        </p>
                        {typeof teacher !== "string" && teacher.email && (
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3 mr-1" />
                            {teacher.email}
                          </div>
                        )}
                        {typeof teacher !== "string" && teacher.employeeId && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            ID: {teacher.employeeId}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No teachers assigned to this class
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Students */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Students ({classData.currentEnrollment})
              </h2>

              {Array.isArray(classData.students) &&
              classData.students.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {classData.students.map((student: any) => (
                    <div
                      key={student._id || student}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {typeof student === "string" ? student : student.name}
                        </p>
                        {typeof student !== "string" && student.studentId && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            ID: {student.studentId}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No students enrolled
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Stats
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Enrollment Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(
                      (classData.currentEnrollment / classData.maxStudents) *
                        100
                    )}
                    %
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (classData.currentEnrollment / classData.maxStudents) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      classData.isActive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {classData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Created
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(classData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
