import api from '@/lib/axios';

export interface TimetableSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subject: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  room: {
    _id: string;
    roomNumber: string;
    roomName: string;
    building: string;
  };
  sessionType: 'theory' | 'lab' | 'practical' | 'tutorial';
}

export interface Timetable {
  _id: string;
  classSection: {
    _id: string;
    className: string;
    classCode: string;
    department: string;
  };
  academicYear: string;
  semester: string;
  effectiveFrom: string;
  effectiveTo?: string;
  slots: TimetableSlot[];
  isActive: boolean;
  generatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  generatedAt?: string;
  lastModifiedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetTimetablesParams {
  classSection?: string;
  academicYear?: string;
  semester?: string;
}

export interface CreateTimetableData {
  classSection: string;
  academicYear: string;
  semester: string;
  effectiveFrom: string;
  effectiveTo?: string;
  slots: {
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
    room: string;
    sessionType: string;
  }[];
}

export interface UpdateTimetableData {
  effectiveFrom?: string;
  effectiveTo?: string;
  slots?: {
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
    room: string;
    sessionType: string;
  }[];
  isActive?: boolean;
}

export interface GenerateTimetableData {
  academicYear: string;
  semester: string;
  effectiveFrom: string;
  effectiveTo?: string;
  classSectionIds?: string[];
}

export interface GenerateTimetableResponse {
  message: string;
  data: {
    timetables: Timetable[];
    warnings?: string[];
    summary: {
      total: number;
      generated: number;
      failed: number;
    };
  };
}

export interface TeacherTimetableResponse {
  aggregatedView: true;
  slots: (TimetableSlot & {
    classSection: {
      _id: string;
      className: string;
      classCode: string;
      department: string;
    };
    academicYear: string;
    semester: string;
  })[];
  classSections: any[];
  timetables: Timetable[];
}

export interface StudentTimetableResponse {
  classSection: any;
  timetables: Timetable[];
}

class TimetableService {
  // Get timetables (role-based)
  async getTimetables(params: GetTimetablesParams = {}): Promise<any> {
    const response = await api.get('/timetables', { params });
    return response.data.data;
  }

  // Get timetable by ID
  async getTimetableById(id: string): Promise<Timetable> {
    const response = await api.get(`/timetables/${id}`);
    return response.data.data;
  }

  // Create timetable (admin only)
  async createTimetable(timetableData: CreateTimetableData): Promise<Timetable> {
    const response = await api.post('/timetables', timetableData);
    return response.data.data;
  }

  // Update timetable (admin only)
  async updateTimetable(id: string, timetableData: UpdateTimetableData): Promise<Timetable> {
    const response = await api.put(`/timetables/${id}`, timetableData);
    return response.data.data;
  }

  // Delete timetable (admin only)
  async deleteTimetable(id: string): Promise<void> {
    await api.delete(`/timetables/${id}`);
  }

  // Generate timetables (admin only)
  async generateTimetables(data: GenerateTimetableData): Promise<GenerateTimetableResponse> {
    const response = await api.post('/timetables/generate', data);
    return response.data;
  }
}

export default new TimetableService();
