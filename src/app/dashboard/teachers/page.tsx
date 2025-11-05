'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Mail,
  BookOpen,
  Calendar,
  Eye,
  Edit,
  LogOut,
  Award,
  Plus,
  Trash2
} from 'lucide-react';
import userService, { User, PaginatedResponse, CreateUserData, UpdateUserData } from '@/services/userService';
import TeacherModals from '@/components/TeacherModals';
import { useAuth } from '@/lib/auth';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form data
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    department: '',
    employeeId: '',
    isVerified: true
  });

  const router = useRouter();

  const { user, loading: authLoading, logout } = useAuth(['admin']);

  useEffect(() => {
    if (user && !authLoading) {
      fetchTeachers();
    }
  }, [user, authLoading]); // Only auth-related dependencies

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<User> = await userService.getTeachers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        department: departmentFilter
      });
      setTeachers(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // fetchTeachers will be called by useEffect
  };

  const handleLogout = logout;

  // Helpers
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      department: '',
      employeeId: '',
      isVerified: true
    });
    setFormError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setFormError('');
      await userService.createUser(formData);
      setShowCreateModal(false);
      resetForm();
      fetchTeachers();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create teacher');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (teacher: User) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '',
      role: 'teacher',
      department: teacher.department || '',
      employeeId: teacher.employeeId || '',
      isVerified: teacher.isVerified
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
      setFormLoading(true);
      setFormError('');
      const updateData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        employeeId: formData.employeeId,
        isVerified: formData.isVerified
      };
      if (formData.password) updateData.password = formData.password;

      await userService.updateUser(selectedTeacher._id, updateData);
      setShowEditModal(false);
      setSelectedTeacher(null);
      resetForm();
      fetchTeachers();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to update teacher');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = (teacher: User) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    try {
      setFormLoading(true);
      await userService.deleteUser(selectedTeacher._id);
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete teacher');
    } finally {
      setFormLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <GraduationCap className="h-8 w-8 text-blue-600 cursor-pointer" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Teachers Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage all teachers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </button>

              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">Teachers</li>
          </ol>
        </nav>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teachers</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pagination.totalItems}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Teachers</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{teachers.filter(t => t.isVerified).length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Verification</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{teachers.filter(t => !t.isVerified).length}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search teachers by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Teachers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading teachers...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={fetchTeachers}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {teachers.map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">{teacher.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {teacher.employeeId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {teacher.department || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            teacher.isVerified 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {teacher.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(teacher.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleEdit(teacher)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteConfirm(teacher)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={currentPage === pagination.totalPages}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* Modals */}
        <TeacherModals
          showCreateModal={showCreateModal}
          showEditModal={showEditModal}
          showDeleteModal={showDeleteModal}
          selectedTeacher={selectedTeacher}
          formData={formData}
          formLoading={formLoading}
          formError={formError}
          setShowCreateModal={setShowCreateModal}
          setShowEditModal={setShowEditModal}
          setShowDeleteModal={setShowDeleteModal}
          setFormData={setFormData}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          resetForm={resetForm}
        />
      </div>
    </div>
  );
}
