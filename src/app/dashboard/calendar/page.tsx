"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import CalendarModals from "@/components/CalendarModals";
import calendarService, {
  CalendarEvent,
  CreateCalendarEventData,
} from "@/services/calendarService";
import classService from "@/services/classService";
import { useAuth } from "@/lib/auth";
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
} from "lucide-react";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [filterType, setFilterType] = useState("all");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

  // Form data
  const [formData, setFormData] = useState<CreateCalendarEventData>({
    title: "",
    description: "",
    eventType: "other",
    startDate: "",
    endDate: "",
    isAllDay: false,
    location: "",
    color: "#3b82f6",
    targetAudience: "all",
    priority: "medium",
  });

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEvents();
      if (user.role === "admin") {
        fetchClasses();
      }
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await calendarService.getEvents({ limit: 50 });
      setEvents(response.data);
    } catch (error: any) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getClasses({ limit: 100 });
      setAvailableClasses(response.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventType: "other",
      startDate: "",
      endDate: "",
      isAllDay: false,
      location: "",
      color: "#3b82f6",
      targetAudience: "all",
      priority: "medium",
    });
    setFormError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setFormError("");
      await calendarService.createEvent(formData);
      setShowCreateModal(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Failed to create event");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      eventType: event.eventType,
      startDate: event.startDate.slice(0, 16), // Format for datetime-local
      endDate: event.endDate ? event.endDate.slice(0, 16) : "",
      isAllDay: event.isAllDay,
      location: event.location || "",
      color: event.color || "#3b82f6",
      targetAudience: event.targetAudience,
      specificClasses: event.specificClasses
        ? event.specificClasses.map((c) => (typeof c === "string" ? c : c._id))
        : [],
      priority: event.priority,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      setFormLoading(true);
      setFormError("");
      await calendarService.updateEvent(selectedEvent._id, formData);
      setShowEditModal(false);
      setSelectedEvent(null);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Failed to update event");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      setFormLoading(true);
      await calendarService.deleteEvent(selectedEvent._id);
      setShowDeleteModal(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err: any) {
      console.error("Failed to delete event:", err);
    } finally {
      setFormLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      exam: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      holiday:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      assignment:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      meeting:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "border-l-4 border-red-500",
      medium: "border-l-4 border-yellow-500",
      low: "border-l-4 border-green-500",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredEvents = events.filter(
    (event) => filterType === "all" || event.eventType === filterType
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                Academic Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {user?.role === "admin" &&
                  "Manage academic events and important dates"}
                {user?.role === "teacher" &&
                  "View academic events and important dates"}
                {user?.role === "student" &&
                  "View academic events and important dates"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
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

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Events</option>
                <option value="exam">Exams</option>
                <option value="holiday">Holidays</option>
                <option value="assignment">Assignments</option>
                <option value="class">Classes</option>
                <option value="meeting">Meetings</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {user?.role === "admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Events
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {events.length}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {
                    events.filter(
                      (e) =>
                        new Date(e.startDate).getMonth() ===
                        new Date().getMonth()
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  High Priority
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {events.filter((e) => e.priority === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Upcoming
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {
                    events.filter((e) => new Date(e.startDate) > new Date())
                      .length
                  }
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {filterType === "all"
                ? "All Events"
                : `${
                    filterType.charAt(0).toUpperCase() + filterType.slice(1)
                  } Events`}
            </h3>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getPriorityColor(
                  event.priority
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(
                          event.eventType
                        )}`}
                      >
                        {event.eventType}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.priority === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            : event.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        }`}
                      >
                        {event.priority} priority
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {formatDate(event.startDate)}
                          {event.endDate &&
                            event.startDate !== event.endDate &&
                            ` - ${formatDate(event.endDate)}`}
                        </span>
                      </div>

                      {!event.isAllDay && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(event.startDate)}
                            {event.endDate && ` - ${formatTime(event.endDate)}`}
                          </span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{event.targetAudience}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      title="View Event"
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {user?.role === "admin" && (
                      <>
                        <button
                          onClick={() => handleEdit(event)}
                          title="Edit Event"
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(event)}
                          title="Delete Event"
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No events found
              </p>
              {user?.role === "admin" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Your First Event
                </button>
              )}
            </div>
          )}
        </div>

        {/* Calendar Modals - Only show for admin */}
        {user?.role === "admin" && (
          <CalendarModals
            showCreateModal={showCreateModal}
            showEditModal={showEditModal}
            showDeleteModal={showDeleteModal}
            selectedEvent={selectedEvent}
            formData={formData}
            formLoading={formLoading}
            formError={formError}
            availableClasses={availableClasses}
            setShowCreateModal={setShowCreateModal}
            setShowEditModal={setShowEditModal}
            setShowDeleteModal={setShowDeleteModal}
            setFormData={setFormData}
            handleCreate={handleCreate}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            resetForm={resetForm}
          />
        )}
      </div>
    </div>
  );
}
