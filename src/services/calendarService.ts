import api from '@/lib/axios';
import { User } from './userService';
import { Class } from './classService';

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  eventType: 'exam' | 'holiday' | 'assignment' | 'class' | 'meeting' | 'other';
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
  location?: string;
  color?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  participants: (User | string)[];
  targetAudience: 'all' | 'students' | 'teachers' | 'specific';
  specificClasses?: (Class | string)[];
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventData {
  title: string;
  description?: string;
  eventType: 'exam' | 'holiday' | 'assignment' | 'class' | 'meeting' | 'other';
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
  location?: string;
  color?: string;
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  participants?: string[];
  targetAudience: 'all' | 'students' | 'teachers' | 'specific';
  specificClasses?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateCalendarEventData extends Partial<CreateCalendarEventData> {
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  eventType?: string;
  targetAudience?: string;
  priority?: string;
  isActive?: boolean;
  userRole?: 'student' | 'teacher' | 'admin';
}

class CalendarService {
  // Get all calendar events
  async getEvents(params: GetEventsParams = {}): Promise<PaginatedResponse<CalendarEvent>> {
    const response = await api.get('/calendar/events', { params });
    return response.data;
  }

  // Get events for current user (filtered based on role and classes)
  async getMyEvents(params: GetEventsParams = {}): Promise<PaginatedResponse<CalendarEvent>> {
    const response = await api.get('/calendar/my-events', { params });
    return response.data;
  }

  // Get event by ID
  async getEventById(id: string): Promise<CalendarEvent> {
    const response = await api.get(`/calendar/events/${id}`);
    return response.data.event;
  }

  // Create new event (admin only)
  async createEvent(eventData: CreateCalendarEventData): Promise<CalendarEvent> {
    const response = await api.post('/calendar/events', eventData);
    return response.data.event;
  }

  // Update event (admin only)
  async updateEvent(id: string, eventData: UpdateCalendarEventData): Promise<CalendarEvent> {
    const response = await api.put(`/calendar/events/${id}`, eventData);
    return response.data.event;
  }

  // Delete event (admin only)
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/calendar/events/${id}`);
  }

  // Get events for a specific date range
  async getEventsInRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const response = await api.get('/calendar/events/range', {
      params: { startDate, endDate }
    });
    return response.data.events;
  }

  // Get upcoming events (next 7 days)
  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    const response = await api.get('/calendar/events/upcoming', {
      params: { days }
    });
    return response.data.events;
  }

  // Get events by type
  async getEventsByType(eventType: string): Promise<CalendarEvent[]> {
    const response = await api.get(`/calendar/events/type/${eventType}`);
    return response.data.events;
  }

  // Get calendar statistics
  async getCalendarStats(): Promise<{
    totalEvents: number;
    upcomingEvents: number;
    eventsByType: Record<string, number>;
    eventsByPriority: Record<string, number>;
  }> {
    const response = await api.get('/calendar/stats');
    return response.data;
  }

  // Get events for a specific user
  async getUserEvents(userId: string): Promise<CalendarEvent[]> {
    const response = await api.get(`/calendar/users/${userId}/events`);
    return response.data.events;
  }

  // Get events for a specific class/section
  async getClassEvents(classId: string): Promise<CalendarEvent[]> {
    const response = await api.get(`/calendar/classes/${classId}/events`);
    return response.data.events;
  }

  // Get academic year calendar
  async getAcademicYearCalendar(year: string): Promise<CalendarEvent[]> {
    const response = await api.get(`/calendar/academic-year/${year}`);
    return response.data.events;
  }

  // Export calendar events to ICS format
  async exportCalendar(params: GetEventsParams = {}): Promise<Blob> {
    const response = await api.get('/calendar/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new CalendarService();