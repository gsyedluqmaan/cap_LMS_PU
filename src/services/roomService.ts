import api from '@/lib/axios';

export interface Room {
  _id: string;
  roomNumber: string;
  roomName: string;
  roomType: 'lab' | 'classroom' | 'lecture-hall' | 'seminar-room' | 'auditorium';
  building: string;
  floor?: string;
  seatingCapacity: number;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasComputers: boolean;
  computerCount?: number;
  hasAC: boolean;
  hasWifi: boolean;
  facilities: string[];
  isActive: boolean;
  description?: string;
  fullLocation?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
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

export interface GetRoomsParams {
  page?: number;
  limit?: number;
  search?: string;
  roomType?: string;
  building?: string;
  isActive?: boolean;
}

export interface CreateRoomData {
  roomNumber: string;
  roomName: string;
  roomType: 'lab' | 'classroom' | 'lecture-hall' | 'seminar-room' | 'auditorium';
  building: string;
  floor?: string;
  seatingCapacity: number;
  hasProjector?: boolean;
  hasWhiteboard?: boolean;
  hasComputers?: boolean;
  computerCount?: number;
  hasAC?: boolean;
  hasWifi?: boolean;
  facilities?: string[];
  description?: string;
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  isActive?: boolean;
}

class RoomService {
  // Get all rooms
  async getRooms(params: GetRoomsParams = {}): Promise<PaginatedResponse<Room>> {
    const response = await api.get('/rooms', { params });
    return response.data;
  }

  // Get room by ID
  async getRoomById(id: string): Promise<Room> {
    const response = await api.get(`/rooms/${id}`);
    return response.data.data;
  }

  // Create room (admin only)
  async createRoom(roomData: CreateRoomData): Promise<Room> {
    const response = await api.post('/rooms', roomData);
    return response.data.data;
  }

  // Update room (admin only)
  async updateRoom(id: string, roomData: UpdateRoomData): Promise<Room> {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data.data;
  }

  // Delete room (admin only)
  async deleteRoom(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  }

  // Get unique buildings (for filters)
  async getBuildings(): Promise<string[]> {
    const response = await this.getRooms({ limit: 1000 });
    const buildings = new Set(response.data.map(room => room.building));
    return Array.from(buildings).sort();
  }
}

export default new RoomService();
