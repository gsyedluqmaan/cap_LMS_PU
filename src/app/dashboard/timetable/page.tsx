"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import timetableService, { Timetable, TimetableSlot } from "@/services/timetableService";
import classService from "@/services/classService";
import { CalendarDays, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

export default function TimetablePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        fetchClasses();
      } else {
        fetchTimetables();
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin" && selectedClassId) {
      fetchTimetables();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getClasses();
      setClasses(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedClassId(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (user.role === "admin" && selectedClassId) {
        params.classSection = selectedClassId;
      }

      const data = await timetableService.getTimetables(params);
      
      // Handle different response formats based on role
      if (user.role === "teacher" && data.aggregatedView) {
        setSlots(data.slots || []);
        setTimetables(data.timetables || []);
      } else if (user.role === "student") {
        setTimetables(data.timetables || []);
        if (data.timetables && data.timetables.length > 0) {
          setSlots(data.timetables[0].slots || []);
        }
      } else if (user.role === "admin") {
        setTimetables(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setSlots(data[0].slots || []);
        }
      }
    } catch (error) {
      console.error("Error fetching timetables:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSlotForDayAndTime = (day: string, time: string) => {
    const [start, end] = time.split('-');
    return slots.find(
      slot => slot.day === day && slot.startTime === start && slot.endTime === end
    );
  };

  const getSessionTypeColor = (sessionType: string) => {
    const colors: any = {
      theory: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700",
      lab: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700",
      practical: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700",
      tutorial: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700",
    };
    return colors[sessionType] || colors.theory;
  };

  const isAdmin = user?.role === "admin";

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Timetable
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user.role === "admin" && "View and manage class timetables"}
              {user.role === "teacher" && "Your teaching schedule"}
              {user.role === "student" && "Your class schedule"}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Sparkles className="h-5 w-5" />
              Generate Timetable
            </button>
          )}
        </div>

        {/* Class Selector for Admin */}
        {isAdmin && classes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} ({cls.classCode})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Timetable Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading timetable...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No timetable found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isAdmin
                ? "Generate a timetable to get started."
                : "Your timetable hasn't been created yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => (
                  <tr key={time}>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {time}
                    </td>
                    {DAYS.map((day) => {
                      const slot = getSlotForDayAndTime(day, time);
                      return (
                        <td
                          key={`${day}-${time}`}
                          className={`border border-gray-200 dark:border-gray-600 p-2 ${
                            slot ? getSessionTypeColor(slot.sessionType) : ''
                          }`}
                        >
                          {slot ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                {slot.subject}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {user.role === "teacher" && slot.classSection ? (
                                  <div>{slot.classSection.className}</div>
                                ) : (
                                  <div>{slot.teacher?.name || "Teacher"}</div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {slot.room?.roomNumber || "Room"} - {slot.sessionType}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 dark:text-gray-600 text-center">
                              {time === '12:00-13:00' ? 'Lunch' : '-'}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Session Types
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-700"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Theory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-200 dark:bg-purple-700"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Lab</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-700"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Practical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-700"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Tutorial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Timetable Modal */}
      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => {
            setShowGenerateModal(false);
            fetchTimetables();
          }}
        />
      )}
    </DashboardLayout>
  );
}

// Generate Timetable Modal Component
function GenerateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    academicYear: "2024-2025",
    semester: "Fall 2024",
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await timetableService.generateTimetables(formData);
      setResult(response);
    } catch (error: any) {
      alert(error.response?.data?.error || "Error generating timetables");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Generate Timetables
          </h2>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 2024-2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Semester *
              </label>
              <input
                type="text"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Fall 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Effective From *
              </label>
              <input
                type="date"
                required
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Effective To (Optional)
              </label>
              <input
                type="date"
                value={formData.effectiveTo}
                onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Generating..." : "Generate"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <div className="font-semibold text-green-900 dark:text-green-200">
                  {result.message}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Generated {result.data.summary.generated} of {result.data.summary.total} timetables
                </div>
              </div>
            </div>

            {result.data.warnings && result.data.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Warnings:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {result.data.warnings.map((warning: string, i: number) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onSuccess}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
