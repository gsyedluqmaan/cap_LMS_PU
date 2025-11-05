import api from '@/lib/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  university: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  isVerified: boolean;
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

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  role?: 'student' | 'teacher' | 'admin';
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  department?: string;
  studentId?: string;
  employeeId?: string;
  university?: string;
  isVerified?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  isVerified?: boolean;
}

class UserService {
  // Get all students
  async getStudents(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    const response = await api.get('/users/students', { params });
    return response.data;
  }

  // Get all teachers
  async getTeachers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    const response = await api.get('/users/teachers', { params });
    return response.data;
  }

  // Get all users (for admin)
  async getAllUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    const response = await api.get('/users', { params });
    return response.data;
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  }

  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.user;
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await api.post('/users/create', userData);
    return response.data.user;
  }

  // Get user statistics
  async getUserStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    verifiedUsers: number;
    unverifiedUsers: number;
  }> {
    const response = await api.get('/users/stats');
    return response.data;
  }
}

export default new UserService();