import api from '@/lib/axios';
import { User } from './userService';

export interface OnlineClass {
  _id: string;
  name: string;
  description?: string;
  classCode: string;
  classType: 'lecture' | 'workshop' | 'seminar' | 'meeting' | 'other';
  subject?: string;
  teacher: User | string;
  students: (User | string)[];
  maxStudents?: number;
  currentEnrollment: number;
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    isRecurring: boolean;
    recurringPattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: string;
      daysOfWeek?: number[];
    };
  };
  meetingDetails: {
    platform: 'zoom' | 'meet' | 'teams' | 'other';
    meetingLink?: string;
    meetingId?: string;
    password?: string;
    dialInNumber?: string;
  };
  materials?: {
    title: string;
    url: string;
    type: 'document' | 'video' | 'link' | 'other';
  }[];
  isActive: boolean;
  isLive: boolean;
  recordingAvailable: boolean;
  recordingLink?: string;
  attendance: {
    student: User | string;
    joinedAt?: string;
    leftAt?: string;
    duration?: number;
    status: 'present' | 'absent' | 'late';
  }[];
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOnlineClassData {
  name: string;
  description?: string;
  classType: 'lecture' | 'workshop' | 'seminar' | 'meeting' | 'other';
  subject?: string;
  teacher: string;
  maxStudents?: number;
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    isRecurring?: boolean;
    recurringPattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: string;
      daysOfWeek?: number[];
    };
  };
  meetingDetails: {
    platform: 'zoom' | 'meet' | 'teams' | 'other';
    meetingLink?: string;
    meetingId?: string;
    password?: string;
    dialInNumber?: string;
  };
  materials?: {
    title: string;
    url: string;
    type: 'document' | 'video' | 'link' | 'other';
  }[];
}

export interface UpdateOnlineClassData extends Partial<CreateOnlineClassData> {
  isActive?: boolean;
  isLive?: boolean;
  recordingAvailable?: boolean;
  recordingLink?: string;
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

export interface GetClassesParams {
  page?: number;
  limit?: number;
  search?: string;
  classType?: string;
  teacher?: string;
  date?: string;
  isActive?: boolean;
  isLive?: boolean;
  subject?: string;
}

class OnlineClassService {
  // Get all online classes
  async getClasses(params: GetClassesParams = {}): Promise<PaginatedResponse<OnlineClass>> {
    const response = await api.get('/classes', { params });
    return response.data;
  }

  // Get class by ID
  async getClassById(id: string): Promise<OnlineClass> {
    const response = await api.get(`/classes/${id}`);
    return response.data.class;
  }

  // Create new online class
  async createClass(classData: CreateOnlineClassData): Promise<OnlineClass> {
    const response = await api.post('/classes', classData);
    return response.data.class;
  }

  // Update class
  async updateClass(id: string, classData: UpdateOnlineClassData): Promise<OnlineClass> {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data.class;
  }

  // Delete class
  async deleteClass(id: string): Promise<void> {
    await api.delete(`/classes/${id}`);
  }

  // Add students to class
  async addStudentsToClass(classId: string, studentIds: string[]): Promise<OnlineClass> {
    const response = await api.post(`/classes/${classId}/students`, { studentIds });
    return response.data.class;
  }

  // Remove students from class
  async removeStudentsFromClass(classId: string, studentIds: string[]): Promise<OnlineClass> {
    const response = await api.delete(`/classes/${classId}/students`, { 
      data: { studentIds } 
    });
    return response.data.class;
  }

  // Get classes by teacher
  async getClassesByTeacher(teacherId: string): Promise<OnlineClass[]> {
    const response = await api.get(`/classes/teacher/${teacherId}`);
    return response.data.classes;
  }

  // Get classes by student
  async getClassesByStudent(studentId: string): Promise<OnlineClass[]> {
    const response = await api.get(`/classes/student/${studentId}`);
    return response.data.classes;
  }

  // Start/Stop live class
  async toggleLiveClass(classId: string, isLive: boolean): Promise<OnlineClass> {
    const response = await api.patch(`/classes/${classId}/live`, { isLive });
    return response.data.class;
  }

  // Record attendance
  async recordAttendance(classId: string, studentId: string, status: 'present' | 'absent' | 'late'): Promise<OnlineClass> {
    const response = await api.post(`/classes/${classId}/attendance`, { studentId, status });
    return response.data.class;
  }

  // Get attendance report
  async getAttendanceReport(classId: string): Promise<any> {
    const response = await api.get(`/classes/${classId}/attendance`);
    return response.data.attendance;
  }

  // Get class statistics
  async getClassStats(): Promise<{
    totalClasses: number;
    liveClasses: number;
    scheduledClasses: number;
    totalEnrollments: number;
    averageClassSize: number;
    classesByType: Record<string, number>;
  }> {
    const response = await api.get('/classes/stats');
    return response.data;
  }

  // Get upcoming classes
  async getUpcomingClasses(days: number = 7): Promise<OnlineClass[]> {
    const response = await api.get('/classes/upcoming', { params: { days } });
    return response.data.classes;
  }

  // Join class (for students)
  async joinClass(classId: string, joinCode?: string): Promise<{ meetingLink: string; class: OnlineClass }> {
    const response = await api.post(`/classes/${classId}/join`, { joinCode });
    return response.data;
  }
}

export default new OnlineClassService();

// Keep the old Class interface for backward compatibility
export interface Class extends OnlineClass {}
export interface CreateClassData extends CreateOnlineClassData {}
export interface UpdateClassData extends UpdateOnlineClassData {}

// New ClassSection interfaces and service
export interface ClassSection {
  _id: string;
  className: string;
  classCode: string;
  description?: string;
  subject?: string;
  department: string;
  semester?: string;
  academicYear: string;
  teachers: string[] | any[];
  students: string[] | any[];
  maxStudents: number;
  currentEnrollment: number;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    room?: string;
    building?: string;
  }[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClassSectionData {
  className: string;
  classCode?: string;
  description?: string;
  subject?: string;
  department: string;
  semester?: string;
  academicYear: string;
  teachers?: string[];
  students?: string[];
  maxStudents: number;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
    room?: string;
    building?: string;
  }[];
  isActive?: boolean;
}

export interface UpdateClassSectionData extends Partial<CreateClassSectionData> {}

export interface ClassSectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  academicYear?: string;
  teacherId?: string;
  studentId?: string;
  isActive?: boolean;
}

export interface PaginatedClassSectionResponse {
  data: ClassSection[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ClassSectionService {
  // Get all class sections with filtering and pagination
  async getClassSections(params?: ClassSectionQueryParams): Promise<PaginatedClassSectionResponse> {
    const response = await api.get('/class-sections', { params });
    return response.data;
  }

  // Get class sections for a specific user (student or teacher)
  async getUserClassSections(userId: string, role: 'student' | 'teacher'): Promise<ClassSection[]> {
    const response = await api.get(`/class-sections/user/${userId}?role=${role}`);
    return response.data;
  }

  // Get a single class section by ID
  async getClassSectionById(id: string): Promise<ClassSection> {
    const response = await api.get(`/class-sections/${id}`);
    return response.data;
  }

  // Create a new class section
  async createClassSection(classData: CreateClassSectionData): Promise<ClassSection> {
    const response = await api.post('/class-sections', classData);
    return response.data;
  }

  // Update an existing class section
  async updateClassSection(id: string, classData: UpdateClassSectionData): Promise<ClassSection> {
    const response = await api.put(`/class-sections/${id}`, classData);
    return response.data;
  }

  // Delete a class section
  async deleteClassSection(id: string): Promise<void> {
    await api.delete(`/class-sections/${id}`);
  }

  // Add students to a class section
  async addStudentsToClassSection(id: string, studentIds: string[]): Promise<ClassSection> {
    const response = await api.post(`/class-sections/${id}/students`, { studentIds });
    return response.data;
  }

  // Remove students from a class section
  async removeStudentsFromClassSection(id: string, studentIds: string[]): Promise<ClassSection> {
    const response = await api.delete(`/class-sections/${id}/students`, { data: { studentIds } });
    return response.data;
  }

  // Add teachers to a class section
  async addTeachersToClassSection(id: string, teacherIds: string[]): Promise<ClassSection> {
    const response = await api.post(`/class-sections/${id}/teachers`, { teacherIds });
    return response.data;
  }

  // Remove teachers from a class section
  async removeTeachersFromClassSection(id: string, teacherIds: string[]): Promise<ClassSection> {
    const response = await api.delete(`/class-sections/${id}/teachers`, { data: { teacherIds } });
    return response.data;
  }
}

export const classSectionService = new ClassSectionService();
